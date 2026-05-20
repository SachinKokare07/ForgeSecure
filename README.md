# ForgeSecure

A compact guide to get ForgeSecure running locally. This README focuses on a clear quick-start, required services, and where to look for code.

## Overview

ForgeSecure is a real-time Industrial Security Operations Center (SOC) prototype. It simulates industrial devices, collects telemetry, runs AI-based anomaly detection, stores logs in MongoDB, and displays incidents on a React dashboard with live Socket.IO updates.

## Quickstart (fast path)

Prerequisites: `node >= 16`, `npm`, `python >= 3.8`, `pip`, and MongoDB running locally or accessible via connection string.

1) Clone the repo

```bash
git clone <repository-url>
cd ForgeSecure
```

2) Start backend (API + simulator)

```bash
cd backend
npm install
# create .env from .env.example and set MONGO_URI if needed
npm run dev
```

3) Start AI service

```bash
cd ai-service
pip install -r requirements.txt
python train.py    # trains and writes saved_model.pkl
uvicorn app:app --reload --port 8000
```

4) Start frontend

```bash
cd frontend
npm install
npm run dev
```

5) (Optional) Run the simulator separately

```bash
cd backend
node simulator/simulator.js
```

After these steps the services typically run at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI service: http://127.0.0.1:8000

## Project layout (important files)

- `backend/` — Express API, Socket.IO, simulator (start point: `server.js`)
- `frontend/` — React + Vite app (entry: `src/main.jsx`, page: `src/pages/Dashboard.jsx`)
- `ai-service/` — FastAPI endpoint and training (`app.py`, `train.py`)

See relevant code for controllers and services:
- `backend/controllers/` — API handlers
- `backend/routes/` — Express routes
- `backend/simulator/` — `simulator.js` sends telemetry to API
- `frontend/src/services/api.js` — frontend API wrappers
- `frontend/src/socket/socket.js` — Socket.IO client setup

## How it works (brief)

1. Simulator or real devices POST telemetry to the backend `/api/device-data`.
2. Backend stores logs, forwards data to the AI service for scoring, and broadcasts anomalies via Socket.IO.
3. Frontend subscribes to Socket.IO for live telemetry and incident updates.

## Useful commands

- Start backend: `cd backend && npm run dev`
- Run simulator: `node backend/simulator/simulator.js`
- Start AI service (dev): `uvicorn app:app --reload --port 8000`
- Start frontend: `cd frontend && npm run dev`

## API (short)

- `GET /api/logs` — fetch logs
- `POST /api/device-data` — submit telemetry
- `PATCH /api/logs/:id/status` — update incident status (`ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`)

Request example for status update:

```json
{
  "incidentStatus": "ACKNOWLEDGED"
}
```

## Notes & next steps

- If you use a remote MongoDB, set `MONGO_URI` in `backend/.env`.
- The AI service requires training data; see `ai-service/dataset` and `train.py`.
- To enable TLS, authentication, or RBAC, extend the backend middleware and frontend auth flows.

## Contributing

Small PRs welcome. For larger changes, open an issue first to discuss design.

## License

This project is provided for educational and research purposes.