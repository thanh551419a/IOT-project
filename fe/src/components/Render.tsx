import { Routes, Route } from "react-router-dom";
import DashBoard from "../pagess/DashBoard";
import DataSensor from "../pagess/DataSensor";
import History from "../pagess/History";
import Profile from "../pagess/Profile";
// ✅ Các component trang được định nghĩa trực tiếp trong Render

// ✅ Component Render chứa tất cả Route
function Render() {
  return (
    <div
      style={{
        flex: 1,
        padding: "0",
        width: "10vw",
        height: "95vh",
      }}
    >
      <Routes>
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/datasensor" element={<DataSensor />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<></>} />
      </Routes>
    </div>
  );
}

export default Render;
