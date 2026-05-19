const axios = require("axios");

const Log = require("../models/Log");

const receiveDeviceData = async (
  req,
  res
) => {

  try {

    const aiResponse = await axios.post(

      process.env.AI_SERVICE_URL,

      {

        duration: req.body.duration,

        src_bytes: req.body.src_bytes,

        dst_bytes: req.body.dst_bytes,

        src_pkts: req.body.src_pkts,

        dst_pkts: req.body.dst_pkts,

      }

    );

    const prediction = aiResponse.data;

    const newLog = await Log.create({

      device: req.body.device,

      duration: req.body.duration,

      src_bytes: req.body.src_bytes,

      dst_bytes: req.body.dst_bytes,

      src_pkts: req.body.src_pkts,

      dst_pkts: req.body.dst_pkts,

      status: prediction.status,

      severity: prediction.severity,

      confidence: prediction.confidence,

      incidentStatus:
        prediction.status === "ANOMALY"
          ? "ACTIVE"
          : "RESOLVED",

    });

    req.io.emit(
      "new-log",
      newLog
    );

    if (
      prediction.status === "ANOMALY"
    ) {

      req.io.emit(
        "anomaly-detected",
        newLog
      );

    }

    res.status(201).json({

      success: true,

      data: newLog,

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

const getLogs = async (
  req,
  res
) => {

  try {

    const logs = await Log.find()
      .sort({ createdAt: -1 });

    res.status(200).json({

      success: true,

      data: logs,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

const updateIncidentStatus = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const { incidentStatus } = req.body;

    const updatedLog =
      await Log.findByIdAndUpdate(

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