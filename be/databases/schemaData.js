import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  // Loại dữ liệu: "temperature", "humidity", "light", "led1", "led2", "led3"
  type: {
    type: String,
    enum: ["temperature", "humidity", "light", "led1", "led2", "led3", "none"],
    required: true,
    default: "none", // ✅ mặc định chưa xác định loại
  },

  // Giá trị cảm biến hoặc trạng thái thiết bị
  value: {
    type: mongoose.Schema.Types.Mixed, // có thể là số hoặc chuỗi
    required: true,
    default: "none", // ✅ chưa có giá trị đo
  },

  // Trạng thái dữ liệu: đã cập nhật hay chưa
  status: {
    type: String,
    enum: ["updated", "unupdated", "none", "disconnected"],
    required: true,
    default: "none", // ✅ chưa xác định trạng thái
  },

  // Thời điểm ghi nhận dữ liệu
  timestamp: {
    type: Date,
    default: Date.now, // ✅ tự động lấy thời gian hiện tại
    index: true,
  },
});

export default sensorSchema;
