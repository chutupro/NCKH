import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

const MapAdminContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [categories, setCategories] = useState([]);

  // Lấy dữ liệu đóng góp từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("userContributions");
    if (saved) {
      try {
        setContributions(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi parse userContributions", e);
      }
    }
  }, []);

  // Lấy danh sách thể loại từ database
  useEffect(() => {
    axios
      .get(`${BASE_URL}/categories`)
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh mục:", err);
        alert("Không thể tải danh sách thể loại.");
      });
  }, []);

  // XỬ LÝ CHẤP NHẬN
  const handleApprove = async (contrib) => {
    if (!window.confirm("Chấp nhận đóng góp này vào bản đồ chính?")) return;

    const categorySelect = document.getElementById("admin-contrib-category");
    const categoryId = categorySelect?.value;

    if (!categoryId) {
      alert("Vui lòng chọn thể loại trước khi duyệt!");
      return;
    }

    const formData = new FormData();
    formData.append("title", contrib.title || "Địa điểm người dùng");
    formData.append("address", contrib.address || "Không rõ");
    formData.append("latitude", contrib.position[0]);
    formData.append("longitude", contrib.position[1]);
    formData.append("desc", contrib.desc || "");
    formData.append("CategoryID", categoryId); // Dùng thể loại admin chọn

    try {
      const blob = await (await fetch(contrib.image)).blob();
      formData.append("image", blob, `contrib-${contrib.id}.jpg`);

      await axios.post(`${BASE_URL}/map-locations`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Xóa khỏi danh sách chờ duyệt
      const updated = contributions.filter((c) => c.id !== contrib.id);
      localStorage.setItem("userContributions", JSON.stringify(updated));
      setContributions(updated);
      setSelected(null);

      alert(`Đã thêm "${contrib.title}" vào bản đồ!`);
    } catch (err) {
      console.error("Lỗi duyệt đóng góp:", err);
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  // XỬ LÝ TỪ CHỐI
  const handleReject = (contrib) => {
    if (!window.confirm("Từ chối đóng góp này?")) return;

    const updated = contributions.filter((c) => c.id !== contrib.id);
    localStorage.setItem("userContributions", JSON.stringify(updated));
    setContributions(updated);
    setSelected(null);
    alert("Đã từ chối đóng góp.");
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "system-ui",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "600",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        Quản lý Đóng góp Người dùng
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* DANH SÁCH ĐÓNG GÓP */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              fontSize: "1.2rem",
              fontWeight: "600",
            }}
          >
            Đóng góp đang chờ ({contributions.length})
          </h3>

          {contributions.length === 0 ? (
            <p
              style={{
                color: "#888",
                fontStyle: "italic",
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              Chưa có đóng góp nào.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              {contributions.map((contrib) => (
                <div
                  key={contrib.id}
                  onClick={() => setSelected(contrib)}
                  style={{
                    padding: "14px",
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background: selected?.id === contrib.id ? "#e3f2fd" : "white",
                    transition: "0.2s",
                    boxShadow:
                      selected?.id === contrib.id ? "0 0 0 2px #1a73e8" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={contrib.image}
                      alt="contrib"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "1rem",
                          color: "#1a0dab",
                        }}
                      >
                        {contrib.title || "Không có tiêu đề"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        {contrib.address || "Không rõ địa chỉ"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#999",
                          marginTop: "4px",
                        }}
                      >
                        {new Date(contrib.timestamp).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHI TIẾT & DUYỆT */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          }}
        >
          {selected ? (
            <>
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                }}
              >
                Chi tiết đóng góp
              </h3>

              <img
                src={selected.image}
                alt="preview"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  maxHeight: "300px",
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  color: "#333",
                }}
              >
                <p>
                  <strong>Tên chủ đề:</strong>{" "}
                  <span style={{ color: "#1a73e8" }}>
                    {selected.title || "Không có"}
                  </span>
                </p>

                <p>
                  <strong>Địa chỉ:</strong> {selected.address || "Không rõ"}
                </p>

                <p>
                  <strong>Tọa độ:</strong> [
                  {selected.position[0].toFixed(6)},{" "}
                  {selected.position[1].toFixed(6)}]
                </p>

                <p>
                  <strong>Mô tả:</strong>{" "}
                  {selected.desc || "Không có mô tả"}
                </p>

                <p>
                  <strong>Thời gian:</strong>{" "}
                  {new Date(selected.timestamp).toLocaleString("vi-VN")}
                </p>
              </div>

              {/* CHỌN THỂ LOẠI (BẮT BUỘC) */}
              <div style={{ margin: "20px 0" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  Chọn thể loại <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  id="admin-contrib-category"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    background: "white",
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Chọn thể loại --
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>
                      {cat.Name}
                    </option>
                  ))}
                </select>
              </div>

              {/* NÚT HÀNH ĐỘNG */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  onClick={() => handleApprove(selected)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  Chấp nhận
                </button>
                <button
                  onClick={() => handleReject(selected)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  Từ chối
                </button>
              </div>
            </>
          ) : (
            <p
              style={{
                color: "#888",
                textAlign: "center",
                marginTop: "80px",
                fontSize: "1.1rem",
              }}
            >
              Chọn một đóng góp để xem chi tiết
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapAdminContributions;