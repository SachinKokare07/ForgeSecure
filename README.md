# 🔐 ForgeSecure

> **Real-time Industrial Security Operations Center (SOC) Dashboard**

ForgeSecure monitors industrial device telemetry, detects anomalies using AI, and manages security incidents in real time. It simulates industrial network traffic from devices such as PLCs, CNC machines, and robotic arms — analyzing, storing, and streaming live data to a React dashboard.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [AI Detection Logic](#ai-detection-logic)
- [Real-Time Features](#real-time-features)
- [Incident Workflow](#incident-workflow)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## ✨ Features

- 📡 **Real-time industrial telemetry monitoring**
- 🤖 **AI-based anomaly detection** with confidence scoring
- 🚨 **Live threat feed** and critical threat alerts
- 🗂️ **Incident management workflow** (Active → Acknowledged → Resolved)
- 📊 **Traffic analytics charts**
- 🔄 **Socket.IO live updates** — no page reload needed
- 🏭 **Industrial device simulator** (PLC, CNC, Robot Arm)
- 🗄️ **MongoDB log storage**

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Tailwind CSS, Recharts, Axios, Socket.IO Client |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, Socket.IO |
| **AI Service** | Python, FastAPI, Scikit-learn, Joblib |

---

## 📁 Project Structure

```
ForgeSecure/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── simulator/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── socket/
│   │   └── App.jsx
│   └── package.json
│
├── ai-service/
│   ├── app.py
│   ├── train.py
│   ├── saved_model.pkl
│   └── requirements.txt
│
└── README.md
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ForgeSecure
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```
You can create your own `.env` file using `.env.example` as reference.

Example:

cp .env.example .env

Start the backend:

```bash
npm run dev
```

> Backend runs at `http://localhost:5000`

---

### 3. AI Service Setup

```bash
cd ai-service
pip install fastapi uvicorn scikit-learn numpy pandas joblib
```

Train the model:

```bash
python train.py
```

This generates `saved_model.pkl`. Then start the AI service:

```bash
uvicorn app:app --reload --port 8000
```

> AI service runs at `http://127.0.0.1:8000`

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs at `http://localhost:5173`

---

### 5. Start the Industrial Simulator

```bash
cd backend
node simulator/simulator.js
```

The simulator continuously sends industrial telemetry data to the backend.

---

## 📡 API Endpoints

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/logs` | Retrieve all logs |

### Device Telemetry

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/device-data` | Send device telemetry data |

### Incident Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/api/logs/:id/status` | Update incident status |

**Request Body:**

```json
{
  "incidentStatus": "ACKNOWLEDGED"
}
```

**Possible Status Values:**

| Value | Description |
|-------|-------------|
| `ACTIVE` | Newly detected incident |
| `ACKNOWLEDGED` | Analyst has reviewed it |
| `RESOLVED` | Incident closed |

---

## 🧠 AI Detection Logic

The AI service analyzes the following telemetry signals:

- 🌐 Network traffic
- 💻 CPU usage
- 🌡️ Temperature

Each data point is classified as:

| Classification | Description |
|---|---|
| `NORMAL` | Expected device behavior |
| `ANOMALY` | Suspicious or irregular behavior |

Anomalies also include a **severity level** and **confidence score** for analyst triage.

---

## ⚡ Real-Time Features

ForgeSecure uses **Socket.IO** to push live updates for:

- Live telemetry streams
- Incident synchronization across clients
- Anomaly broadcasts
- Dashboard refresh without page reload

---

## 🔄 Incident Workflow

```
AI detects anomaly
       │
       ▼
Incident marked ACTIVE
       │
       ▼
Analyst acknowledges → ACKNOWLEDGED
       │
       ▼
Incident resolved manually → RESOLVED
```

---

## 🏭 Sample Devices

| Device ID | Type |
|---|---|
| `PLC_01` | Programmable Logic Controller |
| `PLC_02` | Programmable Logic Controller |
| `CNC_MACHINE_01` | CNC Machine |
| `ROBOT_ARM_01` | Robotic Arm |
| `UNKNOWN_DEVICE` | Unidentified Device |

---

## 🔮 Future Improvements

- [ ] Threat filtering and advanced search
- [ ] PDF / CSV export for reports
- [ ] Historical log search
- [ ] User authentication
- [ ] Role-based access control (RBAC)
- [ ] Enhanced threat analytics

---

## 📄 License

This project is intended for **educational and research purposes** only.