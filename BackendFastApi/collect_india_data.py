
import io
import re
import time
import zipfile
from pathlib import Path

import pandas as pd
import requests


# ============================================================
# 1. PROJECT PATHS AND SETTINGS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

CITY_FILE = RAW_DIR / "india_city_coordinates.csv"
OUTPUT_FILE = PROCESSED_DIR / "india_solar_training.csv"

GEONAMES_URL = "https://download.geonames.org/export/dump/IN.zip"
ADMIN1_URL = (
    "https://download.geonames.org/export/dump/admin1CodesASCII.txt"
)

PVGIS_URL = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc"

# Start with 5 cities for testing.
# Change to 1000 after confirming the script works.
TARGET_CITIES = 1000
MAX_CITIES = 250

# Solar-system capacities to simulate.
CAPACITIES_KW = [1, 2, 3, 5, 10]

REQUEST_DELAY = 1.0
MAX_RETRIES = 4

session = requests.Session()
session.headers.update({"User-Agent": "SolarAI-Student-Project/1.0"})


# ============================================================
# 2. DOWNLOAD AND LOAD INDIAN CITY DATA
# ============================================================

def load_indian_cities():
    print("\nDownloading GeoNames India city data...")

    response = session.get(GEONAMES_URL, timeout=120)
    response.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
        with archive.open("IN.txt") as file:
            cities = pd.read_csv(
                file,
                sep="\t",
                header=None,
                dtype={0: str, 10: str},
                low_memory=False
            )

    cities = cities.iloc[:, :19]
    cities.columns = [
        "geonameid",
        "name",
        "asciiname",
        "alternatenames",
        "latitude",
        "longitude",
        "feature_class",
        "feature_code",
        "country_code",
        "cc2",
        "admin1",
        "admin2",
        "admin3",
        "admin4",
        "population",
        "elevation",
        "dem",
        "timezone",
        "modification_date"
    ]

    # Keep populated places in India with a positive population.
    cities = cities[
        (cities["country_code"] == "IN")
        & (cities["feature_class"] == "P")
    ].copy()

    cities["population"] = pd.to_numeric(
        cities["population"], errors="coerce"
    )
    cities["latitude"] = pd.to_numeric(
        cities["latitude"], errors="coerce"
    )
    cities["longitude"] = pd.to_numeric(
        cities["longitude"], errors="coerce"
    )

    cities = cities[
        (cities["population"] > 0)
        & cities["latitude"].between(6, 38)
        & cities["longitude"].between(68, 98)
    ].copy()

    # Download state/administrative-region names.
    print("Downloading state-name mapping...")

    response = session.get(ADMIN1_URL, timeout=60)
    response.raise_for_status()

    admin1 = pd.read_csv(
        io.StringIO(response.text),
        sep="\t",
        header=None,
        names=["code", "name", "name_ascii", "geoname_id"],
        dtype=str
    )

    # Example mapping key: IN.16 -> Maharashtra.
    state_map = dict(zip(admin1["code"], admin1["name"]))

    # GeoNames admin1 values can contain codes such as 16 or 07.
    cities["state"] = cities["admin1"].apply(
        lambda code: state_map.get(
            f"IN.{str(code).strip().split('.')[0].zfill(2)}",
            "Unknown"
        )
    )

    cities = cities.sort_values(
        "population", ascending=False
    ).drop_duplicates(subset=["geonameid"])

    # Choose the largest populated places.
    selected = cities.head(min(TARGET_CITIES, MAX_CITIES)).copy()

    result = pd.DataFrame({
        "city_id": selected["geonameid"],
        "city": selected["name"],
        "state": selected["state"],
        "latitude": selected["latitude"],
        "longitude": selected["longitude"],
        "population": selected["population"].astype("int64")
    })

    result.to_csv(CITY_FILE, index=False)

    print(f"Saved {len(result)} cities to:")
    print(CITY_FILE)

    print("\nFirst selected cities:")
    print(result.head().to_string(index=False))

    if (result["state"] == "Unknown").any():
        print(
            "\nWarning: Some state names are Unknown. "
            "Check the GeoNames admin1 mapping."
        )

    return result


# ============================================================
# 3. PARSE MONTHLY PVGIS CSV RESPONSE
# ============================================================

def parse_pvgis_csv(csv_text):
    lines = csv_text.splitlines()
    header_index = None

    # PVGIS CSV files include metadata before the monthly table.
    for i, line in enumerate(lines):
        cleaned = line.strip().lstrip("#").strip()
        normalized = cleaned.lower()

        if (
            normalized.startswith("month")
            and "e_m" in normalized
        ):
            header_index = i
            break

    if header_index is None:
        raise ValueError(
            "Monthly table not found in PVGIS response."
        )

    table_text = "\n".join(lines[header_index:])

    df = pd.read_csv(
        io.StringIO(table_text),
        sep=None,
        engine="python",
        on_bad_lines="skip"
    )

    df.columns = [
        str(column).strip().lstrip("#").strip()
        for column in df.columns
    ]

    # Remove spaces around column names.
    df = df.rename(columns={
        column: re.sub(r"\s+", "", column)
        for column in df.columns
    })

    if "month" not in [c.lower() for c in df.columns]:
        raise ValueError("Month column is missing from PVGIS data.")

    # Normalize common column names.
    rename_map = {}
    for column in df.columns:
        lower = column.lower()
        if lower == "month":
            rename_map[column] = "month"
        elif lower == "e_d":
            rename_map[column] = "E_d"
        elif lower == "e_m":
            rename_map[column] = "E_m"
        elif lower == "h(i)_d":
            rename_map[column] = "H(i)_d"
        elif lower == "h(i)_m":
            rename_map[column] = "H(i)_m"
        elif lower == "sd_m":
            rename_map[column] = "SD_m"

    df = df.rename(columns=rename_map)

    if "E_m" not in df.columns:
        raise ValueError("Monthly energy column E_m is missing.")

    df["month"] = pd.to_numeric(df["month"], errors="coerce")
    df = df[df["month"].between(1, 12)].copy()

    for column in ["E_d", "E_m", "H(i)_d", "H(i)_m", "SD_m"]:
        if column in df.columns:
            df[column] = pd.to_numeric(
                df[column], errors="coerce"
            )

    df = df.dropna(subset=["month", "E_m"])
    df["month"] = df["month"].astype(int)

    if len(df) < 12:
        raise ValueError(
            f"Expected 12 monthly records; found {len(df)}."
        )

    return df.drop_duplicates(subset=["month"]).sort_values("month").head(12)


# ============================================================
# 4. FETCH SOLAR ESTIMATES FOR ONE CITY AND CAPACITY
# ============================================================

def fetch_solar_data(city, capacity_kw):
    params = {
        "lat": float(city["latitude"]),
        "lon": float(city["longitude"]),
        "peakpower": float(capacity_kw),
        "loss": 14,
        "angle": 20,
        "aspect": 0,
        "mountingplace": "building",
        "outputformat": "csv"
    }

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = session.get(
                PVGIS_URL,
                params=params,
                timeout=90
            )
            response.raise_for_status()

            monthly = parse_pvgis_csv(response.text)

            # Add the city and solar-system information to every month.
            monthly["city_id"] = str(city["city_id"])
            monthly["city"] = city["city"]
            monthly["state"] = city["state"]
            monthly["latitude"] = float(city["latitude"])
            monthly["longitude"] = float(city["longitude"])
            monthly["population"] = int(city["population"])
            monthly["capacity_kw"] = float(capacity_kw)

            return monthly

        except Exception as error:
            print(
                f"Attempt {attempt}/{MAX_RETRIES} failed for "
                f"{city['city']} ({capacity_kw} kW): {error}"
            )

            if attempt < MAX_RETRIES:
                time.sleep(2 ** attempt)

    return None


# ============================================================
# 5. RESUME PREVIOUS WORK AND COLLECT TRAINING DATA
# ============================================================

def collect_solar_data(cities):
    completed = set()

    if OUTPUT_FILE.exists() and OUTPUT_FILE.stat().st_size > 0:
        try:
            existing = pd.read_csv(
                OUTPUT_FILE,
                dtype={"city_id": str}
            )

            required = {"city_id", "capacity_kw", "month"}

            if required.issubset(existing.columns):
                # Only mark a city/capacity pair complete when
                # all 12 distinct months are present.
                month_counts = existing.groupby(
                    ["city_id", "capacity_kw"]
                )["month"].nunique()

                completed = {
                    (str(city_id), float(capacity))
                    for (city_id, capacity), count in month_counts.items()
                    if count >= 12
                }

            print(
                f"\nFound {len(completed)} completed "
                "city/capacity combinations. Resuming..."
            )

        except Exception as error:
            print(f"Could not read existing output: {error}")
            print("Starting a new collection run.")

    total = len(cities) * len(CAPACITIES_KW)
    job_number = 0

    for _, city in cities.iterrows():
        for capacity_kw in CAPACITIES_KW:
            job_number += 1

            key = (str(city["city_id"]), float(capacity_kw))

            if key in completed:
                print(
                    f"[{job_number}/{total}] Skipping "
                    f"{city['city']} ({capacity_kw} kW): complete"
                )
                continue

            print(
                f"\n[{job_number}/{total}] Fetching "
                f"{city['city']}, {city['state']} "
                f"at {capacity_kw} kW..."
            )

            monthly = fetch_solar_data(city, capacity_kw)

            if monthly is None or monthly["month"].nunique() != 12:
                print("Skipping this combination for now.")
                continue

            # Keep a consistent column order.
            columns = [
                "city_id", "city", "state",
                "latitude", "longitude", "population",
                "capacity_kw", "month",
                "E_d", "E_m", "H(i)_d", "H(i)_m", "SD_m"
            ]

            for column in columns:
                if column not in monthly.columns:
                    monthly[column] = pd.NA

            monthly = monthly[columns]

            # Append results so completed work is preserved.
            monthly.to_csv(
                OUTPUT_FILE,
                mode="a",
                header=not OUTPUT_FILE.exists()
                or OUTPUT_FILE.stat().st_size == 0,
                index=False
            )

            print(f"Saved 12 monthly records to {OUTPUT_FILE}")
            time.sleep(REQUEST_DELAY)

    print("\nCollection process finished.")
    print(f"City coordinates: {CITY_FILE}")
    print(f"Solar training data: {OUTPUT_FILE}")


# ============================================================
# 6. MAIN
# ============================================================

if __name__ == "__main__":
    try:
        city_data = load_indian_cities()
        collect_solar_data(city_data)

    except KeyboardInterrupt:
        print(
            "\nStopped by user. Saved data is preserved. "
            "Run the script again to resume."
        )

    except Exception as error:
        print(f"\nScript stopped because of an error: {error}")
        raise
