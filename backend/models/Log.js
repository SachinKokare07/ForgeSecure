const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    device: {
      type: String,
      required: true,
    },

    traffic: {
      type: Number,
      required: true,
    },

    cpu: {
      type: Number,
      required: true,
    },

    temperature: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["NORMAL", "ANOMALY"],
      default: "NORMAL",
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Log", logSchema);