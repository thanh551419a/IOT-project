import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://thanh551419a:tPDYsc1H3Ab7kvmy@cluster0.dw9comk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ====== SENSOR ======
const SensorSchema = new mongoose.Schema({
  sensor_id: { type: Number, required: true, unique: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  user_id: { type: Number, required: false }, // liên kết với User nhưng có thể bỏ
});

// ====== DEVICE ======
const DeviceSchema = new mongoose.Schema({
  device_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: "N" }, // N = Not Active, 1 = Active
  ip_address: { type: String },
  created_at: { type: Date, default: Date.now },
  user_id: { type: Number },
  sensor_id: { type: Number, ref: "Sensor" },
});

// ====== SENSOR DATA ======
const SensorDataSchema = new mongoose.Schema({
  data_id: { type: Number, required: true, unique: true },
  sensor_id: { type: Number, ref: "Sensor", required: true },
  value: { type: Number, required: true },
  recorded_at: { type: Date, default: Date.now },
});

// ====== DEVICE HISTORY ======
const DeviceHistorySchema = new mongoose.Schema({
  history_id: { type: Number, required: true, unique: true },
  device_id: { type: Number, ref: "Device", required: true },
  action: { type: String, required: true },
  action_by: { type: String },
  user_id: { type: Number },
  created_at: { type: Date, default: Date.now },
  sensorData_id: { type: Number, ref: "SensorData" },
});

export const Sensor = mongoose.model("Sensor", SensorSchema);
export const Device = mongoose.model("Device", DeviceSchema);
export const SensorData = mongoose.model("SensorData", SensorDataSchema);
export const DeviceHistory = mongoose.model("DeviceHistory", DeviceHistorySchema);
