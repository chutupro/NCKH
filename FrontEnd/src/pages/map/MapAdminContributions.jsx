import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

const MapAdminContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputNow = useRef(null);
  const fileInputOld = useRef(null);

  // === LẤY DỮ LIỆU ===
  useEffect(() => {
    const saved = localStorage.getItem("userContributions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setContributions(parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (e) {
        console.error("Lỗi parse userContributions", e);
      }
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/categories`)
      .then((res) => setCategories(res.data || []))
      .catch((err) => {
        console.error("Lỗi lấy danh mục:", err);
        alert("Không thể tải danh sách thể loại.");
      });
  }, []);

  // === CHỈNH SỬA ===
  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => setIsEditing(false);

  // === XỬ LÝ ẢNH ===
  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelected((prev) => ({
        ...prev,
        [type]: ev.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // === CHẤP NHẬN ===
  const handleApprove = async () => {
    if (!window.confirm("Chấp nhận đóng góp này vào bản đồ chính?")) return;

    const categorySelect = document.getElementById("admin-contrib-category");
    const categoryId = categorySelect?.value;

    if (!categoryId) {
      alert("Vui lòng chọn thể loại trước khi duyệt!");
      return;
    }

    const formData = new FormData();
    formData.append("title", selected.title || "Địa điểm người dùng");
    formData.append("address", selected.address || "Không rõ");
    formData.append("latitude", selected.position[0]);
    formData.append("longitude", selected.position[1]);
    formData.append("desc", selected.desc || "");
    formData.append("fullDesc", selected.fullDesc || "");
    formData.append("CategoryID", categoryId);

    try {
      if (selected.image) {
        const blob = await (await fetch(selected.image)).blob();
        formData.append("image", blob, `now-${selected.id}.jpg`);
      }
      if (selected.oldImage) {
        const blob = await (await fetch(selected.oldImage)).blob();
        formData.append("oldImage", blob, `old-${selected.id}.jpg`);
      }

      await axios.post(`${BASE_URL}/map-locations`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = contributions.filter((c) => c.id !== selected.id);
      localStorage.setItem("userContributions", JSON.stringify(updated));
      setContributions(updated);
      setSelected(null);
      setIsEditing(false);

      alert(`Đã thêm "${selected.title}" vào bản đồ chính!`);
    } catch (err) {
      console.error("Lỗi duyệt đóng góp:", err);
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  // === TỪ CHỐI ===
  const handleReject = () => {
    if (!window.confirm("Từ chối đóng góp này? Không thể khôi phục.")) return;
    const updated = contributions.filter((c) => c.id !== selected.id);
    localStorage.setItem("userContributions", JSON.stringify(updated));
    setContributions(updated);
    setSelected(null);
    setIsEditing(false);
    alert("Đã từ chối đóng góp.");
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1400px",
        margin: "0 auto",
        fontFamily: "system-ui",
        background: "#f5f7fa",
      }}
    >
      <h2
        style={{
          fontSize: "2.2rem",
          fontWeight: "700",
          marginBottom: "32px",
          textAlign: "center",
          color: "#1a0dab",
          textShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        Quản lý Đóng góp Người dùng
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "28px" }}>
        {/* DANH SÁCH */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            maxHeight: "82vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px",
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#222",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Đóng góp chờ duyệt
            <span
              style={{
                background: "#ff3b30",
                color: "white",
                fontSize: "0.8rem",
                fontWeight: "600",
                padding: "4px 10px",
                borderRadius: "12px",
              }}
            >
              {contributions.length}
            </span>
          </h3>

          {contributions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#999",
                fontStyle: "italic",
              }}
            >
              <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}></div>
              <p style={{ fontSize: "1.1rem" }}>Chưa có đóng góp nào</p>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                paddingRight: "6px",
              }}
            >
              {contributions.map((contrib) => (
                <div
                  key={contrib.id}
                  onClick={() => {
                    setSelected(contrib);
                    setIsEditing(false);
                  }}
                  style={{
                    padding: "16px",
                    border: "2px solid #eee",
                    borderRadius: "14px",
                    cursor: "pointer",
                    background: selected?.id === contrib.id ? "#e8f4fd" : "white",
                    transition: "all 0.2s ease",
                    boxShadow:
                      selected?.id === contrib.id
                        ? "0 0 0 3px #1a73e8"
                        : "0 1px 3px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        flexShrink: 0,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                    >
                      <img
                        src={
                          contrib.image ||
                          contrib.oldImage ||
                          "https://via.placeholder.com/70?text=Ảnh"
                        }
                        alt="thumb"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "1.05rem",
                          color: "#1a0dab",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {contrib.title || "Không có tiêu đề"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          color: "#555",
                          marginTop: "3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {contrib.address || "Không rõ địa chỉ"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "#888",
                          marginTop: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#888">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13h-1v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        {new Date(contrib.timestamp).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHI TIẾT & CHỈNH SỬA */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            maxHeight: "82vh",
            overflowY: "auto",
          }}
        >
          {selected ? (
            <>
              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.35rem",
                    fontWeight: "700",
                    color: "#222",
                  }}
                >
                  {isEditing ? "Chỉnh sửa đóng góp" : "Chi tiết đóng góp"}
                </h3>
                {!isEditing && (
                  <button
                    onClick={startEdit}
                    style={{
                      padding: "10px 18px",
                      background: "#1a73e8",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {/* ẢNH XƯA - NAY (ĐẸP HƠN) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "24px",
                }}
              >
                {/* ẢNH NAY */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "700",
                        color: "#1a73e8",
                        fontSize: "1rem",
                      }}
                    >
                      Ảnh hiện tại
                    </p>
                    {isEditing && (
                      <label
                        style={{
                          padding: "6px 12px",
                          background: "#e3f2fd",
                          color: "#1a73e8",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Thay ảnh
                        <input
                          ref={fileInputNow}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageChange(e, "image")}
                        />
                      </label>
                    )}
                  </div>
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      background: selected.image ? "transparent" : "#f8f9fa",
                      height: "260px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected.image ? (
                      <img
                        src={selected.image}
                        alt="nay"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          color: "#aaa",
                          fontSize: "0.9rem",
                        }}
                      >
                        <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}></div>
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                </div>

                {/* ẢNH XƯA */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "700",
                        color: "#d50000",
                        fontSize: "1rem",
                      }}
                    >
                      Ảnh xưa
                    </p>
                    {isEditing && (
                      <label
                        style={{
                          padding: "6px 12px",
                          background: "#ffebee",
                          color: "#d50000",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Thêm ảnh
                        <input
                          ref={fileInputOld}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageChange(e, "oldImage")}
                        />
                      </label>
                    )}
                  </div>
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      background: selected.oldImage ? "transparent" : "#f8f9fa",
                      height: "260px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected.oldImage ? (
                      <img
                        src={selected.oldImage}
                        alt="xưa"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          color: "#aaa",
                          fontSize: "0.9rem",
                        }}
                      >
                        <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}></div>
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* THÔNG TIN CHỈNH SỬA */}
              <div
                style={{
                  background: "#fafafa",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  border: "1px solid #eee",
                }}
              >
                {isEditing ? (
                  <>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#333" }}>
                        Tên chủ đề <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={selected.title || ""}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, title: e.target.value }))
                        }
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #ddd",
                          borderRadius: "10px",
                          fontSize: "1rem",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#333" }}>
                        Mô tả ngắn
                      </label>
                      <input
                        type="text"
                        value={selected.desc || ""}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, desc: e.target.value }))
                        }
                        placeholder="Tóm tắt ngắn gọn..."
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #ddd",
                          borderRadius: "10px",
                          fontSize: "1rem",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#333" }}>
                        Mô tả chi tiết
                      </label>
                      <textarea
                        value={selected.fullDesc || ""}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, fullDesc: e.target.value }))
                        }
                        placeholder="Lịch sử, ý nghĩa, thay đổi..."
                        rows={4}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #ddd",
                          borderRadius: "10px",
                          fontSize: "0.95rem",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ margin: "10px 0" }}>
                      <strong>Tên:</strong>{" "}
                      <span style={{ color: "#1a73e8", fontWeight: "600" }}>
                        {selected.title || "Không có"}
                      </span>
                    </p>
                    <p style={{ margin: "10px 0" }}>
                      <strong>Địa chỉ:</strong> {selected.address || "Không rõ"}
                    </p>
                    <p style={{ margin: "10px 0" }}>
                      <strong>Tọa độ:</strong> [
                      {selected.position[0].toFixed(6)}, {selected.position[1].toFixed(6)}]
                    </p>
                    <p style={{ margin: "10px 0" }}>
                      <strong>Mô tả ngắn:</strong> {selected.desc || "Không có"}
                    </p>
                    {selected.fullDesc && (
                      <p style={{ margin: "10px 0" }}>
                        <strong>Mô tả chi tiết:</strong>
                        <br />
                        <span style={{ fontSize: "0.92rem", color: "#555", lineHeight: "1.6" }}>
                          {selected.fullDesc}
                        </span>
                      </p>
                    )}
                    <p style={{ margin: "10px 0", color: "#666", fontSize: "0.9rem" }}>
                      <strong>Gửi lúc:</strong>{" "}
                      {new Date(selected.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </>
                )}
              </div>

              {/* THỂ LOẠI */}
              <div style={{ margin: "24px 0" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  Thể loại <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  id="admin-contrib-category"
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
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
              <div style={{ display: "flex", gap: "14px", marginTop: "28px" }}>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleApprove}
                      style={{
                        flex: 1,
                        padding: "16px",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "700",
                        fontSize: "1.05rem",
                        cursor: "pointer",
                      }}
                    >
                      Lưu & Chấp nhận
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        flex: 1,
                        padding: "16px",
                        background: "#eee",
                        color: "#555",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleApprove}
                      style={{
                        flex: 1,
                        padding: "16px",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "700",
                        fontSize: "1.05rem",
                        cursor: "pointer",
                      }}
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={handleReject}
                      style={{
                        flex: 1,
                        padding: "16px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "700",
                        fontSize: "1.05rem",
                        cursor: "pointer",
                      }}
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                color: "#aaa",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}></div>
              <p style={{ fontSize: "1.2rem" }}>
                Chọn một đóng góp để xem chi tiết
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapAdminContributions;