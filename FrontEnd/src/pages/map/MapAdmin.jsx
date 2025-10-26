import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMapLocation, fetchMapLocations } from "./mapLocationsSlice";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon
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
  const { places, status, error } = useSelector((state) => state.mapLocations);
  const [form, setForm] = useState({
    id: null,
    title: "",
    position: [16.0544, 108.2022],
    rating: 0,
    reviews: 0,
    address: "",
    image: null,
    imagePreview: "",
    oldImage: null,
    oldImagePreview: "",
    desc: "",
    fullDesc: "",
  });
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      console.log("mapRef.current is null, DOM not ready");
      return;
    }

    try {
      console.log("Initializing map...");
      const map = L.map(mapRef.current, {
        center: [16.0544, 108.2022],
        zoom: 12,
        minZoom: 11,
        maxZoom: 18,
      });
      mapInstance.current = map;

      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: "&copy; Google Maps",
      }).addTo(map);

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setForm((prev) => ({
          ...prev,
          position: [lat, lng],
        }));

        markersRef.current.forEach((marker) => map.removeLayer(marker));
        markersRef.current.clear();

        const marker = L.marker([lat, lng], { icon: defaultIcon })
          .addTo(map)
          .bindPopup(`<b>Địa điểm mới</b><br>Tọa độ: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`)
          .openPopup();
        markersRef.current.set(Date.now(), marker);
      });

      dispatch(fetchMapLocations()).catch((error) =>
        console.error("Error fetching map locations:", error)
      );
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (!mapInstance.current || !Array.isArray(places)) {
      console.log("Map not initialized or places invalid:", {
        mapInitialized: !!mapInstance.current,
        places,
      });
      return;
    }

    console.log("Rendering markers with places:", places);
    markersRef.current.forEach((marker) => mapInstance.current.removeLayer(marker));
    markersRef.current.clear();

    places.forEach((place) => {
      if (place.position && Array.isArray(place.position) && place.position.length === 2) {
        try {
          const marker = L.marker(place.position, { icon: defaultIcon })
            .addTo(mapInstance.current)
            .bindPopup(`<b>${place.Name || "Unnamed"}</b><br>Tọa độ: [${place.position[0].toFixed(4)}, ${place.position[1].toFixed(4)}]`)
            .on("click", () => {
              setForm({
                id: place.LocationID,
                title: place.Name,
                position: [place.Latitude, place.Longitude],
                rating: place.Rating,
                reviews: place.Reviews,
                address: place.Address,
                image: place.Image || null,
                imagePreview: place.Image || "",
                oldImage: place.OldImage || null,
                oldImagePreview: place.OldImage || "",
                desc: place.Desc,
                fullDesc: place.FullDesc,
              });
              mapInstance.current.setView(place.position, 15);
            });
          markersRef.current.set(place.LocationID, marker);
        } catch (error) {
          console.warn("Error adding marker for place:", place, error);
        }
      } else {
        console.warn("Invalid place data skipped:", place);
      }
    });
  }, [places]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (index, value) => {
    const newPosition = [...form.position];
    newPosition[index] = parseFloat(value) || 0;
    setForm((prev) => ({ ...prev, position: newPosition }));
    if (mapInstance.current) {
      mapInstance.current.setView(newPosition, 15);
      const marker = L.marker(newPosition, { icon: defaultIcon })
        .addTo(mapInstance.current)
        .bindPopup(`<b>${form.title || "Địa điểm mới"}</b><br>Tọa độ: [${newPosition[0].toFixed(4)}, ${newPosition[1].toFixed(4)}]`)
        .openPopup();
      markersRef.current.set(form.id || Date.now(), marker);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.address || !form.position[0] || !form.position[1]) {
      alert("Vui lòng điền đầy đủ tên, địa chỉ, latitude và longitude!");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("address", form.address);
    formData.append("latitude", form.position[0]);
    formData.append("longitude", form.position[1]);
    formData.append("rating", form.rating);
    formData.append("reviews", form.reviews);
    formData.append("desc", form.desc);
    formData.append("fullDesc", form.fullDesc);
    if (form.image instanceof File) {
      formData.append("image", form.image);
      console.log("Appending new image file:", form.image.name);
    } else if (typeof form.image === "string" && form.image.trim()) {
      formData.append("image", form.image);
      console.log("Appending existing image URL:", form.image);
    }
    if (form.oldImage instanceof File) {
      formData.append("oldImage", form.oldImage);
      console.log("Appending old image file:", form.oldImage.name);
    } else if (typeof form.oldImage === "string" && form.oldImage.trim()) {
      formData.append("oldImage", form.oldImage);
      console.log("Appending existing old image URL:", form.oldImage);
    }

    console.log("FormData being sent:", Object.fromEntries(formData.entries()));
    try {
      const response = await axios.post("http://localhost:3000/map-locations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Server response:", response.data);
      alert("Đã thêm thành công!");
      setForm({
        id: null,
        title: "",
        position: [16.0544, 108.2022],
        rating: 0,
        reviews: 0,
        address: "",
        image: response.data.image || null,
        imagePreview: response.data.image || "",
        oldImage: response.data.oldImage || null,
        oldImagePreview: response.data.oldImage || "",
        desc: "",
        fullDesc: "",
      });
      dispatch(fetchMapLocations());
    } catch (error) {
      console.error("Error submitting form:", error.response ? error.response.data : error.message);
      alert(`Lỗi khi lưu địa điểm: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const field = e.target.name === "newImage" ? "image" : "oldImage";
      const previewField = e.target.name === "newImage" ? "imagePreview" : "oldImagePreview";
      setForm((prev) => ({
        ...prev,
        [field]: file,
        [previewField]: previewUrl,
      }));
      fileInputRef.current.value = "";
    }
  };

  const handleImageClick = (field) => {
    fileInputRef.current.name = field === "image" ? "newImage" : "oldImage";
    fileInputRef.current.click();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Quản lý Địa điểm</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Tên địa điểm"
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
              required
            />
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Địa chỉ"
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
              required
            />
            <input
              type="number"
              step="0.0001"
              name="latitude"
              value={form.position[0]}
              onChange={(e) => handlePositionChange(0, e.target.value)}
              placeholder="Latitude"
              style={{ width: "48%", marginBottom: "10px", padding: "5px" }}
              required
            />
            <input
              type="number"
              step="0.0001"
              name="longitude"
              value={form.position[1]}
              onChange={(e) => handlePositionChange(1, e.target.value)}
              placeholder="Longitude"
              style={{ width: "48%", marginBottom: "10px", padding: "5px" }}
              required
            />
            <input
              type="number"
              step="0.1"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              placeholder="Đánh giá (0-5)"
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <input
              type="number"
              name="reviews"
              value={form.reviews}
              onChange={handleChange}
              placeholder="Số đánh giá"
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <input
                type="text"
                name="image"
                value={form.imagePreview || (typeof form.image === "string" ? form.image : "")}
                onClick={() => handleImageClick("image")}
                placeholder="URL ảnh hiện tại (click để chọn ảnh)"
                style={{ width: "100%", padding: "5px" }}
                readOnly
              />
            </div>
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <input
                type="text"
                name="oldImage"
                value={form.oldImagePreview || (typeof form.oldImage === "string" ? form.oldImage : "")}
                onClick={() => handleImageClick("oldImage")}
                placeholder="URL ảnh cũ (click để chọn ảnh)"
                style={{ width: "100%", padding: "5px" }}
                readOnly
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />
            <input
              type="text"
              name="desc"
              value={form.desc}
              onChange={handleChange}
              placeholder="Mô tả ngắn"
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <textarea
              name="fullDesc"
              value={form.fullDesc}
              onChange={handleChange}
              placeholder="Mô tả chi tiết"
              style={{ width: "100%", marginBottom: "10px", padding: "5px", height: "100px" }}
            />
            <button
              type="submit"
              style={{ padding: "10px 20px", background: "#1a73e8", color: "white", border: "none", borderRadius: "5px" }}
            >
              {form.id ? "Cập nhật" : "Thêm mới"}
            </button>
          </form>
        </div>
        <div style={{ flex: 2 }}>
          <div ref={mapRef} style={{ height: "600px", width: "100%", border: "1px solid #ccc" }} />
          <p style={{ marginTop: "10px", fontWeight: "bold" }}>
            Tọa độ hiện tại: [{form.position[0].toFixed(4)}, {form.position[1].toFixed(4)}]
          </p>
        </div>
      </div>
      {error && <div style={{ color: "red" }}>Lỗi: {error}</div>}
    </div>
  );
};

export default MapAdmin;