import React, { useState, useEffect } from "react";

interface SensorData {
  id: number;
  type: string;
  value: number;
  timestamp: string;
  status: string;
}

const STATUS_VALUES = ["updated", "disconnected", "none"];
const TYPE_VALUES = [
  "led1",
  "led2",
  "led3",
  "humidity",
  "temperature",
  "light",
];

// ===== PHÂN TÍCH Ô NHẬP =====
type DataSearch = {
  hour?: number;
  minute?: number;
  second?: number;
  day?: number;
  month?: number;
  year?: number;
  value?: number | string;
  type?: string;
  status?: string;
};

const parseSearchInput = (input: string): DataSearch => {
  const data: DataSearch = {};
  const tokens = input.trim().toLowerCase().split(/\s+/); // tách theo dấu cách
  if (tokens.length === 0) return data;

  for (const token of tokens) {
    console.log("Token sau khi tach:", token);
    // Nếu có dấu ":" → là thời gian
    if (token.includes(":")) {
      const [h, m, s] = token.split(":").map((x) => Number(x));
      if (!isNaN(h)) data.hour = h;
      if (!isNaN(m)) data.minute = m;
      if (!isNaN(s)) data.second = s;
      continue;
    }

    // Nếu là status
    if (
      token.includes("updated") ||
      token.includes("disconnected") ||
      token.includes("none")
    ) {
      data.status = token;
      continue;
    }
    // Nếu là type (cảm biến)
    if (["humidity", "temperature", "light"].includes(token)) {
      data.type = token;
      continue;
    }

    // Nếu có dấu "/" → là ngày tháng
    if (token.includes("/")) {
      const [d, m, y] = token.split("/").map((x) => Number(x));
      if (!isNaN(d)) data.day = d;
      if (!isNaN(m)) data.month = m;
      if (!isNaN(y)) data.year = y;
      continue;
    }

    // Nếu là ON / OFF / NONE → coi là giá trị
    if (["on", "off", "none"].includes(token)) {
      data.value = token === "none" ? "none" : token.toUpperCase();
      continue;
    }

    // Nếu là số (có thể có dấu chấm)
    if (/^\d+(\.\d+)?$/.test(token)) {
      data.value = Number(token);
      continue;
    }
  }

  return data;
};

// ===== XÂY QUERY STRING =====
const buildQueryString = (params: DataSearch) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      searchParams.append(key, String(value));
  });
  return searchParams.toString();
};

// ===== ĐỊNH DẠNG TIME =====
const formatTimestamp = (ts: string) => {
  const [time, date] = ts.split("_");
  return `${time} ${date}`;
};

// ===== COMPONENT CHÍNH =====
export default function DataSensor() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ===== FETCH TỪ SERVER =====
  const fetchData = async (qs = "") => {
    try {
      setLoading(true);
      const url = qs
        ? `http://localhost:3000/DataSearching?${qs}`
        : "http://localhost:3000/DataSearching";

      console.log("📡 Gửi yêu cầu:", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch lỗi!");
      const json = await res.json();
      setData(json);
      setCurrentPage(1);
    } catch (err) {
      console.error("❌ Lỗi khi fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lấy toàn bộ dữ liệu khi vào trang
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      // nếu người dùng xóa hết => tải lại tất cả
      fetchData();
      return;
    }

    const parsed = parseSearchInput(query);
    console.log("🔍 Parsed search input:", parsed);
    const qs = buildQueryString(parsed);
    console.log("🔍 Tìm kiếm với:", parsed, "→", qs);
    fetchData(qs);
  };

  // ===== PHÂN TRANG =====
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>
        🔎 Tìm kiếm dữ liệu cảm biến
      </h2>

      {/* Ô nhập tìm kiếm */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <input
          type="text"
          placeholder="Nhập số, ngày (/), giờ (:), hoặc từ khóa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            width: "60%",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 16px",
            background: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Tìm kiếm
        </button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Đang tải...</p>}

      {/* BẢNG KẾT QUẢ */}
      {data.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  Type
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  Value
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  Timestamp
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((d, index) => (
                <tr
                  key={d.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                    textAlign: "center",
                  }}
                >
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {d.id}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {d.type}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {d.value}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {formatTimestamp(d.timestamp)}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {d.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PHÂN TRANG */}
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{ marginRight: "5px", padding: "5px 10px" }}
            >
              {"<"}
            </button>
            {currentPage} / {totalPages}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ marginLeft: "5px", padding: "5px 10px" }}
            >
              {">"}
            </button>
          </div>
        </>
      )}

      {!loading && data.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Không tìm thấy dữ liệu nào.
        </p>
      )}
    </div>
  );
}
