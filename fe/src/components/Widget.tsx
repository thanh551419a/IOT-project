import React from "react";

interface WidgetProps {
  source?: string;
  name?: string;
  value?: string | number;
  unit?: string;
  style?: React.CSSProperties; // ✅ Cho phép truyền style từ bên ngoài
}

function Widget({ source, name, value, unit, style }: WidgetProps) {
  return (
    // Hình chữ nhật to nhất , chứa cả hình và text
    <div
      style={{
        margin: "3%",
        width: "40%",
        height: "50%",
        display: "flex",
        flexDirection: "row", // chia ngang
        borderRadius: "15px",
        border: "6px solid #d1d5db", // xám nhạt
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // bóng mềm
        overflow: "hidden", // bo tròn gọn hơn
      }}
    >
      {/* Image chiếm 20% */}
      <div
        style={{
          flex: "0 0 20%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb", // nền nhạt để icon nổi bật
          padding: "10px",
        }}
      >
        <img
          src={source}
          alt="widget icon"
          style={{
            width: "70%",
            height: "auto",
            maxHeight: "80%",
            objectFit: "contain", // giữ tỉ lệ ảnh
          }}
        />
      </div>

      {/* Text chiếm 80% */}
      <div
        style={{
          flex: "0 0 80%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 15px",
        }}
      >
        {/* Name */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.8vw",
              margin: 0,
              textAlign: "center",
              fontWeight: 500,
              color: "#374151",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </h1>
        </div>

        {/* Value + Unit */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "2.2vw",
              margin: 0,
              textAlign: "center",
              fontWeight: 600,
              color: "#111827",
              ...style, // ✅ Áp dụng style truyền từ bên ngoài
            }}
          >
            {value}{" "}
            <span
              style={{
                fontSize: "1.4vw",
                fontWeight: 400,
                color: "#6b7280",
              }}
            >
              {unit}
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Widget;
