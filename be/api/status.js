import { SensorType, ledState, pendingCommands } from "../server.js";

export default function registerStatusAPI(app) {
  app.get("/api/status", (req, res) => {
    res.json({
      air: ledState[SensorType.LED1],
      fan: ledState[SensorType.LED2],
      light: ledState[SensorType.LED3],
      pending: {
        air: pendingCommands[SensorType.LED1],
        fan: pendingCommands[SensorType.LED2],
        light: pendingCommands[SensorType.LED3]
      }
    });
  });
}
