import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

dataset = pd.read_csv("dataset/ton_iot.csv")

feature_columns = ["duration", "src_bytes", "dst_bytes", "src_pkts", "dst_pkts"]

for col in feature_columns:
  if col not in dataset.columns:
    raise ValueError(f"Column '{col}' not found in dataset")

features = dataset[feature_columns].dropna()

scaler = StandardScaler()
scaled_features = scaler.fit_transform(features)
joblib.dump(scaler, "saved_scaler.pkl")

model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
model.fit(scaled_features)
joblib.dump(model, "saved_model.pkl")

print("Model training complete. Saved to saved_model.pkl")