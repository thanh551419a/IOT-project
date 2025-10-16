//import mongoose from "mongoose";
import client from "../mqtt/mqttClient.js";
//import sensorSchema from "./schemaData.js";
import { getTodayCollectionModel } from "./checkCollections.js"; // ✅ import hàm kiểm tra collection
import mongoose from "mongoose";
import { checkMongoConnection } from "./checkConnection.js";
import sensorSchema from "./schemaData.js";
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

  try {
    // ✅ Kiểm tra hoặc tạo collection cho ngày hiện tại
    // Kiểm tra đã có Coleection hôm nay chưa, nếu chưa thì tạo mới 
    const SensorModel = await getTodayCollectionModel();

    console.log("📘 Collection model sẵn sàng:", SensorModel.collection.name);


    // ✅ Lưu thử 1 bản ghi vào collection ngày hôm nay
    console.log("💾 Dữ liệu test đã được lưu thành công!");
  } catch (err) {
    console.error("❌ Lỗi khi thao tác với collection:", err);
  }
});

export { SensorData };
