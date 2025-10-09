const mqtt = require("mqtt");

const MQTT_HOST = "10.228.209.35";
const MQTT_PORT = 1883;
const MQTT_URL = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;

const options = {
  username: "esp32",
  password: "12345678",
};

const client = mqtt.connect(MQTT_URL, options);

client.on("connect", () => {
  console.log("✅ Connected to MQTT broker (as esp32)");
  client.subscribe("esp32/#", (err) => {
    if (err) console.error("❌ Subscribe error:", err.message);
    else console.log("📡 Subscribed to topic: esp32/#");
  });
});

client.on("message", (topic, message) => {
  const payload = message.toString();

  // Xử lý theo topic
  if (topic.includes("temperature")) {
    console.log(`🌡️ Nhiệt độ: ${payload} °C`);
  } else if (topic.includes("humidity")) {
    console.log(`💧 Độ ẩm: ${payload} %`);
  } else if (topic.includes("ldr")) {
    console.log(`💡 Cảm biến ánh sáng (LDR): ${payload}`);
  } else {
    console.log(`📩 Chủ đề khác (${topic}): ${payload}`);
  }
});

client.on("error", (err) => {
  console.error("❌ MQTT connection error:", err.message);
});

module.exports = client;
