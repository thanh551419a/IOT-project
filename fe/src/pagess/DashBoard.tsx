import React, { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import HumidityIcon from "../assets/WidgetImage/Humidity.svg";
import LightBubs from "../assets/WidgetImage/LightBub.svg";
import TemperatureIcon from "../assets/WidgetImage/Temperature.svg";
import Widget from "../components/Widget";
import ToggleSwitch from "../components/ToggleSwitch";
import airConditioner from "../assets/ToggleImage/airConditioner.svg";
import fan from "../assets/ToggleImage/fan.svg";
import Light from "../assets/ToggleImage/Light.svg";

interface DeviceState {
  air: boolean;
  fan: boolean;
  light: boolean;
}

const socket: Socket = io("http://localhost:3000"); // Kết nối socket

function DashBoard() {
  const [state, setState] = useState<DeviceState>({
    air: false,
    fan: false,
    light: false,
  });

  // === Khi load trang: lấy trạng thái ban đầu ===
  useEffect(() => {
    fetch("http://localhost:3000/api/status")
      .then((res) => res.json())
      .then((data: DeviceState) => setState(data))
      .catch((err) => console.error("Lỗi lấy trạng thái:", err));
  }, []);

  // === Khi có gói tin từ server qua socket ===
  useEffect(() => {
    const handleUpdate = (data: DeviceState) => {
      console.log("📡 Nhận cập nhật từ server:", data);
      setState(data);
    };

    socket.on("updateFromServer", handleUpdate);

    return () => {
      socket.off("updateFromServer", handleUpdate);
    };
  }, []);

  // === Khi toggle bằng tay ===
  const handleToggle = (device: keyof DeviceState) => {
    const newState: DeviceState = { ...state, [device]: !state[device] };
    setState(newState);

    fetch("http://localhost:3000/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newState),
    }).catch((err) => console.error("Lỗi cập nhật:", err));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "95vh",
        width: "100%",
      }}
    >
      {/* ===== Widget row ===== */}
      <div
        style={{
          flex: "0 0 33%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Widget
          source={TemperatureIcon}
          name="Temperature"
          value="60"
          unit="°C"
        />
        <Widget source={HumidityIcon} name="Humidity" value="60" unit="%" />
        <Widget source={LightBubs} name="Light" value="600" unit="LUX" />
      </div>

      {/* ===== Toggle row ===== */}
      <div
        style={{
          flex: "0 0 67%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            width: "25%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ToggleSwitch
            source={airConditioner}
            isOn={state.air}
            onToggle={() => handleToggle("air")}
          />
          <ToggleSwitch
            source={fan}
            isOn={state.fan}
            onToggle={() => handleToggle("fan")}
          />
          <ToggleSwitch
            source={Light}
            isOn={state.light}
            onToggle={() => handleToggle("light")}
          />
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
