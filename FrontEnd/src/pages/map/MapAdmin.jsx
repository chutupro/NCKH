// src/pages/map/MapAdmin.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMapLocations } from "./mapLocationsSlice";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;
const BASE_URL = "http://localhost:3000";

const defaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapAdmin = () => {
  const dispatch = useDispatch();
  const { places, status } = useSelector((state) => state.mapLocations);
  const [form, setForm] = useState({
    id: null,
    title: "",
    position: [16.0544, 108.2022],
    address: "",
    image: null,
    imagePreview: "",
    oldImage: null,
    oldImagePreview: "",
    desc: "",
    fullDesc: "",
    categoryId: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showArticleList, setShowArticleList] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());
  const currentMarkerRef = useRef(null);
  const fileInputRef = useRef(null);
  const debounceTimeout = useRef(null);

  // === KHỞI TẠO MAP ===
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [16.0544, 108.2022],
      zoom: 12,
      minZoom: 11,
      maxZoom: 19,
      maxBounds: [[15.8, 107.8], [16.3, 108.5]],
      maxBoundsViscosity: 1.0,
    });
    mapInstance.current = map;

    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: "&copy; Google Maps",
    }).addTo(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocodeHere(lat, lng);

      setForm((prev) => ({ ...prev, position: [lat, lng], address }));
      setSearchQuery(address);

      if (currentMarkerRef.current) {
        mapInstance.current.removeLayer(currentMarkerRef.current);
      }

      const title = form.title || "Địa điểm mới";
      const marker = L.marker([lat, lng], { icon: defaultIcon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <b>${title}</b><br>
          <small style="color:#555;">${address}</small><br>
          <code style="font-size:0.85rem;">[${lat.toFixed(6)}, ${lng.toFixed(6)}]</code>
        `)
        .openPopup();

      currentMarkerRef.current = marker;
      map.setView([lat, lng], 18);
    });

    dispatch(fetchMapLocations());
    fetchCategories();
  }, [dispatch]);

  // === LẤY DANH MỤC ===
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  // === TÌM KIẾM GỢI Ý ===
  const searchHere = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get("https://autosuggest.search.hereapi.com/v1/autosuggest", {
        params: {
          q: query,
          at: "16.0544,108.2022",
          limit: 8,
          apikey: HERE_API_KEY,
          in: "countryCode:VNM",
          lang: "vi",
        },
      });

      const items = (response.data.items || [])
        .filter((item) => item.position && item.address?.label?.includes("Đà Nẵng"))
        .map((item) => {
          const a = item.address || {};
          const house = a.houseNumber ? `${a.houseNumber} ` : "";
          return {
            title: item.title || a.label,
            address: `${house}${a.street || ""}${a.district ? `, ${a.district}` : ""}${a.city ? `, ${a.city}` : ""}`.trim(),
            fullAddress: a.label || "",
            lat: item.position.lat,
            lng: item.position.lng,
          };
        });

      setSuggestions(items);
    } catch (err) {
      console.error("Lỗi gợi ý HERE:", err);
      setSuggestions([]);
    }
  };

  const debouncedSearch = useCallback((q) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => searchHere(q), 300);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setForm((prev) => ({ ...prev, address: val }));
    debouncedSearch(val);
  };

  const handleSelectSuggestion = (sugg) => {
    const lat = sugg.lat;
    const lng = sugg.lng;
    const address = sugg.address || sugg.fullAddress;

    setForm((prev) => ({
      ...prev,
      position: [lat, lng],
      address,
    }));
    setSearchQuery(address);
    setSuggestions([]);

    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 18);
      if (currentMarkerRef.current) {
        mapInstance.current.removeLayer(currentMarkerRef.current);
      }
      const marker = L.marker([lat, lng], { icon: defaultIcon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <b>${form.title || "Địa điểm mới"}</b><br>
          <small style="color:#555;">${address}</small><br>
          <code style="font-size:0.85rem;">[${lat.toFixed(6)}, ${lng.toFixed(6)}]</code>
        `)
        .openPopup();
      currentMarkerRef.current = marker;
    }
  };

  // === REVERSE GEOCODE ===
  const reverseGeocodeHere = async (lat, lng) => {
    try {
      const res = await axios.get("https://revgeocode.search.hereapi.com/v1/revgeocode", {
        params: {
          at: `${lat},${lng}`,
          lang: "vi",
          apikey: HERE_API_KEY,
        },
      });

      const item = res.data.items[0];
      if (!item?.address) return "Không xác định";

      const a = item.address;
      const parts = [];
      if (a.houseNumber) parts.push(a.houseNumber);
      if (a.street) parts.push(a.street);
      if (a.district) parts.push(a.district);
      if (a.city) parts.push(a.city);

      return parts.length > 0 ? parts.join(", ") : a.label || "Không xác định";
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return "Không xác định";
    }
  };

  // === CẬP NHẬT MARKER ===
  useEffect(() => {
    if (!mapInstance.current || !Array.isArray(places)) return;

    markersRef.current.forEach((marker) => mapInstance.current.removeLayer(marker));
    markersRef.current.clear();

    places.forEach((place) => {
      if (place.position?.length === 2) {
        const marker = L.marker(place.position, { icon: defaultIcon })
          .addTo(mapInstance.current)
          .bindPopup(`<b>${place.title}</b><br>${place.address || "Chưa có địa chỉ"}`)
          .on("click", () => {
            setForm({
              ...place,
              imagePreview: place.image ? `${BASE_URL}${place.image}` : "",
              oldImagePreview: place.oldImage ? `${BASE_URL}${place.oldImage}` : "",
              categoryId: place.categoryId || "",
            });
            setSearchQuery(place.address || "");
            mapInstance.current.setView(place.position, 16);
            if (currentMarkerRef.current) mapInstance.current.removeLayer(currentMarkerRef.current);
          });
        markersRef.current.set(place.id, marker);
      }
    });
  }, [places]);

  // === XỬ LÝ ẢNH ===
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const field = e.target.dataset.field;
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      [field]: file,
      [`${field}Preview`]: preview,
    }));
    e.target.value = "";
  };

  const handleImageClick = (field) => {
    fileInputRef.current.dataset.field = field;
    fileInputRef.current.click();
  };

  // === SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.address || !form.position[0] || !form.position[1]) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("address", form.address);
    formData.append("latitude", form.position[0].toString());
    formData.append("longitude", form.position[1].toString());
    formData.append("desc", form.desc || "");
    formData.append("fullDesc", form.fullDesc || "");
    formData.append("CategoryID", form.categoryId || "");

    if (form.image instanceof File) {
      formData.append("image", form.image);
    }
    if (form.oldImage instanceof File) {
      formData.append("oldImage", form.oldImage);
    }

    try {
      if (form.id) {
        // CẬP NHẬT
        await axios.put(`${BASE_URL}/map-locations/${form.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Cập nhật thành công!");
      } else {
        // THÊM MỚI
        await axios.post(`${BASE_URL}/map-locations`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Thêm địa điểm thành công!");
      }

      setForm({
        id: null,
        title: "",
        position: [16.0544, 108.2022],
        address: "",
        image: null,
        imagePreview: "",
        oldImage: null,
        oldImagePreview: "",
        desc: "",
        fullDesc: "",
        categoryId: "",
      });
      setSearchQuery("");
      if (currentMarkerRef.current) mapInstance.current.removeLayer(currentMarkerRef.current);
      dispatch(fetchMapLocations());
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  // === XÓA BÀI VIẾT ===
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      await axios.delete(`${BASE_URL}/map-locations/${id}`);
      alert("Xóa thành công!");
      dispatch(fetchMapLocations());
      setShowArticleList(false);
      setSelectedArticle(null);
    } catch (err) {
      alert("Lỗi xóa: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto", background: "#f5f5f5", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: "600", color: "#333", marginBottom: "30px", textAlign: "center" }}>
        Quản lý Địa điểm Lịch sử Đà Nẵng
      </h2>

      {/* NÚT DANH SÁCH BÀI VIẾT */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button
          onClick={() => setShowArticleList(!showArticleList)}
          style={{
            padding: "12px 24px",
            background: showArticleList ? "#d32f2f" : "#1a73e8",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "0.2s"
          }}
        >
          {showArticleList ? "Ẩn danh sách bài viết" : "Danh sách bài viết"}
        </button>
      </div>

      {/* DANH SÁCH BÀI VIẾT */}
      {showArticleList && (
        <div style={{ marginBottom: "30px", background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1.3rem", fontWeight: "600" }}>
            Tất cả bài viết ({places.length})
          </h3>
          <div style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #eee", borderRadius: "8px" }}>
            {places.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "20px" }}>Chưa có bài viết nào.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                    <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>Ảnh</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>Tiêu đề</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>Địa chỉ</th>
                    <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {places.map((place) => (
                    <tr
                      key={place.id}
                      style={{
                        borderBottom: "1px solid #eee",
                        background: selectedArticle?.id === place.id ? "#e3f2fd" : "white"
                      }}
                      onClick={() => setSelectedArticle(place)}
                    >
                      <td style={{ padding: "12px", verticalAlign: "top" }}>
                        <img
                          src={place.image ? `${BASE_URL}${place.image}` : "https://via.placeholder.com/60"}
                          alt=""
                          style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                        />
                      </td>
                      <td style={{ padding: "12px", fontWeight: "600", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {place.title}
                      </td>
                      <td style={{ padding: "12px", color: "#555", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {place.address || "Chưa có"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(place.id);
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            cursor: "pointer"
                          }}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* FORM + BẢN ĐỒ */}
      <div style={{ display: "flex", gap: "30px" }}>
        {/* FORM */}
        <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          <form onSubmit={handleSubmit}>
            {/* ... (giữ nguyên toàn bộ form như cũ) */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Tên địa điểm</label>
              <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="VD: Cầu Rồng" style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem" }} required />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Thể loại</label>
              <select value={form.categoryId} onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))} style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem" }}>
                <option value="">Chọn thể loại</option>
                {categories.map(cat => (
                  <option key={cat.CategoryID} value={cat.CategoryID}>{cat.Name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px", position: "relative" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>
                Địa chỉ <small style={{ color: "#1a73e8" }}>(gợi ý tự động)</small>
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="VD: 123 Hoàng Minh Thảo..."
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem" }}
              />
              {suggestions.length > 0 && (
                <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #ddd", borderRadius: "8px", maxHeight: "220px", overflowY: "auto", margin: "4px 0 0", padding: 0, listStyle: "none", zIndex: 1000, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                  {suggestions.map((s, i) => (
                    <li key={i} onClick={() => handleSelectSuggestion(s)} style={{ padding: "12px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "0.95rem" }}
                      onMouseEnter={e => e.target.style.background = "#f0f8ff"}
                      onMouseLeave={e => e.target.style.background = "white"}
                    >
                      <strong>{s.title}</strong><br />
                      <small style={{ color: "#666" }}>{s.address}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Lat</label>
                <input type="number" step="0.000001" value={form.position[0]} onChange={e => setForm(prev => ({ ...prev, position: [parseFloat(e.target.value) || 0, prev.position[1]] }))} style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Lng</label>
                <input type="number" step="0.000001" value={form.position[1]} onChange={e => setForm(prev => ({ ...prev, position: [prev.position[0], parseFloat(e.target.value) || 0] }))} style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} required />
              </div>
            </div>

            {/* Ảnh hiện đại & xưa */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Ảnh hiện đại</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button type="button" onClick={() => handleImageClick("image")} style={{ width: "140px", height: "90px", border: "2px dashed #ccc", borderRadius: "12px", background: form.imagePreview ? "transparent" : "#f8f9fa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#1a73e8"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#ccc"}
                >
                  {form.imagePreview ? <img src={form.imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} /> : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#666" viewBox="0 0 16 16" style={{ marginBottom: "4px" }}>
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                      </svg>
                      <span style={{ fontSize: "0.8rem", color: "#555", fontWeight: "500" }}>Chọn ảnh</span>
                    </>
                  )}
                </button>
                {form.image && <div style={{ fontSize: "0.85rem", color: "#666", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.image.name}</div>}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Ảnh xưa</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button type="button" onClick={() => handleImageClick("oldImage")} style={{ width: "140px", height: "90px", border: "2px dashed #ccc", borderRadius: "12px", background: form.oldImagePreview ? "transparent" : "#f8f9fa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#1a73e8"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#ccc"}
                >
                  {form.oldImagePreview ? <img src={form.oldImagePreview} alt="Old Preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} /> : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#666" viewBox="0 0 16 16" style={{ marginBottom: "4px" }}>
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                      </svg>
                      <span style={{ fontSize: "0.8rem", color: "#555", fontWeight: "500" }}>Chọn ảnh</span>
                    </>
                  )}
                </button>
                {form.oldImage && <div style={{ fontSize: "0.85rem", color: "#666", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.oldImage.name}</div>}
              </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} accept="image/*" data-field="" />

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Mô tả ngắn</label>
              <input type="text" value={form.desc} onChange={e => setForm(prev => ({ ...prev, desc: e.target.value }))} placeholder="Mô tả ngắn gọn" style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Mô tả chi tiết</label>
              <textarea value={form.fullDesc} onChange={e => setForm(prev => ({ ...prev, fullDesc: e.target.value }))} placeholder="Lịch sử, ý nghĩa..." style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem", height: "150px", resize: "vertical" }} />
            </div>

            <button type="submit" style={{ width: "100%", padding: "14px", background: "#1a73e8", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "1rem", cursor: "pointer" }}>
              {form.id ? "Cập nhật địa điểm" : "Thêm địa điểm"}
            </button>
          </form>
        </div>

        {/* BẢN ĐỒ */}
        <div style={{ flex: 2, borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          <div ref={mapRef} style={{ height: "700px", width: "100%" }} />
          <p style={{ marginTop: "10px", fontSize: "0.95rem", color: "#555", textAlign: "center" }}>
            <strong>Tọa độ:</strong> [{form.position[0].toFixed(6)}, {form.position[1].toFixed(6)}]
          </p>
        </div>
      </div>

      {status === "failed" && <div style={{ color: "red", marginTop: "20px", textAlign: "center" }}>Lỗi: {status}</div>}
    </div>
  );
};

export default MapAdmin;