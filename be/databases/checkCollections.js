import mongoose from "mongoose";
import sensorSchema from "./schemaData.js";
import cache from "../cache/cache.js";
/**
 * Lấy thời gian GMT+7 (Việt Nam)
 */
function getVietnamDate() {
  const now = new Date();
  // Chuyển sang múi giờ Việt Nam (UTC+7)
  const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return vnTime;
}

/**
 * Hàm kiểm tra hoặc tạo collection cho ngày hiện tại (theo giờ VN).
 * Nếu collection chưa có -> tự tạo mới với schema sensorSchema.
 * @returns {Promise<mongoose.Model>} Mongoose model cho collection hôm nay
 */
export async function getTodayCollectionModel() {
  // Đợi connection sẵn sàng
  if (!mongoose.connection.db) {
    await new Promise(resolve => mongoose.connection.once("open", resolve));
  }
  // Lấy ngày theo giờ Việt Nam
  const vnDate = getVietnamDate();
  const year = vnDate.getUTCFullYear();
  const month = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vnDate.getUTCDate()).padStart(2, '0');
  
  // Tên collection dạng: sensor_data_YYYY_MM_DD
  const collectionName = `sensor_data_${year}_${month}_${day}`;

  // Kiểm tra xem collection đã tồn tại chưa
  const collections = await mongoose.connection.db.listCollections().toArray();
  const exists = collections.some(col => col.name === collectionName);
  
  if (!exists) {
    console.log(`🆕 Collection mới được tạo (VN time): ${collectionName}`);
    // cập nhật date tạo vào 
    cache.set(day , day);
  } else {
    console.log(`✅ Collection đã tồn tại (VN time): ${collectionName}`);
  }

  // Tạo (hoặc lấy lại) model mongoose tương ứng
  return mongoose.models[collectionName] ||
         mongoose.model(collectionName, sensorSchema, collectionName);
}