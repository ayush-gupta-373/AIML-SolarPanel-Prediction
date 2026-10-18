import io
import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, UnidentifiedImageError
from pydantic import BaseModel, Field, model_validator

from ml.fault_detection.inference import predict_faults

BASE_DIR = Path(__file__).resolve().parent
CITY_FILE = BASE_DIR / "data" / "raw" / "india_city_coordinates.csv"
TRAINING_FILE = BASE_DIR / "data" / "processed" / "india_solar_training.csv"
MODEL_FILE = BASE_DIR / "ml" / "artifacts" / "monthly_generation.joblib"
MAX_FAULT_IMAGE_BYTES = 10 * 1024 * 1024
MAX_FAULT_IMAGE_PIXELS = 40_000_000
MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]
PANEL_DEGRADATION_RATE = 0.005
PROJECTION_YEARS = 25
FINANCIAL_YEAR_START_MONTH = 4
CREDIT_SETTLEMENT_RATE_INR_PER_KWH = 2.0

app = FastAPI(title="SolarAI")
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TariffSlab(BaseModel):
    up_to_kwh: float | None = Field(default=None, gt=0)
    rate_per_kwh: Annotated[float, Field(gt=0, le=1000)]


class SolarEstimateRequest(BaseModel):
    city_id: str = Field(min_length=1)
    monthly_consumption_kwh: Annotated[float, Field(gt=0, le=10000)]
    fixed_monthly_charge_inr: Annotated[float, Field(ge=0, le=100000)]
    tariff_slabs: list[TariffSlab] = Field(min_length=1, max_length=10)

    @model_validator(mode="after")
    def validate_tariff_slabs(self):
        if self.tariff_slabs[-1].up_to_kwh is not None:
            raise ValueError("The final tariff slab must have no upper unit limit.")
        if any(slab.up_to_kwh is None for slab in self.tariff_slabs[:-1]):
            raise ValueError("Only the final tariff slab can have no upper limit.")
        limits = [slab.up_to_kwh for slab in self.tariff_slabs[:-1]]
        if any(current <= previous for previous, current in zip(limits, limits[1:])):
            raise ValueError("Tariff slab upper limits must be in ascending order.")
        return self


@lru_cache(maxsize=1)
def load_city_data() -> pd.DataFrame:
    if not CITY_FILE.exists():
        raise HTTPException(
            status_code=503,
            detail=f"City coordinate data was not found at {CITY_FILE}.",
        )

    cities = pd.read_csv(CITY_FILE, dtype={"city_id": str})
    required_columns = {
        "city_id", "city", "state", "latitude", "longitude", "population"
    }
    missing = required_columns - set(cities.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"City coordinate data is missing columns: {sorted(missing)}",
        )

    return cities.drop_duplicates(subset=["city_id"]).copy()


@lru_cache(maxsize=1)
def load_model_bundle() -> dict:
    if not MODEL_FILE.exists():
        raise HTTPException(
            status_code=503,
            detail=(
                "Solar prediction model is not trained yet. "
                "Run BackendFastApi/ml/train.py first."
            ),
        )

    return joblib.load(MODEL_FILE)


@lru_cache(maxsize=1)
def load_training_cities() -> pd.DataFrame:
    if not TRAINING_FILE.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Solar training data was not found at {TRAINING_FILE}.",
        )

    training = pd.read_csv(TRAINING_FILE, dtype={"city_id": str})
    required_columns = {
        "city_id", "city", "state", "latitude", "longitude", "capacity_kw"
    }
    missing = required_columns - set(training.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Solar training data is missing columns: {sorted(missing)}",
        )

    return training.drop_duplicates(subset=["city_id"])[
        ["city_id", "city", "state", "latitude", "longitude"]
    ].copy()


def haversine_distances_km(latitude: float, longitude: float, cities: pd.DataFrame) -> np.ndarray:
    earth_radius_km = 6371.0
    latitude_radians = np.radians(cities["latitude"].to_numpy(dtype=float))
    longitude_radians = np.radians(cities["longitude"].to_numpy(dtype=float))
    requested_latitude = np.radians(latitude)
    requested_longitude = np.radians(longitude)

    latitude_delta = latitude_radians - requested_latitude
    longitude_delta = longitude_radians - requested_longitude
    a = (
        np.sin(latitude_delta / 2) ** 2
        + np.cos(requested_latitude)
        * np.cos(latitude_radians)
        * np.sin(longitude_delta / 2) ** 2
    )
    return 2 * earth_radius_km * np.arcsin(np.sqrt(np.clip(a, 0, 1)))


def predict_monthly_generation(
    model_bundle: dict,
    latitude: float,
    longitude: float,
    capacity_kw: float,
) -> list[float]:
    months = np.arange(1, 13)
    prediction_features = pd.DataFrame({
        "latitude": np.full(12, latitude),
        "longitude": np.full(12, longitude),
        "capacity_kw": np.full(12, capacity_kw),
        "month_sin": np.sin(2 * np.pi * months / 12),
        "month_cos": np.cos(2 * np.pi * months / 12),
    })
    prediction_features = prediction_features[model_bundle["features"]]
    predictions = np.maximum(
        0,
        model_bundle["model"].predict(prediction_features),
    )
    return [float(value) for value in predictions]


def calculate_energy_charge(units: float, tariff_slabs: list[TariffSlab]) -> float:
    remaining_units = units
    lower_limit = 0.0
    charge = 0.0

    for slab in tariff_slabs:
        if remaining_units <= 0:
            break
        slab_units = (
            remaining_units
            if slab.up_to_kwh is None
            else min(remaining_units, slab.up_to_kwh - lower_limit)
        )
        charge += slab_units * slab.rate_per_kwh
        remaining_units -= slab_units
        if slab.up_to_kwh is not None:
            lower_limit = slab.up_to_kwh

    return charge


def calculate_monthly_bills(
    monthly_generation: list[float],
    monthly_consumption_kwh: float,
    tariff_slabs: list[TariffSlab],
    fixed_monthly_charge_inr: float,
    opening_credit_kwh: float = 0.0,
    settle_at_year_end: bool = True,
) -> tuple[list[dict], float, float, float]:
    credit_balance_kwh = opening_credit_kwh
    monthly_bills = []
    settled_credit_kwh = 0.0
    credit_settlement_inr = 0.0

    for month_index, generation_kwh in enumerate(monthly_generation):
        available_solar_kwh = generation_kwh + credit_balance_kwh
        solar_offset_kwh = min(monthly_consumption_kwh, available_solar_kwh)
        credit_balance_kwh = available_solar_kwh - solar_offset_kwh
        grid_import_kwh = monthly_consumption_kwh - solar_offset_kwh
        bill_before_solar_inr = (
            calculate_energy_charge(monthly_consumption_kwh, tariff_slabs)
            + fixed_monthly_charge_inr
        )
        bill_after_solar_inr = (
            calculate_energy_charge(grid_import_kwh, tariff_slabs)
            + fixed_monthly_charge_inr
        )
        month_settled_credit_kwh = 0.0
        month_settlement_inr = 0.0
        if settle_at_year_end and month_index == len(monthly_generation) - 1:
            month_settled_credit_kwh = credit_balance_kwh
            month_settlement_inr = (
                month_settled_credit_kwh * CREDIT_SETTLEMENT_RATE_INR_PER_KWH
            )
            settled_credit_kwh = month_settled_credit_kwh
            credit_settlement_inr = month_settlement_inr
            credit_balance_kwh = 0.0
        monthly_bills.append({
            "month": MONTH_NAMES[
                (FINANCIAL_YEAR_START_MONTH - 1 + month_index) % 12
            ],
            "generation_kwh": round(generation_kwh, 1),
            "consumption_kwh": round(monthly_consumption_kwh, 1),
            "solar_offset_kwh": round(solar_offset_kwh, 1),
            "grid_import_kwh": round(grid_import_kwh, 1),
            "credit_balance_kwh": round(credit_balance_kwh, 1),
            "settled_credit_kwh": round(month_settled_credit_kwh, 1),
            "credit_settlement_inr": round(month_settlement_inr, 2),
            "bill_before_solar_inr": round(bill_before_solar_inr, 2),
            "bill_after_solar_inr": round(bill_after_solar_inr, 2),
            "estimated_savings_inr": round(
                bill_before_solar_inr - bill_after_solar_inr, 2
            ),
        })

    return (
        monthly_bills,
        credit_balance_kwh,
        settled_credit_kwh,
        credit_settlement_inr,
    )


@app.get("/")
def home():
    return {"message": "SolarAI FastAPI is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/fault-detection/analyze")
def analyze_fault_image(image_file: UploadFile = File(...)):
    if image_file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(
            status_code=415,
            detail="Upload a JPEG, PNG, or WebP panel photo.",
        )

    image_bytes = image_file.file.read(MAX_FAULT_IMAGE_BYTES + 1)
    if len(image_bytes) > MAX_FAULT_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Image must be 10 MB or smaller.",
        )
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    try:
        with Image.open(io.BytesIO(image_bytes)) as decoded_image:
            if decoded_image.width * decoded_image.height > MAX_FAULT_IMAGE_PIXELS:
                raise HTTPException(
                    status_code=413,
                    detail="Image dimensions must not exceed 40 megapixels.",
                )
            decoded_image.verify()
        with Image.open(io.BytesIO(image_bytes)) as opened_image:
            panel_image = ImageOps.exif_transpose(opened_image).convert("RGB")
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as image_error:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a readable image.",
        ) from image_error

    try:
        result = predict_faults(panel_image)
    except FileNotFoundError as model_error:
        raise HTTPException(status_code=503, detail=str(model_error)) from model_error
    except ValueError as model_error:
        raise HTTPException(
            status_code=500,
            detail=f"Fault detector returned an invalid result: {model_error}",
        ) from model_error

    result["filename"] = Path(image_file.filename or "panel-image").name
    result["message"] = (
        "No condition was detected above the confidence threshold. "
        "This does not confirm that the panel is fault-free."
        if not result["detections"]
        else "Visual screening result only; this model cannot diagnose internal electrical faults."
    )
    return result


@app.get("/api/solar/locations")
def solar_locations():
    cities = load_city_data().sort_values(["state", "city"])
    return {
        "states": sorted(cities["state"].dropna().unique().tolist()),
        "cities": cities[
            ["city_id", "city", "state"]
        ].to_dict(orient="records"),
    }


@app.post("/api/solar/estimate")
def solar_estimate(payload: SolarEstimateRequest):
    cities = load_city_data()
    selected_rows = cities[cities["city_id"] == payload.city_id]
    if selected_rows.empty:
        raise HTTPException(status_code=404, detail="Selected city was not found.")
    selected_city = selected_rows.iloc[0]

    training_cities = load_training_cities()
    exact_match = training_cities[
        training_cities["city_id"] == payload.city_id
    ]
    if exact_match.empty:
        distances = haversine_distances_km(
            float(selected_city["latitude"]),
            float(selected_city["longitude"]),
            training_cities,
        )
        matched_city = training_cities.iloc[int(np.argmin(distances))]
        matched_distance_km = float(np.min(distances))
        prediction_basis = "nearest_city"
    else:
        matched_city = exact_match.iloc[0]
        matched_distance_km = 0.0
        prediction_basis = "selected_city"

    model_bundle = load_model_bundle()
    capacities = sorted(
        pd.read_csv(TRAINING_FILE, usecols=["capacity_kw"])["capacity_kw"]
        .dropna()
        .astype(float)
        .unique()
        .tolist()
    )
    if not capacities:
        raise HTTPException(
            status_code=500,
            detail="No trained system capacity options are available.",
        )

    latitude = float(matched_city["latitude"])
    longitude = float(matched_city["longitude"])
    consumption = float(payload.monthly_consumption_kwh)
    fixed_monthly_charge = float(payload.fixed_monthly_charge_inr)

    capacity_results = []
    for capacity_kw in capacities:
        calendar_generation = predict_monthly_generation(
            model_bundle, latitude, longitude, capacity_kw
        )
        monthly_generation = (
            calendar_generation[FINANCIAL_YEAR_START_MONTH - 1:]
            + calendar_generation[:FINANCIAL_YEAR_START_MONTH - 1]
        )
        monthly_bills, ending_credit_kwh, settled_credit_kwh, settlement_inr = calculate_monthly_bills(
            monthly_generation,
            consumption,
            payload.tariff_slabs,
            fixed_monthly_charge,
        )
        annual_generation = sum(monthly_generation)
        annual_savings = sum(
            item["estimated_savings_inr"] for item in monthly_bills
        ) + settlement_inr
        capacity_results.append({
            "capacity_kw": capacity_kw,
            "annual_generation_kwh": round(annual_generation, 1),
            "annual_savings_inr": round(annual_savings, 2),
            "credit_settlement_inr": round(settlement_inr, 2),
            "settled_credit_kwh": round(settled_credit_kwh, 1),
            "annual_bill_before_solar_inr": round(
                sum(item["bill_before_solar_inr"] for item in monthly_bills),
                2,
            ),
            "annual_bill_after_solar_inr": round(
                sum(item["bill_after_solar_inr"] for item in monthly_bills),
                2,
            ),
            "ending_credit_kwh": round(ending_credit_kwh, 1),
            "meets_annual_consumption": annual_generation >= consumption * 12,
            "monthly_generation_kwh": [
                round(value, 1) for value in monthly_generation
            ],
        })

    suitable_capacities = [
        item for item in capacity_results
        if item["meets_annual_consumption"]
    ]
    recommendation = (
        min(suitable_capacities, key=lambda item: item["capacity_kw"])
        if suitable_capacities
        else capacity_results[-1]
    )

    monthly_results, credit_balance_kwh, settled_credit_kwh, settlement_inr = calculate_monthly_bills(
        recommendation["monthly_generation_kwh"],
        consumption,
        payload.tariff_slabs,
        fixed_monthly_charge,
    )

    yearly_projection = []
    cumulative_savings = 0.0
    for year in range(1, PROJECTION_YEARS + 1):
        degradation_factor = (1 - PANEL_DEGRADATION_RATE) ** (year - 1)
        yearly_generation = [
            item["generation_kwh"] * degradation_factor
            for item in monthly_results
        ]
        year_bills, credit_balance_kwh, year_settled_kwh, year_settlement_inr = calculate_monthly_bills(
            yearly_generation,
            consumption,
            payload.tariff_slabs,
            fixed_monthly_charge,
        )
        year_generation = sum(yearly_generation)
        year_savings = (
            sum(item["estimated_savings_inr"] for item in year_bills)
            + year_settlement_inr
        )
        cumulative_savings += year_savings
        yearly_projection.append({
            "year": year,
            "generation_kwh": round(year_generation, 1),
            "savings_inr": round(year_savings, 2),
            "credit_settlement_inr": round(year_settlement_inr, 2),
            "settled_credit_kwh": round(year_settled_kwh, 1),
            "cumulative_savings_inr": round(cumulative_savings, 2),
            "bill_before_solar_inr": round(
                sum(item["bill_before_solar_inr"] for item in year_bills),
                2,
            ),
            "bill_after_solar_inr": round(
                sum(item["bill_after_solar_inr"] for item in year_bills),
                2,
            ),
            "ending_credit_kwh": round(credit_balance_kwh, 1),
        })

    return {
        "requested_city": {
            "city": str(selected_city["city"]),
            "state": str(selected_city["state"]),
        },
        "prediction_city": {
            "city": str(matched_city["city"]),
            "state": str(matched_city["state"]),
            "distance_km": round(matched_distance_km, 1),
            "basis": prediction_basis,
        },
        "monthly_consumption_kwh": consumption,
        "tariff_slabs": [
            slab.model_dump() for slab in payload.tariff_slabs
        ],
        "fixed_monthly_charge_inr": fixed_monthly_charge,
        "financial_year": "April to March",
        "credit_settlement_rate_inr_per_kwh": CREDIT_SETTLEMENT_RATE_INR_PER_KWH,
        "recommended_capacity_kw": recommendation["capacity_kw"],
        "recommendation_note": (
            "Smallest available system size estimated to meet annual use."
            if suitable_capacities
            else "Highest available system size; annual production may not meet annual use."
        ),
        "annual_generation_kwh": recommendation["annual_generation_kwh"],
        "annual_bill_before_solar_inr": round(
            sum(item["bill_before_solar_inr"] for item in monthly_results),
            2,
        ),
        "annual_bill_after_solar_inr": round(
            sum(item["bill_after_solar_inr"] for item in monthly_results),
            2,
        ),
        "ending_credit_kwh": round(
            monthly_results[-1]["credit_balance_kwh"], 1
        ),
        "settled_credit_kwh": round(settled_credit_kwh, 1),
        "credit_settlement_inr": round(settlement_inr, 2),
        "estimated_annual_savings_inr": round(
            sum(item["estimated_savings_inr"] for item in monthly_results)
            + settlement_inr,
            2,
        ),
        "monthly_estimates": monthly_results,
        "capacity_comparison": capacity_results,
        "yearly_projection": yearly_projection,
        "model_metrics": {
            "mae_kwh_per_month": model_bundle.get("mae"),
            "rmse_kwh_per_month": model_bundle.get("rmse"),
        },
        "assumptions": [
            "Production is estimated by the trained model using PVGIS-derived data.",
            "Monthly solar credits carry forward only within the April-to-March financial year.",
            f"Unused solar credit is settled at ₹{CREDIT_SETTLEMENT_RATE_INR_PER_KWH:.0f}/kWh at financial-year end and the kWh balance resets to zero.",
            "Energy charges use progressive monthly tariff slabs; each slab rate applies only to units in that range.",
            "The selected monthly fixed charge is added to both bills and remains payable; it is not offset by solar credits.",
            "Export compensation, other taxes or demand charges, subsidies, installation cost, and tariff changes are excluded.",
            f"Long-term chart applies {PANEL_DEGRADATION_RATE * 100:.1f}% annual panel degradation with consumption, tariff slabs, and fixed charges held constant; each financial year settles and resets unused credits.",
        ],
    }
