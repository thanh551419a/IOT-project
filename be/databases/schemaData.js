import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  // Loại dữ liệu: "temperature", "humidity", "light", "led"
  type: {
    type: String,
    enum: ["temperature", "humidity", "light", "led"],
    required: true,
  },

  // Giá trị cảm biến hoặc trạng thái thiết bị
  value: {
    type: mongoose.Schema.Types.Mixed, // có thể là số hoặc chuỗi ("ON"/"OFF")
    required: true,
  },
  //xác nhận trạng thái đã hoàn thành hay chưa của dữ liệu
  status:{
    type: String,
    enum:["updated","unupdated"],
    required:true,
  },
  // Thời điểm ghi nhận dữ liệu
  timestamp: {
    type: Date,
    default: Date.now,
    index: true, // giúp truy vấn nhanh theo thời gian
  },
});

export default sensorSchema;
