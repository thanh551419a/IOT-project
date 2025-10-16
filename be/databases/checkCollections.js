import mongoose from "mongoose";
import sensorSchema from "./schemaData.js";

/**
 * Hàm kiểm tra hoặc tạo collection cho ngày hiện tại.
 * Nếu collection chưa có -> tự tạo mới với schema sensorSchema.
 *  Mongoose model cho collection hôm nay
 */
export async function getTodayCollectionModel() {
  // Đợi connection sẵn sàng
  if (!mongoose.connection.db) {
    await new Promise(resolve => mongoose.connection.once("open", resolve));
  }

  // Tên collection dạng: sensor_data_YYYY_MM_DD
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "_");
  const collectionName = `sensor_data_${dateStr}`;

  // Kiểm tra xem collection đã tồn tại chưa
  const collections = await mongoose.connection.db.listCollections().toArray();
  const exists = collections.some(col => col.name === collectionName);
  if (!exists) {
    console.log(`🆕 Collection mới được tạo: ${collectionName}`);
  } else {
    console.log(`✅ Collection đã tồn tại: ${collectionName}`);
  }

  // Tạo (hoặc lấy lại) model mongoose tương ứng
  return mongoose.models[collectionName] ||
         mongoose.model(collectionName, sensorSchema, collectionName);
}
