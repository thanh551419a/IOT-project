import mongoose from "mongoose";
import sensorSchema from "./schemaData.js";

// Cache các model (có thể dùng cùng schema nhưng collection khác nhau)
export const cacheModels = {
  temperature: mongoose.models.temperature || mongoose.model("temperature", sensorSchema, "temperature"),
  humidity: mongoose.models.humidity || mongoose.model("humidity", sensorSchema, "humidity"),
  light: mongoose.models.light || mongoose.model("light", sensorSchema, "light"),
  led: mongoose.models.led || mongoose.model("led", sensorSchema, "led"),
};
