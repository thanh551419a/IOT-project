// backend-mqtt.js

const mqtt = require('mqtt');

// ====== Cấu hình MQTT ======
const MQTT_HOST = '10.14.45.35'; // IP máy tính chạy Mosquitto
const MQTT_PORT = 1883;
const MQTT_URL = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;

// ====== Kết nối MQTT ======
const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');

  // Subscribe tất cả topic ESP32
  client.subscribe('esp32/#', (err) => {
    if (err) {
      console.error('Subscribe error:', err);
    } else {
      console.log('Subscribed to esp32/#');
    }
  });
});

// ====== Nhận dữ liệu từ ESP32 ======
client.on('message', (topic, message) => {
  console.log(`📡 Topic: ${topic} | Data: ${message.toString()}`);
});

// ====== Hàm gửi dữ liệu về MQTT ======
function publishData(topic, data) {
  client.publish(topic, data.toString(), { qos: 0 }, (err) => {
    if (err) {
      console.error('Publish error:', err);
    } else {
      console.log(`✅ Published to ${topic}: ${data}`);
    }
  });
}

// ====== Ví dụ dùng hàm publish (bỏ comment khi dùng) ======
// publishData('esp32/command', 'TURN_ON_LED');
