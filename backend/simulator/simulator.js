const axios = require("axios");

const API_URL = "http://localhost:5000/api/device-data";

console.log("ForgeSecure Simulator Started...");

const devices = [
  "PLC_01",
  "PLC_02",
  "ROBOT_ARM_01",
  "CNC_MACHINE_01",
];

const generateNormalData = () => {
  return {
    device: devices[Math.floor(Math.random() * devices.length)],

    traffic: Math.floor(Math.random() * 100) + 100,

    cpu: Math.floor(Math.random() * 20) + 30,

    temperature: Math.floor(Math.random() * 10) + 40,
  };
};

const generateAttackData = () => {
  return {
    device: "UNKNOWN_DEVICE",

    traffic: Math.floor(Math.random() * 2000) + 3000,

    cpu: Math.floor(Math.random() * 10) + 90,

    temperature: Math.floor(Math.random() * 20) + 80,
  };
};

const sendData = async () => {
  try {

    console.log("\nGenerating Industrial Data...");

    const isAttack = Math.random() < 0.2;

    const data = isAttack 
      ? generateAttackData()
      : generateNormalData();

    console.log("Sending Data:");
    console.log(data);

    const response = await axios.post(API_URL, data);

    console.log("\nAI Response:");
    console.log(response.data);

  } catch (error) {

    console.log("\n========== ERROR ==========");

    if (error.response) {

      console.log("Response Error:");
      console.log(error.response.data);

      console.log("Status Code:");
      console.log(error.response.status);

    } else if (error.request) {

      console.log("No response received from backend.");

    } else {

      console.log("Error Message:");
      console.log(error.message);
    }
  }
};

sendData();

setInterval(sendData, 3000);