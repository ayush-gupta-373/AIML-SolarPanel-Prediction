
import requests
from pathlib import Path

url = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc"

params = {
    "lat": 26.4499,
    "lon": 80.3319,
    "peakpower": 3,
    "loss": 14,
    "angle": 20,
    "aspect": 0,
    "mountingplace": "building",
    "outputformat": "csv"
}

response = requests.get(url, params=params, timeout=60)
response.raise_for_status()

output_dir = Path("data/raw")
output_dir.mkdir(parents=True, exist_ok=True)

output_file = output_dir / "kanpur_3kw_pvgis.csv"
output_file.write_bytes(response.content)

print("PVGIS CSV downloaded successfully!")
print("Saved to:", output_file.resolve())
print("Response size:", len(response.content), "bytes")
