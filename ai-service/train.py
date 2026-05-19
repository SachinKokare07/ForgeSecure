import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

# LOAD DATASET
df = pd.read_csv("dataset/ton_iot.csv")

print("\nDataset Loaded Successfully")

# ==========================================
# SELECT FEATURES
# ==========================================

FEATURE_COLUMNS = [

    "duration",

    "src_bytes",

    "dst_bytes",

    "src_pkts",

    "dst_pkts"

]

# VERIFY COLUMNS
for column in FEATURE_COLUMNS:

    if column not in df.columns:

        raise Exception(
            f"Column '{column}' not found."
        )

# EXTRACT FEATURES
X = df[FEATURE_COLUMNS]

# REMOVE NULLS
X = X.dropna()

print("\nFeatures Selected")
print(X.head())

# ==========================================
# SCALE DATA
# ==========================================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

# SAVE SCALER
joblib.dump(
    scaler,
    "saved_scaler.pkl"
)

print("\nScaler Saved")

# ==========================================
# TRAIN MODEL
# ==========================================

model = IsolationForest(

    n_estimators=100,

    contamination=0.05,

    random_state=42

)

model.fit(X_scaled)

print("\nModel Trained Successfully")

# ==========================================
# SAVE MODEL
# ==========================================

joblib.dump(
    model,
    "saved_model.pkl"
)

print("\nModel Saved Successfully")

# ==========================================
# TEST PREDICTION
# ==========================================

sample_data = pd.DataFrame([{

    "duration": 10,

    "src_bytes": 5000,

    "dst_bytes": 4500,

    "src_pkts": 100,

    "dst_pkts": 90

}])

sample_scaled = scaler.transform(sample_data)

prediction = model.predict(sample_scaled)

print("\nTest Prediction")

if prediction[0] == -1:

    print("ANOMALY DETECTED")

else:

    print("NORMAL TRAFFIC")