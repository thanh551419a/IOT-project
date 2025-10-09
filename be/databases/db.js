const mongoose = require("mongoose");

const uri = "mongodb+srv://thanh551419a:tPDYsc1H3Ab7kvmy@cluster0.dw9comk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  time: { type: Date, default: Date.now }
});

const SensorData = mongoose.model("SensorData", sensorSchema);

module.exports = { SensorData };
