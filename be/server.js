const express = require("express");
const cors = require("cors");
const mqttClient = require("./mqtt/mqttClient");
const { SensorData } = require("./databases/db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/data", async (req, res) => {
  try {
    const data = await SensorData.find().sort({ time: -1 }).limit(10);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
