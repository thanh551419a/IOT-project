// ===================== FILE: db.js =====================
import client from "../mqtt/mqttClient.js";
import { getTodayCollectionModel } from "./checkCollections.js";
import mongoose from "mongoose";  
import { checkMongoConnection } from "./checkConnection.js";
import cache from "../cache/cache.js";
const uri = "mongodb+srv://thanh551419a:tPDYsc1H3Ab7kvmy@cluster0.dw9comk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    checkMongoConnection();
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ===================== Heartbeat =====================
let lastHeartbeat = Date.now();


// ===================== Get Vietnam time =====================
function getVietnamTime() {
  const now = new Date();
  return new Date(now.getTime() + (7 * 60 * 60 * 1000));
}

// ===================== Check day start/end =====================
function checkTime() {
  const vnTime = getVietnamTime();
  const hours = vnTime.getUTCHours();
  const minutes = vnTime.getUTCMinutes();
  const seconds = vnTime.getUTCSeconds();

  const isStartOfDay = hours === 0 && minutes === 0 && (seconds === 0 || seconds === 1);
  const isEndOfDay = hours === 23 && minutes === 59 && (seconds === 58 || seconds === 59);

  return { isStartOfDay, isEndOfDay, timestamp: vnTime };
}

// ===================== SensorModel =====================
let SensorModel = null;

const topicMap = [
  { topic: "esp32/dht/temperature", key: "temperature", label: "🌡️ Temperature" },
  { topic: "esp32/dht/humidity", key: "humidity", label: "💧 Humidity" },
  { topic: "esp32/ldr/value", key: "light", label: "💡 Light" },
  { topic: "esp32/device/led/1", key: "led1", label: "💡 LED1 Status" },
  { topic: "esp32/device/led/2", key: "led2", label: "💡 LED2 Status" },
  { topic: "esp32/device/led/3", key: "led3", label: "💡 LED3 Status" },
];

/**
 * Nhận message dạng:
 * "esp32/dht/temperature: 50  esp32/dht/humidity: 30  esp32/ldr/value: 500  esp32/device/led/1: ON ..."
 */
function updateCache(key,value){
  cache.set(key,value);
}
async function Resolve(message) {// hàm xử lý lưu value theo đợt 
  // Tách message thành từng cặp "topic: value"
  const pairs = message.split(/\s{2,}/).map(pair => pair.trim()).filter(Boolean);

  for (const pair of pairs) {
    const [topic, rawValue] = pair.split(":").map(s => s.trim());
    const mapItem = topicMap.find(t => t.topic === topic);
    if (!mapItem) continue;

    const { key, label } = mapItem;
    const newValue = rawValue;
    const oldValue = cache.get(key);

    if (oldValue !== newValue) {
      console.log(`${label}:`, newValue);
      updateCache(key,value);
      await handleData(key, newValue,"updated");
    }
  }
}
// ===================== Save to Database =====================
async function saveToDatabase(type, data, status1) {// hàm lưu vào databases
  try {
    const recordData = {
      type: type,
      value: data.value,
      status: status1 || "updated",
      timestamp: data.timestamp,
    };
    const newRecord = new SensorModel(recordData);
    await newRecord.save();
    console.log(`✅ Đã lưu ${type} vào collection: ${SensorModel.collection.name}`);
  } catch (err) {
    console.error("❌ Lỗi khi lưu database:", err);
  }
}

// ===================== Handle Data =====================
async function handleData(type, value) {// lưu với status là updated và kiểm tra thời gian
  if (!SensorModel) {
    console.warn(`⚠️ SensorModel chưa sẵn sàng, bỏ qua ${type}:`, value);
    return;
  }
  const { isStartOfDay, isEndOfDay, timestamp } = checkTime();
  const data = { type, value, timestamp };
  // Đầu ngày
  if (isStartOfDay) {// lưu database khi đã t
    console.log(`🌅 Đầu ngày (VN) - Lưu ${type}:`, value);
    await saveToDatabase(type, data,"updated");
    cache.set(type, value);
  }
  // Cuối ngày
  else if (isEndOfDay) {
    console.log(`🌙 Cuối ngày (VN) - Lưu ${type}:`, value);
    await saveToDatabase(type, data,"updated");
    cache.set(type, value);
  }
  // Giữa ngày
  else {
    if (cache.get(type) !== value) {
      console.log(`🔄 Thay đổi ${type}: ${cache.get(type)} → ${value}`);
      await saveToDatabase(type, data,"updated");
      cache.set(type, value);
    } else {
      console.log(`⏭️ Bỏ qua ${type} (không thay đổi):`, value);
    }
  }
}

// ===================== MQTT Connect =====================
client.on("connect", async () => {
  console.log("✅ Connected to MQTT broker");

  try {
    SensorModel = await getTodayCollectionModel();
    console.log("📘 Collection model sẵn sàng:", SensorModel.collection.name); // chờ kiểm tra xem collection đã có hay chưa
    client.subscribe("esp32/#");
    console.log("✅ Đã subscribe vào tất cả các topic");
  } catch (err) {
    console.error("❌ Lỗi khi thao tác với collection:", err);
  }
});

// ===================== MQTT Message Handler =====================
client.on("message", async (topic, message) => {
  const vnDate = getVietnamDate();
  const day = String(vnDate.getUTCDate()).padStart(2, '0');
  if(day != cache.get(dayCollectionCreate)){
    SensorModel = await getTodayCollectionModel();
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
        if(day != cache.get(dayCollectionCreate)){
          SensorModel = await getTodayCollectionModel();
        }
        for (const key in resetValues) {
          if (cache.get(key) !== resetValues[key]) {
            await saveToDatabase(key, resetValues[key],"disconnected");
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
heartbeatLoop().catch(console.error);

export default client;
