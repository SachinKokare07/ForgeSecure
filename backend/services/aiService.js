const axios = require("axios");

const AI_API_URL = "http://localhost:8000/predict";

const getPrediction = async (data) => {
  try {

    const response = await axios.post(AI_API_URL, {
      traffic: data.traffic,
      cpu: data.cpu,
      temperature: data.temperature,
    });

    return response.data;

  } catch (error) {

    console.log("AI Service Error:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    return {
      status: "NORMAL",
      severity: "LOW",
    };
  }
};

module.exports = getPrediction;