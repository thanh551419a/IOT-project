import React, { useState, useEffect } from "react";

interface ToggleItemProps {
  source?: string; // đường dẫn icon (cha truyền xuống)
  isOn?: boolean; // trạng thái bật/tắt
  onToggle?: () => void; // hàm xử lý khi toggle
}

function TonggleSwitch({ source, isOn = false, onToggle }: ToggleItemProps) {
  return (
    <div
      style={{
        margin: "10%",
        width: "80%", // chiếm 40% ngang cha (bạn có thể chỉnh lại 25%)
        height: "15%", // mỗi block cao ~20% (3 block vừa 60%)
        display: "flex",
        flexDirection: "row",
        borderRadius: "15px",
        border: "6px solid #d1d5db",
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 15px",
      }}
    >
      {/* Icon bên trái */}
      <div
        style={{
          flex: "0 0 20%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          padding: "10px",
        }}
      >
        {source && (
          <img
            src={source}
            alt="toggle icon"
            style={{
              width: "60%",
              height: "auto",
              maxHeight: "80%",
              objectFit: "contain",
            }}
          />
        )}
      </div>

      {/* Toggle button bên phải */}
      <button
        onClick={onToggle}
        style={{
          flex: "0 0 50%",
          display: "flex",
          alignItems: "center",
          justifyContent: isOn ? "flex-end" : "flex-start",
          backgroundColor: isOn ? "#4ade80" : "#d1d5db",
          borderRadius: "9999px",
          width: "60px",
          height: "30px",
          padding: "4px",
          cursor: "pointer",
          border: "none",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            width: "22px",
            height: "22px",
            backgroundColor: "white",
            borderRadius: "50%",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>
    </div>
  );
}

export default TonggleSwitch;
