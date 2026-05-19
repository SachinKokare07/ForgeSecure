from sklearn.ensemble import IsolationForest
import numpy as np
import joblib

# Generate broader normal industrial behavior
X_train = []

for _ in range(500):

    traffic = np.random.randint(100, 250)

    cpu = np.random.randint(30, 60)

    temperature = np.random.randint(40, 60)

    X_train.append([
        traffic,
        cpu,
        temperature
    ])

X_train = np.array(X_train)

model = IsolationForest(
    contamination=0.05,
    random_state=42
)

model.fit(X_train)

joblib.dump(model, "saved_model.pkl")

print("ForgeSecure AI Model Trained Successfully")