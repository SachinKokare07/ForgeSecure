from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

model = joblib.load("saved_model.pkl")


class DeviceData(BaseModel):
    traffic: int
    cpu: int
    temperature: int


@app.get("/")
def home():
    return {
        "message": "ForgeSecure AI Service Running"
    }


@app.post("/predict")
def predict(data: DeviceData):

    features = np.array([[
        data.traffic,
        data.cpu,
        data.temperature
    ]])

    prediction = model.predict(features)

    status = "NORMAL"

    if prediction[0] == -1:
        status = "ANOMALY"

    severity = "LOW"

    if data.traffic > 3000:
        severity = "CRITICAL"

    return {
        "status": status,
        "severity": severity
    }