// ===================== FILE: db.js =====================
import client from "../mqtt/mqttClient.js";
import { getTodayCollectionModel,getVietnamDate } from "./checkCollections.js";
//import mongoose from "mongoose";  
//import { checkMongoConnection } from "./checkConnection.js";
import cache from "../cache/cache.js";
import { time } from "console";
const uri = "mongodb+srv://thanh551419a:tPDYsc1H3Ab7kvmy@cluster0.dw9comk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let SensorModel = null;

export function setSensorModel(model) {
  SensorModel = model;
}

export function getSensorModel() {
  return SensorModel;
}
let sendSSE = null;
export function setSSECallback(callback) {
  sendSSE = callback;
}
const topicMap = [
  { topic: "esp32/dht/temperature", key: "temperature", label: "🌡️ Temperature" },
  { topic: "esp32/dht/humidity", key: "humidity", label: "💧 Humidity" },
  { topic: "esp32/ldr/value", key: "light", label: "💡 Light" },
  { topic: "esp32/device/led/1", key: "led1", label: "💡 LED1 Status" },
  { topic: "esp32/device/led/2", key: "led2", label: "💡 LED2 Status" },
  { topic: "esp32/device/led/3", key: "led3", label: "💡 LED3 Status" },
];
// await mongoose.connect(uri)
//   .then(() => {
//     console.log("✅ Connected to MongoDB");
//     checkMongoConnection();
//   })
//   .catch(err => console.error("❌ MongoDB connection error:", err));

// ===================== Heartbeat =====================



// ===================== Get Vietnam time ====================

// ===================== Check day start/end =====================
export function checkTime() {
  const vnTime = getVietnamDate();
  const hours = vnTime.getUTCHours();
  const minutes = vnTime.getUTCMinutes();
  const seconds = vnTime.getUTCSeconds();

  const isStartOfDay = hours === 0 && minutes === 0 && (seconds === 0 || seconds === 1);
  const isEndOfDay = hours === 23 && minutes === 59 && (seconds === 58 || seconds === 59);

  return { isStartOfDay, isEndOfDay, timestamp: vnTime };
}

// ===================== SensorModel =====================




/**
 * Nhận message dạng:
 * "esp32/dht/temperature: 50  esp32/dht/humidity: 30  esp32/ldr/value: 500  esp32/device/led/1: ON ..."
 */
export function updateCache(key,value){
  cache.set(key,value);
}
export async function Resolve(topic , value) {
  const mapItem = topicMap.find(t => t.topic === topic);
  console.log(value);
  if (!mapItem) return;
  console.log("1.old value:",cache.get(mapItem.key) , "new value:", value , " Is equal:", cache.get(mapItem.key) === value);
  const { key, label } = mapItem;
  const oldValue = cache.get(mapItem.key);
  const dataSent = { type: key, value: value , timestamp: getVietnamDate() };
  if (sendSSE) {
    sendSSE(dataSent);
  }
  if (oldValue !== value) {
    console.log(`${label}:`, value);
    //updateCache(key, value);
    await handleData(key, value, "updated");
  } else {
    console.log(`⏭️ ${label} không thay đổi, bỏ qua`);
  }
  console.log("2.old value:",cache.get(mapItem.key) , "new value:", value);
}
// ===================== Save to Database =====================
export async function saveToDatabase(type, data, status1) {// hàm lưu vào databases
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

  // if(cache.get(type) === null || cache.get(type) === "none" || cache.get(type) === 0){
  //   await saveToDatabase(type, data,"updated");
  //   cache.set(type, value);}
  //   else{
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
  //}
}
}

// ===================== MQTT Connect =====================


// ===================== MQTT Message Handler =====================




export default client;
// cần check collection ở phần ghi database khi dữ liệu thay đổi nữa là đủ ,