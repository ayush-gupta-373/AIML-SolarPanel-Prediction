from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import GroupShuffleSplit

ML_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ML_DIR.parent
DATA_FILE = BACKEND_DIR / "data" / "processed" / "india_solar_training.csv"
MODEL_FILE = ML_DIR / "artifacts" / "monthly_generation.joblib"

df = pd.read_csv(DATA_FILE)

required = {
    "city_id", "latitude", "longitude", "capacity_kw", "month", "E_m"
}
missing = required - set(df.columns)
if missing:
    raise ValueError(f"Dataset is missing columns: {sorted(missing)}")

df = df.drop_duplicates(subset=["city_id", "capacity_kw", "month"]).copy()

for column in ["latitude", "longitude", "capacity_kw", "month", "E_m"]:
    df[column] = pd.to_numeric(df[column], errors="coerce")

df = df.dropna(subset=list(required)).copy()
df = df[df["month"].between(1, 12) & (df["capacity_kw"] > 0) & (df["E_m"] >= 0)].copy()

df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

features = [
    "latitude", "longitude", "capacity_kw", "month_sin", "month_cos"
]
X = df[features]
y = df["E_m"]
groups = df["city_id"]

splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_indices, test_indices = next(splitter.split(X, y, groups=groups))

model = HistGradientBoostingRegressor(
    max_iter=200,
    learning_rate=0.08,
    max_leaf_nodes=15,
    l2_regularization=1.0,
    random_state=42,
)
model.fit(X.iloc[train_indices], y.iloc[train_indices])

actual = y.iloc[test_indices]
predicted = np.maximum(0, model.predict(X.iloc[test_indices]))

mae = mean_absolute_error(actual, predicted)
rmse = np.sqrt(mean_squared_error(actual, predicted))

print(f"Training rows: {len(train_indices)}")
print(f"Test rows: {len(test_indices)}")
print(f"Test cities: {groups.iloc[test_indices].nunique()}")
print(f"MAE: {mae:.2f} kWh/month")
print(f"RMSE: {rmse:.2f} kWh/month")

MODEL_FILE.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(
    {
        "model": model,
        "features": features,
        "target": "E_m",
        "target_unit": "kWh/month",
        "mae": mae,
        "rmse": rmse,
    },
    MODEL_FILE,
)
print(f"Saved model to: {MODEL_FILE}")