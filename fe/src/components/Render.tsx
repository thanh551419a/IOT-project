import { Routes, Route } from "react-router-dom";

// ✅ Các component trang được định nghĩa trực tiếp trong Render
function DashBoard() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Đây là trang Dashboard.</p>
    </div>
  );
}

function DataSensor() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Data Sensor</h2>
      <p>Thông tin dữ liệu cảm biến sẽ hiển thị ở đây.</p>
    </div>
  );
}

function History() {
  return (
    <div style={{ padding: 20 }}>
      <h2>History</h2>
      <p>Lịch sử hoạt động sẽ hiển thị tại đây.</p>
    </div>
  );
}

function Profile() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      <p>Thông tin cá nhân sẽ hiển thị tại đây.</p>
    </div>
  );
}

// ✅ Component Render chứa tất cả Route
function Render() {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
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
