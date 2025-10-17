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
async function saveToDatabase(model, data) {
  try {
    const newRecord = new model(data);
    await newRecord.save();
    console.log(`✅ Đã lưu vào collection: ${model.collection.name}`);
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
async function handleData(type, value, timestamp) {
  const { isStartOfDay, isEndOfDay } = checkTime();
  
  // Lấy model tương ứng
  const model = cacheModels[type];
  
  // Dữ liệu cần lưu
  const data = {
    value: value,
    timestamp: timestamp
  };

  // ✅ Đầu ngày → Lưu và cập nhật cache
  if (isStartOfDay) {
    console.log(`🌅 Đầu ngày - Lưu ${type}:`, value);
    await saveToDatabase(model, data);
    cache[type] = value;
  }
  // ✅ Cuối ngày → Lưu và cập nhật cache
  else if (isEndOfDay) {
    console.log(`🌙 Cuối ngày - Lưu ${type}:`, value);
    await saveToDatabase(model, data);
    cache[type] = value;
  }
  // ✅ Giữa ngày → So sánh với cache
  else {
    if (cache[type] !== value) {
      console.log(`🔄 Thay đổi ${type}: ${cache[type]} → ${value}`);
      await saveToDatabase(model, data);
      cache[type] = value;
    } else {
      console.log(`⏭️ Bỏ qua ${type} (không thay đổi):`, value);
    }
  }
}

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
client.on("message", async (topic, message) => {
  try {
    const value = message.toString().trim();
    const timestamp = new Date();

    // 📊 Phân loại dữ liệu theo topic
    if (topic === "esp32/dht/temperature") {
      const temp = parseFloat(value);
      console.log("🌡️ Temperature:", temp);
      await handleData("temperature", temp, timestamp);
    } 
    else if (topic === "esp32/dht/humidity") {
      const humi = parseFloat(value);
      console.log("💧 Humidity:", humi);
      await handleData("humidity", humi, timestamp);
    } 
    else if (topic === "esp32/ldr/value") {
      const light = parseInt(value);
      console.log("💡 Light:", light);
      await handleData("light", light, timestamp);
    }
    else if (topic === "esp32/device/led/1") {
      ledTemp.led1 = value;
    }
    else if (topic === "esp32/device/led/2") {
      ledTemp.led2 = value;
    }
    else if (topic === "esp32/device/led/3") {
      ledTemp.led3 = value;
    }

    // ✅ Khi đã nhận đủ 3 LED → Xử lý
    if (ledTemp.led1 !== null && ledTemp.led2 !== null && ledTemp.led3 !== null) {
      const ledString = `${ledTemp.led1} ${ledTemp.led2} ${ledTemp.led3}`;
      console.log("💡 LED Status:", ledString);
      await handleData("led", ledString, timestamp);
      
      // Reset
      ledTemp = { led1: null, led2: null, led3: null };
    }

  } catch (err) {
    console.error("❌ Lỗi khi xử lý dữ liệu MQTT:", err);
  }
});

export default client;