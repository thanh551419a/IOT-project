// ================= FILE: ChartRealtime.tsx =================
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface SensorPoint {
  timestamp: string;
  temperature?: number;
  humidity?: number;
  light?: number;
}

interface ChartProps {
  chartData: SensorPoint[];
}

const formatTime = (ts: number) => {
  // Cộng thêm 7 giờ (múi giờ Việt Nam)
  const d = new Date(ts + 7 * 60 * 60 * 1000);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
};

const ChartRealtime: React.FC<ChartProps> = ({ chartData }) => {
  console.log("chart được khỏi động với data:", chartData);
  const chartMerged = React.useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }

    const mergedMap: Record<
      number,
      {
        ts: number;
        timestamp: string;
        temperature?: number;
        humidity?: number;
        light?: number;
      }
    > = {};

    chartData.forEach((d) => {
      let t;

      if (!d.timestamp) {
        // Nếu không có timestamp → tạo mới

        d.timestamp = new Date(Date.now()).toISOString();
        t = Date.now(); // ✅ tạo giá trị t tương ứng
      } else {
        // Nếu có timestamp → kiểm tra hợp lệ
        t = new Date(d.timestamp).getTime();
        if (isNaN(t)) return; // Bỏ qua nếu timestamp không hợp lệ
      }

      const key = Math.floor(t / 1000) * 1000;
      if (!mergedMap[key]) {
        mergedMap[key] = {
          ts: key,
          timestamp: new Date(key).toISOString(),
        };
      }

      if (d.temperature !== undefined)
        mergedMap[key].temperature = +d.temperature;
      if (d.humidity !== undefined) mergedMap[key].humidity = +d.humidity;
      if (d.light !== undefined) mergedMap[key].light = +d.light;
    });

    // Sắp xếp theo thời gian tăng dần
    const sorted = Object.values(mergedMap).sort((a, b) => a.ts - b.ts);

    // ⚙️ Giới hạn hiển thị tối đa 10 điểm gần nhất
    const limited = sorted.slice(-10);

    console.log("Chart data processed (last 10):", limited);
    return limited;
  }, [chartData]);

  if (!chartMerged || chartMerged.length === 0) {
    return (
      <div
        style={{
          width: "96%",
          height: "430px",
          border: "1px solid #ddd",
          borderRadius: "15px",
          padding: "15px",
          backgroundColor: "#fafafa",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h4
          style={{
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "18px",
            color: "#333",
          }}
        >
          Data Sensor Tracking (Realtime)
        </h4>
        <p style={{ color: "#999", fontSize: "14px" }}>
          Đang chờ dữ liệu từ ESP32...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "96%",
        height: "430px",
        border: "1px solid #ddd",
        borderRadius: "15px",
        padding: "15px",
        backgroundColor: "#fafafa",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h4
        style={{
          textAlign: "center",
          marginBottom: "10px",
          fontSize: "18px",
          color: "#333",
        }}
      >
        Data Sensor Tracking (Realtime)
      </h4>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={chartMerged}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis
            dataKey="ts"
            type="number"
            domain={["dataMin", "dataMax"]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => formatTime(Number(v) - 7 * 60 * 60 * 1000)} // ✅ trừ 7 tiếng
            interval={0}
            scale="time"
          />

          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: any, name: string) => {
              if (value === null || value === undefined) return [null, name];
              return [`${value}`, name];
            }}
            labelFormatter={(label) => `Time: ${formatTime(Number(label))}`}
          />
          <Legend wrapperStyle={{ fontSize: "13px" }} />

          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#ff4b4b"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#ff4b4b" }}
            activeDot={{ r: 6 }}
            name="Temperature (°C)"
            connectNulls
            isAnimationActive
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke="#007bff"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#007bff" }}
            activeDot={{ r: 6 }}
            name="Humidity (%)"
            connectNulls
            isAnimationActive
          />
          <Line
            type="monotone"
            dataKey="light"
            stroke="#ffa500"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#ffa500" }}
            activeDot={{ r: 6 }}
            name="Light (LUX)"
            connectNulls
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRealtime;
