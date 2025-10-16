import express from "express";
import cors from "cors";
import client from "./mqtt/mqttClient.js";
import { getTodayCollectionModel } from "./databases/checkCollections.js";
// import mongoose from "mongoose"; // nếu cần kiểm tra connection

const app = express();
app.use(cors());
app.use(express.json());

app.get("/data", async (req, res) => {
  try {
    // getTodayCollectionModel có thể trả về model trực tiếp (cũ) hoặc object { model, ... } (nếu bạn đã thay đổi hàm)
    const result = await getTodayCollectionModel();
    const model = result?.model ?? result;

    if (!model) {
      return res.status(500).json({ error: "No model available for today's collection" });
    }

    const data = await model.find().sort({ time: -1 }).limit(10);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));