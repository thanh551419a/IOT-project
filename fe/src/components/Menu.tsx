import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../app/App.css";

import DashBoardIcon from "../assets/MenuIcon/DashBoard.svg";
import DataSensorIcon from "../assets/MenuIcon/DataSensor.svg";
import HistoryIcon from "../assets/MenuIcon/History.svg";
import ProfileIcon from "../assets/MenuIcon/Profile.svg";

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: DashBoardIcon },
  { path: "/datasensor", label: "Data Sensor", icon: DataSensorIcon },
  { path: "/history", label: "History", icon: HistoryIcon },
  { path: "/profile", label: "Profile", icon: ProfileIcon },
];

function Menu() {
  const location = useLocation();

  // mặc định là 0 (Dashboard)
  const [activeIndex, setActiveIndex] = useState(0);

  // Các thông số chiều cao item + khoảng cách
  const itemHeightPercent = 13; // 13% chiều cao viewport
  const marginTopPercent = 2; // 2% chiều cao viewport (tùy chỉnh)

  // Khi component render, log kích thước cửa sổ
  console.log("Kích thước cửa sổ (innerHeight):", window.innerHeight);

  useEffect(() => {
    const index = menuItems.findIndex(
      (item) => item.path === location.pathname
    );
    // nếu tìm thấy thì cập nhật, không thì giữ mặc định là 0
    if (index !== -1) {
      setActiveIndex(index);
    }
    console.log("Active index:", index);
  }, [location]);

  // Tính toán vị trí top theo đơn vị vh thay vì px
  // (activeIndex + 1) vì phần tử đầu tiên là "IOT Control"
  const highlightTopVH =
    (activeIndex + 1) * (itemHeightPercent + marginTopPercent);

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        width: "20%",
        height: "100%",
        border: "2px solid black", // border nav
        borderRadius: "100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="BoxInDashBoard"
        style={{
          fontSize: "50px",
          fontWeight: "bold",
          border: "1px dashed red", // debug border title
        }}
      >
        IOT Control
      </div>

      {/* Highlight động theo vh */}
      <div
        className="menu-highlight"
        style={{
          // Cộng thêm margin-top tương ứng cho mỗi item trước đó
          top: `calc(${(activeIndex + 1) * 13}vh + ${activeIndex * 4}vh)`, // 13vh: chiều cao item, 4vh: margin giữa các item
          border: "2px solid green",
          position: "absolute",
          left: 0,
          width: "100%",
          height: "13vh", // tương ứng chiều cao item
          transition: "top 0.3s ease",
        }}
      />

      {menuItems.map((item, index) => (
        <Link
          key={item.path}
          to={item.path}
          className="BoxInDashBoard"
          onClick={(e) => {
            setActiveIndex(index);

            // Lấy tọa độ top của phần tử được click
            const rect = (
              e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            console.log("Clicked item:", item.label);
            console.log("Viewport top (px):", rect.top); // top so với màn hình

            const offsetTop = (e.currentTarget as HTMLElement).offsetTop;
            console.log("OffsetTop (relative to parent):", offsetTop); // top so với parent nav
          }}
          style={{
            border: "1px dashed blue", // debug border menu item
            display: "flex",
            alignItems: "center",
            padding: "10px",
          }}
        >
          <img
            src={item.icon}
            style={{
              width: "1em",
              height: "1em",
              marginRight: "8px",
              border: "1px solid purple", // debug border icon
            }}
            alt={item.label}
          />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default Menu;
