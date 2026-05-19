from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import random

app = FastAPI()

model = joblib.load("saved_model.pkl")

class DeviceData(BaseModel):
    traffic: float
    cpu: float
    temperature: float

@app.post("/predict")
def predict(data: DeviceData):

    features = np.array([[
        data.traffic,
        data.cpu,
        data.temperature
    ]])

    prediction = model.predict(features)

    if prediction[0] == -1:

        status = "ANOMALY"
        severity = "CRITICAL"

        confidence = random.randint(90, 99)

    else:

        status = "NORMAL"
        severity = "LOW"

        confidence = random.randint(70, 88)

    return {
        "status": status,
        "severity": severity,
        "confidence": confidence
    }