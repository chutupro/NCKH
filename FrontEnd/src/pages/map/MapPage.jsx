
import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchMapLocations } from "./mapLocationsSlice";
import CompareModal from "./CompareModal";
import ReactDOM from "react-dom";
import axios from "axios";
import { useAppContext } from "../../context/useAppContext";
import { useAuthRestore } from "../../hooks/useAuthRestore";

const BASE_URL = "http://localhost:3000";
const FAVORITE_PHOTOS_KEY = "favoritePhotosByUser";
const FAVORITE_PLACES_KEY = "favoritePlacesByUser";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DA_NANG_BOUNDS = [
  [15.85, 107.85],
  [16.25, 108.4],
];

const MapPage = () => {
  const dispatch = useDispatch();
  const { places, status, error } = useSelector((state) => state.mapLocations);
  const { user, isAuthLoading } = useAppContext(); // ✅ LẤY USER + AUTH LOADING STATE

  useAuthRestore();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const sidebarRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const uploadModalRef = useRef(null);
  const uploadOverlayRef = useRef(null);
  const currentPlace = useRef(null);
  const currentRouteLayer = useRef(null);
  const hoverPopupRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const favoritesSidebarRef = useRef(null);
  const allMarkersRef = useRef(new Map());
  const tileLayerRef = useRef(null); // ✅ Ref cho tile layer
  const communityPhotosRef = useRef(new Map());

  const [searchQuery, setSearchQuery] = useState("");
  const [localSuggestions, setLocalSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(null); // ✅ ĐỔI 0 → null để validation đúng
  const [newComment, setNewComment] = useState("");
  const [selectedImages, setSelectedImages] = useState([]); // ✅ State for review images
  const [activeTab, setActiveTab] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(() => {

    const saved = localStorage.getItem("mapDarkMode");
    return saved === "true";
  });
  const [isSidebarDark, setIsSidebarDark] = useState(() => {

    const saved = localStorage.getItem("sidebarDarkMode");
    return saved === "true";
  });
  const [favoritePlacesByUser, setFavoritePlacesByUser] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITE_PLACES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (err) {
      console.error("Không thể đọc favorite places:", err);
      return {};
    }
  });
  const [favoritePhotosByUser, setFavoritePhotosByUser] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITE_PHOTOS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (err) {
      console.error("Không thể đọc favorite photos:", err);
      return {};
    }
  });
  const [comparePlace, setComparePlace] = useState(null);

  useEffect(() => {
    localStorage.setItem(FAVORITE_PLACES_KEY, JSON.stringify(favoritePlacesByUser));
  }, [favoritePlacesByUser]);

  useEffect(() => {
    localStorage.setItem(FAVORITE_PHOTOS_KEY, JSON.stringify(favoritePhotosByUser));
  }, [favoritePhotosByUser]);

  const escapeHtml = (value = '') =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  useEffect(() => {
    localStorage.setItem(FAVORITE_PLACES_KEY, JSON.stringify(favoritePlacesByUser));
  }, [favoritePlacesByUser]);

  useEffect(() => {
    localStorage.setItem(FAVORITE_PHOTOS_KEY, JSON.stringify(favoritePhotosByUser));
  }, [favoritePhotosByUser]);

  useEffect(() => {
    if (currentPlace.current) {
      updateCommunityPhotoGrid(currentPlace.current.id, currentPlace.current);
    }
  }, [favoritePhotosByUser]);

  useEffect(() => {
    if (!user || !user.userId) return;

    const returnToPlaceData = localStorage.getItem('returnToPlace');
    if (!returnToPlaceData) return;

    try {
      const placeData = JSON.parse(returnToPlaceData);

      if (Date.now() - placeData.timestamp > 10 * 60 * 1000) {
        localStorage.removeItem('returnToPlace');
        return;
      }

      localStorage.removeItem('returnToPlace');

      const placeToOpen = places.find(p => p.id === placeData.placeId);
      if (placeToOpen) {

        if (placeData.openReviewTab) {
          setActiveTab('reviews');
        }

        setTimeout(() => {
          showPlaceDetail(placeToOpen, mapInstance.current);
        }, 500);
      }
    } catch (error) {
      console.error('Error parsing returnToPlace data:', error);
      localStorage.removeItem('returnToPlace');
    }
  }, [user, places]);

  useEffect(() => {
    if (!user || !user.userId) return;
    if (!sidebarRef.current) return;
    if (!currentPlace.current) return;

    const isVisible = sidebarRef.current.style && sidebarRef.current.style.display === 'block';
    if (!isVisible) return;

    if (activeTab !== 'reviews') return;

    console.log('🔄 [User Restored] Updating review form for user:', user.email);

    const timer = setTimeout(() => {
      try {

        const contentArea = sidebarRef.current.querySelector('#reviews-tab-content, [style*="display:flex;flex-direction:column"]');
        if (!contentArea) return;

        const loginPrompt = contentArea.querySelector('#login-to-review-link');
        if (!loginPrompt) return; // Form đã đúng rồi

        console.log('✅ [User Restored] Replacing login prompt with review form');

        const loginPromptContainer = loginPrompt.closest('[style*="background:#fff3cd"]');
        if (loginPromptContainer && loginPromptContainer.parentNode) {

          const savedRating = window.currentRating ?? newRating ?? 0;

          const reviewFormHTML = `
            <div style="width:100%;margin-bottom:16px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span>Đánh giá của bạn: </span>
                <div id="star-rating" style="display:flex;gap:2px;">
                  ${[1, 2, 3, 4, 5].map(i => `<span id="star-${i}" style="cursor:pointer;font-size:1.2rem;color:${i <= savedRating ? "#ffca28" : "#ccc"};" onclick="window.setStarRating(${i})">★</span>`).join("")}
                </div>
              </div>
              <textarea id="comment-input" placeholder="Viết bình luận..." style="width:100%;height:80px;padding:8px;border:1px solid #ccc;border-radius:4px;margin-bottom:8px;resize:vertical;">${newComment}</textarea>
              <div style="margin-bottom:8px;">
                <label for="review-images" style="display:block;font-size:0.9rem;margin-bottom:4px;color:#555;">Thêm ảnh (tùy chọn, tối đa 5):</label>
                <input type="file" id="review-images" accept="image
  useEffect(() => {
    if (!mapRef.current) return;

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

    const lightTile = L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: "&copy; Google Maps",
      maxZoom: 20,
    });

    tileLayerRef.current = lightTile;
    lightTile.addTo(map);

    dispatch(fetchMapLocations());

    axios
      .get(`${BASE_URL}/categories`)
      .then((res) => setCategories(res.data || []))
      .catch(console.error);

    return () => {
      if (mapInstance.current) mapInstance.current.remove();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current) return;

    mapInstance.current.removeLayer(tileLayerRef.current);

    if (isDarkMode) {

      tileLayerRef.current = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", // Hybrid dark
        {
          attribution: "&copy; Google Maps (Dark)",
          maxZoom: 20,
        }
      );
    } else {

      tileLayerRef.current = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          attribution: "&copy; Google Maps",
          maxZoom: 20,
        }
      );
    }

    tileLayerRef.current.addTo(mapInstance.current);

    localStorage.setItem("mapDarkMode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.backgroundColor = isSidebarDark ? "#1a1a1a" : "#ffffff";
      sidebarRef.current.style.color = isSidebarDark ? "#ffffff" : "#333333";
    }
  }, [isSidebarDark]);

  useEffect(() => {
    if (mapInstance.current) {
      const timer = setTimeout(() => mapInstance.current.invalidateSize(), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !places.length || allMarkersRef.current.size > 0) return;

    places.forEach((place) => {
      if (!place.position || place.position.length !== 2) return;

      const marker = L.marker(place.position, {
        icon: new L.Icon.Default(),
        zIndexOffset: 0,
      }).addTo(mapInstance.current);

      marker.placeId = place.id;
      marker.isUserMarker = false;

      marker.on("mouseover", () => showHoverPopup(place, place.position));
      marker.on("mouseout", () => {
        hoverTimeoutRef.current = setTimeout(() => hideHoverPopup(), 300);
      });
      marker.on("click", () => {
        hideHoverPopup();
        currentPlace.current = place;
        clearCurrentRoute();
        showPlaceDetail(place, mapInstance.current);
      });

      allMarkersRef.current.set(place.id, marker);
    });
  }, [places]);

  useEffect(() => {
    if (!mapInstance.current || !places.length) return;

    allMarkersRef.current.forEach((marker, placeId) => {
      const place = places.find((p) => p.id === placeId);
      if (!place) return;

      const isVisible = selectedCategory === null || place.categoryId === selectedCategory;

      if (isVisible) {

        if (!mapInstance.current.hasLayer(marker)) {
          marker.addTo(mapInstance.current);
        }
        marker.setOpacity(1);
        if (marker.getElement()) {
          marker.getElement().style.filter = "";
        }
      } else {

        if (mapInstance.current.hasLayer(marker)) {
          mapInstance.current.removeLayer(marker);
        }
      }
    });
  }, [selectedCategory, places]);

  const highlightMarker = (placeId) => {
    allMarkersRef.current.forEach((marker, id) => {
      if (id === placeId) {
        const highlightIcon = L.icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [35, 58],
          iconAnchor: [17, 58],
          popupAnchor: [1, -50],
          shadowSize: [58, 58],
        });
        marker.setIcon(highlightIcon);
        marker.setZIndexOffset(1000);

        setTimeout(() => {
          marker.setIcon(new L.Icon.Default());
          marker.setZIndexOffset(0);
        }, 1200);
      } else {
        marker.setIcon(new L.Icon.Default());
        marker.setZIndexOffset(0);
      }
    });
  };

  useEffect(() => {
    if (!mapInstance.current) return;

    const leftPanel = L.DomUtil.create("div", "leaflet-left-panel");
    leftPanel.style.cssText = `
      position:fixed;top:0;left:0;width:100px;height:100vh;
      background:#2d2d2d;z-index:10001;display:flex;flex-direction:column;
      align-items:center;padding-top:24px;font-family:system-ui;gap:16px;
    `;
    const backBtn = L.DomUtil.create("div");
    backBtn.innerHTML = `<div style="width:48px;height:48px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    </div>`;
    backBtn.onclick = () => (window.location.href = "/");

    const savedBtn = L.DomUtil.create("div");
    savedBtn.innerHTML = `<div style="width:48px;height:48px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    </div>`;
    savedBtn.onclick = () => showFavoritesSidebar();

    const darkModeBtn = L.DomUtil.create("div");
    const updateDarkModeBtn = () => {
      const isDark = localStorage.getItem("sidebarDarkMode") === "true";
      darkModeBtn.innerHTML = `<div 
        onmouseenter="this.style.transform='scale(1.1)'; this.style.background='#555';" 
        onmouseleave="this.style.transform='scale(1)'; this.style.background='${isDark ? '#2d2d2d' : '#4a4a4a'}';"
        style="width:48px;height:48px;background:${isDark ? '#2d2d2d' : '#4a4a4a'};border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s ease;">
        <span style="font-size:20px;">${isDark ? '☀️' : '🌙'}</span>
      </div>`;
    };
    updateDarkModeBtn();
    darkModeBtn.onclick = () => {
      setIsSidebarDark(prev => !prev);
      setTimeout(updateDarkModeBtn, 50);
    };

    leftPanel.append(backBtn, savedBtn, darkModeBtn);
    document.body.appendChild(leftPanel);

    const topBar = L.DomUtil.create("div", "leaflet-top-bar");
    topBar.style.cssText = `
      position:absolute;top:16px;left:116px;z-index:10001;
      display:flex;gap:12px;max-width:calc(100% - 132px);transition:left 0.3s ease, max-width 0.3s ease;
    `;

    const searchContainer = L.DomUtil.create("div");
    searchContainer.style.cssText = `position:relative;width:320px;display:flex;z-index:10003;`;
    const searchInput = L.DomUtil.create("input");
    searchInput.type = "text";
    searchInput.placeholder = "Tìm địa điểm, ảnh...";
    searchInput.className = "search-input";
    searchInput.style.cssText = `
      flex:1;padding:12px 16px 12px 40px;border:none;border-radius:12px 0 0 12px;
      background:white;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:1rem;outline:none;
      position:relative;z-index:10003;pointer-events:auto;
      color:#333 !important;
    `;

    const searchIcon = L.DomUtil.create("div");
    searchIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
    searchIcon.style.cssText = `position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;z-index:10004;`;

    const searchBtn = L.DomUtil.create("button");
    searchBtn.className = "search-btn";
    searchBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
    searchBtn.style.cssText = `
      width:48px;background:#1a73e8;border:none;border-radius:0 12px 12px 0;
      display:flex;align-items:center;justify-content:center;cursor:pointer;
      transition:0.2s;z-index:10003;
    `;
    searchBtn.onmouseover = () => searchBtn.style.background = "#0d47a1";
    searchBtn.onmouseout = () => searchBtn.style.background = "#1a73e8";

    const suggestionList = L.DomUtil.create("ul");
    suggestionList.className = "suggestion-list";
    suggestionList.style.cssText = `
      position:absolute;top:100%;left:0;right:0;background:white;border-radius:8px;
      margin-top:4px;max-height:300px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,0.15);
      display:none;z-index:10005;list-style:none;padding:0;margin:0;
    `;

    searchContainer.append(searchInput, searchIcon, searchBtn, suggestionList);
    topBar.appendChild(searchContainer);

    const categoryContainer = L.DomUtil.create("div");
    categoryContainer.style.cssText = `
      display:flex;gap:8px;overflow-x:auto;padding:4px 0;flex:1;
      scrollbar-width:none;-ms-overflow-style:none;
    `;
    categoryContainer.style.msOverflowStyle = "none";
    categoryContainer.style.scrollbarWidth = "none";
    topBar.appendChild(categoryContainer);

    const renderCategories = () => {
      categoryContainer.innerHTML = "";
      const allBtn = L.DomUtil.create("button");
      allBtn.innerText = "Tất cả";
      allBtn.style.cssText = `
        padding:8px 16px;border:1px solid #ddd;border-radius:20px;
        background:${selectedCategory === null ? "#1a73e8" : "white"};
        color:${selectedCategory === null ? "white" : "#333"};
        font-size:0.9rem;white-space:nowrap;cursor:pointer;transition:0.2s;
      `;
      allBtn.onclick = () => setSelectedCategory(null);
      categoryContainer.appendChild(allBtn);

      categories.forEach((cat) => {
        const btn = L.DomUtil.create("button");
        btn.innerText = cat.Name;
        btn.dataset.id = cat.CategoryID;
        btn.style.cssText = `
          padding:8px 16px;border:1px solid #ddd;border-radius:20px;
          background:${selectedCategory === cat.CategoryID ? "#1a73e8" : "white"};
          color:${selectedCategory === cat.CategoryID ? "white" : "#333"};
          font-size:0.9rem;white-space:nowrap;cursor:pointer;transition:0.2s;
        `;
        btn.onclick = () => {
          const id = parseInt(btn.dataset.id);
          setSelectedCategory((prev) => (prev === id ? null : id));
        };
        categoryContainer.appendChild(btn);
      });
    };
    renderCategories();

    document.body.appendChild(topBar);

    const sidebar = L.DomUtil.create("div", "custom-sidebar");
    sidebar.style.cssText = `
      position:fixed;top:0;left:100px;width:380px;height:100vh;
      background:white;z-index:10000;overflow-y:auto;display:none;
      padding-bottom:100px;transition:left 0.3s ease;font-family:system-ui;
    `;
    document.body.appendChild(sidebar);
    sidebarRef.current = sidebar;

    const favoritesSidebar = L.DomUtil.create("div", "favorites-sidebar");
    favoritesSidebar.style.cssText = `
      position:fixed;top:0;left:0;width:380px;height:100vh;
      background:#2d2d2d;color:white;z-index:10002;padding:20px;
      display:none;overflow-y:auto;font-family:system-ui;transition:left 0.3s ease;
    `;
    document.body.appendChild(favoritesSidebar);
    favoritesSidebarRef.current = favoritesSidebar;

    const controlPanel = L.DomUtil.create("div", "custom-zoom-control");
    controlPanel.style.cssText = `
      position:fixed;bottom:16px;right:16px;background:white;
      border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.2);
      overflow:hidden;z-index:10001;display:flex;flex-direction:column;
      font-family:system-ui;
    `;

    const zoomInBtn = L.DomUtil.create("button");
    zoomInBtn.innerHTML = `<span style="font-size:1.4rem;font-weight:bold;">+</span>`;
    zoomInBtn.style.cssText = `
      width:40px;height:40px;border:none;background:transparent;
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;font-size:1.4rem;font-weight:bold;
      border-bottom:1px solid #eee;
    `;
    zoomInBtn.onclick = () => mapInstance.current.zoomIn();

    const zoomOutBtn = L.DomUtil.create("button");
    zoomOutBtn.innerHTML = `<span style="font-size:1.4rem;font-weight:bold;">−</span>`;
    zoomOutBtn.style.cssText = `
      width:40px;height:40px;border:none;background:transparent;
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;font-size:1.4rem;font-weight:bold;
      border-bottom:1px solid #eee;
    `;
    zoomOutBtn.onclick = () => mapInstance.current.zoomOut();

    const locateBtn = L.DomUtil.create("button");
    locateBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2.5">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2a10 10 0 0 1 10 10c0 5-5 12-10 12S2 17 2 12A10 10 0 0 1 12 2z"/>
        <path d="M12 8v4m0 4h.01"/>
      </svg>
    `;
    locateBtn.style.cssText = `
      width:40px;height:40px;border:none;background:transparent;
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;
    `;
    locateBtn.onclick = () => {
      if (!userMarker.current) {
        alert("Đang xác định vị trí của bạn...");
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              mapInstance.current.setView([lat, lng], 16);
              if (!userMarker.current) {
                const icon = L.divIcon({
                  html: `<div style="width:16px;height:16px;background:#4285f4;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                  className: "user-location-marker",
                  iconSize: [22, 22],
                  iconAnchor: [11, 11],
                });
                userMarker.current = L.marker([lat, lng], { icon }).addTo(mapInstance.current);
                userMarker.current.bindPopup('<b style="color:#4285f4">Vị trí của bạn</b>').openPopup();
              } else {
                userMarker.current.setLatLng([lat, lng]);
              }
            },
            () => alert("Không thể lấy vị trí. Vui lòng bật định vị!")
          );
        }
      } else {
        const latlng = userMarker.current.getLatLng();
        mapInstance.current.setView(latlng, 16);
        userMarker.current.openPopup();
      }
    };

    controlPanel.append(zoomInBtn, zoomOutBtn, locateBtn);
    document.body.appendChild(controlPanel);

    window.updateTopBarPosition = () => {
      const isDetailOpen = sidebarRef.current.style.display === "block";
      const isFavOpen = favoritesSidebarRef.current.style.display === "block";

      let baseLeft = 116;
      if (isDetailOpen) baseLeft += 380;
      if (isFavOpen) baseLeft += 380;

      topBar.style.left = `${baseLeft}px`;
      topBar.style.maxWidth = `calc(100% - ${baseLeft + 16}px)`;
    };

    return () => {
      document
        .querySelectorAll(
          ".leaflet-left-panel,.leaflet-top-bar,.custom-sidebar,.favorites-sidebar,.hover-popup,.modal-overlay,.detail-modal,.custom-zoom-control"
        )
        .forEach((el) => el?.remove());
      delete window.updateTopBarPosition;
    };
  }, [mapInstance.current, categories, selectedCategory]);

  const searchLocal = useCallback((query) => {
    if (!query.trim()) {
      setLocalSuggestions([]);
      const list = document.querySelector(".suggestion-list");
      if (list) list.style.display = "none";
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    if (!places || places.length === 0) {
      setTimeout(() => searchLocal(query), 100);
      return;
    }

    const q = query.toLowerCase().trim();

    const matches = places
      .filter((p) => {
        const title = (p.title || "").toLowerCase();
        const address = (p.address || "").toLowerCase();
        const desc = (p.desc || "").toLowerCase();
        const image = (p.image || "").split("/").pop().toLowerCase();
        const oldImage = (p.oldImage || "").split("/").pop().toLowerCase();

        return (
          title.includes(q) ||
          address.includes(q) ||
          desc.includes(q) ||
          image.includes(q) ||
          oldImage.includes(q)
        );
      })
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        address: p.address,
        lat: p.position[0],
        lng: p.position[1],
        image: p.image,
        oldImage: p.oldImage,
        match: 
          (p.image || "").toLowerCase().includes(q) ? "ảnh hiện tại" :
          (p.oldImage || "").toLowerCase().includes(q) ? "ảnh xưa" :
          "tên / địa chỉ",
      }));

    setLocalSuggestions(matches);
    setIsSearching(false);

    const list = document.querySelector(".suggestion-list");
    if (!list) return;

    if (matches.length === 0) {
      list.innerHTML = `<li style="padding:12px;color:#999;font-style:italic;">Không tìm thấy</li>`;
      list.style.display = "block";
      return;
    }

    list.innerHTML = matches
      .map(
        (s) => `
        <li style="padding:12px;cursor:pointer;border-bottom:1px solid #eee;font-size:0.95rem;display:flex;align-items:center;gap:8px;"
            onmouseenter="this.style.background='#f0f8ff'" onmouseleave="this.style.background='white'">
          <img src="${s.image ? `${BASE_URL}${s.image}` : "https://via.placeholder.com/40"}" 
               style="width:40px;height:40px;object-fit:cover;border-radius:6px;" />
          <div style="flex:1;">
            <strong>${s.title}</strong>
            <div style="font-size:0.8rem;color:#666;">${s.address}</div>
            <div style="font-size:0.75rem;color:#1a73e8;margin-top:2px;">
              Tìm thấy trong <strong>${s.match}</strong>
            </div>
          </div>
        </li>
      `
      )
      .join("");

    list.style.display = "block";

    list.querySelectorAll("li").forEach((li, i) => {
      li.onclick = () => {
        const place = places.find((p) => p.id === matches[i].id);
        if (place) {
          mapInstance.current.setView([place.position[0], place.position[1]], 17, { animate: true });
          highlightMarker(place.id);
          const input = document.querySelector(".search-input");
          if (input) input.value = place.title;
          setSearchQuery(place.title);
          list.style.display = "none";
          showPlaceDetail(place, mapInstance.current);

          setTimeout(() => mapInstance.current.invalidateSize(), 600);
        }
      };
    });
  }, [places]);

  useEffect(() => {
    const input = document.querySelector(".search-input");
    const searchBtn = document.querySelector(".search-btn");
    if (!input || !searchBtn) return;

    let timeout;
    input.oninput = (e) => {
      const q = e.target.value;
      setSearchQuery(q);
      clearTimeout(timeout);
      timeout = setTimeout(() => searchLocal(q), 300);
    };

    searchBtn.onclick = () => {
      const q = input.value.trim();
      if (!q || localSuggestions.length === 0) return;

      const first = localSuggestions[0];
      const place = places.find((p) => p.id === first.id);
      if (place) {
        mapInstance.current.setView([place.position[0], place.position[1]], 17, { animate: true });
        highlightMarker(place.id);
        input.value = place.title;
        setSearchQuery(place.title);
        document.querySelector(".suggestion-list").style.display = "none";
        showPlaceDetail(place, mapInstance.current);

        setTimeout(() => mapInstance.current.invalidateSize(), 600);
      }
    };

    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        searchBtn.click();
      }
    };

    const updateBtn = () => {
      searchBtn.innerHTML = isSearching
        ? `<div style="width:16px;height:16px;border:2px solid #fff;border-top-color:#1a73e8;border-radius:50%;animation:spin 1s linear infinite;"></div>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
    };
    updateBtn();
    const observer = new MutationObserver(updateBtn);
    observer.observe(searchBtn, { childList: true });

    return () => observer.disconnect();
  }, [searchLocal, localSuggestions, places, isSearching]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .search-input {
        color: #333 !important;
      }
      .search-input::placeholder {
        color: #999 !important;
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const showHoverPopup = (place, latlng) => {
    if (hoverPopupRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      document.body.removeChild(hoverPopupRef.current);
    }

    const popup = L.DomUtil.create("div", "hover-popup");
    popup.style.cssText = `
      position:absolute;bottom:40px;left:50%;transform:translateX(-50%);
      width:260px;background:#1c1c1c;color:white;border-radius:12px;
      overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.3);font-family:system-ui;
      z-index:10003;pointer-events:auto;user-select:none;
    `;

    let isSaved = getCurrentUserPlaceFavorites().some((f) => f.id === place.id);

    popup.innerHTML = `
      <img src="${place.image ? `${BASE_URL}${place.image}` : "https://via.placeholder.com/260x120?text=Chưa+có+hình"}" style="width:100%;height:120px;object-fit:cover;" />
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
      if (!user || !user.userId) {
        alert("Vui lòng đăng nhập để lưu địa điểm.");
        return;
      }
      const fullPlace = places.find((p) => p.id === place.id) || place;
      if (isSaved) {
        removePlaceFromFavorites(fullPlace.id);
        isSaved = false;
      } else {
        addPlaceToFavorites(fullPlace);
        isSaved = true;
        alert("Đã lưu vào mục yêu thích!");
      }
      saveBtn.style.background = isSaved ? "#d32f2f" : "#333";
      const icon = saveBtn.querySelector("svg");
      if (icon) {
        icon.setAttribute("fill", isSaved ? "white" : "none");
      }
    };

    popup.onmouseenter = () => clearTimeout(hoverTimeoutRef.current);
    popup.onmouseleave = () => {
      hoverTimeoutRef.current = setTimeout(hideHoverPopup, 300);
    };
  };

  const hideHoverPopup = () => {
    if (hoverPopupRef.current) {
      try {
        if (hoverPopupRef.current.parentNode) {
          document.body.removeChild(hoverPopupRef.current);
        }
      } catch (err) {
        console.warn('Failed to remove hover popup:', err);
      }
      hoverPopupRef.current = null;
    }
  };

  const clearCurrentRoute = () => {
    if (currentRouteLayer.current) {
      mapInstance.current.removeLayer(currentRouteLayer.current);
      currentRouteLayer.current = null;
    }
  };

  const getCurrentUserPlaceFavorites = () => {
    if (!user?.userId) return [];
    return favoritePlacesByUser[user.userId] || [];
  };

  const getCurrentUserPhotoFavorites = () => {
    if (!user?.userId) return [];
    return favoritePhotosByUser[user.userId] || [];
  };

  const addPlaceToFavorites = (place) => {
    if (!user || !user.userId) {
      alert("Vui lòng đăng nhập để lưu địa điểm.");
      return false;
    }
    setFavoritePlacesByUser((prev) => {
      const current = Array.isArray(prev[user.userId]) ? prev[user.userId] : [];
      if (current.some((item) => item.id === place.id)) {
        return prev;
      }
      return {
        ...prev,
        [user.userId]: [...current, place],
      };
    });
    return true;
  };

  const removePlaceFromFavorites = (id) => {
    if (!user || !user.userId) return;
    setFavoritePlacesByUser((prev) => {
      const current = Array.isArray(prev[user.userId]) ? prev[user.userId] : [];
      const filtered = current.filter((item) => item.id !== id);
      if (filtered.length === current.length) return prev;
      return {
        ...prev,
        [user.userId]: filtered,
      };
    });
  };

  const handleToggleFavoritePlace = (place) => {
    if (!place) return;
    if (!user || !user.userId) {
      alert("Vui lòng đăng nhập để lưu địa điểm.");
      return;
    }
    setFavoritePlacesByUser((prev) => {
      const next = { ...prev };
      const list = Array.isArray(next[user.userId]) ? [...next[user.userId]] : [];
      const exists = list.findIndex((item) => item.id === place.id);
      if (exists >= 0) {
        list.splice(exists, 1);
      } else {
        list.push({
          id: place.id,
          title: place.title,
          address: place.address,
          rating: place.rating,
          reviews: place.reviews,
          desc: place.desc,
          image: place.image,
        });
      }
      next[user.userId] = list;
      return next;
    });
  };

  const handleToggleFavoritePhoto = (photo, placeInfo) => {
    if (!photo) return;
    if (!user || !user.userId) {
      alert("Vui lòng đăng nhập để lưu ảnh vào mục yêu thích.");
      return;
    }

    setFavoritePhotosByUser((prev) => {
      const next = { ...prev };
      const list = Array.isArray(next[user.userId]) ? [...next[user.userId]] : [];
      const rawId = photo.SubmissionID ?? photo.submissionId;
      const submissionId = rawId ? String(rawId) : `${Date.now()}-${Math.random()}`;
      const existingIndex = list.findIndex((item) => item.submissionId === submissionId);

      if (existingIndex >= 0) {
        list.splice(existingIndex, 1);
      } else {
        list.push({
          submissionId,
          ImagePath: photo.ImagePath || photo.imagePath || "",
          Year: photo.Year || photo.year || "Chưa rõ năm",
          submittedBy: photo.submittedBy || photo.userName || "Ẩn danh",
          locationId: placeInfo?.id ?? placeInfo?.LocationID ?? photo.LocationID ?? null,
          locationTitle: placeInfo?.title || placeInfo?.Name || placeInfo?.locationTitle || "Không rõ địa điểm",
          savedAt: Date.now(),
        });
      }

      next[user.userId] = list;
      return next;
    });
  };

  const updateCommunityPhotoGrid = (locationId, placeMeta = null) => {
    if (!sidebarRef.current) return;
    const container = sidebarRef.current.querySelector(
      `#community-photo-carousel[data-location-id="${locationId}"]`,
    );
    if (!container) return;

    const photos = communityPhotosRef.current.get(locationId) || [];
    if (!photos.length) {
      container.innerHTML =
        '<p style="margin:0;color:#777;font-size:0.9rem;">Chưa có ảnh nào được duyệt.</p>';
      return;
    }

    const placeInfo =
      placeMeta ||
      (currentPlace.current && currentPlace.current.id === locationId ? currentPlace.current : null) ||
      places.find((p) => p.id === locationId);
    const userPhotoFavorites = getCurrentUserPhotoFavorites();
    const savedPhotoIds = new Set(userPhotoFavorites.map((item) => item.submissionId));

    const slides = photos
      .map((photo, idx) => {
        const src = photo.ImagePath?.startsWith('http')
          ? photo.ImagePath
          : `${BASE_URL}${photo.ImagePath || ''}`;
        const yearLabel = photo.Year || 'Chưa rõ';
        const submittedBy = photo.submittedBy ? escapeHtml(photo.submittedBy) : 'Ẩn danh';
        const submissionId = String(photo.SubmissionID ?? photo.submissionId ?? idx);
        const isSaved = savedPhotoIds.has(submissionId);
        return `
          <div class="carousel-slide" data-index="${idx}" data-photo-id="${submissionId}" style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:${idx === 0 ? 1 : 0};transition:opacity 0.4s ease;">
            <img
              src="${src}"
              alt="Ảnh cộng đồng"
              style="width:100%;height:100%;object-fit:cover;border-radius:16px;cursor:pointer;"
              data-full="${src}"
              data-year="${yearLabel}"
              data-user="${submittedBy}"
              loading="lazy"
            />
            <button class="save-photo-btn" data-photo-id="${submissionId}" style="position:absolute;top:12px;right:12px;border:none;border-radius:999px;padding:6px 12px;font-size:0.8rem;font-weight:600;cursor:pointer;z-index:6;background:${
              isSaved ? '#1a73e8' : 'rgba(15,23,42,0.85)'
            };color:${isSaved ? '#fff' : '#f1f5f9'};">
              ${isSaved ? '★ Đã lưu' : '☆ Lưu ảnh'}
            </button>
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(15,23,42,0.85),transparent 55%);border-radius:16px;pointer-events:none;"></div>
            <div style="position:absolute;left:12px;right:12px;bottom:12px;color:#e5e7eb;font-size:0.8rem;display:flex;flex-direction:column;gap:4px;pointer-events:none;">
              <span style="font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">📷 Ảnh cộng đồng</span>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%;">👤 ${submittedBy}</span>
                <span style="padding:4px 10px;border-radius:999px;background:rgba(15,23,42,0.9);color:#facc15;font-weight:600;">📅 ${yearLabel}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="carousel-wrapper" style="position:relative;width:100%;height:220px;border-radius:18px;overflow:hidden;background:#020617;">
        ${slides}
        <button class="carousel-nav prev" style="position:absolute;top:50%;left:12px;transform:translateY(-50%);width:34px;height:34px;border:none;border-radius:50%;background:rgba(15,23,42,0.7);color:white;font-size:1.2rem;cursor:pointer;">‹</button>
        <button class="carousel-nav next" style="position:absolute;top:50%;right:12px;transform:translateY(-50%);width:34px;height:34px;border:none;border-radius:50%;background:rgba(15,23,42,0.7);color:white;font-size:1.2rem;cursor:pointer;">›</button>
        <div class="carousel-dots" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:6px;"></div>
      </div>
    `;

    const slidesEls = container.querySelectorAll('.carousel-slide');
    const dotsContainer = container.querySelector('.carousel-dots');
    let current = 0;

    dotsContainer.innerHTML = photos
      .map(
        (_, idx) =>
          `<span data-idx="${idx}" style="width:8px;height:8px;border-radius:50%;background:${
            idx === 0 ? '#1a73e8' : '#cbd5f5'
          };display:inline-block;"></span>`,
      )
      .join('');

    const dots = dotsContainer.querySelectorAll('span');

    const updateActiveSlide = (next) => {
      if (next < 0) next = slidesEls.length - 1;
      if (next >= slidesEls.length) next = 0;
      slidesEls[current].style.opacity = 0;
      slidesEls[current].style.pointerEvents = 'none';
      slidesEls[next].style.opacity = 1;
      slidesEls[next].style.pointerEvents = 'auto';
      dots[current].style.background = '#cbd5f5';
      dots[next].style.background = '#1a73e8';
      current = next;
    };

    container.querySelector('.prev')?.addEventListener('click', () => updateActiveSlide(current - 1));
    container.querySelector('.next')?.addEventListener('click', () => updateActiveSlide(current + 1));
    dots.forEach((dot, idx) => dot.addEventListener('click', () => updateActiveSlide(idx)));

    slidesEls.forEach((slide, idx) => {
      slide.style.cursor = 'pointer';
      slide.style.pointerEvents = idx === 0 ? 'auto' : 'none';
      slide.addEventListener('click', () => {
        openPhotoPreview({ photos, startIndex: idx });
      });
    });

    container.querySelectorAll('.save-photo-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const submissionId = btn.getAttribute('data-photo-id');
        const targetPhoto = photos.find(
          (p) => String(p.SubmissionID ?? p.submissionId ?? "") === submissionId,
        );
        handleToggleFavoritePhoto(targetPhoto, placeInfo);
        setTimeout(() => updateCommunityPhotoGrid(locationId, placeInfo), 50);
      });
    });
  };

  const refreshCommunityPhotos = async (locationId, placeMeta = null) => {
    try {
      const res = await axios.get(`${BASE_URL}/location-images/location/${locationId}`);
      communityPhotosRef.current.set(locationId, res.data || []);
    } catch (err) {
      console.error('Không tải được ảnh cộng đồng', err);
      communityPhotosRef.current.set(locationId, []);
    } finally {
      const meta =
        placeMeta ||
        (currentPlace.current && currentPlace.current.id === locationId ? currentPlace.current : null) ||
        places.find((p) => p.id === locationId);
      updateCommunityPhotoGrid(locationId, meta);
    }
  };

  const attachCommunityPhotoSection = (place) => {
    if (!sidebarRef.current) return;
    updateCommunityPhotoGrid(place.id, place);

    const uploadBtn = sidebarRef.current.querySelector('#open-photo-modal');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => openPhotoUploadModal(place));
    }
  };

  const showPlaceDetail = async (place, map) => {
    const isFavOpen = favoritesSidebarRef.current.style.display === "block";
    sidebarRef.current.style.left = isFavOpen ? "380px" : "100px";
    sidebarRef.current.style.display = "block";

    window.updateTopBarPosition();
    setTimeout(() => window.updateTopBarPosition(), 50);

    if (typeof window.currentRating === 'undefined') {
      window.currentRating = null; // ✅ ĐỔI 0 → null để validation chính xác
      console.log('🔢 Initialized window.currentRating: null');
    } else {
      console.log('✅ Keeping existing window.currentRating:', window.currentRating);
    }

    window.setStarRating = (rating) => {
      console.log('⭐ setStarRating CALLED:', rating);

      window.currentRating = rating;

      setNewRating(rating);

      console.log('✅ Rating saved - window:', window.currentRating, 'state will update to:', rating);

      for (let i = 1; i <= 5; i++) {
        const star = document.getElementById(`star-${i}`);
        if (star) {
          star.style.color = i <= rating ? "#ffca28" : "#ccc";
        }
      }
    };

    setTimeout(() => {
      const savedRating = window.currentRating ?? newRating ?? 0;
      if (savedRating > 0) {
        console.log('🎨 Restoring star colors for rating:', savedRating);
        for (let i = 1; i <= 5; i++) {
          const star = document.getElementById(`star-${i}`);
          if (star) {
            star.style.color = i <= savedRating ? "#ffca28" : "#ccc";
          }
        }
      }
    }, 100);

    let communityPhotos = [];

    try {
      const [reviewsRes, photosRes] = await Promise.all([
        axios.get(`${BASE_URL}/map-locations/${place.id}/feedback`),
        axios.get(`${BASE_URL}/location-images/location/${place.id}`),
      ]);
      setReviews(reviewsRes.data.map(r => ({
        rating: r.Rating,
        comment: r.Comment,
        timestamp: new Date(r.CreatedAt).toLocaleDateString('vi-VN'),
        userName: r.user?.FullName || 'Ẩn danh',
        avatar: r.user?.profile?.Avatar || '/img/default-avatar.png',
        likes: r.Likes || 0,
        images: r.ImageUrls ? JSON.parse(r.ImageUrls) : [],
        imagesApproved: !!r.ImagesApproved,
      })));
      communityPhotos = photosRes.data || [];
    } catch (error) {
      console.error("Error loading reviews/photos:", error);
      setReviews([]);
      communityPhotos = [];
    }
    communityPhotosRef.current.set(place.id, communityPhotos);

    const categoryName = place.categoryName || "Chưa phân loại";

    sidebarRef.current.innerHTML = `
      <div style="padding:20px;position:relative">
        <div onclick="window.closeSidebar()" style="position:absolute;top:16px;left:16px;width:36px;height:36px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:10">
          <span style="font-size:1.4rem;color:#5f6368;font-weight:bold">×</span>
        </div>

        <img src="${place.image ? `${BASE_URL}${place.image}` : "https://via.placeholder.com/360x180?text=Chưa+có+hình"}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:16px" />

        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px;">
          <h3 style="margin:0;font-size:1.2rem;color:#1a0dab;font-weight:600;flex:1;line-height:1.4;">
            ${place.title}
          </h3>
          <div style="background:#e8f0fe;padding:6px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;color:#1a73e8;white-space:nowrap;flex-shrink:0;">
            ${categoryName}
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:4px;margin-bottom:12px">
          <span style="color:#d50000;font-weight:bold;">${place.rating || 0}</span>
          ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(5 - Math.floor(place.rating || 0))}
          <span style="color:#666;font-size:0.9rem">(${place.reviews || 0} đánh giá)</span>
        </div>

        <p style="margin:12px 0;font-size:0.95rem;color:#333;line-height:1.5">${place.desc || "Mô tả chưa có"}</p>

        <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:2px solid #dadce0">
          <button id="overview-tab" style="flex:1;padding:10px;border:none;background:${activeTab === "overview" ? "#e8f0fe" : "#f8f9fa"};color:${activeTab === "overview" ? "#1a73e8" : "#333"};cursor:pointer;font-weight:${activeTab === "overview" ? "600" : "normal"};font-size:0.9rem">Tổng quan</button>
          <button id="reviews-tab" style="flex:1;padding:10px;border:none;background:${activeTab === "reviews" ? "#e8f0fe" : "#f8f9fa"};color:${activeTab === "reviews" ? "#1a73e8" : "#333"};cursor:pointer;font-weight:${activeTab === "reviews" ? "600" : "normal"};font-size:0.9rem">Đánh giá</button>
        </div>

        <div id="content-area">
          ${activeTab === "overview" ? `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
              <button id="get-directions-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">Đường đi</button>
              <button id="share-location-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">Chia sẻ</button>
              <button id="save-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">Lưu</button>
              <button id="compare-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">So sánh</button>
            </div>
            <div id="route-details" style="display:none;font-size:0.9rem;color:#555;margin:16px 0;line-height:1.6"></div>
            <div style="margin-top:20px;border-top:1px solid #e5e7eb;padding-top:16px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <h4 style="margin:0;font-size:1rem;color:#1a1c2b;">Ảnh cộng đồng</h4>
                <button id="open-photo-modal" style="padding:8px 14px;border:1px solid #1a73e8;background:#fff;color:#1a73e8;border-radius:999px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
                  <span>➕</span> Thêm ảnh
                </button>
              </div>
              <div id="community-photo-carousel" data-location-id="${place.id}" style="width:100%;height:220px;">
                ${communityPhotos.length ? '<!-- sẽ được cập nhật sau -->' : '<p style="margin:0;color:#777;font-size:0.9rem;">Chưa có ảnh nào được duyệt.</p>'}
              </div>
            </div>
          ` : `
            <div style="display:flex;flex-direction:column;align-items:center;width:100%;">
              <div style="background:#f1f1f1;padding:16px;border-radius:8px;width:100%;margin-bottom:16px;text-align:center;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-weight:600;">${(reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0).toFixed(1)}</span>
                  <span style="color:#777;">${reviews.length} đánh giá</span>
                </div>
                <div style="margin-top:8px;">
                  <span style="color:#ffca28;">${"★".repeat(Math.floor(reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0))}${"☆".repeat(5 - Math.floor(reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1) || 0))}</span>
                </div>
              </div>

              <!-- Histogram and Write review button -->
              <div style="width:100%;display:flex;gap:12px;margin-bottom:16px;align-items:flex-start;">
                <div style="flex:1;">
                  ${(() => {
                    const counts = [0,0,0,0,0];
                    reviews.forEach(rv => { counts[5 - rv.rating] = (counts[5 - rv.rating] || 0) + 1; });
                    const total = reviews.length || 1;
                    return `
                      <div style="display:flex;flex-direction:column;gap:6px;">
                        ${[5,4,3,2,1].map((star, idx) => {
                          const num = reviews.filter(r => r.rating === star).length;
                          const pct = Math.round((num / Math.max(reviews.length,1)) * 100);
                          return `
                            <div style="display:flex;align-items:center;gap:8px;">
                              <div style="width:36px">${star}★</div>
                              <div style="flex:1;background:#eee;border-radius:6px;height:10px;overflow:hidden;">
                                <div style="width:${pct}%;height:100%;background:#ffd54f;border-radius:6px"></div>
                              </div>
                              <div style="width:36px;text-align:right;color:#666">${pct}%</div>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    `;
                  })()}
                </div>
                <div style="width:160px;">
                  <button id="write-review-btn" style="width:100%;padding:12px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">Viết đánh giá</button>
                </div>
              </div>

              ${user && user.userId ? `
              <div style="width:100%;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <span>Đánh giá của bạn: </span>
                  <div id="star-rating" style="display:flex;gap:2px;">
                    ${[1, 2, 3, 4, 5].map(i => `
                      <span id="star-${i}" style="cursor:pointer;font-size:1.2rem;color:${i <= (window.currentRating || newRating || 0) ? "#ffca28" : "#ccc"};" onclick="window.setStarRating(${i})">★</span>
                    `).join("")}
                  </div>
                </div>
                <textarea id="comment-input" placeholder="Viết bình luận..." style="width:100%;height:80px;padding:8px;border:1px solid #ccc;border-radius:4px;margin-bottom:8px;resize:vertical;">${newComment}</textarea>
                <div style="margin-bottom:8px;">
                  <label for="review-images" style="display:block;font-size:0.9rem;margin-bottom:4px;color:#555;">Thêm ảnh (tùy chọn, tối đa 5):</label>
                  <input type="file" id="review-images" accept="image
  const showDetailModal = (place) => {
    if (modalRef.current) {
      document.body.removeChild(modalRef.current);
      document.body.removeChild(overlayRef.current);
    }

    const overlay = L.DomUtil.create("div", "modal-overlay");
    overlay.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:10001;cursor:pointer;`;
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    const modal = L.DomUtil.create("div", "detail-modal");
    modal.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:700px;max-height:80vh;background:white;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:10002;font-family:system-ui;display:flex;flex-direction:column;`;

    modal.innerHTML = `
      <div style="position:relative;">
        <div onclick="window.closeDetailModal()" style="position:absolute;top:12px;right:12px;width:36px;height:36px;background:rgba(0,0,0,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;">
          <span style="font-size:1.4rem;color:#666;">×</span>
        </div>
        <img src="${place.image ? `${BASE_URL}${place.image}` : "https://via.placeholder.com/700xauto?text=Chưa+có+hình"}" style="width:100%;height:auto;object-fit:contain;border-radius:12px;" />
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

  window.closeDetailModal = () => {
    if (modalRef.current) document.body.removeChild(modalRef.current);
    if (overlayRef.current) document.body.removeChild(overlayRef.current);
    modalRef.current = null;
    overlayRef.current = null;
  };

  const closePhotoUploadModal = () => {
    if (uploadModalRef.current) {
      document.body.removeChild(uploadModalRef.current);
      uploadModalRef.current = null;
    }
    if (uploadOverlayRef.current) {
      document.body.removeChild(uploadOverlayRef.current);
      uploadOverlayRef.current = null;
    }
  };

  const openPhotoUploadModal = (place) => {
    closePhotoUploadModal();

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePhotoUploadModal();
    });
    document.body.appendChild(overlay);
    uploadOverlayRef.current = overlay;

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;max-width:420px;background:white;border-radius:20px;padding:24px;box-shadow:0 24px 60px rgba(15,23,42,0.25);z-index:10002;';
    modal.innerHTML = `
      <button id="close-photo-modal" style="position:absolute;top:12px;right:12px;width:34px;height:34px;border:none;border-radius:50%;background:#f1f5f9;color:#475569;font-size:1.1rem;cursor:pointer;">×</button>
      <h2 style="margin:0 0 8px;font-size:1.4rem;color:#1f2937;">Thêm ảnh cộng đồng</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:0.95rem;">Chia sẻ khoảnh khắc của bạn tại <strong>${place.title}</strong>. Ảnh sẽ được kiểm duyệt trước khi hiển thị.</p>
      ${
        user && user.userId
          ? `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="display:block;font-weight:600;margin-bottom:6px;color:#1f2937;">Chọn ảnh *</label>
            <input type="file" id="photo-modal-file" accept="image
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

  const showFavoritesSidebar = () => {
    const userPhotoFavorites = getCurrentUserPhotoFavorites();
    const userPlaceFavorites = getCurrentUserPlaceFavorites();
    favoritesSidebarRef.current.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;font-size:1.4rem;font-weight:600;color:white;">Mục yêu thích</h3>
        <div onclick="window.closeFavoritesSidebar()" style="width:36px;height:36px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          <span style="font-size:1.6rem;color:#aaa;">×</span>
        </div>
      </div>
      <div style="margin-bottom:12px;font-size:0.9rem;color:#aaa;">
        Ảnh đã lưu: <span class="photo-fav-count" style="color:#0ff;">${userPhotoFavorites.length}</span>
      </div>
      <div id="favorite-photos-container" style="margin-bottom:16px;color:white;"></div>
      <div style="margin:16px 0;border-top:1px solid #333;"></div>
      <div style="margin-bottom:16px;font-size:0.9rem;color:#aaa;">
        Địa điểm đã lưu: <span class="fav-count" style="color:#0ff;">${userPlaceFavorites.length}</span>
      </div>
      <div id="favorites-list" style="color:white;"></div>
    `;

    const photoContainer = document.getElementById("favorite-photos-container");
    if (!user || !user.userId) {
      photoContainer.innerHTML = `<div style="color:#aaa;text-align:center;padding:16px;">Đăng nhập để lưu và xem ảnh yêu thích.</div>`;
    } else if (!userPhotoFavorites.length) {
      photoContainer.innerHTML = `<div style="color:#aaa;text-align:center;padding:16px;">Chưa có ảnh nào được lưu.</div>`;
    } else {
      photoContainer.innerHTML = userPhotoFavorites
        .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
        .map((photo) => {
          const src = photo.ImagePath?.startsWith('http')
            ? photo.ImagePath
            : `${BASE_URL}${photo.ImagePath || ''}`;
          return `
            <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #333;position:relative;cursor:pointer;" onclick="window.openFavoritePhoto('${photo.submissionId}')">
              <img src="${src}" style="width:72px;height:72px;object-fit:cover;border-radius:10px;" alt="Ảnh yêu thích" />
              <div style="flex:1;">
                <div style="font-weight:600;font-size:0.95rem;color:white;margin-bottom:4px;">${photo.locationTitle || 'Ảnh cộng đồng'}</div>
                <div style="font-size:0.85rem;color:#cbd5f5;margin-bottom:2px;">👤 ${photo.submittedBy || 'Ẩn danh'}</div>
                <div style="font-size:0.85rem;color:#facc15;">📅 ${photo.Year || 'Chưa rõ năm'}</div>
              </div>
              <div onclick="event.stopPropagation(); window.removeFavoritePhoto('${photo.submissionId}')" style="position:absolute;top:8px;right:0;width:28px;height:28px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </div>
            </div>
          `;
        })
        .join("");
    }

    const list = document.getElementById("favorites-list");
    if (userPlaceFavorites.length === 0) {
      list.innerHTML = `<div style="color:#aaa;text-align:center;padding:20px;">Chưa có địa điểm nào được lưu.</div>`;
    } else {
      list.innerHTML = userPlaceFavorites
        .map((fav) => {
          const place = places.find((p) => p.id === fav.id) || fav;
          return `
            <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #444;position:relative;">
              <img src="${place.image ? `${BASE_URL}${place.image}` : "https://via.placeholder.com/60x60?text=Chưa+có+hình"}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" />
              <div style="flex:1;cursor:pointer;" onclick="window.showPlaceFromFav(${place.id})">
                <div style="font-weight:600;font-size:1rem;color:white;">${place.title}</div>
                <div style="display:flex;align-items:center;gap:4px;font-size:0.85rem;color:#0ff;margin:4px 0;">
                  <span>${place.rating || 0}</span> ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(5 - Math.floor(place.rating || 0))}
                  <span style="color:#aaa;">(${place.reviews || 0})</span>
                </div>
                <div style="font-size:0.85rem;color:#aaa;">${place.desc || "Mô tả chưa có"}</div>
              </div>
              <div onclick="event.stopPropagation(); window.removeFromFavorites(${place.id})" style="position:absolute;top:12px;right:0;width:32px;height:32px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </div>
            </div>
          `;
        })
        .join("");
    }

    favoritesSidebarRef.current.style.display = "block";

    if (sidebarRef.current.style.display === "block") {
      sidebarRef.current.style.left = "380px";
    }

    window.updateTopBarPosition();
    setTimeout(() => window.updateTopBarPosition(), 50);
  };

  window.closeFavoritesSidebar = () => {
    favoritesSidebarRef.current.style.display = "none";

    if (sidebarRef.current.style.display === "block") {
      sidebarRef.current.style.left = "100px";
    }

    window.updateTopBarPosition();
    setTimeout(() => window.updateTopBarPosition(), 50);
  };

  window.removeFromFavorites = (id) => {
    removePlaceFromFavorites(id);
    setTimeout(showFavoritesSidebar, 0);
  };

  window.removeFavoritePhoto = (submissionId) => {
    if (!user || !user.userId) return;
    const normalizedId = String(submissionId);
    setFavoritePhotosByUser((prev) => {
      const next = { ...prev };
      const list = Array.isArray(next[user.userId])
        ? next[user.userId].filter((item) => item.submissionId !== normalizedId)
        : [];
      next[user.userId] = list;
      return next;
    });
    setTimeout(showFavoritesSidebar, 0);
  };

  window.openFavoritePhoto = (submissionId) => {
    const list = getCurrentUserPhotoFavorites();
    const index = list.findIndex((item) => item.submissionId === String(submissionId));
    if (index !== -1) {
      openPhotoPreview({ photos: list, startIndex: index });
    }
  };

  window.showPlaceFromFav = (id) => {
    const userPlaceFavorites = getCurrentUserPlaceFavorites();
    const place = places.find((p) => p.id === id) || userPlaceFavorites.find((f) => f.id === id);
    if (place) {
      currentPlace.current = place;
      clearCurrentRoute();
      showPlaceDetail(place, mapInstance.current);
      highlightMarker(place.id);
      favoritesSidebarRef.current.style.display = "block";
      sidebarRef.current.style.left = "380px";
      sidebarRef.current.style.display = "block";
    }
  };

  window.closeSidebar = () => {
    sidebarRef.current.style.display = "none";
    clearCurrentRoute();

    window.updateTopBarPosition();
    setTimeout(() => window.updateTopBarPosition(), 50);
  };

  useEffect(() => {
    if (!mapInstance.current || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (userMarker.current) {
          mapInstance.current.removeLayer(userMarker.current);
        }

        const icon = L.divIcon({
          html: `<div style="width:16px;height:16px;background:#4285f4;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
          className: "user-location-marker",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        userMarker.current = L.marker([lat, lng], { icon }).addTo(mapInstance.current);
        userMarker.current.bindPopup('<b style="color:#4285f4">Vị trí của bạn</b>').openPopup();
        mapInstance.current.setView([lat, lng], 14);
      },
      () => console.warn("Không thể lấy vị trí người dùng"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [mapInstance.current]);

  if (status === "failed") {
    return <div style={{ color: "red", padding: "20px" }}>Lỗi: {error}</div>;
  }

  return (
    <>
      <div
        ref={mapRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
        }}
      />

      {}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          position: "fixed",
          bottom: "145px", // Ngay trên zoom controls (3 nút + padding)
          right: "16px",
          zIndex: 10001,
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          border: "2px solid rgba(0,0,0,0.2)",
          backgroundColor: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          transition: "all 0.2s ease",
        }}
        title={isDarkMode ? "Bản đồ thường" : "Chế độ vệ tinh"}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f0f0f0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#fff";
        }}
      >
        🛰️
      </button>

      {}
      {comparePlace &&
        ReactDOM.createPortal(
          <CompareModal place={comparePlace} onClose={() => setComparePlace(null)} />,
          document.body
        )}
    </>
  );
};

export default MapPage;