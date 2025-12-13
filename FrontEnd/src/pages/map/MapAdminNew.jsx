// src/pages/map/MapAdminNew.jsx
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

/**
 * ADMIN QUẢN LÝ ĐỊA ĐIỂM - PHIÊN BẢN MỚI
 * 
 * Admin KHÔNG tự thêm địa điểm nữa
 * Admin CHỈ NHẬN ảnh từ thư viện → Gắn thông tin địa điểm vào ảnh
 */
const MapAdminNew = () => {
  const dispatch = useDispatch();
  const { places } = useSelector((state) => state.mapLocations);

  // Danh sách ảnh từ thư viện
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Ảnh được chọn để gắn địa điểm (2 loại ảnh)
  const [uploadedModernImage, setUploadedModernImage] = useState(null); // Ảnh hiện đại (preview)
  const [uploadedModernFile, setUploadedModernFile] = useState(null); // File ảnh hiện đại
  const [selectedOldImage, setSelectedOldImage] = useState(null); // Ảnh xưa (từ thư viện)
  const [selectingOldImage, setSelectingOldImage] = useState(false); // Đang chọn ảnh xưa
  
  // Form gắn địa điểm vào ảnh
  const [locationForm, setLocationForm] = useState({
    title: "",
    address: "",
    position: [16.0544, 108.2022],
    desc: "",
    fullDesc: "",
    modernYear: "",
    oldYear: "",
    categoryId: "",
  });

  // Map
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());
  const currentMarkerRef = useRef(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
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

    // Click để đặt marker
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocodeHere(lat, lng);

      setLocationForm((prev) => ({ ...prev, position: [lat, lng], address }));
      setSearchQuery(address);

      if (currentMarkerRef.current) {
        mapInstance.current.removeLayer(currentMarkerRef.current);
      }

      const title = locationForm.title || "Vị trí mới";
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
    loadImagesFromLibrary();
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

  // === TẢI ẢNH TỪ THƯ VIỆN ===
  const loadImagesFromLibrary = async (category = '', pageNum = 1) => {
    setLoadingImages(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });
      if (category) {
        params.append('category', category);
      }

      const res = await axios.get(`${BASE_URL}/location-images/available-images?${params}`);
      setImages(res.data.images || []);
      setFilteredImages(res.data.images || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể tải danh sách ảnh từ thư viện');
    } finally {
      setLoadingImages(false);
    }
  };

  // === CHỌN ẢNH XƯA Từ thư viện ===
  const handleSelectOldImage = (image) => {
    console.log('🖼️ [DEBUG] Selected old image:', image);
    console.log('🖼️ [DEBUG] ImageID:', image?.ImageID);
    setSelectedOldImage(image);
    setSelectingOldImage(false);
    
    // Cập nhật categoryId nếu chưa có
    if (!locationForm.categoryId && image.CategoryID) {
      setLocationForm(prev => ({ ...prev, categoryId: image.CategoryID }));
    }
  };

  // === UPLOAD ẢNH HIỆN ĐẠI ===
  const handleModernImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      
      // Kiểm tra kích thước (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 10MB!');
        return;
      }
      
      setUploadedModernFile(file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedModernImage({
          preview: reader.result,
          name: file.name,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
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
    setLocationForm((prev) => ({ ...prev, address: val }));
    debouncedSearch(val);
  };

  const handleSelectSuggestion = (sugg) => {
    const lat = sugg.lat;
    const lng = sugg.lng;
    const address = sugg.address || sugg.fullAddress;

    setLocationForm((prev) => ({
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
          <b>${locationForm.title || "Vị trí mới"}</b><br>
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
          .bindPopup(`<b>${place.title}</b><br>${place.address || "Chưa có địa chỉ"}`);
        markersRef.current.set(place.id, marker);
      }
    });
  }, [places]);

  // === SUBMIT - GẮN ĐỊA ĐIỂM VÀO ẢNH ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uploadedModernFile && !selectedOldImage) {
      alert("Vui lòng upload ảnh hiện đại hoặc chọn ảnh xưa từ thư viện!");
      return;
    }

    if (!locationForm.title || !locationForm.address || !locationForm.position[0] || !locationForm.position[1]) {
      alert("Vui lòng điền đầy đủ thông tin địa điểm!");
      return;
    }

    try {
      // Bước 1: Upload ảnh hiện đại qua gallery TRƯỚC (nếu có)
      let modernImageID = null;
      if (uploadedModernFile) {
        const formData = new FormData();
        formData.append('file', uploadedModernFile);
        formData.append('description', `Ảnh hiện đại - ${locationForm.title}`);
        formData.append('categoryId', locationForm.categoryId || '1');

        const galleryResponse = await axios.post(`${BASE_URL}/gallery`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        modernImageID = galleryResponse.data.ImageID || galleryResponse.data.id;
        console.log(`✅ Uploaded modern image, ImageID=${modernImageID}`);
      }

      // Bước 2: Tạo location VỚI ImageID
      console.log('📸 [DEBUG] selectedOldImage:', selectedOldImage);
      console.log('📸 [DEBUG] selectedOldImage?.ImageID:', selectedOldImage?.ImageID);
      
      const locationData = {
        title: locationForm.title,
        address: locationForm.address,
        latitude: locationForm.position[0],
        longitude: locationForm.position[1],
        desc: locationForm.desc || "",
        fullDesc: locationForm.fullDesc || "",
        CategoryID: locationForm.categoryId || null,
        mainImageID: modernImageID, // Gửi ImageID của ảnh hiện đại
        oldImageID: selectedOldImage?.ImageID || null, // Gửi ImageID của ảnh xưa
        imageYear: locationForm.modernYear || "",  // ✅ THÊM: Năm ảnh hiện đại
        oldImageYear: locationForm.oldYear || "",  // ✅ THÊM: Năm ảnh xưa
      };

      console.log('🚀 Creating location with ImageIDs + Years:', locationData);
      console.log('📅 [DEBUG] Sending imageYear:', locationData.imageYear, 'oldImageYear:', locationData.oldImageYear);
      const locationRes = await axios.post(`${BASE_URL}/map-locations`, locationData);
      const newLocationId = locationRes.data.LocationID || locationRes.data.id;

      if (!newLocationId) {
        throw new Error('Không lấy được LocationID');
      }

      // KHÔNG cần gắn ảnh nữa vì đã gửi ImageID khi tạo location
      // Các bước assign đã bị xóa

      alert("✅ Đã gắn địa điểm vào ảnh thành công!");
      
      // Loại bỏ ảnh xưa đã chọn khỏi danh sách
      if (selectedOldImage) {
        setImages(prev => prev.filter(img => img.ImageID !== selectedOldImage.ImageID));
        setFilteredImages(prev => prev.filter(img => img.ImageID !== selectedOldImage.ImageID));
      }
      
      // Reset form
      setUploadedModernImage(null);
      setUploadedModernFile(null);
      setSelectedOldImage(null);
      setLocationForm({
        title: "",
        address: "",
        position: [16.0544, 108.2022],
        desc: "",
        fullDesc: "",
        modernYear: "",
        oldYear: "",
        categoryId: "",
      });
      setSearchQuery("");
      if (currentMarkerRef.current) mapInstance.current.removeLayer(currentMarkerRef.current);
      
      dispatch(fetchMapLocations());
      // KHÔNG load lại thư viện để tránh ảnh hiện đại vừa upload xuất hiện
    } catch (err) {
      console.error("Lỗi gắn địa điểm:", err);
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  // === FILTER ===
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setPage(1);
    loadImagesFromLibrary(category, 1);
  };

  return (
    <div style={{ 
      padding: "40px", 
      maxWidth: "1600px", 
      margin: "0 auto", 
      background: "#f5f5f5", 
      borderRadius: "12px", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "30px",
        color: "white",
      }}>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "600" }}>
          📍 Quản lý Địa điểm - Gắn ảnh từ Thư viện
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: "1rem", opacity: 0.95 }}>
          Chọn ảnh từ thư viện và gắn thông tin địa điểm vào ảnh
        </p>
      </div>

      <div style={{ display: "flex", gap: "30px" }}>
        {/* BÊN TRÁI: DANH SÁCH ẢNH */}
        <div style={{ 
          flex: 1,
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          maxHeight: "800px",
          overflowY: "auto",
        }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "1.3rem", color: "#374151" }}>
            🖼️ Ảnh từ Thư viện
          </h2>

          {/* Filter */}
          <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <button
              onClick={() => handleCategoryFilter('')}
              style={{
                padding: "8px 16px",
                border: selectedCategory === '' ? '2px solid #667eea' : '1px solid #d1d5db',
                borderRadius: "8px",
                background: selectedCategory === '' ? '#667eea' : 'white',
                color: selectedCategory === '' ? 'white' : '#374151',
                fontWeight: selectedCategory === '' ? 600 : 500,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.CategoryID}
                onClick={() => handleCategoryFilter(cat.Slug)}
                style={{
                  padding: "8px 16px",
                  border: selectedCategory === cat.Slug ? '2px solid #667eea' : '1px solid #d1d5db',
                  borderRadius: "8px",
                  background: selectedCategory === cat.Slug ? '#667eea' : 'white',
                  color: selectedCategory === cat.Slug ? 'white' : '#374151',
                  fontWeight: selectedCategory === cat.Slug ? 600 : 500,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                {cat.Name}
              </button>
            ))}
          </div>

          {/* Banner khi đang chọn ảnh xưa */}
          {selectingOldImage && (
            <div style={{
              padding: "12px",
              background: "#fef3c7",
              border: "2px solid #d97706",
              borderRadius: "8px",
              marginBottom: "16px",
              textAlign: "center",
            }}>
              <p style={{ margin: 0, fontWeight: "600", color: "#d97706" }}>
                🏛️ Chọn ảnh XƯA từ thư viện
              </p>
              <button
                onClick={() => setSelectingOldImage(false)}
                style={{
                  marginTop: "8px",
                  padding: "4px 12px",
                  background: "white",
                  border: "1px solid #d97706",
                  borderRadius: "6px",
                  color: "#d97706",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                ✖ Hủy
              </button>
            </div>
          )}

          {/* Danh sách ảnh */}
          {loadingImages ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
              Đang tải ảnh...
            </div>
          ) : filteredImages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
              Không có ảnh nào trong thư viện
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {filteredImages.map((img) => {
                const isOldSelected = selectedOldImage?.ImageID === img.ImageID;

                return (
                  <div
                    key={img.ImageID}
                    onClick={() => selectingOldImage && handleSelectOldImage(img)}
                    style={{
                      border: isOldSelected ? "3px solid #d97706" : "2px solid #e5e7eb",
                      borderRadius: "12px",
                      overflow: "hidden",
                      cursor: selectingOldImage ? "pointer" : "default",
                      transition: "all 0.3s",
                      background: isOldSelected ? "#fef3c7" : "white",
                      opacity: selectingOldImage ? 1 : 0.7,
                    }}
                    onMouseEnter={(e) => {
                      if (selectingOldImage && !isOldSelected) {
                        e.currentTarget.style.borderColor = "#d97706";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectingOldImage && !isOldSelected) {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <div style={{ width: "100%", height: "150px", background: "#f3f4f6", position: "relative" }}>
                      <img
                        src={img.FilePath}
                        alt={img.AltText || 'Ảnh'}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                      />
                      {isOldSelected && (
                        <div style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "#d97706",
                          color: "white",
                          borderRadius: "8px",
                          padding: "4px 8px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}>
                          ✓ Đã chọn
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "12px" }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#374151", fontWeight: "500" }}>
                        {img.AltText || `Ảnh #${img.ImageID}`}
                      </p>
                      {img.category && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                          {img.category.Name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "8px" }}>
              <button
                onClick={() => {
                  const newPage = Math.max(1, page - 1);
                  setPage(newPage);
                  loadImagesFromLibrary(selectedCategory, newPage);
                }}
                disabled={page === 1}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: page === 1 ? "#f3f4f6" : "white",
                  color: page === 1 ? "#9ca3af" : "#374151",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  fontWeight: 500,
                }}
              >
                ← Trước
              </button>
              <span style={{ padding: "8px 16px", display: "flex", alignItems: "center", color: "#374151", fontWeight: 500 }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => {
                  const newPage = Math.min(totalPages, page + 1);
                  setPage(newPage);
                  loadImagesFromLibrary(selectedCategory, newPage);
                }}
                disabled={page === totalPages}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: page === totalPages ? "#f3f4f6" : "white",
                  color: page === totalPages ? "#9ca3af" : "#374151",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  fontWeight: 500,
                }}
              >
                Sau →
              </button>
            </div>
          )}
        </div>

        {/* BÊN PHẢI: FORM GẮN ĐỊA ĐIỂM + BẢN ĐỒ */}
        <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Section upload ảnh Hiện đại */}
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", color: "#374151" }}>
              🏙️ Ảnh HIỆN ĐẠI (Upload mới)
            </h3>
            {uploadedModernImage ? (
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <img
                  src={uploadedModernImage.preview}
                  alt={uploadedModernImage.name}
                  style={{
                    width: "120px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #667eea",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "600", color: "#374151" }}>
                    {uploadedModernImage.name}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
                    {(uploadedModernImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedModernImage(null);
                    setUploadedModernFile(null);
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#fee",
                    border: "1px solid #fcc",
                    borderRadius: "8px",
                    color: "#c33",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  ✖ Bỏ chọn
                </button>
              </div>
            ) : (
              <label style={{
                width: "100%",
                padding: "12px",
                background: "#f0f4ff",
                border: "2px dashed #667eea",
                borderRadius: "8px",
                color: "#667eea",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                display: "block",
                textAlign: "center",
              }}>
                + Upload ảnh hiện đại
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleModernImageUpload}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>

          {/* Section chọn ảnh Xưa từ thư viện */}
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", color: "#374151" }}>
              🏛️ Ảnh XƯA (Từ thư viện)
            </h3>
            {selectedOldImage ? (
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <img
                  src={selectedOldImage.FilePath}
                  alt={selectedOldImage.AltText}
                  style={{
                    width: "120px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #d97706",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "600", color: "#374151" }}>
                    {selectedOldImage.AltText || `Ảnh #${selectedOldImage.ImageID}`}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
                    {selectedOldImage.category?.Name || 'Không có danh mục'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOldImage(null)}
                  style={{
                    padding: "8px 16px",
                    background: "#fee",
                    border: "1px solid #fcc",
                    borderRadius: "8px",
                    color: "#c33",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  ✖ Bỏ chọn
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSelectingOldImage(true)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#fef3c7",
                  border: "2px dashed #d97706",
                  borderRadius: "8px",
                  color: "#d97706",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                + Chọn ảnh xưa từ thư viện
              </button>
            )}
          </div>

          {/* Form gắn địa điểm */}
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", color: "#374151" }}>
              📝 Thông tin Địa điểm
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>
                  Tên địa điểm <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  value={locationForm.title}
                  onChange={e => setLocationForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="VD: Cầu Rồng"
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem" }}
                  required
                  disabled={!uploadedModernFile && !selectedOldImage}
                />
              </div>

              <div style={{ marginBottom: "16px", position: "relative" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>
                  Địa chỉ <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="VD: 123 Hoàng Minh Thảo..."
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem" }}
                  disabled={!uploadedModernFile && !selectedOldImage}
                />
                {suggestions.length > 0 && (
                  <ul style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    margin: "4px 0 0",
                    padding: 0,
                    listStyle: "none",
                    zIndex: 1000,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}>
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => handleSelectSuggestion(s)}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                          fontSize: "0.9rem"
                        }}
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

              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Lat</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={locationForm.position[0]}
                    onChange={e => setLocationForm(prev => ({ ...prev, position: [parseFloat(e.target.value) || 0, prev.position[1]] }))}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}
                    required
                    disabled={!uploadedModernFile && !selectedOldImage}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Lng</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={locationForm.position[1]}
                    onChange={e => setLocationForm(prev => ({ ...prev, position: [prev.position[0], parseFloat(e.target.value) || 0] }))}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}
                    required
                    disabled={!uploadedModernFile && !selectedOldImage}
                  />
                </div>
              </div>

              {uploadedModernImage && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>🏙️ Năm ảnh hiện đại (không bắt buộc)</label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear() + 1}
                    value={locationForm.modernYear}
                    onChange={e => setLocationForm(prev => ({ ...prev, modernYear: e.target.value }))}
                    placeholder="VD: 2024"
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}
                  />
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Mô tả ngắn</label>
                <input
                  type="text"
                  value={locationForm.desc}
                  onChange={e => setLocationForm(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="Mô tả ngắn gọn"
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}
                  disabled={!uploadedModernFile && !selectedOldImage}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "#555", marginBottom: "8px" }}>Mô tả chi tiết</label>
                <textarea
                  value={locationForm.fullDesc}
                  onChange={e => setLocationForm(prev => ({ ...prev, fullDesc: e.target.value }))}
                  placeholder="Lịch sử, ý nghĩa..."
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", height: "100px", resize: "vertical" }}
                  disabled={!uploadedModernFile && !selectedOldImage}
                />
              </div>

              <button
                type="submit"
                disabled={!uploadedModernFile && !selectedOldImage}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: (uploadedModernFile || selectedOldImage) ? "#667eea" : "#d1d5db",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: (uploadedModernFile || selectedOldImage) ? "pointer" : "not-allowed",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  if (uploadedModernFile || selectedOldImage) e.currentTarget.style.background = "#5568d3";
                }}
                onMouseLeave={(e) => {
                  if (uploadedModernFile || selectedOldImage) e.currentTarget.style.background = "#667eea";
                }}
              >
                {(uploadedModernFile || selectedOldImage) ? "📍 Gắn Địa điểm vào Ảnh" : "⚠️ Vui lòng upload/chọn ít nhất 1 ảnh"}
              </button>
            </form>
          </div>

          {/* Bản đồ */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}>
            <div ref={mapRef} style={{ height: "400px", width: "100%" }} />
            <div style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}>
              <span style={{ fontSize: "1rem" }}>📍</span>
              <code style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                {locationForm.position[0].toFixed(6)}, {locationForm.position[1].toFixed(6)}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapAdminNew;
