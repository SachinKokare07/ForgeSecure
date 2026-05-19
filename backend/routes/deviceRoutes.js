const express = require("express");

const {
  receiveDeviceData,
  getLogs,
} = require("../controllers/deviceController");

const router = express.Router();

router.post("/device-data", receiveDeviceData);

router.get("/logs", getLogs);

module.exports = router;