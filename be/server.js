import express from "express";
import cors from "cors";
import cache from "./cache/cache.js";
import http from "http";
import client from "./mqtt/mqttClient.js";
import { Server } from "socket.io";
import db from "./databases/db.js";
import sensorSchema from "./databases/schemaData.js"; // chỉ là schema, không phải model
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// 🧩 Tạo model tạm thời từ schema (vì bạn không lưu DB, chỉ dùng để tạo object default)
const SensorModel = mongoose.model("TempSensor", sensorSchema);

// 🧱 Khai báo biến lưu dữ liệu cảm biến với giá trị mặc định
let sensor = new SensorModel(); // có các giá trị default từ schemaData

// 🛰️ GET: gửi dữ liệu hiện tại về FE
app.get("/data", (req, res) => {
  res.json(sensor); // fe hỏi be lấy dữ liệu hiện tại
});

// 🛰️ POST: nhận dữ liệu mới từ FE
app.post("/data", (req, res) => {
  // Gộp dữ liệu mới vào object hiện tại (để không mất các giá trị default)
  sensor = { ...sensor._doc, ...req.body };// fe yêu cầu be cập nhật dữ liệu mới

  console.log("✅ Đã nhận dữ liệu mới:", sensor);
  res.json({
    message: "Đã cập nhật thành công!",
    newData: sensor,
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy ở cổng ${PORT}`));
