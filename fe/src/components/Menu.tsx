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
  const [activeIndex, setActiveIndex] = useState(
    menuItems.findIndex((item) => item.path === location.pathname)
  );

  useEffect(() => {
    const index = menuItems.findIndex(
      (item) => item.path === location.pathname
    );
    if (index !== -1) setActiveIndex(index);
  }, [location]);

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        width: "20%",
        height: "95vh",
        border: "2px solid black",
        borderRadius: "100px",
        position: "relative", // cần để highlight định vị tuyệt đối
        overflow: "hidden",
      }}
    >
      <div
        className="BoxInDashBoard"
        style={{ fontSize: "50px", fontWeight: "bold" }}
      >
        IOT Control
      </div>

      {/* Highlight động */}
      <div
        className="menu-highlight"
        style={{
          top: `${(activeIndex + 1) * (140 + 40) + 40}px`,
        }}
      />

      {menuItems.map((item, index) => (
        <Link
          key={item.path}
          to={item.path}
          className="BoxInDashBoard"
          onClick={() => setActiveIndex(index)}
        >
          <img
            src={item.icon}
            style={{ width: "1em", height: "1em", marginRight: "8px" }}
            alt={item.label}
          />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default Menu;
