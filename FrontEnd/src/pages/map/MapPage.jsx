import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from "react-redux";
<<<<<<< Updated upstream
import { fetchMapLocations } from "./mapLocationsSlice";
=======
import { fetchMapLocations, fetchFeedback, addFeedback } from "./mapLocationsSlice";
import axios from "axios";
>>>>>>> Stashed changes

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapPage = () => {
  const dispatch = useDispatch();
<<<<<<< Updated upstream
  const { places, status, error } = useSelector((state) => state.mapLocations);
=======
  const { places, feedback, status, error } = useSelector((state) => state.mapLocations);
>>>>>>> Stashed changes
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const sidebarRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const currentPlace = useRef(null);
  const styleRef = useRef(null);
  const currentRouteLayer = useRef(null);
  const hoverPopupRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const favoritesSidebarRef = useRef(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
<<<<<<< Updated upstream

  // === GIỚI HẠN ĐÀ NẴNG ===
  const DA_NANG_BOUNDS = [[15.85, 107.85], [16.25, 108.4]];

  useEffect(() => {
    if (!mapRef.current) return;

    // Khởi tạo bản đồ
=======
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loggedInUserId = 1; // Giả lập userId, thay bằng logic thực tế từ context hoặc token
    setUserId(loggedInUserId);
  }, []);

  const DA_NANG_BOUNDS = [[15.85, 107.85], [16.25, 108.4]];

  useEffect(() => {
    if (!mapRef.current) return;

>>>>>>> Stashed changes
    const map = L.map(mapRef.current, {
      center: [16.0544, 108.2022],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: DA_NANG_BOUNDS,
      maxBoundsViscosity: 1.0,
    });
    mapInstance.current = map;
    map.fitBounds(DA_NANG_BOUNDS);

    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: "&copy; Google Maps",
    }).addTo(map);

<<<<<<< Updated upstream
    // Đảm bảo kích thước bản đồ được cập nhật
    map.invalidateSize();

    // Fetch dữ liệu từ Redux
    dispatch(fetchMapLocations());

    // === KHUNG TRÁI - MÀU XÁM ===
    const leftPanel = L.DomUtil.create("div", "leaflet-left-panel");
    leftPanel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100px;
      height: 100vh;
      background: #2d2d2d;
      z-index: 10001;
      box-shadow: 2px 0 10px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 24px;
=======
    map.invalidateSize();

    dispatch(fetchMapLocations());

    const leftPanel = L.DomUtil.create("div", "leaflet-left-panel");
    leftPanel.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100px; height: 100vh;
      background: #2d2d2d; z-index: 10001; box-shadow: 2px 0 10px rgba(0,0,0,0.2);
      display: flex; flex-direction: column; align-items: center; padding-top: 24px;
>>>>>>> Stashed changes
      font-family: system-ui;
    `;

    const backBtn = L.DomUtil.create("div", "leaflet-back-btn");
    backBtn.innerHTML = `
      <div style="width:48px;height:48px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;margin-bottom:24px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </div>
    `;
<<<<<<< Updated upstream
    backBtn.onclick = () => {
      window.location.href = "/";
    };
=======
    backBtn.onclick = () => { window.location.href = "/"; };
>>>>>>> Stashed changes

    const savedBtn = L.DomUtil.create("div", "leaflet-saved-btn");
    savedBtn.innerHTML = `
      <div style="width:48px;height:48px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </div>
    `;
<<<<<<< Updated upstream
    savedBtn.onclick = () => {
      showFavoritesSidebar();
    };
=======
    savedBtn.onclick = () => { showFavoritesSidebar(); };
>>>>>>> Stashed changes

    leftPanel.appendChild(backBtn);
    leftPanel.appendChild(savedBtn);
    document.body.appendChild(leftPanel);

<<<<<<< Updated upstream
    // === SIDEBAR YÊU THÍCH (MÀU TỐI) ===
    const favoritesSidebar = L.DomUtil.create("div", "favorites-sidebar");
    favoritesSidebar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 380px;
      height: 100vh;
      background: #2d2d2d;
      color: white;
      z-index: 10002;
      font-family: system-ui;
      padding: 20px;
      display: none;
      overflow-y: auto;
      box-shadow: 2px 0 10px rgba(0,0,0,0.3);
=======
    const favoritesSidebar = L.DomUtil.create("div", "favorites-sidebar");
    favoritesSidebar.style.cssText = `
      position: fixed; top: 0; left: 0; width: 380px; height: 100vh;
      background: #2d2d2d; color: white; z-index: 10002; font-family: system-ui;
      padding: 20px; display: none; overflow-y: auto; box-shadow: 2px 0 10px rgba(0,0,0,0.3);
>>>>>>> Stashed changes
      transition: all 0.3s ease;
    `;
    document.body.appendChild(favoritesSidebar);
    favoritesSidebarRef.current = favoritesSidebar;

<<<<<<< Updated upstream
    // === SIDEBAR CHI TIẾT (MÀU TRẮNG) ===
    const sidebar = L.DomUtil.create("div", "custom-sidebar");
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      left: 100px;
      width: 380px;
      height: 100vh;
      background: white;
      z-index: 10000;
      overflow-y: auto;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      font-family: system-ui;
      display: none;
      padding-bottom: 100px;
      transition: left 0.3s ease;
=======
    const sidebar = L.DomUtil.create("div", "custom-sidebar");
    sidebar.style.cssText = `
      position: fixed; top: 0; left: 100px; width: 380px; height: 100vh;
      background: white; z-index: 10000; overflow-y: auto; box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      font-family: system-ui; display: none; padding-bottom: 100px; transition: left 0.3s ease;
>>>>>>> Stashed changes
    `;
    document.body.appendChild(sidebar);
    sidebarRef.current = sidebar;

    return () => {
      if (mapInstance.current) mapInstance.current.remove();
<<<<<<< Updated upstream
      document.querySelectorAll(
        ".custom-sidebar, .leaflet-left-panel, .favorites-sidebar, .hover-popup, .modal-overlay, .detail-modal, .review-modal"
      ).forEach((el) => el.remove());
=======
      document.querySelectorAll(".custom-sidebar, .leaflet-left-panel, .favorites-sidebar, .hover-popup, .modal-overlay, .detail-modal, .review-modal").forEach((el) => el.remove());
>>>>>>> Stashed changes
      if (styleRef.current) styleRef.current.remove();
      delete window.closeSidebar;
      delete window.closeDetailModal;
      delete window.closeFavoritesSidebar;
      delete window.showPlaceFromFav;
      delete window.removeFromFavorites;
      delete window.setStarRating;
    };
  }, [dispatch]);

  useEffect(() => {
    if (mapInstance.current && status === "succeeded" && Array.isArray(places)) {
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer);
      });
      places.forEach((place) => {
        if (place.position && Array.isArray(place.position) && place.position.length === 2) {
          const marker = L.marker(place.position, {
            icon: L.icon({
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
          }).addTo(mapInstance.current);

          let isHovering = false;

          marker.on("mouseover", () => {
            isHovering = true;
            showHoverPopup(place, place.position);
          });

          marker.on("mouseout", () => {
            isHovering = false;
            hoverTimeoutRef.current = setTimeout(() => {
              if (!isHovering && hoverPopupRef.current) hideHoverPopup();
            }, 300);
          });

          marker.on("click", () => {
            hideHoverPopup();
            currentPlace.current = place;
            clearCurrentRoute();
<<<<<<< Updated upstream
=======
            dispatch(fetchFeedback(place.id));
>>>>>>> Stashed changes
            showPlaceDetail(place, mapInstance.current);
          });
        }
      });
    }
<<<<<<< Updated upstream
  }, [status, places]);

  // === HOVER POPUP NHỎ ===
=======
  }, [status, places, dispatch]);

>>>>>>> Stashed changes
  const showHoverPopup = (place, latlng) => {
    if (hoverPopupRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      document.body.removeChild(hoverPopupRef.current);
    }

    const popup = L.DomUtil.create("div", "hover-popup");
    popup.style.cssText = `
<<<<<<< Updated upstream
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      width: 260px;
      background: #1c1c1c;
      color: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      font-family: system-ui;
      z-index: 10003;
      pointer-events: auto;
      user-select: none;
=======
      position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
      width: 260px; background: #1c1c1c; color: white; border-radius: 12px;
      overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.3); font-family: system-ui;
      z-index: 10003; pointer-events: auto; user-select: none;
>>>>>>> Stashed changes
    `;

    const isSaved = favorites.some((f) => f.id === place.id);

    popup.innerHTML = `
      <img src="${place.image || 'https://via.placeholder.com/260x120?text=Chưa+có+hình'}" style="width:100%;height:120px;object-fit:cover;" />
      <div style="padding:12px;">
        <h4 style="margin:0 0 4px;font-size:1rem;font-weight:600;">${place.title}</h4>
        <div style="display:flex;align-items:center;gap:4px;font-size:0.85rem;margin-bottom:6px;">
          <span style="color:#ffca28;font-weight:bold;">${place.rating || 0}</span>
          ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(5 - Math.floor(place.rating || 0))}
          <span style="color:#aaa;">(${place.reviews || 0})</span>
        </div>
        <p style="margin:0 0 8px;font-size:0.8rem;color:#ccc;line-height:1.4;">${place.desc || "Mô tả chưa có"}</p>
        <div style="display:flex;justify-content:flex-end;">
          <button id="hover-save-btn" style="width:32px;height:32px;background:${isSaved ? "#d32f2f" : "#333"};color:white;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? "white" : "none"}" stroke="white" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    hoverPopupRef.current = popup;

    const point = mapInstance.current.latLngToContainerPoint(latlng);
    popup.style.left = `${point.x}px`;
    popup.style.bottom = `${window.innerHeight - point.y + 30}px`;

    const saveBtn = document.getElementById("hover-save-btn");
    saveBtn.onclick = (e) => {
      e.stopPropagation();
      const fullPlace = places.find((p) => p.id === place.id) || place;
      if (!favorites.some((fav) => fav.id === fullPlace.id)) {
        const updated = [...favorites, fullPlace];
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
        alert("Đã lưu vào mục yêu thích!");
        showHoverPopup(place, latlng);
      } else {
        alert("Đã có trong mục yêu thích!");
      }
    };

    popup.onmouseenter = () => clearTimeout(hoverTimeoutRef.current);
    popup.onmouseleave = () => {
      hoverTimeoutRef.current = setTimeout(hideHoverPopup, 300);
    };
  };

  const hideHoverPopup = () => {
    if (hoverPopupRef.current) {
      document.body.removeChild(hoverPopupRef.current);
      hoverPopupRef.current = null;
    }
  };

<<<<<<< Updated upstream
  // === XÓA ĐƯỜNG HIỆN TẠI ===
=======
>>>>>>> Stashed changes
  const clearCurrentRoute = () => {
    if (currentRouteLayer.current) {
      mapInstance.current.removeLayer(currentRouteLayer.current);
      currentRouteLayer.current = null;
    }
  };

<<<<<<< Updated upstream
  // === HIỂN THỊ CHI TIẾT TRÊN SIDEBAR TRẮNG ===
=======
>>>>>>> Stashed changes
  const showPlaceDetail = (place, map) => {
    const isFavoritesOpen = favoritesSidebarRef.current.style.display === "block";

    sidebarRef.current.innerHTML = `
      <div style="padding:20px;position:relative">
        <div onclick="window.closeSidebar()" style="position:absolute;top:16px;left:16px;width:36px;height:36px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:10">
          <span style="font-size:1.4rem;color:#5f6368;font-weight:bold">×</span>
        </div>

        <img src="${place.image || 'https://via.placeholder.com/360x180?text=Chưa+có+hình'}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:16px" />

        <h3 style="margin:0 0 8px;font-size:1.2rem;color:#1a0dab;font-weight:600">${place.title}</h3>

        <div style="display:flex;align-items:center;gap:4px;margin-bottom:12px">
          <span style="color:#d50000;font-weight:bold;">${place.rating || 0}</span>
          ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(5 - Math.floor(place.rating || 0))}
          <span style="color:#666;font-size:0.9rem">(${place.reviews || 0} đánh giá)</span>
        </div>

        <p style="margin:12px 0;font-size:0.95rem;color:#333;line-height:1.5">${place.desc || "Mô tả chưa có"}</p>

        <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:2px solid #dadce0">
          <button id="overview-tab" style="flex:1;padding:10px;border:none;background:${activeTab === 'overview' ? '#e8f0fe' : '#f8f9fa'};color:${activeTab === 'overview' ? '#1a73e8' : '#333'};cursor:pointer;font-weight:${activeTab === 'overview' ? '600' : 'normal'};font-size:0.9rem">Tổng quan</button>
          <button id="reviews-tab" style="flex:1;padding:10px;border:none;background:${activeTab === 'reviews' ? '#e8f0fe' : '#f8f9fa'};color:${activeTab === 'reviews' ? '#1a73e8' : '#333'};cursor:pointer;font-weight:${activeTab === 'reviews' ? '600' : 'normal'};font-size:0.9rem">Đánh giá</button>
        </div>

        <div id="content-area" style="margin-bottom:16px">
          ${activeTab === "overview"
            ? `
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
                <button id="get-directions-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">
                  Đường đi
                </button>
                <button id="share-location-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">
                  Chia sẻ vị trí
                </button>
                <button id="save-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">
                  Lưu
                </button>
                <button id="compare-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">
                  So sánh
                </button>
              </div>
              <div id="route-details" style="display:none;font-size:0.9rem;color:#555;margin:16px 0;line-height:1.6"></div>
            `
            : `
              <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
                <div style="background:#f1f1f1; padding:16px; border-radius:8px; width:100%; margin-bottom:16px; text-align:center;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:600;">${(feedback.reduce((sum, f) => sum + f.Rating, 0) / Math.max(feedback.length, 1) || 0).toFixed(1)}</span>
                    <span style="color:#777;">${feedback.length} đánh giá</span>
                  </div>
                  <div style="margin-top:8px;">
                    <span style="color:#ffca28;">${"★".repeat(Math.floor((feedback.reduce((sum, f) => sum + f.Rating, 0) / Math.max(feedback.length, 1) || 0)) || 0)}${"☆".repeat(5 - Math.floor((feedback.reduce((sum, f) => sum + f.Rating, 0) / Math.max(feedback.length, 1) || 0)) || 0)}</span>
                  </div>
                </div>

                <div style="width:100%; margin-bottom:16px;">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                    <span>Đánh giá của bạn: </span>
                    <div id="star-rating" style="display:flex; gap:2px;">
                      ${[1, 2, 3, 4, 5]
                        .map(
                          (i) => `
<<<<<<< Updated upstream
                        <span
                          id="star-${i}"
                          style="cursor:pointer; font-size:1.2rem; color:${i <= newRating ? "#ffca28" : "#ccc"};"
                          onclick="window.setStarRating(${i})"
                        >★</span>
                      `
=======
                          <span
                            id="star-${i}"
                            style="cursor:pointer; font-size:1.2rem; color:${i <= newRating ? "#ffca28" : "#ccc"};"
                            onclick="window.setStarRating(${i})"
                          >★</span>
                        `
>>>>>>> Stashed changes
                        )
                        .join("")}
                    </div>
                  </div>
                  <textarea
                    id="comment-input"
                    placeholder="Viết bình luận của bạn..."
                    style="width:100%; height:80px; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:8px; resize:vertical;"
                  ></textarea>
                  <button id="submit-review-btn" style="width:100%; padding:10px; background:#1a73e8; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Gửi đánh giá</button>
                </div>

                <div style="width:100%; margin-bottom:16px;">
                  <div id="reviews-list" style="max-height:300px; overflow-y:auto; width:100%;">
<<<<<<< Updated upstream
                    ${reviews
                      .map(
                        (review) => `
                      <div style="padding:10px; border-bottom:1px solid #eee; width:100%;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                          <span style="color:#ffca28;">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span>
                          <span style="color:#555;">${review.comment}</span>
                        </div>
                        <span style="font-size:0.8rem; color:#888;">Vào lúc ${review.timestamp}</span>
                      </div>
                    `
=======
                    ${feedback
                      .map(
                        (review) => `
                        <div style="padding:10px; border-bottom:1px solid #eee; width:100%;">
                          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <span style="color:#ffca28;">${"★".repeat(review.Rating)}${"☆".repeat(5 - review.Rating)}</span>
                            <span style="color:#555;">${review.Comment}</span>
                          </div>
                          <span style="font-size:0.8rem; color:#888;">Bởi ${review.user?.FullName || 'Ẩn danh'} vào ${new Date(review.CreatedAt).toLocaleString('vi-VN')}</span>
                        </div>
                      `
>>>>>>> Stashed changes
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            `}
          </div>

          ${activeTab === "overview"
            ? `
              <button id="view-detail-btn" style="width:100%;padding:14px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:1rem">
                Xem chi tiết
              </button>

              <div style="font-size:0.9rem;color:#555;margin:16px 0;line-height:1.6">
                <div>Location: ${place.address || "Địa chỉ chưa có"}</div>
              </div>
            `
            : ""}
        `;

    sidebarRef.current.style.left = isFavoritesOpen ? "380px" : "100px";
    sidebarRef.current.style.display = "block";

<<<<<<< Updated upstream
    // Gán sự kiện cho các tab và nút
=======
    // Gắn sự kiện cho textarea
    const commentInput = document.getElementById("comment-input");
    if (commentInput) {
      commentInput.value = newComment;
      commentInput.addEventListener("input", (e) => {
        setNewComment(e.target.value);
      });
    }

>>>>>>> Stashed changes
    document.getElementById("overview-tab").onclick = () => {
      setActiveTab("overview");
      const contentArea = sidebarRef.current.querySelector("#content-area");
      if (contentArea) {
        contentArea.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            <button id="get-directions-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">
              Đường đi
            </button>
            <button id="share-location-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">
              Chia sẻ vị trí
            </button>
            <button id="save-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">
              Lưu
            </button>
            <button id="compare-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">
              So sánh
            </button>
          </div>
          <div id="route-details" style="display:none;font-size:0.9rem;color:#555;margin:16px 0;line-height:1.6"></div>
        `;
        document.getElementById("get-directions-btn").onclick = () => {
          if (!userMarker.current) {
            alert("Vui lòng cho phép định vị vị trí trước khi xem đường đi!");
            return;
          }
          calculateRoute(userMarker.current.getLatLng(), currentPlace.current.position, mapInstance.current);
        };
        document.getElementById("share-location-btn").onclick = () => {
          const url = `${window.location.origin}/map?to=${currentPlace.current.position[0]},${currentPlace.current.position[1]}`;
          navigator.clipboard.writeText(url).then(() => alert("Đã sao chép link chia sẻ vị trí!"));
        };
        document.getElementById("save-btn").onclick = () => {
          const fullPlace = places.find((p) => p.id === place.id) || place;
          if (!favorites.some((fav) => fav.id === fullPlace.id)) {
            const updated = [...favorites, fullPlace];
            setFavorites(updated);
            localStorage.setItem("favorites", JSON.stringify(updated));
            alert("Đã lưu vào mục yêu thích!");
          } else {
            alert("Đã có trong mục yêu thích!");
          }
        };
        document.getElementById("compare-btn").onclick = () => {
          showCompareModal(place);
        };
      }
    };

    document.getElementById("reviews-tab").onclick = () => {
      setActiveTab("reviews");
      const contentArea = sidebarRef.current.querySelector("#content-area");
      if (contentArea) {
        contentArea.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
            <div style="background:#f1f1f1; padding:16px; border-radius:8px; width:100%; margin-bottom:16px; text-align:center;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
<<<<<<< Updated upstream
                <span style="font-weight:600;">${(reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0).toFixed(1)}</span>
                <span style="color:#777;">${reviews.length} đánh giá</span>
              </div>
              <div style="margin-top:8px;">
                <span style="color:#ffca28;">${"★".repeat(Math.floor((reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0)) || 0)}${"☆".repeat(5 - Math.floor((reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0)) || 0)}</span>
=======
                <span style="font-weight:600;">${(feedback.reduce((sum, f) => sum + f.Rating, 0) / Math.max(feedback.length, 1) || 0).toFixed(1)}</span>
                <span style="color:#777;">${feedback.length} đánh giá</span>
              </div>
              <div style="margin-top:8px;">
                <span style="color:#ffca28;">${"★".repeat(Math.floor((feedback.reduce((sum, f) => sum + f.Rating, 0) / Math.max(feedback.length, 1) || 0)) || 0)}${"☆".repeat(5 - Math.floor((feedback.reduce((sum, f) => sum + f.Rating, 0) / Math.max(feedback.length, 1) || 0)) || 0)}</span>
>>>>>>> Stashed changes
              </div>
            </div>

            <div style="width:100%; margin-bottom:16px;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                <span>Đánh giá của bạn: </span>
                <div id="star-rating" style="display:flex; gap:2px;">
                  ${[1, 2, 3, 4, 5]
                    .map(
                      (i) => `
<<<<<<< Updated upstream
                    <span
                      id="star-${i}"
                      style="cursor:pointer; font-size:1.2rem; color:${i <= newRating ? "#ffca28" : "#ccc"};"
                      onclick="window.setStarRating(${i})"
                    >★</span>
                  `
=======
                      <span
                        id="star-${i}"
                        style="cursor:pointer; font-size:1.2rem; color:${i <= newRating ? "#ffca28" : "#ccc"};"
                        onclick="window.setStarRating(${i})"
                      >★</span>
                    `
>>>>>>> Stashed changes
                    )
                    .join("")}
                </div>
              </div>
<<<<<<< Updated upstream
              <textarea id="comment-input" placeholder="Viết bình luận của bạn..." style="width:100%; height:80px; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:8px; resize:vertical;"></textarea>
=======
              <textarea
                id="comment-input"
                placeholder="Viết bình luận của bạn..."
                style="width:100%; height:80px; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:8px; resize:vertical;"
              ></textarea>
>>>>>>> Stashed changes
              <button id="submit-review-btn" style="width:100%; padding:10px; background:#1a73e8; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Gửi đánh giá</button>
            </div>

            <div style="width:100%; margin-bottom:16px;">
              <div id="reviews-list" style="max-height:300px; overflow-y:auto; width:100%;">
<<<<<<< Updated upstream
                ${reviews
                  .map(
                    (review) => `
                  <div style="padding:10px; border-bottom:1px solid #eee; width:100%;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                      <span style="color:#ffca28;">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span>
                      <span style="color:#555;">${review.comment}</span>
                    </div>
                    <span style="font-size:0.8rem; color:#888;">Vào lúc ${review.timestamp}</span>
                  </div>
                `
=======
                ${feedback
                  .map(
                    (review) => `
                    <div style="padding:10px; border-bottom:1px solid #eee; width:100%;">
                      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <span style="color:#ffca28;">${"★".repeat(review.Rating)}${"☆".repeat(5 - review.Rating)}</span>
                        <span style="color:#555;">${review.Comment}</span>
                      </div>
                      <span style="font-size:0.8rem; color:#888;">Bởi ${review.user?.FullName || 'Ẩn danh'} vào ${new Date(review.CreatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  `
>>>>>>> Stashed changes
                  )
                  .join("")}
              </div>
            </div>
          </div>
        `;
<<<<<<< Updated upstream
        document.getElementById("comment-input").oninput = (e) => setNewComment(e.target.value);
        document.getElementById("submit-review-btn").onclick = () => {
          if (newRating > 0 && newComment.trim()) {
            const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
            setReviews([...reviews, { rating: newRating, comment: newComment, timestamp }]);
            setNewRating(0);
            setNewComment("");
            document.getElementById("comment-input").value = "";
            const stars = document.querySelectorAll('[id^="star-"]');
            stars.forEach((star) => (star.style.color = "#ccc"));
          } else {
            alert("Vui lòng chọn số sao và viết bình luận!");
          }
        };
      }
    };

    document.getElementById("get-directions-btn").onclick = () => {
      if (!userMarker.current) {
        alert("Vui lòng cho phép định vị vị trí trước khi xem đường đi!");
        return;
      }
      calculateRoute(userMarker.current.getLatLng(), currentPlace.current.position, mapInstance.current);
    };
    document.getElementById("share-location-btn").onclick = () => {
      const url = `${window.location.origin}/map?to=${currentPlace.current.position[0]},${currentPlace.current.position[1]}`;
      navigator.clipboard.writeText(url).then(() => alert("Đã sao chép link chia sẻ vị trí!"));
    };
    document.getElementById("save-btn").onclick = () => {
      const fullPlace = places.find((p) => p.id === place.id) || place;
      if (!favorites.some((fav) => fav.id === fullPlace.id)) {
        const updated = [...favorites, fullPlace];
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
        alert("Đã lưu vào mục yêu thích!");
      } else {
        alert("Đã có trong mục yêu thích!");
      }
    };
    document.getElementById("view-detail-btn").onclick = () => {
      showDetailModal(place);
    };
    document.getElementById("compare-btn").onclick = () => {
      showCompareModal(place);
    };
  };

  // === MODAL CHI TIẾT GIỮA MÀN HÌNH ===
  const showDetailModal = (place) => {
    if (modalRef.current) {
      document.body.removeChild(modalRef.current);
      document.body.removeChild(overlayRef.current);
    }

    const overlay = L.DomUtil.create("div", "modal-overlay");
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      z-index: 10001; cursor: pointer;
    `;
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

=======
        const commentInput = document.getElementById("comment-input");
        if (commentInput) {
          commentInput.value = newComment;
          commentInput.addEventListener("input", (e) => {
            setNewComment(e.target.value);
          });
        }
        document.getElementById("submit-review-btn").onclick = async () => {
          if (!userId) {
            alert("Vui lòng đăng nhập để gửi đánh giá!");
            return;
          }
          const ratingFromDOM = newRating; // Lấy trực tiếp từ state
          const commentFromDOM = document.getElementById("comment-input").value.trim() || newComment; // Lấy từ DOM hoặc state

          // Debug log
          console.log("Rating:", ratingFromDOM, "Comment:", commentFromDOM);

          if (ratingFromDOM > 0 && commentFromDOM) {
            try {
              await dispatch(addFeedback({
                locationId: currentPlace.current.id,
                userId,
                rating: ratingFromDOM,
                comment: commentFromDOM,
              })).unwrap();
              setNewRating(0);
              setNewComment("");
              document.getElementById("comment-input").value = "";
              const stars = document.querySelectorAll('[id^="star-"]');
              stars.forEach((star) => (star.style.color = "#ccc"));
              dispatch(fetchFeedback(currentPlace.current.id));
              dispatch(fetchMapLocations());

              // Cập nhật giao diện với bình luận mới
              const reviewsList = document.getElementById("reviews-list");
              if (reviewsList) {
                const newReview = {
                  Rating: ratingFromDOM,
                  Comment: commentFromDOM,
                  user: { FullName: "Bạn" }, // Giả lập tên người dùng
                  CreatedAt: new Date().toISOString(),
                };
                const newReviewsHTML = `
                  <div style="padding:10px; border-bottom:1px solid #eee; width:100%;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                      <span style="color:#ffca28;">${"★".repeat(newReview.Rating)}${"☆".repeat(5 - newReview.Rating)}</span>
                      <span style="color:#555;">${newReview.Comment}</span>
                    </div>
                    <span style="font-size:0.8rem; color:#888;">Bởi ${newReview.user.FullName} vào ${new Date(newReview.CreatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                  ${reviewsList.innerHTML}
                `;
                reviewsList.innerHTML = newReviewsHTML;
              }

              alert("Đánh giá thành công!");
            } catch (error) {
              alert("Lỗi khi gửi đánh giá: " + error.message);
            }
          } else {
            alert("Vui lòng chọn số sao và viết bình luận!");
          }
        };
      }
    };

    document.getElementById("get-directions-btn").onclick = () => {
      if (!userMarker.current) {
        alert("Vui lòng cho phép định vị vị trí trước khi xem đường đi!");
        return;
      }
      calculateRoute(userMarker.current.getLatLng(), currentPlace.current.position, mapInstance.current);
    };
    document.getElementById("share-location-btn").onclick = () => {
      const url = `${window.location.origin}/map?to=${currentPlace.current.position[0]},${currentPlace.current.position[1]}`;
      navigator.clipboard.writeText(url).then(() => alert("Đã sao chép link chia sẻ vị trí!"));
    };
    document.getElementById("save-btn").onclick = () => {
      const fullPlace = places.find((p) => p.id === place.id) || place;
      if (!favorites.some((fav) => fav.id === fullPlace.id)) {
        const updated = [...favorites, fullPlace];
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
        alert("Đã lưu vào mục yêu thích!");
      } else {
        alert("Đã có trong mục yêu thích!");
      }
    };
    document.getElementById("view-detail-btn").onclick = () => {
      showDetailModal(place);
    };
    document.getElementById("compare-btn").onclick = () => {
      showCompareModal(place);
    };
  };

  const showDetailModal = (place) => {
    if (modalRef.current) {
      document.body.removeChild(modalRef.current);
      document.body.removeChild(overlayRef.current);
    }

    const overlay = L.DomUtil.create("div", "modal-overlay");
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      z-index: 10001; cursor: pointer;
    `;
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

>>>>>>> Stashed changes
    const modal = L.DomUtil.create("div", "detail-modal");
    modal.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 90%; max-width: 700px; max-height: 80vh; background: white;
      border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 10002; font-family: system-ui; display: flex; flex-direction: column;
    `;

    modal.innerHTML = `
      <div style="position:relative;">
        <div onclick="window.closeDetailModal()" style="position:absolute;top:12px;right:12px;width:36px;height:36px;background:rgba(0,0,0,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;">
          <span style="font-size:1.4rem;color:#666;">×</span>
        </div>
        <img src="${place.image || 'https://via.placeholder.com/700xauto?text=Chưa+có+hình'}" style="width:100%;height:auto;object-fit:contain;border-radius:12px;" />
      </div>
      <div style="padding:20px;flex:1;overflow-y:auto;">
        <h3 style="margin:0 0 12px;font-size:1.4rem;font-weight:600;color:#1a0dab;">${place.title}</h3>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:16px;">
          <span style="color:#d50000;font-weight:bold;">${place.rating || 0}</span>
          ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(5 - Math.floor(place.rating || 0))}
          <span style="color:#666;font-size:0.9rem;">(${place.reviews || 0} đánh giá)</span>
        </div>
        <p style="margin:0 0 20px;font-size:1rem;line-height:1.7;color:#333;">${place.fullDesc || "Chi tiết chưa có"}</p>
        <div style="padding:16px;background:#f8f9fa;border-radius:8px;font-size:0.95rem;color:#555;">
          <div style="margin-bottom:8px;"><strong>Địa chỉ:</strong> ${place.address || "Địa chỉ chưa có"}</div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modalRef.current = modal;
    overlay.onclick = () => window.closeDetailModal();
  };

<<<<<<< Updated upstream
  window.closeDetailModal = () => {
    if (modalRef.current) {
      document.body.removeChild(modalRef.current);
      modalRef.current = null;
    }
    if (overlayRef.current) {
      document.body.removeChild(overlayRef.current);
      overlayRef.current = null;
    }
  };

  // === MODAL SO SÁNH HÌNH ẢNH ===
=======
>>>>>>> Stashed changes
  const showCompareModal = (place) => {
    if (modalRef.current) {
      document.body.removeChild(modalRef.current);
      document.body.removeChild(overlayRef.current);
    }

    const overlay = L.DomUtil.create("div", "modal-overlay");
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      z-index: 10001; cursor: pointer;
    `;
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    const modal = L.DomUtil.create("div", "detail-modal");
    modal.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 90%; max-width: 700px; max-height: 80vh; background: white;
      border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 10002; font-family: system-ui; display: flex; flex-direction: column;
    `;

    modal.innerHTML = `
      <div style="position:relative;">
        <div onclick="window.closeDetailModal()" style="position:absolute;top:12px;right:12px;width:36px;height:36px;background:rgba(0,0,0,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;">
          <span style="font-size:1.4rem;color:#666;">×</span>
        </div>
        <h3 style="margin: 20px; font-size: 1.4rem; font-weight: 600; color: #1a0dab; text-align: center;">So sánh qua các thời kỳ</h3>
        <div style="display: flex; justify-content: space-between; padding: 20px;">
          <div style="flex: 1; margin-right: 10px;">
            <h4 style="margin: 0 0 10px; font-size: 1rem; color: #333;">Hình ảnh xưa</h4>
            <img src="${place.oldImage || 'https://via.placeholder.com/350x250?text=Chưa+có+hình'}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;" />
            <p style="margin: 10px 0; font-size: 0.9rem; color: #555;">Năm 1990 - Hình ảnh khu vực trước khi xây dựng cầu, với cảnh quan tự nhiên và ít dấu vết đô thị hóa.</p>
          </div>
          <div style="flex: 1; margin-left: 10px;">
            <h4 style="margin: 0 0 10px; font-size: 1rem; color: #333;">Hình ảnh hiện tại</h4>
            <img src="${place.image || 'https://via.placeholder.com/350x250?text=Chưa+có+hình'}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;" />
            <p style="margin: 10px 0; font-size: 0.9rem; color: #555;">Năm 2025 - Cầu Rồng hoàn thiện với kiến trúc hiện đại, trở thành điểm đến nổi bật.</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modalRef.current = modal;
    overlay.onclick = () => window.closeDetailModal();
  };

<<<<<<< Updated upstream
  // === TÍNH ĐƯỜNG ĐI ===
=======
>>>>>>> Stashed changes
  const calculateRoute = async (from, to, map) => {
    const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${from.lng},${from.lat};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Không thể kết nối với máy chủ định tuyến");
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
        const polyline = L.polyline(coords, { color: "#4285f4", weight: 6, opacity: 0.9 }).addTo(map);
        currentRouteLayer.current = polyline;
        map.fitBounds(polyline.getBounds());

        const km = (route.distance / 1000).toFixed(1);
        const mins = Math.round(route.duration / 60);

        const routeDetails = document.getElementById("route-details");
        routeDetails.innerHTML = `
          <h4 style="margin:16px 0 8px;font-size:1rem;color:#333;font-weight:600">Lộ trình</h4>
          <div style="padding:16px;background:#f8f9fa;border-radius:8px">
            <div style="font-weight:600;color:#333;margin-bottom:8px">
              Thời gian: <span style="color:#1a73e8">${mins} phút</span> · Khoảng cách: <span style="color:#1a73e8">${km} km</span>
            </div>
          </div>
        `;
        routeDetails.style.display = "block";
      }
    } catch (err) {
      document.getElementById("route-details").innerHTML = `<div style="color:#d50000;padding:10px">Không thể tìm đường: ${err.message}</div>`;
      document.getElementById("route-details").style.display = "block";
    }
  };

<<<<<<< Updated upstream
  // === CÁC HÀM TOÀN CỤC ===
=======
>>>>>>> Stashed changes
  window.closeSidebar = () => {
    if (sidebarRef.current) {
      sidebarRef.current.style.display = "none";
      sidebarRef.current.style.left = "100px";
    }
    currentPlace.current = null;
    clearCurrentRoute();
  };

  window.closeFavoritesSidebar = () => {
    favoritesSidebarRef.current.style.display = "none";
    if (sidebarRef.current) {
      sidebarRef.current.style.left = "100px";
      if (sidebarRef.current.style.display === "block") {
        sidebarRef.current.style.display = "none";
      }
    }
  };

<<<<<<< Updated upstream
  // === HIỂN THỊ MỤC YÊU THÍCH + NÚT XÓA ===
=======
>>>>>>> Stashed changes
  const showFavoritesSidebar = () => {
    favoritesSidebarRef.current.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin:0; font-size:1.4rem; font-weight:600; color:white;">Mục yêu thích</h3>
        <div onclick="window.closeFavoritesSidebar()" style="width:36px;height:36px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          <span style="font-size:1.6rem;color:#aaa;">×</span>
        </div>
      </div>
      <div style="margin-bottom:16px; font-size:0.9rem; color:#aaa;">
        <span style="margin-right:8px;">Lock</span> Riêng tư · <span class="fav-count">${favorites.length}</span> địa điểm
      </div>
      <div id="favorites-list" style="color:white;"></div>
    `;

    const list = document.getElementById("favorites-list");
    if (favorites.length === 0) {
      list.innerHTML = `<div style="color:#aaa; text-align:center; padding:20px;">Chưa có địa điểm nào được lưu.</div>`;
    } else {
      list.innerHTML = favorites
        .map(
          (fav) => {
            const place = places.find((p) => p.id === fav.id) || fav;
            return `
              <div style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #444; position:relative;">
                <img src="${place.image || 'https://via.placeholder.com/60x60?text=Chưa+có+hình'}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;" />
                <div style="flex:1; cursor:pointer;" onclick="window.showPlaceFromFav(${place.id})">
                  <div style="font-weight:600; font-size:1rem; color:white;">${place.title}</div>
                  <div style="display:flex; align-items:center; gap:4px; font-size:0.85rem; color:#0ff; margin:4px 0;">
                    <span>${place.rating || 0}</span> ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(5 - Math.floor(place.rating || 0))}
                    <span style="color:#aaa;">(${place.reviews || 0})</span>
                  </div>
                  <div style="font-size:0.85rem; color:#aaa;">${place.desc || "Mô tả chưa có"}</div>
                </div>
                <div onclick="event.stopPropagation(); window.removeFromFavorites(${place.id})" style="position:absolute; top:12px; right:0; width:32px; height:32px; background:#444; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:0.2s;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </div>
              </div>
            `;
          }
        )
        .join("");
    }

    favoritesSidebarRef.current.style.display = "block";
    if (sidebarRef.current) sidebarRef.current.style.display = "none";
  };

<<<<<<< Updated upstream
  // === XÓA ĐỊA ĐIỂM KHỎI YÊU THÍCH ===
=======
>>>>>>> Stashed changes
  window.removeFromFavorites = (id) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    showFavoritesSidebar();
  };

<<<<<<< Updated upstream
  // === MỞ CHI TIẾT TỪ YÊU THÍCH ===
=======
>>>>>>> Stashed changes
  window.showPlaceFromFav = (id) => {
    const place = places.find((p) => p.id === id) || favorites.find((f) => f.id === id);
    if (place) {
      currentPlace.current = place;
      clearCurrentRoute();
<<<<<<< Updated upstream
=======
      dispatch(fetchFeedback(place.id));
>>>>>>> Stashed changes
      showPlaceDetail(place, mapInstance.current);
      favoritesSidebarRef.current.style.display = "block";
      sidebarRef.current.style.left = "380px";
      sidebarRef.current.style.display = "block";
    }
  };

<<<<<<< Updated upstream
  // === ĐẶT ĐÁNH GIÁ SAO ===
  window.setStarRating = (rating) => {
    setNewRating(rating);
=======
  window.setStarRating = (rating) => {
    setNewRating(rating);
    console.log("newRating updated to:", rating); // Kiểm tra
>>>>>>> Stashed changes
    const stars = document.querySelectorAll('[id^="star-"]');
    stars.forEach((star) => {
      const starValue = parseInt(star.id.split("-")[1]);
      star.style.color = starValue <= rating ? "#ffca28" : "#ccc";
    });
  };

<<<<<<< Updated upstream
  // === GPS ===
  useEffect(() => {
    if (navigator.geolocation && mapInstance.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const icon = L.divIcon({
            html: `<div style="position: relative;"><div style="background:#4285f4;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.3);"></div><div style="position:absolute;top:0;left:0;width:100%;height:100%;background:#4285f4;border-radius:50%;animation:pulse 2s infinite;opacity:0.4"></div></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          userMarker.current = L.marker([lat, lng], { icon }).addTo(mapInstance.current);
          userMarker.current
            .bindPopup('<b style="color:#4285f4">Vị trí của bạn</b>')
            .openPopup();
          mapInstance.current.setView([lat, lng], 14);
        },
        () => alert("Vui lòng cho phép định vị để sử dụng chức năng đường đi!")
      );
    }
  }, []);

  // === STYLE ===
=======
  window.closeDetailModal = () => {
    if (modalRef.current) {
      document.body.removeChild(modalRef.current);
      document.body.removeChild(overlayRef.current);
      modalRef.current = null;
      overlayRef.current = null;
    }
  };

  useEffect(() => {
    if (navigator.geolocation && mapInstance.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const icon = L.divIcon({
            html: `<div style="position: relative;"><div style="background:#4285f4;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.3);"></div><div style="position:absolute;top:0;left:0;width:100%;height:100%;background:#4285f4;border-radius:50%;animation:pulse 2s infinite;opacity:0.4"></div></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          userMarker.current = L.marker([lat, lng], { icon }).addTo(mapInstance.current);
          userMarker.current
            .bindPopup('<b style="color:#4285f4">Vị trí của bạn</b>')
            .openPopup();
          mapInstance.current.setView([lat, lng], 14);
        },
        () => alert("Vui lòng cho phép định vị để sử dụng chức năng đường đi!")
      );
    }
  }, []);

>>>>>>> Stashed changes
  useEffect(() => {
    if (!styleRef.current) {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes pulse {0%{transform:scale(1);opacity:0.4}70%{transform:scale(2.5);opacity:0}100%{transform:scale(1);opacity:0}}
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }
    return () => {
      if (styleRef.current) styleRef.current.remove();
    };
  }, []);

  if (status === "failed") {
    return <div style={{ color: "red", padding: "20px" }}>Lỗi tải dữ liệu: {error}</div>;
  }

  return (
    <div
      ref={mapRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }}
    />
  );
};

export default MapPage;