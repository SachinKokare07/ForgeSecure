const express = require("express");

const {
  receiveDeviceData,
  getLogs,
  updateIncidentStatus,
} = require("../controllers/deviceController");

const router = express.Router();

router.post("/device-data", receiveDeviceData);

router.get("/logs", getLogs);

router.patch(
  "/logs/:id/status",
  updateIncidentStatus
);

module.exports = router;