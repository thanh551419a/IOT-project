import React from "react";

interface WidgetProps {
  source?: string;
  name?: string;
  value?: string | number;
  unit?: string;
}

function Widget({ source, name, value, unit }: WidgetProps) {
  return (
    // Hình chữ nhật to nhất , chứa cả hình và text
    <div
      style={{
        margin: "3%",
        width: "40%",
        height: "50%",
        // border: "2px solid black",
        display: "flex",
        flexDirection: "row", // chia ngang
        borderRadius: "15px",
        border: "6px solid #d1d5db", // xám nhạt
        // backgroundColor: "rgba(0,0,0,0.1)", // DEBUG
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // bóng mềm
        overflow: "hidden", // bo tròn gọn hơn
      }}
    >
      {/* Image chiếm 30% */}
      <div
        style={{
          flex: "0 0 20%",
          height: "100%",
          width: "15%",
          // border: "1px solid red", // DEBUG
          // backgroundColor: "rgba(255,0,0,0.1)", // DEBUG
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

      {/* Text chiếm 70% */}
      <div
        style={{
          flex: "0 0 80%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          // border: "1px solid blue", // DEBUG
          // backgroundColor: "rgba(0,0,255,0.1)", // DEBUG
          justifyContent: "center",
          padding: "0 15px",
        }}
      >
        {/* Name chiếm 50% dọc */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "Simple",
            // border: "1px solid green", // DEBUG
            // backgroundColor: "rgba(0,255,0,0.1)", // DEBUG
          }}
        >
          <h1
            style={{
              fontSize: "1.8vw", // responsive
              margin: 0,
              textAlign: "unset",
              fontWeight: 500,
              color: "#374151", // xám đậm
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis", // cắt chữ dài bằng "..."
            }}
          >
            {name}
          </h1>
        </div>

        {/* Value + Unit chiếm 50% dọc */}
        <div
          style={{
            flex: 1,
            display: "flex",
            // alignItems: "center",
            justifyContent: "center",
            // border: "1px solid orange", // DEBUG
            // backgroundColor: "rgba(255,165,0,0.1)", // DEBUG
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "2.2vw", // responsive
              margin: 0,
              textAlign: "center",
              fontWeight: 600,
              color: "#111827", // đậm hơn
              font: "Simple",
            }}
          >
            {value}{" "}
            <span
              style={{
                fontSize: "1.4vw",
                fontWeight: 400,
                color: "#6b7280", // xám nhạt hơn
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
