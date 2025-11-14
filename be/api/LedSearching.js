import mongoose from "mongoose";
import { SensorStatus } from "../server.js"; // hoặc LedStatus nếu cần

export default function registerLedSearchingAPI(app) {
  app.get("/ledSearching", async (req, res) => {
    try {
      const db = mongoose.connection.db;
      if (!db) return res.status(500).json({ error: "Database chưa sẵn sàng!" });

      const { sort = "asc", timestart, timeend, led = "all", value = "all", status = "all" } = req.query;

      if (!timestart || !timeend) return res.status(400).json({ error: "Thiếu timestart hoặc timeend!" });

      // ---------------------------
      // Hàm parse giờ VN từ frontend
      const parseVNTime = (str) => {
        const [timePart, datePart] = str.split("_");
        const [hh, mm, ss] = timePart.split(":").map(Number);
        const [dd, MM, yyyy] = datePart.split("/").map(Number);
        return new Date(yyyy, MM - 1, dd, hh, mm, ss); // giờ VN trực tiếp
      };

      const startDate = parseVNTime(timestart);
      const endDate = parseVNTime(timeend);

      // ---------------------------
      // Lấy tất cả collection sensor_data_YYYY_MM_DD
      const allCollections = await db.listCollections().toArray();
      const sensorCollections = allCollections.filter(c => /^sensor_data_\d{4}_\d{2}_\d{2}$/.test(c.name));

      // Chỉ lấy collection có ngày nằm trong khoảng start → end
      const parseCollectionDate = name => {
        const match = name.match(/sensor_data_(\d{4})_(\d{2})_(\d{2})/);
        if (!match) return null;
        const [, year, month, day] = match;
        return new Date(+year, +month - 1, +day);
      };

      const matchedCollections = sensorCollections.filter(c => {
        const colDate = parseCollectionDate(c.name);
        if (!colDate) return false;
        const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDay   = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        return colDate >= startDay && colDate <= endDay;
      });

      // ---------------------------
      // Build Mongo filter
      const filter = { timestamp: { $gte: startDate, $lte: endDate } };
      if (led !== "all") filter.type = led.toLowerCase();
      if (value !== "all") filter.value = value.toUpperCase();
      if (status !== "all" && Object.values(SensorStatus).includes(status.toLowerCase()))
        filter.status = status.toLowerCase();

      console.log("📤 Mongo Filter:", JSON.stringify(filter, null, 2));
      console.log("🔹 Matched collections:", matchedCollections.map(c => c.name));

      // ---------------------------
      // Query tất cả collection và gom kết quả
      const results = [];
      await Promise.all(
        matchedCollections.map(async (col) => {
          try {
            const docs = await db.collection(col.name)
              .find(filter)
              .sort({ timestamp: sort === "asc" ? 1 : -1 })
              .toArray();
            if (docs.length) results.push(...docs);
          } catch (err) {
            console.warn(`⚠️ Bỏ qua collection ${col.name} vì lỗi:`, err.message);
          }
        })
      );

      // Trả kết quả
      res.json(results);

    } catch (err) {
      console.error("❌ Lỗi khi xử lý /ledSearching:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
}
