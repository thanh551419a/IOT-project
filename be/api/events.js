import { sseClients, SensorType, ledState } from "../server.js";
import cache from "../cache/cache.js";

export default function registerSSEAPI(app) {
  app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const init = {
      [SensorType.TEMPERATURE]: cache.get(SensorType.TEMPERATURE) ?? "0",
      [SensorType.HUMIDITY]: cache.get(SensorType.HUMIDITY) ?? "0",
      [SensorType.LIGHT]: cache.get(SensorType.LIGHT) ?? "0",
      [SensorType.LED1]: ledState[SensorType.LED1] ? "ON" : "OFF",
      [SensorType.LED2]: ledState[SensorType.LED2] ? "ON" : "OFF",
      [SensorType.LED3]: ledState[SensorType.LED3] ? "ON" : "OFF",
    };

    const timestamp = Date.now(); // ✅ thêm timestamp
    console.log("🔸 Gửi init SSE với timestamp:", timestamp);
    Object.entries(init).forEach(([k, v]) => {
      res.write(
        `data: ${JSON.stringify({
          type: k,
          value: v,
          timestamp, // ✅ thêm vào JSON
        })}\n\n`
      );
    });

    sseClients.push(res);

    req.on("close", () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });
}
