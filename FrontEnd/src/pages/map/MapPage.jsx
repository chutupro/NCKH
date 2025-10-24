import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// === DỮ LIỆU 5 ĐIỂM + NỘI DUNG CHI TIẾT DÀI + HÌNH XƯA ===
const photoData = [
  {
    id: 1,
    position: [16.061083, 108.224694],
    title: "Cầu Rồng Đà Nẵng",
    rating: 4.8,
    reviews: 1250,
    address: "Cầu Rồng, An Hải Đông, Sơn Trà, Đà Nẵng",
    image: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-18.jpg",
    oldImage: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-18.jpg",
    desc: "Cây cầu biểu tượng của Đà Nẵng, phun lửa & nước vào cuối tuần",
    fullDesc: "Cầu Rồng là công trình kiến trúc độc đáo với hình dáng con rồng uốn lượn dài 666m, 6 làn xe. Vào 21h thứ Bảy và Chủ Nhật, rồng phun lửa 9 lần, phun nước 3 lần, thu hút hàng nghìn du khách. Cầu được khánh thành năm 2013, chi phí 1.500 tỷ đồng, là biểu tượng mới của thành phố đáng sống.",
  },
  {
    id: 2,
    position: [16.0544, 108.2242],
    title: "Cầu Vàng - Bà Nà Hills",
    rating: 4.9,
    reviews: 8920,
    address: "Bà Nà Hills, Hòa Vang, Đà Nẵng",
    image: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-18.jpg",
    oldImage: "https://example.com/old-cuangold.jpg",
    desc: "Bàn tay khổng lồ nâng cầu vàng - biểu tượng du lịch Việt Nam",
    fullDesc: "Cầu Vàng nằm ở độ cao 1.400m, dài 150m, được nâng đỡ bởi đôi bàn tay đá phủ rêu phong. Công trình do kiến trúc sư Vũ Việt Anh thiết kế, hoàn thành năm 2018. CNN, BBC, New York Times đều ca ngợi là 'cây cầu đẹp nhất thế giới'. View núi non hùng vĩ, sương mù bao phủ, check-in sống ảo cực đỉnh.",
  },
  {
    id: 3,
    position: [16.0658, 108.2323],
    title: "Biển Mỹ Khê",
    rating: 4.7,
    reviews: 5670,
    address: "Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
    image: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-18.jpg",
    oldImage: "https://example.com/old-mykhe.jpg",
    desc: "Top 6 bãi biển đẹp nhất hành tinh - Forbes",
    fullDesc: "Biển Mỹ Khê dài 10km, cát trắng mịn, nước trong xanh, sóng vừa phải. Forbes bình chọn top 6 bãi biển đẹp nhất hành tinh. Có nhiều hoạt động: tắm biển, lặn ngắm san hô, dù lượn, moto nước. Khu vực có nhiều resort 5 sao, nhà hàng hải sản tươi sống. Đường Võ Nguyên Giáp chạy dọc biển là tuyến đường đẹp nhất Đà Nẵng.",
  },
  {
    id: 4,
    position: [16.0333, 108.2182],
    title: "Chợ Hàn",
    rating: 4.5,
    reviews: 3210,
    address: "119 Trần Phú, Hải Châu 1, Hải Châu, Đà Nẵng",
    image: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-18.jpg",
    oldImage: "https://example.com/old-choan.jpg",
    desc: "Chợ truyền thống lớn nhất Đà Nẵng, đặc sản & quà lưu niệm",
    fullDesc: "Chợ Hàn là trung tâm thương mại truyền thống lớn nhất Đà Nẵng, xây dựng từ năm 1940. Tập trung đặc sản miền Trung: mực một nắng, tré, bánh khô mè, nước mắm Nam Ô. Có khu ăn uống đường phố: bánh tráng cuốn thịt heo, mì Quảng, bánh xèo. Giá cả hợp lý, không chặt chém. Gần cầu Rồng, dễ kết hợp tham quan.",
  },
  {
    id: 5,
    position: [16.0742, 108.1501],
    title: "Ngũ Hành Sơn",
    rating: 4.6,
    reviews: 4100,
    address: "81 Huyền Trân Công Chúa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng",
    image: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-18.jpg",
    oldImage: "https://example.com/old-nguhanhson.jpg",
    desc: "Quần thể hang động & chùa chiền linh thiêng",
    fullDesc: "Ngũ Hành Sơn gồm 5 núi: Kim, Mộc, Thủy, Hỏa, Thổ. Có chùa Linh Ứng, hang Huyền Không, động Âm Phủ. Đi thang máy lên đỉnh Thủy Sơn ngắm toàn cảnh Đà Nẵng. Làng đá mỹ nghệ Non Nước nổi tiếng với tượng điêu khắc tinh xảo. Vé vào cửa: 40.000đ, thang máy: 15.000đ/chiều.",
  },
];

const MapPage = () => {
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
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // === GIỚI HẠN ĐÀ NẴNG ===
  const DA_NANG_BOUNDS = [
    [15.85, 107.85],
    [16.25, 108.4],
  ];

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = () => {
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
        font-family: system-ui;
      `;

      const backBtn = L.DomUtil.create("div", "leaflet-back-btn");
      backBtn.innerHTML = `
        <div style="width:48px;height:48px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;margin-bottom:24px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </div>
      `;
      backBtn.onclick = () => {
        window.location.href = "/";
      };

      const savedBtn = L.DomUtil.create("div", "leaflet-saved-btn");
      savedBtn.innerHTML = `
        <div style="width:48px;height:48px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
      `;
      savedBtn.onclick = () => {
        showFavoritesSidebar();
      };

      leftPanel.appendChild(backBtn);
      leftPanel.appendChild(savedBtn);
      document.body.appendChild(leftPanel);

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
        transition: all 0.3s ease;
      `;

      document.body.appendChild(favoritesSidebar);
      favoritesSidebarRef.current = favoritesSidebar;

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
      `;
      document.body.appendChild(sidebar);
      sidebarRef.current = sidebar;

      // === HOVER POPUP NHỎ ===
      const showHoverPopup = (place, latlng) => {
        if (hoverPopupRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          document.body.removeChild(hoverPopupRef.current);
        }

        const popup = L.DomUtil.create("div", "hover-popup");
        popup.style.cssText = `
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
        `;

        const isSaved = favorites.some(f => f.id === place.id);

        popup.innerHTML = `
          <img src="${place.image}" style="width:100%;height:120px;object-fit:cover;" />
          <div style="padding:12px;">
            <h4 style="margin:0 0 4px;font-size:1rem;font-weight:600;">${place.title}</h4>
            <div style="display:flex;align-items:center;gap:4px;font-size:0.85rem;margin-bottom:6px;">
              <span style="color:#ffca28;font-weight:bold;">${place.rating}</span>
              ${"★".repeat(Math.floor(place.rating))}${"☆".repeat(5 - Math.floor(place.rating))}
              <span style="color:#aaa;">(${place.reviews})</span>
            </div>
            <p style="margin:0 0 8px;font-size:0.8rem;color:#ccc;line-height:1.4;">${place.desc}</p>
            <div style="display:flex;justify-content:flex-end;">
              <button id="hover-save-btn" style="width:32px;height:32px;background:${isSaved ? '#d32f2f' : '#333'};color:white;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'white' : 'none'}" stroke="white" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
          </div>
        `;

        document.body.appendChild(popup);
        hoverPopupRef.current = popup;

        const point = map.latLngToContainerPoint(latlng);
        popup.style.left = `${point.x}px`;
        popup.style.bottom = `${window.innerHeight - point.y + 30}px`;

        const saveBtn = document.getElementById("hover-save-btn");
        saveBtn.onclick = (e) => {
          e.stopPropagation();
          const fullPlace = photoData.find(p => p.id === place.id);
          if (!favorites.some(fav => fav.id === fullPlace.id)) {
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

      // === THÊM 5 ĐIỂM ===
      photoData.forEach((photo) => {
        const marker = L.marker(photo.position, {
          icon: L.icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          }),
        }).addTo(map);

        let isHovering = false;

        marker.on("mouseover", () => {
          isHovering = true;
          showHoverPopup(photo, photo.position);
        });

        marker.on("mouseout", () => {
          isHovering = false;
          hoverTimeoutRef.current = setTimeout(() => {
            if (!isHovering && hoverPopupRef.current) hideHoverPopup();
          }, 300);
        });

        marker.on("click", () => {
          hideHoverPopup();
          currentPlace.current = photo;
          clearCurrentRoute();
          showPlaceDetail(photo, map);
        });
      });

      // === XÓA ĐƯỜNG HIỆN TẠI ===
      const clearCurrentRoute = () => {
        if (currentRouteLayer.current) {
          mapInstance.current.removeLayer(currentRouteLayer.current);
          currentRouteLayer.current = null;
        }
      };

      // === HIỂN THỊ CHI TIẾT TRÊN SIDEBAR TRẮNG ===
      const showPlaceDetail = (place, map) => {
        const isFavoritesOpen = favoritesSidebarRef.current.style.display === "block";

        sidebarRef.current.innerHTML = `
          <div style="padding:20px;position:relative">
            <div onclick="window.closeSidebar()" style="position:absolute;top:16px;left:16px;width:36px;height:36px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:10">
              <span style="font-size:1.4rem;color:#5f6368;font-weight:bold">×</span>
            </div>

            <img src="${place.image}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:16px" />

            <h3 style="margin:0 0 8px;font-size:1.2rem;color:#1a0dab;font-weight:600">${place.title}</h3>

            <div style="display:flex;align-items:center;gap:4px;margin-bottom:12px">
              <span style="color:#d50000;font-weight:bold;">${place.rating}</span>
              ${"★".repeat(Math.floor(place.rating))}${"☆".repeat(5 - Math.floor(place.rating))}
              <span style="color:#666;font-size:0.9rem">(${place.reviews} đánh giá)</span>
            </div>

            <p style="margin:12px 0;font-size:0.95rem;color:#333;line-height:1.5">${place.desc}</p>

            <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:2px solid #dadce0">
              <button id="overview-tab" style="flex:1;padding:10px;border:none;background:${activeTab === 'overview' ? '#e8f0fe' : '#f8f9fa'};color:${activeTab === 'overview' ? '#1a73e8' : '#333'};cursor:pointer;font-weight:${activeTab === 'overview' ? '600' : 'normal'};font-size:0.9rem">Tổng quan</button>
              <button id="reviews-tab" style="flex:1;padding:10px;border:none;background:${activeTab === 'reviews' ? '#e8f0fe' : '#f8f9fa'};color:${activeTab === 'reviews' ? '#1a73e8' : '#333'};cursor:pointer;font-weight:${activeTab === 'reviews' ? '600' : 'normal'};font-size:0.9rem">Đánh giá</button>
            </div>

            <div id="content-area" style="margin-bottom:16px">
              ${activeTab === 'overview' ? `
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
              ` : `
                <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
                  <div style="background:#f1f1f1; padding:16px; border-radius:8px; width:100%; margin-bottom:16px; text-align:center;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span style="font-weight:600;">${(reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0).toFixed(1)}</span>
                      <span style="color:#777;">${reviews.length} đánh giá</span>
                    </div>
                    <div style="margin-top:8px;">
                      <span style="color:#ffca28;">${"★".repeat(Math.floor((reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0)) || 0)}${"☆".repeat(5 - Math.floor((reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0)) || 0)}</span>
                    </div>
                  </div>

                  <div style="width:100%; margin-bottom:16px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                      <span>Đánh giá của bạn: </span>
                      <div id="star-rating" style="display:flex; gap:2px;">
                        ${[1, 2, 3, 4, 5].map(i => `
                          <span
                            id="star-${i}"
                            style="cursor:pointer; font-size:1.2rem; color:${i <= newRating ? '#ffca28' : '#ccc'};"
                          >★</span>
                        `).join('')}
                      </div>
                    </div>
                    <textarea id="comment-input" placeholder="Viết bình luận của bạn..." style="width:100%; height:80px; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:8px; resize:vertical;"></textarea>
                    <button id="submit-review-btn" style="width:100%; padding:10px; background:#1a73e8; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Gửi đánh giá</button>
                  </div>

                  <div style="width:100%; margin-bottom:16px;">
                    <div id="reviews-list" style="max-height:300px; overflow-y:auto; width:100%;">
                      ${reviews.map(review => `
                        <div style="padding:10px; border-bottom:1px solid #eee; width:100%;">
                          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <span style="color:#ffca28;">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span>
                            <span style="color:#555;">${review.comment}</span>
                          </div>
                          <span style="font-size:0.8rem; color:#888;">Vào lúc ${review.timestamp}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              `}
            </div>

            ${activeTab === 'overview' ? `
              <button id="view-detail-btn" style="width:100%;padding:14px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:1rem">
                Xem chi tiết
              </button>

              <div style="font-size:0.9rem;color:#555;margin:16px 0;line-height:1.6">
                <div>Location: ${place.address}</div>
              </div>
            ` : ''}
          </div>
        `;

        sidebarRef.current.style.left = isFavoritesOpen ? "380px" : "100px";
        sidebarRef.current.style.display = "block";

        // Gán sự kiện cho các tab và nút
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
              const fullPlace = photoData.find(p => p.id === place.id);
              if (!favorites.some(fav => fav.id === fullPlace.id)) {
                const updated = [...favorites, fullPlace];
                setFavorites(updated);
                localStorage.setItem("favorites", JSON.stringify(updated));
                alert("Đã lưu vào mục yêu thích!");
              } else {
                alert("Địa điểm này đã có trong mục yêu thích!");
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
                    <span style="font-weight:600;">${(reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0).toFixed(1)}</span>
                    <span style="color:#777;">${reviews.length} đánh giá</span>
                  </div>
                  <div style="margin-top:8px;">
                    <span style="color:#ffca28;">${"★".repeat(Math.floor((reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0)) || 0)}${"☆".repeat(5 - Math.floor((reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0)) || 0)}</span>
                  </div>
                </div>

                <div style="width:100%; margin-bottom:16px;">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                    <span>Đánh giá của bạn: </span>
                    <div id="star-rating" style="display:flex; gap:2px;">
                      ${[1, 2, 3, 4, 5].map(i => `
                        <span
                          id="star-${i}"
                          style="cursor:pointer; font-size:1.2rem; color:${i <= newRating ? '#ffca28' : '#ccc'};"
                          onclick="window.setStarRating(${i})"
                        >★</span>
                      `).join('')}
                    </div>
                  </div>
                  <textarea id="comment-input" placeholder="Viết bình luận của bạn..." style="width:100%; height:80px; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:8px; resize:vertical;"></textarea>
                  <button id="submit-review-btn" style="width:100%; padding:10px; background:#1a73e8; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Gửi đánh giá</button>
                </div>

                <div style="width:100%; margin-bottom:16px;">
                  <div id="reviews-list" style="max-height:300px; overflow-y:auto; width:100%;">
                    ${reviews.map(review => `
                      <div style="padding:10px; border-bottom:1px solid #eee; width:100%;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                          <span style="color:#ffca28;">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span>
                          <span style="color:#555;">${review.comment}</span>
                        </div>
                        <span style="font-size:0.8rem; color:#888;">Vào lúc ${review.timestamp}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `;
            document.getElementById("comment-input").oninput = (e) => setNewComment(e.target.value);
            document.getElementById("submit-review-btn").onclick = () => {
              if (newRating > 0 && newComment.trim()) {
                const timestamp = new Date().toLocaleString("vi-VN");
                setReviews([...reviews, { rating: newRating, comment: newComment, timestamp }]);
                setNewRating(0);
                setNewComment("");
                document.getElementById("comment-input").value = "";
                const stars = document.querySelectorAll('[id^="star-"]');
                stars.forEach(star => star.style.color = '#ccc');
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
          const fullPlace = photoData.find(p => p.id === place.id);
          if (!favorites.some(fav => fav.id === fullPlace.id)) {
            const updated = [...favorites, fullPlace];
            setFavorites(updated);
            localStorage.setItem("favorites", JSON.stringify(updated));
            alert("Đã lưu vào mục yêu thích!");
          } else {
            alert("Địa điểm này đã có trong mục yêu thích!");
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
            <img src="${place.image}" style="width:100%;height:auto;object-fit:contain;border-radius:12px;" />
          </div>
          <div style="padding:20px;flex:1;overflow-y:auto;">
            <h3 style="margin:0 0 12px;font-size:1.4rem;font-weight:600;color:#1a0dab;">${place.title}</h3>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:16px;">
              <span style="color:#d50000;font-weight:bold;">${place.rating}</span>
              ${"★".repeat(Math.floor(place.rating))}${"☆".repeat(5 - Math.floor(place.rating))}
              <span style="color:#666;font-size:0.9rem;">(${place.reviews} đánh giá)</span>
            </div>
            <p style="margin:0 0 20px;font-size:1rem;line-height:1.7;color:#333;">${place.fullDesc}</p>
            <div style="padding:16px;background:#f8f9fa;border-radius:8px;font-size:0.95rem;color:#555;">
              <div style="margin-bottom:8px;"><strong>Địa chỉ:</strong> ${place.address}</div>
            </div>
          </div>
        `;

        document.body.appendChild(modal);
        modalRef.current = modal;
        overlay.onclick = () => window.closeDetailModal();
      };

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
                <img src="${place.oldImage}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;" />
                <p style="margin: 10px 0; font-size: 0.9rem; color: #555;">Năm 1990 - Hình ảnh khu vực trước khi xây dựng cầu, với cảnh quan tự nhiên và ít dấu vết đô thị hóa.</p>
              </div>
              <div style="flex: 1; margin-left: 10px;">
                <h4 style="margin: 0 0 10px; font-size: 1rem; color: #333;">Hình ảnh hiện tại</h4>
                <img src="${place.image}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;" />
                <p style="margin: 10px 0; font-size: 0.9rem; color: #555;">Năm 2025 - Cầu Rồng hoàn thiện với kiến trúc hiện đại, trở thành điểm đến nổi bật.</p>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(modal);
        modalRef.current = modal;
        overlay.onclick = () => window.closeDetailModal();
      };

      // === TÍNH ĐƯỜNG ĐI ===
      const calculateRoute = async (from, to, map) => {
        const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${from.lng},${from.lat};${to[1]},${to[0]}?overview=full&geometries=geojson`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Không thể kết nối với máy chủ định tuyến");
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
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

      // === CÁC HÀM TOÀN CỤC ===
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

      // === HIỂN THỊ MỤC YÊU THÍCH + NÚT XÓA ===
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
          list.innerHTML = favorites.map(fav => `
            <div style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #444; position:relative;">
              <img src="${fav.image}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;" />
              <div style="flex:1; cursor:pointer;" onclick="window.showPlaceFromFav(${fav.id})">
                <div style="font-weight:600; font-size:1rem; color:white;">${fav.title}</div>
                <div style="display:flex; align-items:center; gap:4px; font-size:0.85rem; color:#0ff; margin:4px 0;">
                  <span>${fav.rating}</span> ${"★".repeat(Math.floor(fav.rating))}${"☆".repeat(5 - Math.floor(fav.rating))}
                  <span style="color:#aaa;">(${fav.reviews})</span>
                </div>
                <div style="font-size:0.85rem; color:#aaa;">${fav.desc}</div>
              </div>
              <div onclick="event.stopPropagation(); window.removeFromFavorites(${fav.id})" style="position:absolute; top:12px; right:0; width:32px; height:32px; background:#444; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </div>
            </div>
          `).join("");
        }

        favoritesSidebarRef.current.style.display = "block";
        if (sidebarRef.current) sidebarRef.current.style.display = "none";
      };

      // === XÓA ĐỊA ĐIỂM KHỎI YÊU THÍCH ===
      window.removeFromFavorites = (id) => {
        const updated = favorites.filter(f => f.id !== id);
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
        showFavoritesSidebar();
      };

      // === MỞ CHI TIẾT TỪ YÊU THÍCH ===
      window.showPlaceFromFav = (id) => {
        const place = photoData.find(p => p.id === id);
        if (place) {
          currentPlace.current = place;
          clearCurrentRoute();
          showPlaceDetail(place, mapInstance.current);
          favoritesSidebarRef.current.style.display = "block";
          sidebarRef.current.style.left = "380px";
          sidebarRef.current.style.display = "block";
        }
      };

      // === ĐẶT ĐÁNH GIÁ SAO ===
      window.setStarRating = (rating) => {
        setNewRating(rating);
        const stars = document.querySelectorAll('[id^="star-"]');
        stars.forEach(star => {
          const starValue = parseInt(star.id.split('-')[1]);
          star.style.color = starValue <= rating ? '#ffca28' : '#ccc';
        });
      };

      // === GPS ===
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude, lng = pos.coords.longitude;
            const icon = L.divIcon({
              html: `<div style="position: relative;"><div style="background:#4285f4;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.3);"></div><div style="position:absolute;top:0;left:0;width:100%;height:100%;background:#4285f4;border-radius:50%;animation:pulse 2s infinite;opacity:0.4"></div></div>`,
              iconSize: [22, 22], iconAnchor: [11, 11],
            });
            userMarker.current = L.marker([lat, lng], { icon }).addTo(map);
            userMarker.current.bindPopup('<b style="color:#4285f4">Vị trí của bạn</b>').openPopup();
            map.setView([lat, lng], 14);
          },
          () => alert("Vui lòng cho phép định vị để sử dụng chức năng đường đi!")
        );
      }

      // === STYLE ===
      if (!styleRef.current) {
        const style = document.createElement("style");
        style.textContent = `
          @keyframes pulse {0%{transform:scale(1);opacity:0.4}70%{transform:scale(2.5);opacity:0}100%{transform:scale(1);opacity:0}}
        `;
        document.head.appendChild(style);
        styleRef.current = style;
      }

      const checkMap = setInterval(() => {
        if (mapRef.current?.offsetHeight > 0) {
          map.invalidateSize();
          clearInterval(checkMap);
        }
      }, 100);

      return () => {
        clearInterval(checkMap);
        if (mapInstance.current) mapInstance.current.remove();
        document.querySelectorAll(".custom-sidebar, .leaflet-left-panel, .favorites-sidebar, .hover-popup, .modal-overlay, .detail-modal, .review-modal").forEach(el => el.remove());
        if (styleRef.current) styleRef.current.remove();
        delete window.closeSidebar;
        delete window.closeDetailModal;
        delete window.closeFavoritesSidebar;
        delete window.showPlaceFromFav;
        delete window.removeFromFavorites;
        delete window.setStarRating;
        delete window.closeReviewModal;
      };
    };

    initMap();
  }, [favorites, reviews, newRating, newComment, activeTab]);

  return (
    <div ref={mapRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }} />
  );
};

export default MapPage;