import mqtt from "mqtt";
import os from "os";

// 🧩 Hàm tự động lấy IPv4 hiện tại của máy
function getLocalIPv4() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("wi-fi") || lowerName.includes("wlan") || lowerName.includes("ethernet")) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return "127.0.0.1"; // fallback nếu không tìm thấy
}

// 🖥️ Lấy IP động của broker
const MQTT_HOST = getLocalIPv4();
const MQTT_PORT = 1883;
const MQTT_URL = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;
console.log(`🔍 MQTT Broker IP: ${MQTT_HOST}`);

// ⚙️ Thông tin đăng nhập MQTT
const options = {
  username: "esp32",
  password: "12345678",
  reconnectPeriod: 2000, // tự động reconnect mỗi 2s
  clean: true,           // xóa session cũ khi reconnect
};

// 🚀 Kết nối tới MQTT broker
const client = mqtt.connect(MQTT_URL, options);
console.log("in mqttClient.js");

client.on("connect", () => {
  console.log(`✅ Connected to MQTT broker at ${MQTT_HOST}:${MQTT_PORT}`);
  // Đăng ký topic (có thể mở rộng tùy sensor)
  client.subscribe("#");
});

client.on("reconnect", () => {
  console.log("♻️ Reconnecting to MQTT broker...");
});

client.on("error", (err) => {
  console.error("❌ MQTT connection error:", err.message);
});

client.on("close", () => {
  console.warn("⚠️ MQTT connection closed.");
});

export default client;
