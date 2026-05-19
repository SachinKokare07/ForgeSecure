const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({

  device: {
    type: String,
    required: true,
  },

  duration: {
    type: Number,
    required: true,
  },

  src_bytes: {
    type: Number,
    required: true,
  },

  dst_bytes: {
    type: Number,
    required: true,
  },

  src_pkts: {
    type: Number,
    required: true,
  },

  dst_pkts: {
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