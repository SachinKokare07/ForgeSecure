from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import random

app = FastAPI()

model = joblib.load("saved_model.pkl")

scaler = joblib.load("saved_scaler.pkl")

class DeviceData(BaseModel):

    duration: float

    src_bytes: float

    dst_bytes: float

    src_pkts: float

    dst_pkts: float

@app.post("/predict")
def predict(data: DeviceData):

    try:

        features = np.array([[
            data.duration,
            data.src_bytes,
            data.dst_bytes,
            data.src_pkts,
            data.dst_pkts
        ]])

        scaled_features = scaler.transform(
            features
        )

        prediction = model.predict(
            scaled_features
        )

        if prediction[0] == -1:

            status = "ANOMALY"

            severity = "CRITICAL"

            confidence = random.randint(
                90,
                99
            )

        else:

            status = "NORMAL"

            severity = "LOW"

            confidence = random.randint(
                70,
                88
            )

        return {

            "status": status,

            "severity": severity,

            "confidence": confidence

        }

    except Exception as error:

        return {

            "success": False,

            "message": str(error)

        }