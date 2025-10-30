import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

// cache và mqtt client
import cache from "./cache/cache.js";           // 1 lần thôi
import client from "./mqtt/mqttClient.js";      // 1 lần thôi

// database
import * as db from "./databases/db.js";
import sensorSchema from "./databases/schemaData.js"; // schema, không phải model
import { getTodayCollectionModel, getVietnamDate } from "./databases/checkCollections.js";
import { checkMongoConnection } from "./databases/checkConnection.js";

// MongoDB URI
const uri = "mongodb+srv://thanh551419a:tPDYsc1H3Ab7kvmy@cluster0.dw9comk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let SensorModel = null;
const topicMap = [
  { topic: "esp32/dht/temperature", key: "temperature", label: "🌡️ Temperature" },
  { topic: "esp32/dht/humidity", key: "humidity", label: "💧 Humidity" },
  { topic: "esp32/ldr/value", key: "light", label: "💡 Light" },
  { topic: "esp32/device/led/1", key: "led1", label: "💡 LED1 Status" },
  { topic: "esp32/device/led/2", key: "led2", label: "💡 LED2 Status" },
  { topic: "esp32/device/led/3", key: "led3", label: "💡 LED3 Status" },
];
mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    checkMongoConnection();
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
let lastHeartbeat = Date.now();
// ===================== MQTT Client =====================
client.on("connect", async () => {
  console.log("✅ Connected to MQTT broker");
  try {
    SensorModel = await getTodayCollectionModel();
    db.setSensorModel(SensorModel);
    console.log("📘 Collection model sẵn sàng:", SensorModel.collection.name); // chờ kiểm tra xem collection đã có hay chưa
    client.subscribe("esp32/#");
    console.log("✅ Đã subscribe vào tất cả các topic");
    heartbeatLoop().catch(console.error);
  } catch (err) {
    console.error("❌ Lỗi khi thao tác với collection:", err);
  }
  
});
//MQTT Message handler
client.on("message", async (topic, message) => {
  const vnDate = getVietnamDate();
  const day = String(vnDate.getUTCDate()).padStart(2, '0');
  if(day != cache.get(dayCollectionCreate)){
    SensorModel = await getTodayCollectionModel();
    db.setSensorModel(SensorModel);
  }
  try {
    const value = message.toString().trim();
    //const model = await getTodayCollectionModel();
    if(cache.get(light) === null ){
      await Resolve(value);
    }
    // chở kiểm tra collection đã có chưa rồi mới lưu dữ liệu vào collection tương ứng
    // Heartbeat
    if (topic === "esp32/heartbeat") {
      lastHeartbeat = Date.now();
      return;
    }
  } catch (err) {
    console.error("❌ Lỗi khi xử lý dữ liệu MQTT:", err);
  }
});


//====================Heartbeat Monitor =====================
let HEARTBEAT_TIMEOUT = 500; // 500ms timeout
// ===================== Heartbeat Loop =====================
async function heartbeatLoop() {
  while (true) {
    try {
      const now = Date.now();
      const diff = now - lastHeartbeat;
      HEARTBEAT_TIMEOUT = 5000;
      const resetValues = {
        temperature: 0,
        humidity: 0,
        light: 0,
        led1: "OFF",
        led2: "OFF",
        led3: "OFF",
      };
      //console.log(`💓 Heartbeat check - last: ${diff}ms ago`); 
      // kiem tra heartbeat qua lau khong
      if (diff > HEARTBEAT_TIMEOUT) {
        console.log("⚠️ Không nhận được heartbeat → reset tất cả giá trị và LED OFF");
        const vnDate = getVietnamDate();
        const day = String(vnDate.getUTCDate()).padStart(2, '0');
        if(day != cache.get(day)){
          SensorModel = await getTodayCollectionModel();
          db.setSensorModel(SensorModel);
        }
        for (const key in resetValues) {
          if (cache.get(key) !== resetValues[key]) {
            await db.saveToDatabase(key, resetValues[key],"disconnected");
          }
        }
        //cập nhật dữ liệu về 0
        cache.reset();
        // Cập nhật lastHeartbeat để tránh lặp liên tục
        lastHeartbeat = now;
      }
    } catch (err) {
      console.error("❌ Lỗi heartbeat loop:", err);
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); // chờ 20 giây trước khi kiểm tra lại
  }
}

// Bắt đầu heartbeat loop














const app = express();
app.use(cors());
app.use(express.json());

// 🧩 Tạo model tạm thời từ schema (vì bạn không lưu DB, chỉ dùng để tạo object default)

// 🧱 Khai báo biến lưu dữ liệu cảm biến với giá trị mặc định
//let sensor = new SensorModel(); // có các giá trị default từ schemaData

// 🛰️ GET: gửi dữ liệu hiện tại về FE
// app.get("/data", (req, res) => {
//   res.json(sensor); // fe hỏi be lấy dữ liệu hiện tại
// });

// // 🛰️ POST: nhận dữ liệu mới từ FE
// app.post("/data", (req, res) => {
//   // Gộp dữ liệu mới vào object hiện tại (để không mất các giá trị default)
//   sensor = { ...sensor._doc, ...req.body };// fe yêu cầu be cập nhật dữ liệu mới

//   console.log("✅ Đã nhận dữ liệu mới:", sensor);
//   res.json({
//     message: "Đã cập nhật thành công!",
//     newData: sensor,
//   });
// });

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  sseClients.push(res);

  req.on("close", () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) sseClients.splice(index, 1);
  });
});
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy ở cổng ${PORT}`));


