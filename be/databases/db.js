// ========== FILE: db.js ==========
import client from "../mqtt/mqttClient.js";
import { getTodayCollectionModel } from "./checkCollections.js";
import mongoose from "mongoose";
import { checkMongoConnection } from "./checkConnection.js";

const uri = "mongodb+srv://thanh551419a:tPDYsc1H3Ab7kvmy@cluster0.dw9comk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    checkMongoConnection();
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 📦 cache1 dữ liệu hiện tại
let cache11 = {
  temperature: null,
  humidity: null,
  light: null,
  led1: null,
  led2: null,
  led3: null,
};

// 🕐 Lấy thời gian GMT+7 (Việt Nam)
function getVietnamTime() {
  const now = new Date();
  // Chuyển sang múi giờ Việt Nam (UTC+7)
  const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return vnTime;
}

// 💾 Hàm lưu vào database
async function saveToDatabase(type, data) {
  try {
    // ⚠️ Không cần kiểm tra lại vì handleData đã kiểm tra rồi
    const recordData = {
      type: type,
      value: data.value,
      status: data.status || "updated",
      timestamp: data.timestamp
    };
    
    const newRecord = new SensorModel(recordData);
    await newRecord.save();
    console.log(`✅ Đã lưu ${type} vào collection: ${SensorModel.collection.name}`);
  } catch (err) {
    console.error("❌ Lỗi khi lưu database:", err);
  }
}

// 🕐 Kiểm tra thời gian (theo giờ Việt Nam)
function checkTime() {
  const vnTime = getVietnamTime();
  const hours = vnTime.getUTCHours();
  const minutes = vnTime.getUTCMinutes();
  const seconds = vnTime.getUTCSeconds();

  // Đầu ngày: 00:00:00 hoặc 00:00:01 (giờ VN)
  const isStartOfDay = hours === 0 && minutes === 0 && (seconds === 0 || seconds === 1);
  
  // Cuối ngày: 23:59:58 hoặc 23:59:59 (giờ VN)
  const isEndOfDay = hours === 23 && minutes === 59 && (seconds === 58 || seconds === 59);

  return { isStartOfDay, isEndOfDay, timestamp: vnTime };
}

// 🔄 Xử lý và lưu dữ liệu
async function handleData(type, value, status = "updated") {
  // ⚠️ Kiểm tra SensorModel đã sẵn sàng chưa
  if (!SensorModel) {
    console.warn(`⚠️ SensorModel chưa sẵn sàng, bỏ qua ${type}:`, value);
    return;
  }

  const { isStartOfDay, isEndOfDay, timestamp } = checkTime();
  
  // Dữ liệu cần lưu
  const data = {
    type: type,
    value: value,
    status: status,
    timestamp: timestamp
  };

  // ✅ Đầu ngày → Lưu và cập nhật cache1
  if (isStartOfDay) {
    console.log(`🌅 Đầu ngày (VN) - Lưu ${type}:`, value);
    await saveToDatabase(type, data);
    cache1[type] = value;
  }
  // ✅ Cuối ngày → Lưu và cập nhật cache1
  else if (isEndOfDay) {
    console.log(`🌙 Cuối ngày (VN) - Lưu ${type}:`, value);
    await saveToDatabase(type, data);
    cache1[type] = value;
  }
  // ✅ Giữa ngày → So sánh với cache1
  else {
    if (cache1[type] !== value) {
      console.log(`🔄 Thay đổi ${type}: ${cache1[type]} → ${value}`);
      await saveToDatabase(type, data);
      cache1[type] = value;
    } else {
      console.log(`⏭️ Bỏ qua ${type} (không thay đổi):`, value);
    }
  }
}

// 📦 Lưu SensorModel để dùng chung
let SensorModel = null;

// 🚀 Khi MQTT broker kết nối thành công
client.on("connect", async () => {
  console.log("✅ Connected to MQTT broker");
  
  try {
    SensorModel = await getTodayCollectionModel();
    console.log("📘 Collection model sẵn sàng:", SensorModel.collection.name);
    
    // Subscribe tất cả topic ESP32
    client.subscribe("esp32/#");
    console.log("✅ Đã subscribe vào tất cả các topic");
  } catch (err) {
    console.error("❌ Lỗi khi thao tác với collection:", err);
  }
});

// 📦 Lưu trữ tạm LED
let
led1 = "OFF" ,
led2 = "OFF" ,
led3 = "OFF" ;
// Thời gian nhận heartbeat gần nhất
let lastHeartbeat = Date.now();
const HEARTBEAT_TIMEOUT = 500; // 500ms timeout

// cache1 dữ liệu ban đầu
let cache1 = {
  temperature: null,
  humidity: null,
  light: null,
  led1: null,
  led2: null,
  led3: null,
};

client.on("message", async (topic, message) => {
  try {
    const value = message.toString().trim();
    const now = Date.now();

    // Nếu nhận heartbeat → cập nhật thời gian
    if (topic === "esp32/heartbeat") {
      lastHeartbeat = now;
      return; // không cần lưu database cho heartbeat
    }



    // 📊 Phân loại dữ liệu theo topic và kiểm tra cache1
    if (topic === "esp32/dht/temperature") {
      const temp = parseFloat(value);
      if (cache1.temperature !== temp) {
        console.log("🌡️ Temperature:", temp);
        await handleData("temperature", temp);
        cache1.temperature = temp;
      }
    } 
    else if (topic === "esp32/dht/humidity") {
      const humi = parseFloat(value);
      if (cache1.humidity !== humi) {
        console.log("💧 Humidity:", humi);
        await handleData("humidity", humi);
        cache1.humidity = humi;
      }
    } 
    else if (topic === "esp32/ldr/value") {
      const light = parseInt(value);
      if (cache1.light !== light) {
        console.log("💡 Light:", light);
        await handleData("light", light);
        cache1.light = light;
      }
    } 
    else if (topic === "esp32/device/led/1") {
      if (led1 !== value) {
        led1 = value.toString();
        console.log("💡 LED1 Status:", led1);
        await handleData("led1", led1);
        //cache1.led1 = led1;
      }
    } 
    else if (topic === "esp32/device/led/2") {
      if (led2 !== value) {
        led2 = value.toString();
        console.log("💡 LED2 Status:", led2);
        await handleData("led2", led2);
        //cache1.led2 = led2;
      }
    } 
    else if (topic === "esp32/device/led/3") {
      if (led3 !== value) {
        led3 = value.toString();
        console.log("💡 LED3 Status:", led3);
        await handleData("led3", led3);
        //cache1.led3 = led3;
      }
    }

    // 🔴 Kiểm tra heartbeat timeout
    if (now - lastHeartbeat > HEARTBEAT_TIMEOUT) {
      console.log("⚠️ Không nhận được heartbeat → reset tất cả giá trị và LED OFF");

      // Đặt tất cả giá trị về 0 / OFF
      const resetValues = {
        temperature: 0,
        humidity: 0,
        light: 0,
        led1: "OFF",
        led2: "OFF",
        led3: "OFF",
      };

      // Lưu database nếu giá trị thay đổi so với cache1
      for (const key in resetValues) {
        if (cache1[key] !== resetValues[key]) {
          await handleData(key, resetValues[key]);
          cache1[key] = resetValues[key];
        }
      }
      // Cập nhật lastHeartbeat để tránh lặp liên tục
      lastHeartbeat = now;
    }

  } catch (err) {
    console.error("❌ Lỗi khi xử lý dữ liệu MQTT:", err);
  }
});

export default client;