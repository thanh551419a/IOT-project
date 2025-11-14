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

  const [activeIndex, setActiveIndex] = useState(0);

  const itemHeightPercent = 13;
  const marginTopPercent = 2;

  useEffect(() => {
    const index = menuItems.findIndex(
      (item) => item.path === location.pathname
    );
    if (index !== -1) setActiveIndex(index);
  }, [location]);

  const highlightTopVH =
    (activeIndex + 1) * (itemHeightPercent + marginTopPercent);

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        width: "20%",
        height: "100%",
        borderRadius: "100px",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <div
        className="BoxInDashBoard"
        style={{
          fontSize: "50px",
          fontWeight: "bold",
          textAlign: "center",
          margin: "20px 0",
          color: "#333",
        }}
      >
        IOT Control
      </div>

      {/* Highlight động */}
      <div
        className="menu-highlight"
        style={{
          top: `calc(${(activeIndex + 1) * 13}vh + ${
            activeIndex * 4
          }vh + 50px)`,
          position: "absolute",
          left: 0,
          width: "100%",
          height: "13vh",
          borderRadius: "100px",
          background: "rgba(0, 128, 255, 0.1)",
          transition: "top 0.3s ease",
        }}
      />

      {menuItems.map((item, index) => (
        <Link
          key={item.path}
          to={item.path}
          className="BoxInDashBoard"
          onClick={() => setActiveIndex(index)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
            textDecoration: "none",
            color: "#333",
            fontSize: "20px",
            borderRadius: "60px",
            zIndex: 2,
          }}
        >
          <img
            src={item.icon}
            style={{
              width: "1em",
              height: "1em",
              marginRight: "8px",
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
