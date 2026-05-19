import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const getLogs = async () => {
  try {

    const response = await api.get("/logs");

    return Array.isArray(response.data?.data)
      ? response.data.data
      : [];

  } catch (error) {

    console.log("API Error:", error.message);

    return [];
  }
};

export const updateIncidentStatus = async (
  id,
  incidentStatus
) => {

  const response = await api.patch(
    `/logs/${id}/status`,
    {
      incidentStatus,
    }
  );

  return response.data.data;

};

export default api;