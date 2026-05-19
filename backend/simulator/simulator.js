const axios = require("axios");

const API_URL =
  "http://localhost:5000/api/device-data";

console.log(
  "ForgeSecure Simulator Started..."
);

const generateData = () => {

  const anomaly = Math.random() > 0.7;

  if (anomaly) {

    return {

      device: "UNKNOWN_DEVICE",

      duration:
        Math.random() * 500,

      src_bytes:
        80000 +
        Math.random() * 100000,

      dst_bytes:
        60000 +
        Math.random() * 90000,

      src_pkts:
        500 +
        Math.random() * 1000,

      dst_pkts:
        400 +
        Math.random() * 900,

    };

  }

  return {

    device: "PLC_01",

    duration:
      Math.random() * 10,

    src_bytes:
      1000 +
      Math.random() * 5000,

    dst_bytes:
      500 +
      Math.random() * 3000,

    src_pkts:
      10 +
      Math.random() * 50,

    dst_pkts:
      10 +
      Math.random() * 40,

  };

};

const sendData = async () => {

  try {

    const data = generateData();

    console.log(
      "\nGenerating Network Telemetry..."
    );

    console.log(
      "Sending Data:"
    );

    console.log(data);

    const response = await axios.post(
      API_URL,
      data
    );

    console.log(
      "\nAI Response:"
    );

    console.log(response.data);

  } catch (error) {

    console.log(
      "\n========== ERROR =========="
    );

    if (error.response) {

      console.log(
        "Response Error:"
      );

      console.log(
        error.response.data
      );

      console.log(
        "Status Code:"
      );

      console.log(
        error.response.status
      );

    } else {

      console.log(error.message);

    }

  }

};

setInterval(sendData, 3000);