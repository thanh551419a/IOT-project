// ================= FILE: DashBoard.tsx =================
import React, { useState, useEffect } from "react";
import Widget from "../components/Widget";
import ToggleSwitch from "../components/ToggleSwitch";
import TemperatureIcon from "../assets/WidgetImage/Temperature.svg";
import HumidityIcon from "../assets/WidgetImage/Humidity.svg";
import LightBubs from "../assets/WidgetImage/LightBub.svg";
import airConditioner from "../assets/ToggleImage/airConditioner.svg";
import fan from "../assets/ToggleImage/fan.svg";
import Light from "../assets/ToggleImage/Light.svg";
import ChartRealtime, { SensorPoint } from "../components/ChartRealtime";

interface WidgetData {
  temperature: string;
  humidity: string;
  light: string;
}

interface DeviceState {
  air: boolean;
  fan: boolean;
  light: boolean;
}

function DashBoard() {
  const [widgetData, setWidgetData] = useState<WidgetData>({
    temperature: "0",
    humidity: "0",
    light: "0",
  });

  const [deviceState, setDeviceState] = useState<DeviceState>({
    air: false,
    fan: false,
    light: false,
  });

  const [loadingDevice, setLoadingDevice] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({
    air: false,
    fan: false,
    light: false,
  });

  const [chartData, setChartData] = useState<SensorPoint[]>([]);

  // ===== SSE (Realtime Data) =====
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3000/events");
    const handleMessage = (event: MessageEvent) => {
      try {
        console.log("🔹 Raw SSE:", event.data);
        if (!event.data || event.data.trim() === "") return; // ✅ bỏ qua gói rỗng
        const incoming = JSON.parse(event.data);
        const { type, value, timestamp } = incoming;

        if (!["temperature", "humidity", "light"].includes(type)) return;

        setWidgetData((prev) => ({ ...prev, [type]: value }));

        setChartData((prevData) => {
          const updated = [...prevData];
          const existingIndex = updated.findIndex(
            (d) => d.timestamp === timestamp
          );
          if (existingIndex !== -1)
            updated[existingIndex] = {
              ...updated[existingIndex],
              [type]: parseFloat(value),
            };
          else updated.push({ timestamp, [type]: parseFloat(value) });

          if (updated.length > 30) updated.shift();
          return updated;
        });
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.addEventListener("message", handleMessage);
    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };
    return () => {
      eventSource.removeEventListener("message", handleMessage);
      eventSource.close();
    };
  }, []);

  // ===== Handle toggle device =====
  const handleToggle = (device: keyof DeviceState) => {
    if (cooldowns[device] || loadingDevice === device) {
      alert(`⚠️ ${device.toUpperCase()} đang trong thời gian chờ...`);
      return;
    }
    setLoadingDevice(device);
    setTimeout(() => {
      setLoadingDevice(null);
      const newState = { ...deviceState, [device]: !deviceState[device] };
      setDeviceState(newState);
      fetch("http://localhost:3000/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newState),
      }).catch((err) => console.error("Toggle error:", err));
      setCooldowns((prev) => ({ ...prev, [device]: true }));
      setTimeout(() => {
        setCooldowns((prev) => ({ ...prev, [device]: false }));
      }, 3000);
    }, 1000);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100vh",
        borderRadius: "20px",
        backgroundColor: "#fff",
        padding: "1.5rem",
        gap: "1.2rem",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* === Cột trái: Widgets + Chart === */}
      <div
        style={{
          flex: 0.72,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            gap: "1rem",
            height: "150px",
          }}
        >
          <Widget
            source={TemperatureIcon}
            name="Temperature"
            value={widgetData.temperature}
            unit="°C"
          />
          <Widget
            source={HumidityIcon}
            name="Humidity"
            value={widgetData.humidity}
            unit="%"
          />
          <Widget
            source={LightBubs}
            name="Light"
            value={widgetData.light}
            unit="LUX"
          />
        </div>

        {/* === Biểu đồ tách riêng === */}
        <ChartRealtime chartData={chartData} />
      </div>

      {/* === Cột phải: Toggle === */}
      <div
        style={{
          flex: 0.25,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "40px",
          height: "100%",
        }}
      >
        {["air", "fan", "light"].map((device) => (
          <div
            key={device}
            style={{ position: "relative", transform: "scale(1.3)" }}
          >
            <ToggleSwitch
              source={
                device === "air"
                  ? airConditioner
                  : device === "fan"
                  ? fan
                  : Light
              }
              isOn={deviceState[device as keyof DeviceState]}
              onToggle={() => handleToggle(device as keyof DeviceState)}
              disabled={cooldowns[device] || loadingDevice === device}
            />
            {(loadingDevice === device || cooldowns[device]) && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#444",
                  fontWeight: "bold",
                  fontSize: "15px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  padding: "5px 10px",
                  borderRadius: "8px",
                }}
              >
                {loadingDevice === device ? "Đang gửi..." : "Đang chờ..."}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashBoard;
