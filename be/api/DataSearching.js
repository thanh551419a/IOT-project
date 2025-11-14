import mongoose from "mongoose";
import { SensorType, SensorStatus } from "../server.js";

export default function registerDataSearchingAPI(app) {
  app.get("/DataSearching", async (req, res) => {
    try {
      const mongoDb = mongoose.connection.db;
      if (!mongoDb)
        return res.status(500).json({ error: "Database chưa sẵn sàng!" });
      const query = req.query;
      const collections = await mongoDb.listCollections().toArray();
      const sensorCollections = collections.filter((c) =>
        /^sensor_data_\d{4}_\d{2}_\d{2}$/.test(c.name)
      );

      const parseCollectionDate = (name) => {
        const match = name.match(/sensor_data_(\d{4})_(\d{2})_(\d{2})/);
        if (!match) return null;
        const [, year, month, day] = match;
        return { year: +year, month: +month, day: +day };
      };

      const matchDateFilter = (info, query) => {
        if (!info) return false;
        if (query.year && info.year !== +query.year) return false;
        if (query.month && info.month !== +query.month) return false;
        if (query.day && info.day !== +query.day) return false;
        return true;
      };

      // 🧩 Xây filter thông minh
      const buildFilter = (query) => {
        const filter = {};

        // --- Type ---
        if (query.type && Object.values(SensorType).includes(query.type.toLowerCase())) {
          filter.type = query.type.toLowerCase();
        }

        // --- Status ---
        if (query.status && Object.values(SensorStatus).includes(query.status.toLowerCase())) {
          filter.status = query.status.toLowerCase();
        }

        // --- Value ---
        if (query.value) {
          const num = Number(query.value);
          filter.value = isNaN(num) ? query.value : num.toString();
        }

        // --- Time filter ---
        if (query.hour != null) {
          const hh = String(query.hour).padStart(2, "0");
          const mm = query.minute != null ? String(query.minute).padStart(2, "0") : "\\d{2}";

          filter.$expr = {
            $regexMatch: {
              input: { $dateToString: { format: "%H:%M", date: "$timestamp" } },
              regex: `^${hh}:${mm}`,
              options: "i",
            },
          };
        }

        console.log("📤 Mongo Filter:", JSON.stringify(filter, null, 2));
        return filter;
      };

      const matchedCollections = sensorCollections.filter((c) =>
        matchDateFilter(parseCollectionDate(c.name), query)
      );

      const toSearch = matchedCollections.length > 0 ? matchedCollections : sensorCollections;
      const mongoFilter = buildFilter(query);
      let results = [];

      // 🧩 Duyệt qua từng collection
      for (const col of toSearch) {
        try {
          const docs = await mongoDb.collection(col.name).find(mongoFilter).toArray();
          if (docs.length > 0) results.push(...docs);
        } catch (e) {
          console.warn(`⚠️ Bỏ qua collection ${col.name} vì lỗi:`, e.message);
        }
      }

      res.json(results);
    } catch (err) {
      console.error("❌ Lỗi khi tìm kiếm:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
}
