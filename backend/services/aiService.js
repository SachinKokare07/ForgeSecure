const axios = require("axios");

const AI_SERVICE_URL = "http://localhost:8000/predict";

const getPrediction = async (data) => {
  try {
    const response = await axios.post(AI_SERVICE_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports = getPrediction;