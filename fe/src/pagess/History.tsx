import React, { useState } from "react";

// Lấy thời gian hiện tại theo định dạng datetime-local
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

// Format timestamp server sang HH:mm:ss DD/MM/YYYY
const formatTimestamp = (ts?: string) => {
  if (!ts) return "-";
  const [hm, dmy] = ts.split("_");
  if (!hm || !dmy) return ts;
  const [hh, mm, ss] = hm.split(":");
  const [dd, MM, yyyy] = dmy.split("/");
  return `${hh}:${mm}:${ss} ${dd}/${MM}/${yyyy}`;
};

interface LedData {
  id: number;
  type: string; // led1, led2, led3
  value: string; // "ON" / "OFF"
  status: string; // "updated" / "disconnected"
  timestamp: string;
}

function History() {
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [timeStart, setTimeStart] = useState<string>(getCurrentDateTimeLocal());
  const [timeEnd, setTimeEnd] = useState<string>(getCurrentDateTimeLocal());
  const [data, setData] = useState<LedData[]>([]);

  // Filter dropdowns
  const [ledFilter, setLedFilter] = useState<"all" | "led1" | "led2" | "led3">(
    "all"
  );
  const [valueFilter, setValueFilter] = useState<"all" | "ON" | "OFF">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "updated" | "disconnected"
  >("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeStart(value);
    if (timeEnd && new Date(value) > new Date(timeEnd)) setTimeEnd(value);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (timeStart && new Date(value) > new Date(timeEnd)) setTimeEnd(timeStart);
    else setTimeEnd(value);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
  };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  };
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
  };

  const convertToVNTime = (localStr: string) => {
    const date = new Date(localStr);
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const vnTime = new Date(utc + 7 * 60 * 60000);
    const hh = String(vnTime.getHours()).padStart(2, "0");
    const mm = String(vnTime.getMinutes()).padStart(2, "0");
    const ss = String(vnTime.getSeconds()).padStart(2, "0");
    const dd = String(vnTime.getDate()).padStart(2, "0");
    const MM = String(vnTime.getMonth() + 1).padStart(2, "0");
    const yyyy = vnTime.getFullYear();
    return `${hh}:${mm}:${ss}_${dd}/${MM}/${yyyy}`;
  };

  const handleSearch = async () => {
    if (!timeStart || !timeEnd) {
      alert("Vui lòng chọn thời gian bắt đầu và kết thúc!");
      return;
    }

    // --- giữ nguyên convertToVNTime() của bạn ---
    const timestartFormatted = convertToVNTime(timeStart);
    const timeendFormatted = convertToVNTime(timeEnd);

    // --- BẤM SỬA: ghép query string thủ công để backend nhận đúng định dạng ---
    const queryString =
      `sort=${sort}` +
      `&type=all` +
      `&timestart=${timestartFormatted}` +
      `&timeend=${timeendFormatted}` +
      `&led=${ledFilter}` +
      `&value=${valueFilter}` +
      `&status=${statusFilter}`;

    const url = `http://localhost:3000/ledSearching?${queryString}`;
    console.log("🔍 URL gửi đi:", url);

    try {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const jsonData: LedData[] = await response.json();
      setData(jsonData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu:", error);
    }
  };

  const filteredData = data.filter((item) => {
    let ok = true;
    if (ledFilter !== "all") ok = ok && item.type === ledFilter;
    if (valueFilter !== "all") ok = ok && item.value === valueFilter;
    if (statusFilter !== "all") ok = ok && item.status === statusFilter;
    return ok;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2
        style={{ textAlign: "center", marginBottom: "30px", fontSize: "28px" }}
      >
        🕒 History
      </h2>

      {/* Filters row */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "nowrap",
          marginBottom: "15px",
        }}
      >
        <div style={{ flex: "0 0 10%" }}>
          <label>Sort:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "asc" | "desc")}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="asc">Earliest → Latest</option>
            <option value="desc">Latest → Earliest</option>
          </select>
        </div>

        <div style={{ flex: "0 0 15%" }}>
          <label>LED:</label>
          <select
            value={ledFilter}
            onChange={(e) =>
              setLedFilter(e.target.value as "all" | "led1" | "led2" | "led3")
            }
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="all">All</option>
            <option value="led1">LED1</option>
            <option value="led2">LED2</option>
            <option value="led3">LED3</option>
          </select>
        </div>

        <div style={{ flex: "0 0 15%" }}>
          <label>Value:</label>
          <select
            value={valueFilter}
            onChange={(e) =>
              setValueFilter(e.target.value as "all" | "ON" | "OFF")
            }
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="all">All</option>
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>
        </div>

        <div style={{ flex: "0 0 15%" }}>
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "all" | "updated" | "disconnected"
              )
            }
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="all">All</option>
            <option value="updated">Updated</option>
            <option value="disconnected">Disconnected</option>
          </select>
        </div>

        <div style={{ flex: "0 0 20%" }}>
          <label>Time Start:</label>
          <input
            type="datetime-local"
            min="2000-01-01T00:00"
            max="2099-12-31T23:59"
            value={timeStart}
            onChange={handleStartChange}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={{ flex: "0 0 20%" }}>
          <label>Time End:</label>
          <input
            type="datetime-local"
            min="2000-01-01T00:00"
            max="2099-12-31T23:59"
            value={timeEnd}
            onChange={handleEndChange}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Search button */}
      <div
        style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}
      >
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 25px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          🔎 Search
        </button>
      </div>

      {/* Table */}
      {paginatedData.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              marginTop: "20px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  LED
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Value
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Status
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.id}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.type}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.value}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.status}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {formatTimestamp(item.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "15px",
              gap: "10px",
            }}
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default History;
