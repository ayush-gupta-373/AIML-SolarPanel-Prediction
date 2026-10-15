
import pandas as pd
from pathlib import Path

# Locate the dataset
file_path = (
    Path(__file__).parent
    / "data"
    / "processed"
    / "india_solar_training.csv"
)

# Load the CSV file
df = pd.read_csv(file_path)

print("\n--- DATASET VALIDATION ---")

# 1. Dataset size
print("\n1. Dataset shape:")
print("Rows:", len(df))
print("Columns:", len(df.columns))

# 2. Column names
print("\n2. Column names:")
print(df.columns.tolist())

# 3. Missing values
print("\n3. Missing values per column:")
print(df.isnull().sum())

# 4. Duplicate rows
print("\n4. Duplicate rows:", df.duplicated().sum())

# 5. Data types
print("\n5. Data types:")
print(df.dtypes)

# 6. Basic numerical statistics
print("\n6. Numerical statistics:")
print(df.describe())

# 7. Unique cities and capacities
print("\n7. Unique cities:", df["city"].nunique())
print("Unique capacities:", sorted(df["capacity_kw"].unique()))
print("Unique months:", sorted(df["month"].unique()))

# 8. Check expected values
print("\n8. Expected-value checks:")
print("Invalid months:", (~df["month"].between(1, 12)).sum())
print("Non-positive capacities:", (df["capacity_kw"] <= 0).sum())

solar_columns = ["E_d", "E_m", "H(i)_d", "H(i)_m", "SD_m"]

for column in solar_columns:
    df[column] = pd.to_numeric(df[column], errors="coerce")

print(
    "Missing or non-numeric solar values:",
    df[solar_columns].isna().sum().sum()
)

print("\nValidation report completed.")
