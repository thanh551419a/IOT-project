import axios from "axios";
const API_BASE_URL = "http://localhost:3000/";

export const getSensorData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}api/sensor-data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    throw error;
  }
};

export const sendSensorData = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}api/sensor-data`, data);
    return response.data;
  } catch (error) {
    console.error("Error sending sensor data:", error);
    throw error;
  }
};

