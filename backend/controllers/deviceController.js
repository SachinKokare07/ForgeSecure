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
    });

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

    const logs = await Log.find().sort({ createdAt: -1 });

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

module.exports = {
  receiveDeviceData,
  getLogs,
};