//import mongoose from "mongoose";
import client from "../mqtt/mqttClient.js";
//import sensorSchema from "./schemaData.js";
import { getTodayCollectionModel } from "./checkCollections.js"; // ✅ import hàm kiểm tra collection
import mongoose from "mongoose";
import { checkMongoConnection } from "./checkConnection.js";
import sensorSchema from "./schemaData.js";
import { cacheModels } from "./cache.js";
const uri = "mongodb+srv://thanh551419a:tPDYsc1H3Ab7kvmy@cluster0.dw9comk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    checkMongoConnection(); // 🔍 Kiểm tra ngay sau khi kết nối
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));


// 🚀 Khi MQTT broker kết nối thành công
client.on("connect", async () => { // ✅ thêm async ở đây
  console.log("✅ Connected to MQTT broker");
  // Lắng nghe dữ liệu từ topic "sensor/data"
 
  try {
    // ✅ Kiểm tra hoặc tạo collection cho ngày hiện tại
    // Kiểm tra đã có Coleection hôm nay chưa, nếu chưa thì tạo mới 
    const SensorModel = await getTodayCollectionModel();

    console.log("📘 Collection model sẵn sàng:", SensorModel.collection.name);
    // Đọc dữ liệu từ MQTT topic
    console.log("✅ Đã subscribe vào tất cả các topic");
    // ✅ Lưu thử 1 bản ghi vào collection ngày hôm nay
    //console.log("💾 Dữ liệu test đã được lưu thành công!");
  } catch (err) {
    console.error("❌ Lỗi khi thao tác với collection:", err);
  }
});
client.on("message" , async (topic, message) => {
    try {
    const value = message.toString().trim();

   // 📊 Phân loại dữ liệu theo topic
   let temp = "";
if (topic === "esp32/dht/temperature") {
  console.log(parseFloat(value));
} 
else if (topic === "esp32/dht/humidity") {
  console.log(parseFloat(value));
} 
else if (topic === "esp32/ldr/value") {
  console.log(parseInt(value));
}
if (topic === "esp32/device/led/1") {
  temp += value;
}
else if (topic === "esp32/device/led/2") {
  temp += value;
}
else if (topic === "esp32/device/led/3") {
  temp += value;
}
console.log(temp);
  } catch (err) {
    console.error("❌ Lỗi khi xử lý dữ liệu MQTT:", err);}
});

export default client;
