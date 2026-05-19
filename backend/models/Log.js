const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({

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
    required: true,
  },

  severity: {
    type: String,
    required: true,
  },

  confidence: {
    type: Number,
    required: true,
  },
  
  incidentStatus: {
  type: String,
  default: "ACTIVE",
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model("Log", logSchema);