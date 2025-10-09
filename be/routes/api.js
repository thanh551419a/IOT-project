// routes/api.js
import express from "express";
import { publishData } from "../mqtt/mqttClient.js";
import { SensorData } from "../databases/db.js";

const router = express.Router();

// Lấy toàn bộ dữ liệu cảm biến
router.get("/data", async (req, res) => {
  try {
    const allData = await SensorData.find().sort({ time: -1 });
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

// Gửi lệnh đến ESP32 qua MQTT
router.post("/publish", (req, res) => {
  const { topic, data } = req.body;
  if (!topic || !data) {
    return res.status(400).json({ error: "Thiếu topic hoặc data" });
  }

  publishData(topic, data);
  res.json({ message: `Đã gửi đến ${topic}`, data });
});

export default router;
