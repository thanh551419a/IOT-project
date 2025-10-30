import client from "../mqtt/mqttClient.js";
import { getTodayCollectionModel } from "./checkCollections.js";
import mongoose from "mongoose";
import { checkMongoConnection } from "./checkConnection.js";
import sensorSchema from "./schemaData.js";
import { cacheModels } from "./cache.js";

const uri = "mongodb+srv://thanh551419a:tPDYsc1H3Ab7kvmy@cluster0.dw9comk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    checkMongoConnection();
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 📦 Cache dữ liệu hiện tại
let cache = {
  temperature: null,
  humidity: null,
  light: null,
  led: null
};

// 💾 Hàm lưu vào database
async function saveToDatabase(type, data) {
  try {
    const recordData = {
      type: type,
      value: data.value,
      status: data.status || "updated",
      timestamp: data.timestamp,
    };
    const newRecord = new SensorModel(recordData);
    await newRecord.save();
    console.log(`✅ Đã lưu ${type} vào collection: ${SensorModel.collection.name}`);
  } catch (err) {
    console.error("❌ Lỗi khi lưu database:", err);
  }
}


// 🕐 Kiểm tra thời gian
function checkTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Đầu ngày: 00:00:00 hoặc 00:00:01
  const isStartOfDay = hours === 0 && minutes === 0 && (seconds === 0 || seconds === 1);
  
  // Cuối ngày: 23:59:58 hoặc 23:59:59
  const isEndOfDay = hours === 23 && minutes === 59 && (seconds === 58 || seconds === 59);

  return { isStartOfDay, isEndOfDay, timestamp: now };
}

// 🔄 Xử lý và lưu dữ liệu

// 🚀 Khi MQTT broker kết nối thành công
client.on("connect", async () => {
  console.log("✅ Connected to MQTT broker");
  
  try {
    const SensorModel = await getTodayCollectionModel();
    console.log("📘 Collection model sẵn sàng:", SensorModel.collection.name);
    
    // Subscribe tất cả topic ESP32
    client.subscribe("esp32/#");
    console.log("✅ Đã subscribe vào tất cả các topic");
  } catch (err) {
    console.error("❌ Lỗi khi thao tác với collection:", err);
  }
});

// 📦 Lưu trữ tạm LED
let ledTemp = {
  led1: null,
  led2: null,
  led3: null
};

// 📨 Lắng nghe message từ MQTT

export default client;