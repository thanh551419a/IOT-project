// ===================== FILE: server.js =====================
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import client from "./mqtt/mqttClient.js"; 
import cache from "./cache/cache.js";
import * as db from "./databases/db.js";
import { getTodayCollectionModel, getVietnamDate } from "./databases/checkCollections.js";

// ==== import các API ====
import registerUpdateAPI from "./api/update.js";
import registerStatusAPI from "./api/status.js";
import registerSSEAPI from "./api/events.js";
import registerDataSearchingAPI from "./api/dataSearching.js";
import registerLedSearchingAPI from "./api/LedSearching.js";
const app = express();
app.use(cors());
app.use(express.json());

// ===================== MongoDB =====================
const uri = "mongodb+srv://thanh551419a:tPDYsc1H3Ab7kvmy@cluster0.dw9comk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(async () => { 
    console.log("✅ Connected to MongoDB"); 
    const SensorModel = await getTodayCollectionModel();
    db.setSensorModel(SensorModel);
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ===================== ENUM =====================
export const SensorType = Object.freeze({
  TEMPERATURE: "temperature",
  HUMIDITY: "humidity",
  LIGHT: "light",
  LED1: "led1",
  LED2: "led2",
  LED3: "led3",
});

export const SensorStatus = Object.freeze({
  NONE: "none",
  UPDATED: "updated",
  DISCONNECTED: "disconnected",
});

// ===================== SSE Clients =====================
export let sseClients = [];
export function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((res) => {
    try {
      res.write(payload);
    } catch (err) {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    }
  });
}

// ===================== Heartbeat =====================
let lastHeartbeat = Date.now();
const HEARTBEAT_TIMEOUT = 10000; // 10s

// ===================== LED State =====================
export let ledState = { [SensorType.LED1]: false, [SensorType.LED2]: false, [SensorType.LED3]: false };
export let pendingCommands = { [SensorType.LED1]: false, [SensorType.LED2]: false, [SensorType.LED3]: false };

// ===================== Helper =====================
function getKeyFromTopic(topic) {
  const map = [
    { topic: "esp32/dht/temperature", key: SensorType.TEMPERATURE },
    { topic: "esp32/dht/humidity", key: SensorType.HUMIDITY },
    { topic: "esp32/ldr/value", key: SensorType.LIGHT },
    { topic: "esp32/device/led/1", key: SensorType.LED1 },
    { topic: "esp32/device/led/2", key: SensorType.LED2 },
    { topic: "esp32/device/led/3", key: SensorType.LED3 },
  ];
  const f = map.find(t => t.topic === topic);
  return f ? f.key : null;
}

// ===================== MQTT =====================
client.on("connect", async () => {
  console.log("✅ Connected to MQTT broker");
  try {
    const SensorModel = await getTodayCollectionModel();
    db.setSensorModel(SensorModel);
    client.subscribe("esp32/#");
    console.log("✅ Subscribed esp32/#");
    heartbeatLoop().catch(console.error);
  } catch (err) {
    console.error("❌ MQTT init error:", err);
  }
});

client.on("message", async (topic, message) => {
  const msg = message.toString().trim();

  if (topic === "esp32/heartbeat") {
    lastHeartbeat = Date.now();
    return;
  }

  try {
    const vnDate = getVietnamDate();
    const day = String(vnDate.getUTCDate()).padStart(2, "0");
    if (day !== cache.get("dayCollectionCreate")) {
      cache.set("dayCollectionCreate", String(day));
      const SensorModel = await getTodayCollectionModel();
      db.setSensorModel(SensorModel);
    }
  } catch (err) {
    console.error("❌ collection check error:", err);
  }

  const key = getKeyFromTopic(topic);

  if ([SensorType.TEMPERATURE, SensorType.HUMIDITY, SensorType.LIGHT].includes(key)) {
    cache.set(key, msg);
    await db.Resolve(topic, msg);
    broadcastSSE({ type: key, value: msg });
    return;
  }

  if ([SensorType.LED1, SensorType.LED2, SensorType.LED3].includes(key)) {
    const normalized = msg === "ON" ? "ON" : "OFF";
    const boolVal = normalized === "ON";
    if (ledState[key] !== boolVal) {
      ledState[key] = boolVal;
      pendingCommands[key] = false;
      cache.set(key, normalized);
      await db.saveToDatabase(key, { value: normalized, timestamp: getVietnamDate() }, SensorStatus.UPDATED);
      broadcastSSE({ type: key, value: normalized });
    }
    return;
  }
});

// ===================== GỌI API =====================
registerUpdateAPI(app);
registerStatusAPI(app);
registerSSEAPI(app);
registerDataSearchingAPI(app);
registerLedSearchingAPI(app);
// ===================== Heartbeat Loop =====================
async function heartbeatLoop(){
  while(true){
    try{
      const now = Date.now();
      if(now - lastHeartbeat > HEARTBEAT_TIMEOUT){
        console.warn("⚠️ Heartbeat lost -> reset sensors & LEDs");
        const resetValues = {
          [SensorType.TEMPERATURE]: "0",
          [SensorType.HUMIDITY]: "0",
          [SensorType.LIGHT]: "0",
          [SensorType.LED1]: "OFF",
          [SensorType.LED2]: "OFF",
          [SensorType.LED3]: "OFF",
        };
        const vnDate = getVietnamDate();
        const day = String(vnDate.getUTCDate()).padStart(2,"0");
        if(day !== cache.get("dayCollectionCreate")){
          cache.set("dayCollectionCreate",day);
          const SensorModel = await getTodayCollectionModel();
          db.setSensorModel(SensorModel);
        }
        for(const k in resetValues){
          const val = resetValues[k];
          if(k.startsWith("led")){
            const boolVal = val==="ON";
            if(ledState[k]!==boolVal){
              ledState[k]=boolVal;
              pendingCommands[k]=false;
              await db.saveToDatabase(k,{value:val,timestamp:getVietnamDate()},SensorStatus.DISCONNECTED);
              broadcastSSE({type:k,value:val});
            }
            cache.set(k,val);
          }else{
            if(cache.get(k)!==val){
              await db.saveToDatabase(k,{value:val,timestamp:getVietnamDate()},SensorStatus.DISCONNECTED);
            }
            cache.set(k,val);
            broadcastSSE({type:k,value:val});
          }
        }
        lastHeartbeat = Date.now();
      }
    }catch(err){ console.error("❌ heartbeatLoop err:",err);}
    await new Promise(r=>setTimeout(r,5000));
  }
}

// ===================== Start Server =====================
const PORT=3000;
app.listen(PORT,()=>console.log(`🚀 Server running on port ${PORT}`));
