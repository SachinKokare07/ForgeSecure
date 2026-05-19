const Log = require("../models/Log");

const getPrediction = require("../services/aiService");

const receiveDeviceData = async (req, res) => {
  try {
    console.log("Incoming Data:");
    console.log(req.body);

    const prediction = await getPrediction(req.body);

    const newLog = await Log.create({
      device: req.body.device,

      traffic: req.body.traffic,

      cpu: req.body.cpu,

      temperature: req.body.temperature,

      status: prediction.status,

      severity: prediction.severity,

      confidence: prediction.confidence,

      incidentStatus: prediction.status === "ANOMALY" ? "ACTIVE" : "RESOLVED",
    });

    req.io.emit("new-log", newLog);

    if (prediction.status === "ANOMALY") {
      req.io.emit("anomaly-detected", newLog);
    }

    res.status(201).json({
      success: true,
      data: newLog,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(50);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateIncidentStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const { incidentStatus } = req.body;

    const updatedLog = await Log.findByIdAndUpdate(

      id,

      {
        incidentStatus,
      },

      {
        new: true,
      }

    );

    req.io.emit(
      "incident-updated",
      updatedLog
    );

    res.status(200).json({
      success: true,
      data: updatedLog,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

module.exports = {
  receiveDeviceData,
  getLogs,
  updateIncidentStatus,
};
