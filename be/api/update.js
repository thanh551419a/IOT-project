import client from "../mqtt/mqttClient.js";
import { SensorType } from "../server.js";
import { pendingCommands } from "../server.js";

export default function registerUpdateAPI(app) {
  app.post("/api/update", (req, res) => {
    const { air, fan, light } = req.body ?? {};
    if (typeof air !== "boolean" || typeof fan !== "boolean" || typeof light !== "boolean") {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const publishList = [
      { topic: "esp32/device/led/1", key: SensorType.LED1, value: air ? "ON" : "OFF" },
      { topic: "esp32/device/led/2", key: SensorType.LED2, value: fan ? "ON" : "OFF" },
      { topic: "esp32/device/led/3", key: SensorType.LED3, value: light ? "ON" : "OFF" },
    ];

    publishList.forEach(item => {
      try {
        client.publish(item.topic, item.value, { qos: 1, retain: true });
        pendingCommands[item.key] = true;
      } catch (err) {
        console.error("❌ Publish exception:", err);
      }
    });

    res.json({ success: true, message: "Commands published, waiting confirmation" });
  });
}
