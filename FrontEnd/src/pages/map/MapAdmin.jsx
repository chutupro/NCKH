// src/pages/map/MapAdmin.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMapLocation, fetchMapLocations } from "./mapLocationsSlice";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const BASE_URL = "http://localhost:3000";

const MapAdmin = () => {
  const dispatch = useDispatch();
  const { places, status, error } = useSelector((state) => state.mapLocations);
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
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());
  const fileInputRef = useRef(null);
  const debounceTimeout = useRef(null);

  // === XỬ LÝ CHỌN ẢNH (2 INPUT RIÊNG BIỆT) ===
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const field = e.target.dataset.field; // "image" hoặc "oldImage"
    if (!field) return;

    // Xóa blob cũ nếu có
    if (form[`${field}Preview`]?.startsWith("blob:")) {
      URL.revokeObjectURL(form[`${field}Preview`]);
    }

    const preview = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      [field]: file,
      [`${field}Preview`]: preview,
    }));

    // Reset input để chọn lại cùng file
    e.target.value = "";
  };

  const handleImageClick = (field) => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.field = field;
      fileInputRef.current.click();
    }
  };

  // === GỢI Ý ĐỊA CHỈ ===
  const formatAddress = (addressDetails, displayName, userInput = "") => {
    const parts = [];
    const userHouseMatch = userInput.match(/^(\d+[\w-]*)/i);
    const userHouseNumber = userHouseMatch ? userHouseMatch[1] : null;
    const hasHouseInData = addressDetails?.house_number;

    if (!hasHouseInData && userHouseNumber) parts.push(userHouseNumber);
    else if (hasHouseInData) parts.push(addressDetails.house_number);

    if (addressDetails?.road) parts.push(addressDetails.road);
    if (
      addressDetails?.neighbourhood &&
      !parts.includes(addressDetails.neighbourhood)
    )
      parts.push(addressDetails.neighbourhood);
    if (addressDetails?.suburb && !parts.includes(addressDetails.suburb))
      parts.push(addressDetails.suburb);
    if (
      addressDetails?.city_district &&
      !parts.includes(addressDetails.city_district)
    )
      parts.push(addressDetails.city_district);

    const city =
      addressDetails?.city ||
      addressDetails?.town ||
      addressDetails?.village ||
      "";
    if (city && !parts.includes(city)) parts.push(city);

    if (
      parts.length > 0 &&
      addressDetails?.state &&
      addressDetails.state !== "Đà Nẵng" &&
      !parts.includes(addressDetails.state)
    )
      parts.push(addressDetails.state);

    return parts.length > 0
      ? parts.join(", ")
      : displayName || "Địa chỉ không xác định";
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`
      );
      return formatAddress(
        response.data.address,
        response.data.display_name,
        searchQuery
      );
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return searchQuery || "Không thể lấy địa chỉ";
    }
  };

  const fetchAddressSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const houseMatch = query.match(/^(\d+[\w-]*)\s*(.*)/i);
      const houseNumber = houseMatch ? houseMatch[1] : "";
      const street = houseMatch ? houseMatch[2].trim() : query.trim();

      let searchStr = "";
      if (houseNumber && street)
        searchStr = `${houseNumber} ${street}, Đà Nẵng, Việt Nam`;
      else if (houseNumber) searchStr = `${houseNumber}, Đà Nẵng, Việt Nam`;
      else searchStr = `${query}, Đà Nẵng, Việt Nam`;

      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: searchStr,
            format: "json",
            limit: 10,
            addressdetails: 1,
            countrycodes: "vn",
            bounded: 1,
            viewbox: "107.85,16.25,108.4,15.85",
            dedupe: 1,
            "accept-language": "vi",
          },
          headers: { "User-Agent": "DaNangHistoryMap/1.0" },
        }
      );

      const filtered = response.data
        .filter((item) => {
          const addr = item.address || {};
          const inDaNang =
            addr.city === "Đà Nẵng" ||
            addr.state === "Đà Nẵng" ||
            item.display_name.toLowerCase().includes("đà nẵng");
          return inDaNang && item.lat && item.lon;
        })
        .sort((a, b) => {
          const aHasHouse = !!a.address?.house_number;
          const bHasHouse = !!b.address?.house_number;
          return bHasHouse - aHasHouse;
        });

      setSuggestions(filtered.slice(0, 8));
    } catch (error) {
      console.error("Lỗi gợi ý:", error);
      setSuggestions([]);
    }
  };

  const debouncedSearch = useCallback((query) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchAddressSuggestions(query);
    }, 300);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setForm((prev) => ({ ...prev, address: value }));
    debouncedSearch(value);
  };

  const handleSelectSuggestion = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const fullAddress = formatAddress(
      suggestion.address,
      suggestion.display_name,
      searchQuery
    );

    setForm((prev) => ({
      ...prev,
      position: [lat, lng],
      address: fullAddress,
    }));
    setSearchQuery(fullAddress);
    setSuggestions([]);

    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 18);
      clearTempMarker();
      addMarker([lat, lng], fullAddress, form.title || "Địa điểm mới");
    }
  };

  const clearTempMarker = () => {
    const tempMarker = markersRef.current.get("current");
    if (tempMarker && mapInstance.current) {
      mapInstance.current.removeLayer(tempMarker);
      markersRef.current.delete("current");
    }
  };

  const addMarker = (latLng, address, title) => {
    clearTempMarker();

    const marker = L.marker(latLng, { icon: defaultIcon })
      .addTo(mapInstance.current)
      .bindPopup(
        `<b>${title}</b><br>${address}<br>[${latLng[0].toFixed(
          6
        )}, ${latLng[1].toFixed(6)}]`
      )
      .openPopup();

    markersRef.current.set("current", marker);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [16.0544, 108.2022],
      zoom: 12,
      minZoom: 11,
      maxZoom: 19,
      maxBounds: [
        [15.8, 107.8],
        [16.3, 108.5],
      ],
      maxBoundsViscosity: 1.0,
    });
    mapInstance.current = map;

    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: "&copy; Google Maps",
    }).addTo(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);

      setForm((prev) => ({
        ...prev,
        position: [lat, lng],
        address,
      }));
      setSearchQuery(address);
      setSuggestions([]);

      clearTempMarker();
      addMarker([lat, lng], address, form.title || "Địa điểm mới");
      map.setView([lat, lng], 18);
    });

    dispatch(fetchMapLocations());
  }, [dispatch]);

  useEffect(() => {
    if (!mapInstance.current) return;
    addMarker(form.position, form.address, form.title || "Địa điểm mới");
  }, [form.position, form.address, form.title]);

  useEffect(() => {
    if (!mapInstance.current || !Array.isArray(places)) return;

    places.forEach((place) => {
      if (!markersRef.current.has(place.id) && place.position?.length === 2) {
        const marker = L.marker(place.position, { icon: defaultIcon })
          .addTo(mapInstance.current)
          .bindPopup(
            `<b>${place.title}</b><br>${place.address || "Chưa có địa chỉ"}`
          )
          .on("click", () => {
            setForm({
              ...place,
              imagePreview: place.image ? `${BASE_URL}${place.image}` : "",
              oldImagePreview: place.oldImage
                ? `${BASE_URL}${place.oldImage}`
                : "",
            });
            setSearchQuery(place.address || "");
            mapInstance.current.setView(place.position, 16);
            clearTempMarker();
          });
        markersRef.current.set(place.id, marker);
      }
    });
  }, [places]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (index, value) => {
    const num = parseFloat(value) || 0;
    const newPos = [...form.position];
    newPos[index] = num;
    setForm((prev) => ({ ...prev, position: newPos }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.address ||
      !form.position[0] ||
      !form.position[1]
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("address", form.address);
    formData.append("latitude", form.position[0].toString());
    formData.append("longitude", form.position[1].toString());
    formData.append("desc", form.desc);
    formData.append("fullDesc", form.fullDesc);
    if (form.image instanceof File) formData.append("image", form.image);
    if (form.oldImage instanceof File)
      formData.append("oldImage", form.oldImage);

    try {
      const response = await axios.post(
        "http://localhost:3000/map-locations",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const serverImage = response.data.image || "";
      const serverOldImage = response.data.oldImage || "";

      alert("Thêm thành công!");

      setForm({
        id: null,
        title: "",
        address: "",
        position: [16.0544, 108.2022],
        desc: "",
        fullDesc: "",
        image: null,
        oldImage: null,
        imagePreview: serverImage ? `${BASE_URL}${serverImage}` : "",
        oldImagePreview: serverOldImage ? `${BASE_URL}${serverOldImage}` : "",
      });

      setSearchQuery("");
      dispatch(fetchMapLocations());
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1400px",
        margin: "0 auto",
        background: "#f5f5f5",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "600",
          color: "#333",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        Quản lý Địa điểm Lịch sử Đà Nẵng
      </h2>

      <div style={{ display: "flex", gap: "30px" }}>
        {/* === FORM === */}
        <div
          style={{
            flex: 1,
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* TÊN */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#555",
                  marginBottom: "8px",
                }}
              >
                Tên địa điểm
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="VD: Cầu Rồng"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
                required
              />
            </div>

            {/* ĐỊA CHỈ */}
            <div style={{ marginBottom: "20px", position: "relative" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#555",
                  marginBottom: "8px",
                }}
              >
                Địa chỉ{" "}
                <small style={{ color: "#1a73e8" }}>(gợi ý tự động)</small>
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="VD: 458 Nguyễn Hữu Thọ..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
              {suggestions.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    maxHeight: "220px",
                    overflowY: "auto",
                    margin: "4px 0 0",
                    padding: 0,
                    listStyle: "none",
                    zIndex: 1000,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {suggestions.map((s) => (
                    <li
                      key={s.place_id}
                      onClick={() => handleSelectSuggestion(s)}
                      style={{
                        padding: "12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        fontSize: "0.95rem",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#f0f8ff")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "white")
                      }
                    >
                      <strong>
                        {s.address?.house_number
                          ? `${s.address.house_number} `
                          : ""}
                      </strong>
                      {formatAddress(s.address, s.display_name, searchQuery)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* LAT LNG */}
            <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    color: "#555",
                    marginBottom: "8px",
                  }}
                >
                  Lat
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={form.position[0]}
                  onChange={(e) => handlePositionChange(0, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    color: "#555",
                    marginBottom: "8px",
                  }}
                >
                  Lng
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={form.position[1]}
                  onChange={(e) => handlePositionChange(1, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                  required
                />
              </div>
            </div>

            {/* ẢNH HIỆN ĐẠI */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#555",
                  marginBottom: "8px",
                }}
              >
                Ảnh hiện đại
              </label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <button
                  type="button"
                  onClick={() => handleImageClick("image")}
                  style={{
                    width: "140px",
                    height: "90px",
                    border: "2px dashed #ccc",
                    borderRadius: "12px",
                    background: form.imagePreview ? "transparent" : "#f8f9fa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                    padding: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#1a73e8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#ccc")
                  }
                >
                  {form.imagePreview ? (
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        fill="#666"
                        viewBox="0 0 16 16"
                        style={{ marginBottom: "4px" }}
                      >
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                      </svg>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#555",
                          fontWeight: "500",
                        }}
                      >
                        Chọn ảnh
                      </span>
                    </>
                  )}
                </button>
                {form.image && (
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      maxWidth: "160px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {form.image.name}
                  </div>
                )}
              </div>
            </div>

            {/* ẢNH XƯA */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#555",
                  marginBottom: "8px",
                }}
              >
                Ảnh xưa
              </label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <button
                  type="button"
                  onClick={() => handleImageClick("oldImage")}
                  style={{
                    width: "140px",
                    height: "90px",
                    border: "2px dashed #ccc",
                    borderRadius: "12px",
                    background: form.oldImagePreview
                      ? "transparent"
                      : "#f8f9fa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                    padding: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#1a73e8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#ccc")
                  }
                >
                  {form.oldImagePreview ? (
                    <img
                      src={form.oldImagePreview}
                      alt="Old Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        fill="#666"
                        viewBox="0 0 16 16"
                        style={{ marginBottom: "4px" }}
                      >
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                      </svg>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#555",
                          fontWeight: "500",
                        }}
                      >
                        Chọn ảnh
                      </span>
                    </>
                  )}
                </button>
                {form.oldImage && (
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      maxWidth: "160px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {form.oldImage.name}
                  </div>
                )}
              </div>
            </div>

            {/* INPUT ẨN */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
              data-field=""
            />

            {/* MÔ TẢ */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#555",
                  marginBottom: "8px",
                }}
              >
                Mô tả ngắn
              </label>
              <input
                type="text"
                name="desc"
                value={form.desc}
                onChange={handleChange}
                placeholder="Mô tả ngắn gọn"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#555",
                  marginBottom: "8px",
                }}
              >
                Mô tả chi tiết
              </label>
              <textarea
                name="fullDesc"
                value={form.fullDesc}
                onChange={handleChange}
                placeholder="Lịch sử, ý nghĩa..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  height: "150px",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                background: "#1a73e8",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              {form.id ? "Cập nhật" : "Thêm địa điểm"}
            </button>
          </form>
        </div>

        {/* BẢN ĐỒ */}
        <div
          style={{
            flex: 2,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div ref={mapRef} style={{ height: "700px", width: "100%" }} />
          <p
            style={{
              marginTop: "10px",
              fontSize: "0.95rem",
              color: "#555",
              textAlign: "center",
            }}
          >
            <strong>Tọa độ:</strong> [{form.position[0].toFixed(6)},{" "}
            {form.position[1].toFixed(6)}]
          </p>
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginTop: "20px", textAlign: "center" }}>
          Lỗi: {error}
        </div>
      )}
    </div>
  );
};

export default MapAdmin;
