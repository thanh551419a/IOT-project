// updateDatabase.js
import mongoose from "mongoose";
import { checkMongoConnection } from "./checkConnection.js";

/**
 * Ghi dữ liệu vào MongoDB bằng model được truyền từ trên xuống.
 * @param {mongoose.Model} model - Model MongoDB đã được khởi tạo sẵn.
 * @param {Object} data - Dữ liệu cần ghi, ví dụ:
 *   {
 *     type: "temperature",
 *     value: 28.5,
 *     status: "updated"
 *   }
 */
export async function saveToDatabase(model, data) {
  try {
    // 🔍 Kiểm tra trạng thái kết nối MongoDB
    const connectionState = checkMongoConnection();

    // Nếu chưa kết nối, chờ kết nối mở
    if (connectionState !== "connected") {
      console.warn("⚠️ Database chưa sẵn sàng. Đang chờ kết nối...");
      await new Promise(resolve => mongoose.connection.once("open", resolve));
      console.log("🟢 Kết nối đã sẵn sàng, tiếp tục ghi dữ liệu...");
    }

    // ✅ Ghi dữ liệu mới bằng model được truyền xuống
    const newDoc = new model({
      type: data.type,
      value: data.value,
      status: data.status,
      timestamp: data.timestamp || new Date(),
    });

    await newDoc.save();

    console.log(`💾 Dữ liệu đã được lưu thành công vào collection "${model.collection.collectionName}":`, newDoc);
    return newDoc;
  } catch (error) {
    console.error("❌ Lỗi khi ghi dữ liệu vào MongoDB:", error);
    throw error;
  }
}
