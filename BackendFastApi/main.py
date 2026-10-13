
from fastapi import FastAPI

app = FastAPI(title="SolarAI")

@app.get("/")
def home():
    return {"message": "SolarAI FastAPI is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/predict")
def predict(temperature: float, solar_irradiance: float):
    # Temporary placeholder, not a trained ML prediction
    return {
        "temperature": temperature,
        "solar_irradiance": solar_irradiance,
        "message": "Prediction endpoint is working"
    }