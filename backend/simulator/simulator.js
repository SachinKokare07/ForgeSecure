const axios = require("axios");

const API_URL = "http://localhost:5000/api/device-data";
const POLL_INTERVAL = 3000;

const generateData = () => {
  const isAnomaly = Math.random() > 0.7;

  if (isAnomaly) {
    return {
      device: "UNKNOWN_DEVICE",
      duration: Math.random() * 500,
      src_bytes: 80000 + Math.random() * 100000,
      dst_bytes: 60000 + Math.random() * 90000,
      src_pkts: 500 + Math.random() * 1000,
      dst_pkts: 400 + Math.random() * 900,
    };
  }

  return {
    device: "PLC_01",
    duration: Math.random() * 10,
    src_bytes: 1000 + Math.random() * 5000,
    dst_bytes: 500 + Math.random() * 3000,
    src_pkts: 10 + Math.random() * 50,
    dst_pkts: 10 + Math.random() * 40,
  };
};

const sendData = async () => {
  try {
    const data = generateData();
    const response = await axios.post(API_URL, data);
  } catch (error) {
    if (!error.response) {
      console.error("Simulator error:", error.message);
    }
  }
};

console.log("ForgeSecure Simulator started, sending telemetry every", POLL_INTERVAL / 1000, "seconds");
setInterval(sendData, POLL_INTERVAL);