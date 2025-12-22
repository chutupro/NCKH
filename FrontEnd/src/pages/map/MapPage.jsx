// src/pages/map/MapPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchMapLocations } from "./mapLocationsSlice";
import CompareModal from "./CompareModal";
import ShareModal from "./ShareModal";
import ReactDOM from "react-dom";
import axios from "axios";
import { useAppContext } from "../../context/useAppContext";
import getAiFeatureConfig, { getAiEndpointUrl } from "../../config/aiConfig";
import { useLocation } from "react-router-dom"; // ✅ Import useLocation để theo dõi URL changes

const BASE_URL = "http://localhost:3000";
const FAVORITE_PHOTOS_KEY = "favoritePhotosByUser";
const FAVORITE_PLACES_KEY = "favoritePlacesByUser";

/* ---------- FIX MARKER ICON (CHUẨN 100%) ---------- */
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

// Safe image URL helper: return absolute URL if provided, else prefix BASE_URL
const safeImageUrl = (img, fallback) => {
  if (!img) return fallback || "https://via.placeholder.com/260x120?text=Chưa+có+hình";
  const s = String(img || "");
  return s.startsWith("http") ? s : `${BASE_URL}${s}`;
};

// Helper: call AI moderation endpoint and normalize result
const moderateText = async (text) => {
  if (!text) return null;
  const aiConfig = getAiFeatureConfig();
  const moderateEnabled = aiConfig?.featureFlags?.moderateComment !== false;
  if (!moderateEnabled) return null;

  const moderateEndpoint = getAiEndpointUrl("moderateComment");
  if (!moderateEndpoint) return null;

  const res = await axios.post(moderateEndpoint, { text }, { timeout: 5000 });

  const data = res.data || {};

  // If the AI already returns action/label, trust it
  if (data.action || data.label) return data;

  // Fallback mapping from older AI shape (toxicity/categories)
  const toxicity = data.toxicity ?? 0;
  const categories = data.categories || [];

  if (toxicity > 0.6) return { action: "block", label: "toxic", detail: data };
  if (categories.includes("hate") || categories.includes("violence"))
    return { action: "allow", label: "hate", detail: data };
  if (toxicity > 0.4)
    return { action: "allow", label: "non_toxic", warn: true, detail: data };
  return { action: "allow", label: "non_toxic", detail: data };
};

/* ---------- COMPONENT ---------- */
const MapPage = () => {
  const dispatch = useDispatch();
  const location = useLocation(); // ✅ Hook để theo dõi URL changes
  const { places, status, error } = useSelector((state) => state.mapLocations);
  const { user, isAuthLoading } = useAppContext(); // ✅ LẤY USER + AUTH LOADING STATE

  // ✅ REF để đọc giá trị mới nhất trong event listeners (tránh stale closure)
  const userRef = useRef(user);
  const isAuthLoadingRef = useRef(isAuthLoading);

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
  const currentOpenPopupMarker = useRef(null); // ✅ Theo dõi marker có popup đang mở
  const placesRef = useRef([]); // ✅ Ref để lưu places mới nhất cho search

  /* ---------- STATE ---------- */
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
    // ✅ Lưu preference vào localStorage
    const saved = localStorage.getItem("mapDarkMode");
    return saved === "true";
  });
  const [isSidebarDark, setIsSidebarDark] = useState(() => {
    // ✅ Dark mode cho sidebar
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLocation, setShareLocation] = useState(null);
  const [shareMapPosition, setShareMapPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // Lưu vị trí người dùng
  const [pendingLocationId, setPendingLocationId] = useState(null); // Lưu locationId từ URL

  useEffect(() => {
    localStorage.setItem(
      FAVORITE_PLACES_KEY,
      JSON.stringify(favoritePlacesByUser)
    );
  }, [favoritePlacesByUser]);

  useEffect(() => {
    localStorage.setItem(
      FAVORITE_PHOTOS_KEY,
      JSON.stringify(favoritePhotosByUser)
    );
  }, [favoritePhotosByUser]);

  // ✅ Sync refs with latest state values (để tránh stale closure trong event listeners)
  useEffect(() => {
    userRef.current = user;
    isAuthLoadingRef.current = isAuthLoading;
  }, [user, isAuthLoading]);

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  useEffect(() => {
    localStorage.setItem(
      FAVORITE_PLACES_KEY,
      JSON.stringify(favoritePlacesByUser)
    );
  }, [favoritePlacesByUser]);

  useEffect(() => {
    localStorage.setItem(
      FAVORITE_PHOTOS_KEY,
      JSON.stringify(favoritePhotosByUser)
    );
  }, [favoritePhotosByUser]);

  useEffect(() => {
    if (currentPlace.current) {
      updateCommunityPhotoGrid(currentPlace.current.id, currentPlace.current);
    }
  }, [favoritePhotosByUser]);

  /* ---------- CẬP NHẬT LẠI UI KHI USER THAY ĐỔI ---------- */
  useEffect(() => {
    // Khi user thay đổi (login/logout/switch account), cập nhật lại carousel
    if (currentPlace.current) {
      updateCommunityPhotoGrid(currentPlace.current.id, currentPlace.current);
    }
  }, [user?.userId]);

  /* ---------- KIỂM TRA REDIRECT SAU KHI LOGIN ---------- */
  useEffect(() => {
    if (!user || !user.userId) return;

    // Kiểm tra xem có địa điểm cần quay lại không
    const returnToPlaceData = localStorage.getItem("returnToPlace");
    if (!returnToPlaceData) return;

    try {
      const placeData = JSON.parse(returnToPlaceData);
      // Kiểm tra timestamp để tránh dữ liệu cũ (chỉ trong vòng 10 phút)
      if (Date.now() - placeData.timestamp > 10 * 60 * 1000) {
        localStorage.removeItem("returnToPlace");
        return;
      }

      // Xóa dữ liệu sau khi đọc
      localStorage.removeItem("returnToPlace");

      // Tìm địa điểm trong danh sách places
      const placeToOpen = places.find((p) => p.id === placeData.placeId);
      if (placeToOpen) {
        // Set activeTab thành reviews nếu user muốn đánh giá
        if (placeData.openReviewTab) {
          setActiveTab("reviews");
        }
        // Mở sidebar cho địa điểm đó sau 500ms để đảm bảo map đã load xong
        setTimeout(() => {
          showPlaceDetail(placeToOpen, mapInstance.current);
        }, 500);
      }
    } catch (error) {
      console.error("Error parsing returnToPlace data:", error);
      localStorage.removeItem("returnToPlace");
    }
  }, [user, places]);

  /* ---------- XỬ LÝ URL PARAMETERS KHI CHIA SẺ ĐỊA ĐIỂM ---------- */
  // Bước 1: Đọc locationId hoặc search từ URL mỗi khi URL thay đổi
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const locationId = urlParams.get("locationId");
    const searchTerm = urlParams.get("search");
    
    console.log('📌 [MapPage Step 1] Reading URL params:', { locationId, searchTerm, fullSearch: location.search });
    
    if (locationId) {
      console.log("📌 [MapPage] Detected locationId from URL:", locationId);
      setPendingLocationId(locationId);
    } else if (searchTerm) {
      console.log("📌 [MapPage] Detected search term from URL:", searchTerm);
      setSearchQuery(searchTerm); // Set search query
      setPendingLocationId(null); // Clear pending location
    } else {
      setPendingLocationId(null); // Clear nếu không có params
    }
  }, [location.search]); // ✅ Chạy lại mỗi khi URL search thay đổi
  
  // Bước 2: Tự động search khi có searchQuery và places đã load
  useEffect(() => {
    if (!searchQuery || !places || places.length === 0 || !mapInstance.current) return;
    
    // Kiểm tra xem có phải search từ URL không (để tự động trigger)
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get("search");
    
    if (searchTerm && searchQuery === searchTerm) {
      console.log("🔍 [MapPage] Auto-searching for:", searchQuery);
      
      // Tìm kiếm địa điểm
      const query = searchQuery.toLowerCase();
      const matches = places.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const address = (p.address || "").toLowerCase();
        const desc = (p.desc || "").toLowerCase();
        return title.includes(query) || address.includes(query) || desc.includes(query);
      });
      
      if (matches.length > 0) {
        const place = matches[0];
        console.log("✅ [MapPage] Found place:", place.title);
        
        // Zoom đến địa điểm
        mapInstance.current.setView([place.position[0], place.position[1]], 17, { animate: true });
        
        // Hiển thị chi tiết
        setTimeout(() => {
          showPlaceDetail(place, mapInstance.current);
        }, 1000);
        
        // Clear URL search param
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.log("❌ [MapPage] No place found for:", searchQuery);
      }
    }
  }, [searchQuery, places, mapInstance.current]);
  
  // Bước 3: Xử lý pending locationId khi map và places đã sẵn sàng
  useEffect(() => {
    console.log('🔄 [MapPage Step 3] Checking conditions:', {
      hasMap: !!mapInstance.current,
      placesCount: places?.length || 0,
      pendingLocationId
    });
    
    // Chỉ chạy khi map và places đã load VÀ có pendingLocationId
    if (!mapInstance.current || !places || places.length === 0 || !pendingLocationId) {
      if (pendingLocationId && (!mapInstance.current || !places || places.length === 0)) {
        console.log('⏳ [MapPage] Waiting for map and places to load...', {
          hasMap: !!mapInstance.current,
          placesCount: places?.length || 0,
          pendingLocationId
        });
      }
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const locationId = pendingLocationId;
      const locationName = urlParams.get("locationName");
      const lat = parseFloat(urlParams.get("lat"));
      const lng = parseFloat(urlParams.get("lng"));
      const zoom = parseInt(urlParams.get("zoom")) || 15;

      console.log("📍 [MapPage] Processing location:", {
        locationId,
        locationName,
        lat,
        lng,
        zoom,
        placesAvailable: places.length
      });

      // Tìm địa điểm trong danh sách
      let targetPlace = null;
      if (locationId) {
        targetPlace = places.find((p) => String(p.id) === String(locationId));
        console.log(`🔍 [MapPage] Searching for locationId=${locationId}:`, 
          targetPlace ? `Found: ${targetPlace.title}` : 'NOT FOUND',
          `\nAvailable places:`, places.map(p => ({ id: p.id, title: p.title }))
        );
      }

      // Nếu có tọa độ, fly đến vị trí đó
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        mapInstance.current.flyTo([lat, lng], zoom, {
          duration: 1.5,
          easeLinearity: 0.25,
        });

        // Nếu tìm thấy địa điểm, mở sidebar sau khi map đã fly xong
        if (targetPlace) {
          setTimeout(() => {
            showPlaceDetail(targetPlace, mapInstance.current);
          }, 1800);
        } else if (locationName) {
          // Nếu không tìm thấy trong danh sách nhưng có tên, hiển thị marker tạm
          console.log("📌 Showing temporary marker for:", locationName);
          L.marker([lat, lng])
            .addTo(mapInstance.current)
            .bindPopup(`<b>${locationName}</b><br>Địa điểm được chia sẻ`)
            .openPopup();
        }
      } else if (targetPlace) {
        // Không có tọa độ nhưng có địa điểm
        const placePos = targetPlace.position;
        console.log('🎯 [MapPage] Using targetPlace position:', {
          title: targetPlace.title,
          position: placePos,
          hasMap: !!mapInstance.current
        });
        
        if (placePos && placePos.length === 2) {
          const currentCenter = mapInstance.current.getCenter();
          const currentZoom = mapInstance.current.getZoom();
          console.log('✈️ [MapPage] Flying from:', [currentCenter.lat, currentCenter.lng], 'zoom:', currentZoom);
          console.log('✈️ [MapPage] Flying to:', placePos, 'zoom: 18');
          
          mapInstance.current.flyTo(placePos, 18, {
            duration: 2,
            easeLinearity: 0.25,
          });
          
          setTimeout(() => {
            console.log('📱 [MapPage] Opening sidebar for:', targetPlace.title);
            showPlaceDetail(targetPlace, mapInstance.current);
          }, 2200);
        } else {
          console.log('❌ [MapPage] Invalid position:', placePos);
        }
      }

      // Clear pending locationId sau khi xử lý
      setPendingLocationId(null);
      
      // Xóa parameters khỏi URL sau khi xử lý (optional - giữ URL clean)
      // window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Error handling shared location:", error);
      setPendingLocationId(null);
    }
  }, [places, mapInstance.current, pendingLocationId]);

  // ✅ RE-RENDER FORM ĐÁNH GIÁ SAU KHI USER RESTORE (KHÔNG RESET RATING)
  useEffect(() => {
    if (!user || !user.userId) return;
    if (!sidebarRef.current) return;
    if (!currentPlace.current) return;

    const isVisible =
      sidebarRef.current.style && sidebarRef.current.style.display === "block";
    if (!isVisible) return;

    // Chỉ update nếu đang ở tab reviews
    if (activeTab !== "reviews") return;

    console.log(
      "🔄 [User Restored] Updating review form for user:",
      user.email
    );

    // Delay để đảm bảo DOM đã ready
    const timer = setTimeout(() => {
      try {
        // Tìm content area
        const contentArea = sidebarRef.current.querySelector(
          '#reviews-tab-content, [style*="display:flex;flex-direction:column"]'
        );
        if (!contentArea) return;

        // Kiểm tra xem có đang hiển thị "Vui lòng đăng nhập" không
        const loginPrompt = contentArea.querySelector("#login-to-review-link");
        if (!loginPrompt) return; // Form đã đúng rồi

        console.log(
          "✅ [User Restored] Replacing login prompt with review form"
        );

        // Replace login prompt với form đánh giá
        const loginPromptContainer = loginPrompt.closest(
          '[style*="background:#fff3cd"]'
        );
        if (loginPromptContainer && loginPromptContainer.parentNode) {
          // Lấy rating hiện tại (nếu có)
          const savedRating = window.currentRating ?? newRating ?? 0;

          const reviewFormHTML = `
            <div style="width:100%;margin-bottom:16px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span>Đánh giá của bạn: </span>
                <div id="star-rating" style="display:flex;gap:2px;">
                  ${[1, 2, 3, 4, 5]
                    .map(
                      (i) =>
                        `<span id="star-${i}" style="cursor:pointer;font-size:1.2rem;color:${
                          i <= savedRating ? "#ffca28" : "#ccc"
                        };" onclick="window.setStarRating(${i})">★</span>`
                    )
                    .join("")}
                </div>
              </div>
              <textarea id="comment-input" placeholder="Viết bình luận..." style="width:100%;height:80px;padding:8px;border:1px solid #ccc;border-radius:4px;margin-bottom:8px;resize:vertical;">${newComment}</textarea>
              <div style="margin-bottom:8px;">
                <label for="review-images" style="display:block;font-size:0.9rem;margin-bottom:4px;color:#555;">Thêm ảnh (tùy chọn, tối đa 5):</label>
                <input type="file" id="review-images" accept="image/*" multiple style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;" />
                <div id="image-preview" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;"></div>
              </div>
              <button id="submit-review-btn" style="width:100%;padding:10px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Gửi đánh giá</button>
            </div>
          `;

          loginPromptContainer.outerHTML = reviewFormHTML;

          // ✅ KHÔI PHỤC LẠI window.currentRating (QUAN TRỌNG!)
          if (savedRating > 0) {
            window.currentRating = savedRating;
            console.log(
              "🔄 [User Restored] Restored window.currentRating:",
              savedRating
            );
          }

          // Re-attach event listeners
          const submitBtn = document.getElementById("submit-review-btn");
          const imageInput = document.getElementById("review-images");
          const imagePreview = document.getElementById("image-preview");

          if (submitBtn) {
            // Attach image input preview handler
            if (imageInput) {
              imageInput.addEventListener("change", (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 5) {
                  alert("⚠️ Chỉ được chọn tối đa 5 ảnh!");
                  imageInput.value = "";
                  return;
                }

                // Show preview
                if (imagePreview) {
                  imagePreview.innerHTML = files
                    .map(
                      (f, idx) => `
                    <div style="position:relative;width:80px;height:80px;">
                      <img src="${URL.createObjectURL(
                        f
                      )}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:1px solid #ccc" />
                      <span style="position:absolute;top:-6px;right:-6px;background:#666;color:white;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;cursor:pointer;" data-remove-idx="${idx}">✕</span>
                    </div>
                  `
                    )
                    .join("");

                  // Attach remove handlers
                  imagePreview
                    .querySelectorAll("[data-remove-idx]")
                    .forEach((btn) => {
                      btn.addEventListener("click", () => {
                        const idx = parseInt(
                          btn.getAttribute("data-remove-idx")
                        );
                        const dt = new DataTransfer();
                        Array.from(imageInput.files).forEach((f, i) => {
                          if (i !== idx) dt.items.add(f);
                        });
                        imageInput.files = dt.files;
                        imageInput.dispatchEvent(new Event("change"));
                      });
                    });
                }
              });
            }

            // Attach stars click handlers
            for (let i = 1; i <= 5; i++) {
              const star = document.getElementById(`star-${i}`);
              if (star) {
                star.addEventListener("click", () => {
                  console.log("⭐ Star clicked:", i);
                  window.setStarRating(i);
                });
              }
            }

            // Attach submit handler
            submitBtn.addEventListener("click", async () => {
              const commentInput = document.getElementById("comment-input");
              const comment = commentInput?.value?.trim();

              const currentRating = window.currentRating ?? newRating;

              console.log("📊 [SUBMIT] Rating check:", {
                "window.currentRating": window.currentRating,
                "newRating state": newRating,
                "final currentRating": currentRating,
                type: typeof currentRating,
                comment: comment?.substring(0, 30),
              });

              if (
                currentRating === null ||
                currentRating === undefined ||
                currentRating < 1 ||
                currentRating > 5
              ) {
                console.error("❌ Rating validation failed:", {
                  currentRating,
                  windowCurrentRating: window.currentRating,
                  newRatingState: newRating,
                  type: typeof currentRating,
                  isNull: currentRating === null,
                  isUndefined: currentRating === undefined,
                });
                alert(
                  "🌟 Vui lòng chọn số sao (1-5 sao) trước khi gửi đánh giá!"
                );
                return;
              }
              if (!comment) {
                alert("💬 Vui lòng nhập bình luận!");
                return;
              }

              try {
                console.log("🚀 [SUBMIT] Sending to API:", {
                  userId: user.userId,
                  rating: currentRating,
                  comment: comment,
                  endpoint: `${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`,
                });

                // ✅ AI MODERATE COMMENT (standardized)
                let aiAnalysis = null;
                let moderationForSend = null;
                try {
                  const mod = await moderateText(comment);
                  aiAnalysis = mod?.detail || mod;
                  if (mod) {
                    if (mod.action === "block" || mod.label === "toxic") {
                      alert(
                        "⚠️ Bình luận có nội dung không phù hợp. Vui lòng điều chỉnh!"
                      );
                      const commentInput =
                        document.getElementById("comment-input");
                      if (commentInput) commentInput.value = "";
                      setNewComment("");
                      return;
                    }

                    if (mod.warn) {
                      const confirmSend = confirm(
                        "⚠️ Bình luận có thể không phù hợp. Bạn có chắc muốn gửi?"
                      );
                      if (!confirmSend) return;
                    }

                    if (mod.label === "hate") {
                      moderationForSend = mod.detail || mod;
                    }
                  }
                } catch (aiError) {
                  console.error(
                    "❌ [AI] Moderate error:",
                    aiError?.message || aiError
                  );
                  alert(
                    "❌ AI kiểm duyệt không khả dụng. Vui lòng thử lại sau!\n\nLỗi: " +
                      (aiError?.message || aiError)
                  );
                  return;
                }

                // ✅ Build FormData to send images + data
                const formData = new FormData();
                formData.append("userId", user.userId);
                formData.append("rating", currentRating);
                formData.append("comment", comment);
                if (moderationForSend) {
                  formData.append(
                    "moderation",
                    JSON.stringify(moderationForSend)
                  );
                }

                // Add images if selected
                if (imageInput?.files) {
                  Array.from(imageInput.files).forEach((file) => {
                    formData.append("images", file);
                  });
                }

                await axios.post(
                  `${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`,
                  formData,
                  {
                    headers: { "Content-Type": "multipart/form-data" },
                  }
                );

                console.log("✅ [SUBMIT] Review submitted successfully!");

                // Reset form
                setNewRating(null);
                setNewComment("");
                window.currentRating = null;
                if (commentInput) commentInput.value = "";
                if (imageInput) imageInput.value = "";
                if (imagePreview) imagePreview.innerHTML = "";

                // Reset màu sao
                for (let i = 1; i <= 5; i++) {
                  const star = document.getElementById(`star-${i}`);
                  if (star) star.style.color = "#ccc";
                }

                // Reload reviews
                const reviewsRes = await axios.get(
                  `${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`
                );
                const newReviewsList = reviewsRes.data.map((r) => ({
                  FeedbackID: r.FeedbackID,
                  rating: r.Rating,
                  comment: r.Comment,
                  timestamp: new Date(r.CreatedAt).toLocaleDateString("vi-VN"),
                  userName: r.user?.FullName || "Ẩn danh",
                  avatar: r.user?.profile?.Avatar || "/img/default-avatar.png",
                  likes: r.Likes || 0,
                  images: r.ImageUrls ? JSON.parse(r.ImageUrls) : [],
                  imagesApproved: !!r.ImagesApproved,
                }));

                setReviews(newReviewsList);

                console.log(
                  "✅ [SUBMIT] Reviews updated:",
                  newReviewsList.length,
                  "total reviews"
                );

                // ✅ CẬP NHẬT RATING SUMMARY TRỰC TIẾP
                setTimeout(() => {
                  const avgRating =
                    newReviewsList.length > 0
                      ? (
                          newReviewsList.reduce((sum, r) => sum + r.rating, 0) /
                          newReviewsList.length
                        ).toFixed(1)
                      : "0.0";

                  const ratingSummary = document.querySelector(
                    ".rating-summary-container"
                  );
                  if (ratingSummary) {
                    ratingSummary.innerHTML = `
                      <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-weight:600;">${avgRating}</span>
                        <span style="color:#777;">${
                          newReviewsList.length
                        } đánh giá</span>
                      </div>
                      <div style="margin-top:8px;">
                        <span style="color:#ffca28;">${"★".repeat(
                          Math.floor(parseFloat(avgRating))
                        )}${"☆".repeat(
                      5 - Math.floor(parseFloat(avgRating))
                    )}</span>
                      </div>
                    `;
                    console.log("✅ Rating summary updated to:", avgRating);
                  }

                  const histogram = document.querySelector(".rating-histogram");
                  if (histogram && newReviewsList.length > 0) {
                    const histogramHTML = [5, 4, 3, 2, 1]
                      .map((star) => {
                        const num = newReviewsList.filter(
                          (r) => r.rating === star
                        ).length;
                        const pct = Math.round(
                          (num / newReviewsList.length) * 100
                        );
                        return `
                        <div style="display:flex;align-items:center;gap:8px;">
                          <div style="width:36px">${star}★</div>
                          <div style="flex:1;background:#eee;border-radius:6px;height:10px;overflow:hidden;">
                            <div style="width:${pct}%;height:100%;background:#ffd54f;border-radius:6px"></div>
                          </div>
                          <div style="width:36px;text-align:right;color:#666">${pct}%</div>
                        </div>
                      `;
                      })
                      .join("");
                    histogram.innerHTML = histogramHTML;
                    console.log("✅ Histogram updated");
                  }
                }, 150);

                // Update reviews list in DOM immediately (with avatar + like button)
                const reviewsList = document.getElementById("reviews-list");
                if (reviewsList) {
                  reviewsList.innerHTML =
                    newReviewsList.length > 0
                      ? newReviewsList
                          .map(
                            (r) => `
                    <div style="padding:12px;border-bottom:1px solid #eee;display:flex;gap:12px;align-items:flex-start;">
                      <img src="${
                        r.avatar
                      }" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0" />
                      <div style="flex:1;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px;">
                          <div>
                            <div style="font-weight:600;color:#333">${
                              r.userName || "Ẩn danh"
                            }</div>
                            <div style="color:#ffca28;">${"★".repeat(
                              r.rating
                            )}${"☆".repeat(5 - r.rating)}</div>
                          </div>
                          <div style="display:flex;align-items:center;gap:8px">
                            <button class="like-btn" data-feedback-id="${
                              r.FeedbackID || ""
                            }" style="background:transparent;border:none;cursor:pointer;color:#666;display:flex;align-items:center;gap:6px">👍 <span class="like-count">${
                              r.likes
                            }</span></button>
                          </div>
                        </div>
                        <p style="margin:4px 0;color:#555;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;">${
                          r.comment
                        }</p>
                        ${
                          r.images && r.images.length > 0 && r.imagesApproved
                            ? `
                          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                            ${r.images
                              .map(
                                (img) =>
                                  `<img src="${
                                    img.startsWith("http")
                                      ? img
                                      : `${BASE_URL}${img}`
                                  }" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee"/>`
                              )
                              .join("")}
                          </div>
                        `
                            : ""
                        }
                        <div style="font-size:0.8rem;color:#888;margin-top:8px;">${
                          r.timestamp
                        }</div>
                      </div>
                    </div>
                  `
                          )
                          .join("")
                      : '<p style="text-align:center;color:#999;padding:20px;">Chưa có đánh giá nào</p>';

                  // Attach like button handlers
                  const likeButtons = reviewsList.querySelectorAll(".like-btn");
                  likeButtons.forEach((btn) => {
                    btn.addEventListener("click", async (e) => {
                      e.preventDefault();
                      const fid = btn.getAttribute("data-feedback-id");
                      if (!fid) return;
                      const countSpan = btn.querySelector(".like-count");
                      // Optimistic UI
                      const current =
                        parseInt(countSpan.textContent || "0", 10) || 0;
                      countSpan.textContent = (current + 1).toString();
                      try {
                        await axios.post(
                          `${BASE_URL}/map-locations/${place.id}/feedback/${fid}/like`
                        );
                      } catch (err) {
                        console.error("Like failed", err);
                        countSpan.textContent = current.toString();
                        alert("Không thể like, thử lại sau");
                      }
                    });
                  });
                }

                // ✅ No success message (user doesn't want it)
              } catch (error) {
                console.error("Error submitting review:", error);
                alert(
                  `Có lỗi khi gửi đánh giá: ${
                    error.response?.data?.message || error.message
                  }`
                );
              }
            });
          }
        }
      } catch (err) {
        console.error("Error updating review form:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [user?.userId, activeTab]);

  // ✅ HANDLE isAuthLoading CHANGES - FIX "Đang kiểm tra đăng nhập..." STUCK
  useEffect(() => {
    console.log("🔍 [isAuthLoading useEffect] Triggered:", {
      isAuthLoading,
      activeTab,
      userEmail: user?.email,
    });

    if (isAuthLoading) return; // Chỉ chạy khi isAuthLoading = false
    if (!sidebarRef.current) return;
    if (!currentPlace.current) return;

    const isVisible =
      sidebarRef.current.style && sidebarRef.current.style.display === "block";
    if (!isVisible) {
      console.log("⚠️ [isAuthLoading=false] Sidebar not visible, skipping");
      return;
    }

    // Chỉ update nếu đang ở tab reviews
    if (activeTab !== "reviews") {
      console.log("⚠️ [isAuthLoading=false] Not on reviews tab, skipping");
      return;
    }

    console.log(
      "🔄 [isAuthLoading=false] Updating review form. User:",
      user?.email || "null"
    );

    // Delay để đảm bảo DOM đã ready
    const timer = setTimeout(() => {
      try {
        // Tìm content area
        const contentArea = sidebarRef.current.querySelector(
          '#reviews-tab-content, [style*="display:flex;flex-direction:column"]'
        );
        if (!contentArea) return;

        // Kiểm tra xem có đang hiển thị "Đang kiểm tra đăng nhập..." không
        // Spinner có text trong <p> tag
        const loadingText = Array.from(contentArea.querySelectorAll("p")).find(
          (p) => p.textContent.includes("Đang kiểm tra đăng nhập")
        );
        if (!loadingText) {
          console.log(
            "✅ [isAuthLoading=false] No loading spinner found, DOM already updated"
          );
          return; // Không còn spinner
        }

        // Tìm container div chứa spinner (parent of <p>)
        const loadingSpinner = loadingText.closest(
          'div[style*="text-align:center"]'
        );
        if (!loadingSpinner) {
          console.log(
            "⚠️ [isAuthLoading=false] Found loading text but no container div"
          );
          return;
        }

        console.log(
          "✅ [isAuthLoading=false] Removing loading spinner and showing form/login prompt"
        );

        // Xác định nội dung thay thế dựa trên user state
        let replacementHTML = "";

        if (user && user.userId) {
          // User đã đăng nhập - hiển thị form đánh giá
          const savedRating = window.currentRating ?? newRating ?? 0;

          replacementHTML = `
            <div style="width:100%;margin-bottom:16px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span>Đánh giá của bạn: </span>
                <div id="star-rating" style="display:flex;gap:2px;">
                  ${[1, 2, 3, 4, 5]
                    .map(
                      (i) =>
                        `<span id="star-${i}" style="cursor:pointer;font-size:1.2rem;color:${
                          i <= savedRating ? "#ffca28" : "#ccc"
                        };" onclick="window.setStarRating(${i})">★</span>`
                    )
                    .join("")}
                </div>
              </div>
              <textarea id="comment-input" placeholder="Viết bình luận..." style="width:100%;height:80px;padding:8px;border:1px solid #ccc;border-radius:4px;margin-bottom:8px;resize:vertical;">${newComment}</textarea>
              <div style="margin-bottom:8px;">
                <label for="review-images" style="display:block;font-size:0.9rem;margin-bottom:4px;color:#555;">Thêm ảnh (tùy chọn, tối đa 5):</label>
                <input type="file" id="review-images" accept="image/*" multiple style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;" />
                <div id="image-preview" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;"></div>
              </div>
              <button id="submit-review-btn" style="width:100%;padding:10px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Gửi đánh giá</button>
            </div>
          `;
        } else {
          // User chưa đăng nhập - hiển thị login prompt
          replacementHTML = `
            <div style="width:100%;background:#fff3cd;border-left:4px solid #ffc107;padding:12px;border-radius:4px;margin-bottom:12px;">
              <p style="margin:0;font-size:0.9rem;color:#856404;">
                Vui lòng <a href="#" id="login-to-review-link" style="color:#007bff;text-decoration:underline;cursor:pointer;">đăng nhập</a> để viết đánh giá.
              </p>
            </div>
          `;
        }

        // Replace loading spinner
        const spinnerContainer = loadingSpinner.closest("div");
        if (spinnerContainer && spinnerContainer.parentNode) {
          spinnerContainer.outerHTML = replacementHTML;

          // ✅ RE-ATTACH EVENT LISTENERS
          if (user && user.userId) {
            // Restore window.currentRating
            const savedRating = window.currentRating ?? newRating ?? 0;
            if (savedRating > 0) {
              window.currentRating = savedRating;
              console.log(
                "🔄 [isAuthLoading=false] Restored window.currentRating:",
                savedRating
              );
            }

            // Re-attach event listeners for review form
            const submitBtn = document.getElementById("submit-review-btn");
            const imageInput = document.getElementById("review-images");
            const imagePreview = document.getElementById("image-preview");

            if (imageInput) {
              imageInput.addEventListener("change", (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 5) {
                  alert("⚠️ Chỉ được chọn tối đa 5 ảnh!");
                  imageInput.value = "";
                  return;
                }

                // Show preview
                if (imagePreview) {
                  imagePreview.innerHTML = files
                    .map(
                      (f, idx) => `
                    <div style="position:relative;width:80px;height:80px;">
                      <img src="${URL.createObjectURL(
                        f
                      )}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:1px solid #ccc" />
                      <span style="position:absolute;top:-6px;right:-6px;background:#666;color:white;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;cursor:pointer;" data-remove-idx="${idx}">✕</span>
                    </div>
                  `
                    )
                    .join("");

                  // Attach remove handlers
                  imagePreview
                    .querySelectorAll("[data-remove-idx]")
                    .forEach((btn) => {
                      btn.addEventListener("click", () => {
                        const idx = parseInt(
                          btn.getAttribute("data-remove-idx")
                        );
                        const dt = new DataTransfer();
                        Array.from(imageInput.files).forEach((f, i) => {
                          if (i !== idx) dt.items.add(f);
                        });
                        imageInput.files = dt.files;
                        imageInput.dispatchEvent(new Event("change"));
                      });
                    });
                }
              });
            }

            // Attach stars click handlers
            for (let i = 1; i <= 5; i++) {
              const star = document.getElementById(`star-${i}`);
              if (star) {
                star.addEventListener("click", () => {
                  console.log("⭐ Star clicked:", i);
                  window.setStarRating(i);
                });
              }
            }

            // Attach submit handler (simplified - full logic already exists in original code)
            if (submitBtn) {
              submitBtn.addEventListener("click", async () => {
                const commentInput = document.getElementById("comment-input");
                const comment = commentInput?.value?.trim();
                const currentRating = window.currentRating ?? newRating;

                if (!currentRating || currentRating < 1 || currentRating > 5) {
                  alert(
                    "🌟 Vui lòng chọn số sao (1-5 sao) trước khi gửi đánh giá!"
                  );
                  return;
                }
                if (!comment) {
                  alert("💬 Vui lòng nhập bình luận!");
                  return;
                }

                // Handle image upload and submission
                const files = imageInput ? Array.from(imageInput.files) : [];

                try {
                  submitBtn.disabled = true;
                  submitBtn.textContent = "Đang phân tích...";

                  // ✅ BLACKLIST WORDS - Chặn các từ vi phạm phổ biến
                  const blacklistWords = [
                    "cc",
                    "dm",
                    "vl",
                    "cl",
                    "dcm",
                    "vcl",
                    "dit",
                    "dít",
                    "lồn",
                    "lon",
                    "cu",
                    "cac",
                    "cặc",
                    "buoi",
                    "bươi",
                    "fuck",
                    "shit",
                    "damn",
                    "bitch",
                    "ass",
                    "dick",
                    "ngu",
                    "nứu",
                    "cho",
                    "chó",
                    "pig",
                    "dog",
                    "cứt",
                    "đéo",
                    "deo",
                  ];

                  const commentLower = comment.toLowerCase().trim();
                  const hasBlacklistWord = blacklistWords.some((word) => {
                    // Match từ độc lập hoặc trong chuỗi
                    return (
                      commentLower === word ||
                      commentLower.includes(` ${word} `) ||
                      commentLower.startsWith(`${word} `) ||
                      commentLower.endsWith(` ${word}`) ||
                      commentLower.includes(word)
                    );
                  });

                  if (hasBlacklistWord) {
                    console.log(
                      "⚠️ [BLACKLIST] Comment contains blacklisted word:",
                      commentLower
                    );
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Gửi đánh giá";
                    alert(
                      "⚠️ Bình luận chứa nội dung không phù hợp. Vui lòng điều chỉnh!"
                    );
                    return;
                  }

                  // ✅ AI MODERATE COMMENT trước khi submit
                  console.log(
                    "🔍 [DEBUG #2] Starting AI moderation (map review)..."
                  );
                  let moderationForSend = null;
                  try {
                    const mod = await moderateText(comment);
                    const aiAnalysis = mod?.detail || mod;
                    console.log("✅ [AI] Analysis result:", aiAnalysis);

                    if (mod) {
                      if (mod.action === "block" || mod.label === "toxic") {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Gửi đánh giá";
                        alert(
                          "⚠️ Bình luận có nội dung không phù hợp. Vui lòng điều chỉnh!"
                        );
                        const commentInput =
                          document.getElementById("comment-input");
                        if (commentInput) commentInput.value = "";
                        setNewComment("");
                        return;
                      }

                      if (mod.warn) {
                        const confirmSend = confirm(
                          "⚠️ Bình luận có thể không phù hợp. Bạn có chắc muốn gửi?"
                        );
                        if (!confirmSend) {
                          submitBtn.disabled = false;
                          submitBtn.textContent = "Gửi đánh giá";
                          return;
                        }
                      }

                      if (mod.label === "hate") {
                        moderationForSend = mod.detail || mod;
                      }
                    }
                  } catch (aiError) {
                    console.error(
                      "❌ [AI] Moderate error:",
                      aiError?.message || aiError
                    );
                    alert(
                      "❌ AI kiểm duyệt không khả dụng. Vui lòng thử lại sau!\n\nLỗi: " +
                        (aiError?.message || aiError)
                    );
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Gửi đánh giá";
                    return;
                  }

                  submitBtn.textContent = "Đang gửi...";

                  const formData = new FormData();
                  formData.append("userId", user.userId);
                  formData.append("rating", currentRating);
                  formData.append("comment", comment);
                  if (moderationForSend) {
                    formData.append(
                      "moderation",
                      JSON.stringify(moderationForSend)
                    );
                  }
                  files.forEach((file) => formData.append("images", file));

                  console.log("🚀 [SUBMIT] Submitting to:", {
                    url: `${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`,
                    placeId: currentPlace.current.id,
                    currentPlace: currentPlace.current,
                  });

                  await axios.post(
                    `${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`,
                    formData,
                    {
                      headers: { "Content-Type": "multipart/form-data" },
                      withCredentials: true,
                    }
                  );

                  commentInput.value = "";
                  if (imageInput) imageInput.value = "";
                  if (imagePreview) imagePreview.innerHTML = "";
                  window.currentRating = 0;
                  setNewRating(0);
                  // Refresh reviews
                  const res = await axios.get(
                    `${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`
                  );
                  showPlaceDetail(currentPlace.current, res.data || []);
                } catch (err) {
                  console.error("Error submitting review:", err);
                  alert(
                    "❌ Lỗi khi gửi đánh giá: " +
                      (err.response?.data?.message || err.message)
                  );
                } finally {
                  submitBtn.disabled = false;
                  submitBtn.textContent = "Gửi đánh giá";
                }
              });
            }
          } else {
            // Attach login link handler
            const loginLink = document.getElementById("login-to-review-link");
            if (loginLink) {
              loginLink.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("🔗 Login link clicked");
                // Trigger login modal or redirect
                window.location.href = "/auth/login";
              });
            }
          }
        }
      } catch (err) {
        console.error("❌ [isAuthLoading=false] Error updating DOM:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isAuthLoading, user?.userId, activeTab, newRating, newComment]);

  /* ---------- KHỞI TẠO MAP ---------- */
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

    // ✅ TILE LAYER - sẽ được toggle bằng dark mode
    const lightTile = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      {
        attribution: "&copy; Google Maps",
        maxZoom: 20,
      }
    );

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

  /* ---------- CẬP NHẬT PLACES REF KHI PLACES THAY ĐỔI ---------- */
  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  /* ---------- KIỂM TRA VÀ MỞ LẠI PLACE SAU KHI LOGIN ---------- */
  useEffect(() => {
    if (!mapInstance.current || places.length === 0 || !user?.userId) return;

    const returnToPlaceData = sessionStorage.getItem("returnToPlaceAfterLogin");
    if (!returnToPlaceData) return;

    try {
      const placeData = JSON.parse(returnToPlaceData);
      const place = places.find((p) => p.id === placeData.id);

      if (place) {
        console.log("✅ Quay lại place sau khi login:", place.title);

        // Xóa ngay để tránh loop
        sessionStorage.removeItem("returnToPlaceAfterLogin");

        // Zoom tới vị trí
        setTimeout(() => {
          if (mapInstance.current) {
            mapInstance.current.setView(
              [place.position[0], place.position[1]],
              17,
              { animate: true }
            );

            // Mở sidebar chi tiết
            showPlaceDetail(place, mapInstance.current);

            // Highlight marker
            highlightMarker(place.id);
          }
        }, 800);
      } else {
        // Không tìm thấy place, vẫn xóa để tránh loop
        sessionStorage.removeItem("returnToPlaceAfterLogin");
      }
    } catch (err) {
      console.error("Lỗi khi parse returnToPlaceAfterLogin:", err);
      sessionStorage.removeItem("returnToPlaceAfterLogin");
    }
  }, [places.length, user?.userId]);

  /* ---------- TOGGLE DARK/LIGHT MODE ---------- */
  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current) return;

    // Remove current tile layer
    mapInstance.current.removeLayer(tileLayerRef.current);

    // Add new tile layer based on mode
    if (isDarkMode) {
      // Dark mode - Google Maps dark style
      tileLayerRef.current = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", // Hybrid dark
        {
          attribution: "&copy; Google Maps (Dark)",
          maxZoom: 20,
        }
      );
    } else {
      // Light mode - Standard Google Maps
      tileLayerRef.current = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          attribution: "&copy; Google Maps",
          maxZoom: 20,
        }
      );
    }

    tileLayerRef.current.addTo(mapInstance.current);

    // Save preference
    localStorage.setItem("mapDarkMode", isDarkMode);
  }, [isDarkMode]);

  /* ---------- ÁP DỤNG DARK MODE CHO SIDEBAR ---------- */
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.backgroundColor = isSidebarDark
        ? "#1a1a1a"
        : "#ffffff";
      sidebarRef.current.style.color = isSidebarDark ? "#ffffff" : "#333333";
    }
  }, [isSidebarDark]);

  /* ---------- FIX BLACK SCREEN ---------- */
  useEffect(() => {
    if (mapInstance.current) {
      const timer = setTimeout(() => mapInstance.current.invalidateSize(), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  /* ---------- VẼ TẤT CẢ MARKER MỘT LẦN DUY NHẤT (KHÔNG BAO GIỜ XÓA) ---------- */
  useEffect(() => {
    if (
      !mapInstance.current ||
      !places.length ||
      allMarkersRef.current.size > 0
    )
      return;

    places.forEach((place) => {
      if (!place.position || place.position.length !== 2) return;

      const marker = L.marker(place.position, {
        icon: new L.Icon.Default(),
        zIndexOffset: 0,
      }).addTo(mapInstance.current);

      marker.placeId = place.id;
      marker.isUserMarker = false;

      // ✅ TẠO POPUP HTML VỚI THÔNG TIN ĐỊA ĐIỂM
      const popupContent = `
        <div style="cursor:pointer;min-width:200px;" class="marker-popup-content" data-place-id="${
          place.id
        }">
          <img src="${
            place.image || "https://via.placeholder.com/200x100?text=Chưa+có+hình"
          }" style="width:100%;height:100px;object-fit:cover;border-radius:4px;margin-bottom:8px;" />
          <h4 style="margin:0 0 4px;font-size:0.95rem;font-weight:600;color:#333;">${
            place.title
          }</h4>
          <div style="display:flex;align-items:center;gap:4px;font-size:0.85rem;margin-bottom:4px;">
            <span style="color:#ffca28;font-weight:bold;">${
              place.rating || 0
            }</span>
            ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(
        5 - Math.floor(place.rating || 0)
      )}
            <span style="color:#888;">(${place.reviews || 0})</span>
          </div>
          <p style="margin:0;font-size:0.8rem;color:#666;line-height:1.3;max-height:40px;overflow:hidden;">${
            place.desc || "Mô tả chưa có"
          }</p>
          <div style="margin-top:8px;font-size:0.75rem;color:#1a73e8;font-weight:500;">
            👆 Click để xem chi tiết
          </div>
        </div>
      `;

      // ✅ SỬ DỤNG TOOLTIP THAY VÌ POPUP ĐỂ HIỂN THỊ NHIỀU CÁI CÙNG LÚC
      marker
        .bindTooltip(popupContent, {
          permanent: true, // Luôn hiển thị
          direction: "top", // Hiển thị phía trên marker
          className: "custom-marker-popup custom-marker-tooltip",
          offset: [0, -10], // Dịch lên trên một chút
          opacity: 1,
        })
        .openTooltip();

      // ✅ LƯU MARKER ĐẦU TIÊN LÀ MARKER ĐANG MỞ
      if (!currentOpenPopupMarker.current) {
        currentOpenPopupMarker.current = marker;
      }

      // ✅ HÀM ATTACH CLICK LISTENER CHO TOOLTIP - SỬ DỤNG addEventListener
      const attachTooltipClickListener = () => {
        // Tìm tất cả tooltip elements với place.id này
        const tooltipElements = document.querySelectorAll(
          `.marker-popup-content[data-place-id="${place.id}"]`
        );

        tooltipElements.forEach((tooltipElement) => {
          if (tooltipElement && !tooltipElement.dataset.listenerAttached) {
            tooltipElement.dataset.listenerAttached = "true";

            tooltipElement.addEventListener(
              "click",
              (e) => {
                console.log("🖱️ Tooltip clicked for place:", place.title);
                e.preventDefault();
                e.stopPropagation();

                currentPlace.current = place;
                clearCurrentRoute();
                showPlaceDetail(place, mapInstance.current);
              },
              { capture: true }
            );

            console.log("✅ Click listener attached for:", place.title);
          }
        });
      };

      // ✅ ATTACH LISTENER NHIỀU LẦN ĐỂ ĐẢM BẢO
      setTimeout(attachTooltipClickListener, 100);
      setTimeout(attachTooltipClickListener, 300);
      setTimeout(attachTooltipClickListener, 500);

      // ✅ ATTACH LISTENER KHI TOOLTIP MỞ
      marker.on("tooltipopen", () => {
        setTimeout(attachTooltipClickListener, 50);
        setTimeout(attachTooltipClickListener, 200);
      });

      // ✅ CLICK VÀO MARKER MỞ CHI TIẾT
      marker.on("click", () => {
        currentPlace.current = place;
        clearCurrentRoute();
        showPlaceDetail(place, mapInstance.current);
      });

      allMarkersRef.current.set(place.id, marker);
    });
  }, [places]);

  /* ---------- LỌC DANH MỤC → LÀM MỜ MARKER (KHÔNG XÓA) ---------- */
  useEffect(() => {
    if (!mapInstance.current || !places.length) return;

    // ✅ Tạo danh sách marker cần hiển thị
    const visibleMarkers = [];
    const hiddenMarkers = [];

    allMarkersRef.current.forEach((marker, placeId) => {
      const place = places.find((p) => p.id === placeId);
      if (!place) return;

      const isVisible =
        selectedCategory === null || place.categoryId === selectedCategory;

      if (isVisible) {
        visibleMarkers.push(marker);
      } else {
        hiddenMarkers.push(marker);
      }
    });

    // ✅ Ẩn các marker không thuộc category
    hiddenMarkers.forEach((marker) => {
      if (marker.getTooltip() && marker.isTooltipOpen()) {
        marker.closeTooltip();
      }
      if (mapInstance.current.hasLayer(marker)) {
        mapInstance.current.removeLayer(marker);
      }
    });

    // ✅ Hiển thị và mở tooltip cho tất cả marker visible
    visibleMarkers.forEach((marker, index) => {
      const wasHidden = !mapInstance.current.hasLayer(marker);

      if (wasHidden) {
        marker.addTo(mapInstance.current);
      }

      marker.setOpacity(1);
      if (marker.getElement()) {
        marker.getElement().style.filter = "";
      }

      // ✅ Mở tooltip (tooltip có thể mở nhiều cái cùng lúc)
      if (marker.getTooltip() && !marker.isTooltipOpen()) {
        marker.openTooltip();

        // ✅ ATTACH LISTENER SAU KHI MỞ TOOLTIP
        const place = places.find((p) => {
          let found = false;
          allMarkersRef.current.forEach((m, placeId) => {
            if (m === marker) found = placeId;
          });
          return p.id === found;
        });

        if (place) {
          setTimeout(() => {
            const tooltipElement = document.querySelector(
              `.marker-popup-content[data-place-id="${place.id}"]`
            );
            if (tooltipElement && !tooltipElement.onclick) {
              tooltipElement.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentPlace.current = place;
                clearCurrentRoute();
                showPlaceDetail(place, mapInstance.current);
              };
            }
          }, 200);
        }
      }
    });
  }, [selectedCategory, places]);

  /* ---------- HIGHLIGHT MARKER (DÙNG setIcon → KHÔNG LỖI LAYOUT) ---------- */
  const highlightMarker = (placeId) => {
    allMarkersRef.current.forEach((marker, id) => {
      if (id === placeId) {
        const highlightIcon = L.icon({
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

  /* ---------- UI ELEMENTS (LEFT PANEL, TOP BAR, ...) ---------- */
  useEffect(() => {
    if (!mapInstance.current) return;

    // === LEFT PANEL ===
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

    // ✅ NÚT DARK MODE CHO SIDEBAR
    const darkModeBtn = L.DomUtil.create("div");
    const updateDarkModeBtn = () => {
      const isDark = localStorage.getItem("sidebarDarkMode") === "true";
      darkModeBtn.innerHTML = `<div 
        onmouseenter="this.style.transform='scale(1.1)'; this.style.background='#555';" 
        onmouseleave="this.style.transform='scale(1)'; this.style.background='${
          isDark ? "#2d2d2d" : "#4a4a4a"
        }';"
        style="width:48px;height:48px;background:${
          isDark ? "#2d2d2d" : "#4a4a4a"
        };border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s ease;">
        <span style="font-size:20px;">${isDark ? "☀️" : "🌙"}</span>
      </div>`;
    };
    updateDarkModeBtn();
    darkModeBtn.onclick = () => {
      setIsSidebarDark((prev) => !prev);
      setTimeout(updateDarkModeBtn, 50);
    };

    leftPanel.append(backBtn, savedBtn, darkModeBtn);
    document.body.appendChild(leftPanel);

    // === TOP BAR ===
    const topBar = L.DomUtil.create("div", "leaflet-top-bar");
    topBar.style.cssText = `
      position:absolute;top:16px;left:116px;z-index:10001;
      display:flex;gap:12px;max-width:calc(100% - 132px);transition:left 0.3s ease, max-width 0.3s ease;
    `;

    // === SEARCH + NÚT TÌM KIẾM ===
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
    searchBtn.onmouseover = () => (searchBtn.style.background = "#0d47a1");
    searchBtn.onmouseout = () => (searchBtn.style.background = "#1a73e8");

    const suggestionList = L.DomUtil.create("ul");
    suggestionList.className = "suggestion-list";
    suggestionList.style.cssText = `
      position:absolute;top:100%;left:0;right:0;background:white;border-radius:8px;
      margin-top:4px;max-height:300px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,0.15);
      display:none;z-index:10005;list-style:none;padding:0;margin:0;
    `;

    searchContainer.append(searchInput, searchIcon, searchBtn, suggestionList);
    topBar.appendChild(searchContainer);

    // === CATEGORIES ===
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
          background:${
            selectedCategory === cat.CategoryID ? "#1a73e8" : "white"
          };
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

    // === SIDEBAR ===
    const sidebar = L.DomUtil.create("div", "custom-sidebar");
    sidebar.style.cssText = `
      position:fixed;top:0;left:100px;width:380px;height:100vh;
      background:white;z-index:10000;overflow-y:auto;display:none;
      padding-bottom:100px;transition:left 0.3s ease;font-family:system-ui;
    `;
    document.body.appendChild(sidebar);
    sidebarRef.current = sidebar;

    // === FAVORITES SIDEBAR ===
    const favoritesSidebar = L.DomUtil.create("div", "favorites-sidebar");
    favoritesSidebar.style.cssText = `
      position:fixed;top:0;left:0;width:380px;height:100vh;
      background:#2d2d2d;color:white;z-index:10002;padding:20px;
      display:none;overflow-y:auto;font-family:system-ui;transition:left 0.3s ease;
    `;
    document.body.appendChild(favoritesSidebar);
    favoritesSidebarRef.current = favoritesSidebar;

    // === ZOOM + LOCATION CONTROLS ===
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
                userMarker.current = L.marker([lat, lng], { icon }).addTo(
                  mapInstance.current
                );
                userMarker.current
                  .bindPopup('<b style="color:#4285f4">Vị trí của bạn</b>')
                  .openPopup();
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

    // === UPDATE TOP BAR POSITION ===
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

  /* ---------- TÌM KIẾM LOCAL + NÚT TÌM KIẾM ---------- */
  const searchLocal = useCallback(
    (query) => {
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
          match: (p.image || "").toLowerCase().includes(q)
            ? "ảnh hiện tại"
            : (p.oldImage || "").toLowerCase().includes(q)
            ? "ảnh xưa"
            : "tên / địa chỉ",
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
          <img src="${
            s.image ? `${BASE_URL}${s.image}` : "https://via.placeholder.com/40"
          }" 
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
            mapInstance.current.setView(
              [place.position[0], place.position[1]],
              17,
              { animate: true }
            );
            highlightMarker(place.id);
            const input = document.querySelector(".search-input");
            if (input) input.value = place.title;
            setSearchQuery(place.title);
            list.style.display = "none";
            showPlaceDetail(place, mapInstance.current);

            // ÉP VẼ LẠI SAU KHI ZOOM
            setTimeout(() => mapInstance.current.invalidateSize(), 600);
          }
        };
      });
    },
    [places]
  );

  useEffect(() => {
    const input = document.querySelector(".search-input");
    const searchBtn = document.querySelector(".search-btn");
    if (!input || !searchBtn) return;

    // ✅ NẾU PLACES CHƯA LOAD, CHỜ LOAD XONG
    if (!placesRef.current || placesRef.current.length === 0) {
      console.log("⏳ Đợi places load...");
      return;
    }

    console.log("✅ Places đã load, gắn event listeners");

    let timeout;
    const handleInput = (e) => {
      const q = e.target.value;
      setSearchQuery(q);
      clearTimeout(timeout);
      timeout = setTimeout(() => searchLocal(q), 300);
    };

    const handleSearch = () => {
      const q = input.value.trim();
      if (!q) return;

      // ✅ SỬ DỤNG placesRef ĐỂ CÓ GIÁ TRỊ MỚI NHẤT
      const currentPlaces = placesRef.current;

      // ✅ KIỂM TRA XEM PLACES ĐÃ LOAD CHƯA
      if (!currentPlaces || currentPlaces.length === 0) {
        alert("Đang tải dữ liệu, vui lòng thử lại sau giây lát!");
        return;
      }

      // ✅ TÌM KIẾM TRỰC TIẾP (KHÔNG PHỤ THUỘC VÀO SUGGESTIONS)
      const query = q.toLowerCase();
      const matches = currentPlaces.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const address = (p.address || "").toLowerCase();
        const desc = (p.desc || "").toLowerCase();
        return (
          title.includes(query) ||
          address.includes(query) ||
          desc.includes(query)
        );
      });

      if (matches.length === 0) {
        alert("Không tìm thấy địa điểm phù hợp!");
        return;
      }

      // ✅ CHỌN KẾT QUẢ ĐẦU TIÊN
      const place = matches[0];
      if (place && mapInstance.current) {
        mapInstance.current.setView(
          [place.position[0], place.position[1]],
          17,
          { animate: true }
        );
        highlightMarker(place.id);
        input.value = place.title;
        setSearchQuery(place.title);
        const list = document.querySelector(".suggestion-list");
        if (list) list.style.display = "none";
        showPlaceDetail(place, mapInstance.current);
        setTimeout(() => mapInstance.current.invalidateSize(), 600);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    };

    // Gắn event listeners
    input.oninput = handleInput;
    searchBtn.onclick = handleSearch;
    input.onkeydown = handleKeyDown;

    const updateBtn = () => {
      searchBtn.innerHTML = isSearching
        ? `<div style="width:16px;height:16px;border:2px solid #fff;border-top-color:#1a73e8;border-radius:50%;animation:spin 1s linear infinite;"></div>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
    };
    updateBtn();
    const observer = new MutationObserver(updateBtn);
    observer.observe(searchBtn, { childList: true });

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [places.length, isSearching, searchLocal]); // ✅ Thêm places.length để re-run khi data load

  /* ---------- CSS TOÀN CỤC CHO SEARCH INPUT ---------- */
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

  /* ---------- HOVER POPUP ---------- */
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

    const imgSrc = safeImageUrl(place.image, "https://via.placeholder.com/260x120?text=Chưa+có+hình");

    popup.innerHTML = `
      <img src="${imgSrc}" style="width:100%;height:120px;object-fit:cover;" />
      <div style="padding:12px;">
        <h4 style="margin:0 0 4px;font-size:1rem;font-weight:600;">${
          place.title
        }</h4>
        <div style="display:flex;align-items:center;gap:4px;font-size:0.85rem;margin-bottom:6px;">
          <span style="color:#ffca28;font-weight:bold;">${
            place.rating || 0
          }</span>
          ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(
      5 - Math.floor(place.rating || 0)
    )}
          <span style="color:#aaa;">(${place.reviews || 0})</span>
        </div>

        <p style="margin:0 0 8px;font-size:0.8rem;color:#ccc;line-height:1.4;">${
          place.desc || "Mô tả chưa có"
        }</p>
        <div style="display:flex;justify-content:flex-end;">
          <button id="hover-save-btn" style="width:32px;height:32px;background:${
            isSaved ? "#d32f2f" : "#333"
          };color:white;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${
              isSaved ? "white" : "none"
            }" stroke="white" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
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
        (async () => {
          const shouldLogin = await showLoginConfirmModal(
            "Bạn cần đăng nhập để lưu địa điểm vào yêu thích."
          );
          if (shouldLogin) {
            window.location.href = "/login";
          }
        })();
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
        console.warn("Failed to remove hover popup:", err);
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
    if (!user?.userId) {
      console.log("🔴 getCurrentUserPhotoFavorites: No user logged in");
      return [];
    }
    console.log(
      `✅ getCurrentUserPhotoFavorites: User ${user.userId} has ${
        (favoritePhotosByUser[user.userId] || []).length
      } saved photos`
    );
    return favoritePhotosByUser[user.userId] || [];
  };

  /* ---------- MODAL XÁC NHẬN ĐĂNG NHẬP ---------- */
  const showLoginConfirmModal = (
    message = "Bạn cần đăng nhập để sử dụng tính năng này."
  ) => {
    return new Promise((resolve) => {
      // Tạo overlay
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
      `;

      // Tạo modal
      const modal = document.createElement("div");
      modal.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        text-align: center;
        font-family: system-ui, -apple-system, sans-serif;
      `;

      modal.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 16px;">🔐</div>
        <h3 style="margin: 0 0 12px; font-size: 1.5rem; color: #1a202c;">
          Yêu cầu đăng nhập
        </h3>
        <p style="margin: 0 0 24px; color: #4a5568; font-size: 1rem; line-height: 1.6;">
          ${message}
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="cancel-btn" style="
            padding: 12px 24px;
            border: 2px solid #e2e8f0;
            background: white;
            color: #4a5568;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          ">
            Từ chối
          </button>
          <button id="login-btn" style="
            padding: 12px 24px;
            border: none;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          ">
            Đăng nhập
          </button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Xử lý buttons
      const cancelBtn = modal.querySelector("#cancel-btn");
      const loginBtn = modal.querySelector("#login-btn");

      cancelBtn.onmouseover = () => {
        cancelBtn.style.background = "#f7fafc";
      };
      cancelBtn.onmouseout = () => {
        cancelBtn.style.background = "white";
      };

      loginBtn.onmouseover = () => {
        loginBtn.style.transform = "translateY(-2px)";
        loginBtn.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
      };
      loginBtn.onmouseout = () => {
        loginBtn.style.transform = "translateY(0)";
        loginBtn.style.boxShadow = "none";
      };

      const cleanup = () => {
        overlay.remove();
      };

      cancelBtn.onclick = () => {
        cleanup();
        resolve(false);
      };

      loginBtn.onclick = () => {
        cleanup();
        // Lưu URL và thông tin place hiện tại để redirect về sau khi login
        sessionStorage.setItem("redirectAfterLogin", "/map");
        if (currentPlace.current) {
          sessionStorage.setItem(
            "returnToPlaceAfterLogin",
            JSON.stringify({
              id: currentPlace.current.id,
              title: currentPlace.current.title,
              position: currentPlace.current.position,
            })
          );
        }
        resolve(true);
      };

      // Click outside để đóng
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          cleanup();
          resolve(false);
        }
      };
    });
  };

  const addPlaceToFavorites = async (place) => {
    if (!user || !user.userId) {
      const shouldLogin = await showLoginConfirmModal(
        "Bạn cần đăng nhập để lưu địa điểm vào yêu thích."
      );
      if (shouldLogin) {
        window.location.href = "/login";
      }
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

  const handleToggleFavoritePlace = async (place) => {
    if (!place) return;
    if (!user || !user.userId) {
      const shouldLogin = await showLoginConfirmModal(
        "Bạn cần đăng nhập để lưu địa điểm vào yêu thích."
      );
      if (shouldLogin) {
        window.location.href = "/login";
      }
      return;
    }
    setFavoritePlacesByUser((prev) => {
      const next = { ...prev };
      const list = Array.isArray(next[user.userId])
        ? [...next[user.userId]]
        : [];
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

  const handleToggleFavoritePhoto = async (photo, placeInfo) => {
    if (!photo) return;
    if (!user || !user.userId) {
      const shouldLogin = await showLoginConfirmModal(
        "Bạn cần đăng nhập để lưu ảnh vào yêu thích."
      );
      if (shouldLogin) {
        window.location.href = "/login";
      }
      return;
    }

    console.log(`📸 Toggle favorite photo for user: ${user.userId}`, photo);

    setFavoritePhotosByUser((prev) => {
      const next = { ...prev };
      const list = Array.isArray(next[user.userId])
        ? [...next[user.userId]]
        : [];
      const rawId = photo.SubmissionID ?? photo.submissionId;
      const submissionId = rawId
        ? String(rawId)
        : `${Date.now()}-${Math.random()}`;
      const existingIndex = list.findIndex(
        (item) => item.submissionId === submissionId
      );

      if (existingIndex >= 0) {
        list.splice(existingIndex, 1);
        console.log(`🗑️ Removed photo ${submissionId} from favorites`);
      } else {
        list.push({
          submissionId,
          ImagePath: photo.ImagePath || photo.imagePath || "",
          Year: photo.Year || photo.year || "Chưa rõ năm",
          submittedBy: photo.submittedBy || photo.userName || "Ẩn danh",
          locationId:
            placeInfo?.id ?? placeInfo?.LocationID ?? photo.LocationID ?? null,
          locationTitle:
            placeInfo?.title ||
            placeInfo?.Name ||
            placeInfo?.locationTitle ||
            "Không rõ địa điểm",
          savedAt: Date.now(),
        });
        console.log(`💾 Added photo ${submissionId} to favorites`);
      }

      next[user.userId] = list;
      console.log(`📊 User ${user.userId} now has ${list.length} saved photos`);
      return next;
    });
  };

  const updateCommunityPhotoGrid = (locationId, placeMeta = null) => {
    if (!sidebarRef.current) return;
    const container = sidebarRef.current.querySelector(
      `#community-photo-carousel[data-location-id="${locationId}"]`
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
      (currentPlace.current && currentPlace.current.id === locationId
        ? currentPlace.current
        : null) ||
      places.find((p) => p.id === locationId);
    const userPhotoFavorites = getCurrentUserPhotoFavorites();
    const savedPhotoIds = new Set(
      userPhotoFavorites.map((item) => item.submissionId)
    );

    const slides = photos
      .map((photo, idx) => {
        const src = photo.ImagePath?.startsWith("http")
          ? photo.ImagePath
          : `${BASE_URL}${photo.ImagePath || ""}`;
        const yearLabel = photo.Year || "Chưa rõ";
        const submittedBy = photo.submittedBy
          ? escapeHtml(photo.submittedBy)
          : "Ẩn danh";
        const submissionId = String(
          photo.SubmissionID ?? photo.submissionId ?? idx
        );
        const isSaved = savedPhotoIds.has(submissionId);
        return `
          <div class="carousel-slide" data-index="${idx}" data-photo-id="${submissionId}" style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:${
          idx === 0 ? 1 : 0
        };transition:opacity 0.4s ease;">
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
          isSaved ? "#1a73e8" : "rgba(15,23,42,0.85)"
        };color:${isSaved ? "#fff" : "#f1f5f9"};">
              ${isSaved ? "★ Đã lưu" : "☆ Lưu ảnh"}
            </button>
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(15,23,42,0.85),transparent 55%);border-radius:16px;pointer-events:none;"></div>
            <div style="position:absolute;left:12px;right:12px;bottom:12px;color:#e5e7eb;font-size:0.8rem;display:flex;flex-direction:column;gap:4px;pointer-events:none;">
              <span style="font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">📷 Ảnh cộng đồng</span>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                ${
                  photo.submittedBy
                    ? `<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%;">👤 ${submittedBy}</span>`
                    : ""
                }
                <span style="padding:4px 10px;border-radius:999px;background:rgba(15,23,42,0.9);color:#facc15;font-weight:600;${
                  !photo.submittedBy ? "margin-left:auto;" : ""
                }">📅 ${yearLabel}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = `
      <div class="carousel-wrapper" style="position:relative;width:100%;height:220px;border-radius:18px;overflow:hidden;background:#020617;">
        ${slides}
        <button class="carousel-nav prev" style="position:absolute;top:50%;left:12px;transform:translateY(-50%);width:34px;height:34px;border:none;border-radius:50%;background:rgba(15,23,42,0.7);color:white;font-size:1.2rem;cursor:pointer;">‹</button>
        <button class="carousel-nav next" style="position:absolute;top:50%;right:12px;transform:translateY(-50%);width:34px;height:34px;border:none;border-radius:50%;background:rgba(15,23,42,0.7);color:white;font-size:1.2rem;cursor:pointer;">›</button>
        <div class="carousel-dots" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:6px;"></div>
      </div>
    `;

    const slidesEls = container.querySelectorAll(".carousel-slide");
    const dotsContainer = container.querySelector(".carousel-dots");
    let current = 0;

    dotsContainer.innerHTML = photos
      .map(
        (_, idx) =>
          `<span data-idx="${idx}" style="width:8px;height:8px;border-radius:50%;background:${
            idx === 0 ? "#1a73e8" : "#cbd5f5"
          };display:inline-block;"></span>`
      )
      .join("");

    const dots = dotsContainer.querySelectorAll("span");

    const updateActiveSlide = (next) => {
      if (next < 0) next = slidesEls.length - 1;
      if (next >= slidesEls.length) next = 0;
      slidesEls[current].style.opacity = 0;
      slidesEls[current].style.pointerEvents = "none";
      slidesEls[next].style.opacity = 1;
      slidesEls[next].style.pointerEvents = "auto";
      dots[current].style.background = "#cbd5f5";
      dots[next].style.background = "#1a73e8";
      current = next;
    };

    container
      .querySelector(".prev")
      ?.addEventListener("click", () => updateActiveSlide(current - 1));
    container
      .querySelector(".next")
      ?.addEventListener("click", () => updateActiveSlide(current + 1));
    dots.forEach((dot, idx) =>
      dot.addEventListener("click", () => updateActiveSlide(idx))
    );

    // Thiết lập pointer events ban đầu & gắn sự kiện click
    slidesEls.forEach((slide, idx) => {
      slide.style.cursor = "pointer";
      slide.style.pointerEvents = idx === 0 ? "auto" : "none";
      slide.addEventListener("click", () => {
        openPhotoPreview({ photos, startIndex: idx });
      });
    });

    container.querySelectorAll(".save-photo-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const submissionId = btn.getAttribute("data-photo-id");
        const targetPhoto = photos.find(
          (p) => String(p.SubmissionID ?? p.submissionId ?? "") === submissionId
        );
        handleToggleFavoritePhoto(targetPhoto, placeInfo);
        setTimeout(() => updateCommunityPhotoGrid(locationId, placeInfo), 50);
      });
    });
  };

  const refreshCommunityPhotos = async (locationId, placeMeta = null) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/location-images/location/${locationId}`
      );
      communityPhotosRef.current.set(locationId, res.data || []);
    } catch (err) {
      console.error("Không tải được ảnh cộng đồng", err);
      communityPhotosRef.current.set(locationId, []);
    } finally {
      const meta =
        placeMeta ||
        (currentPlace.current && currentPlace.current.id === locationId
          ? currentPlace.current
          : null) ||
        places.find((p) => p.id === locationId);
      updateCommunityPhotoGrid(locationId, meta);
    }
  };

  const attachCommunityPhotoSection = (place) => {
    if (!sidebarRef.current) return;
    updateCommunityPhotoGrid(place.id, place);

    const uploadBtn = sidebarRef.current.querySelector("#open-photo-modal");
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => openPhotoUploadModal(place));
    }
  };

  /* ---------- HANDLE SHARE BUTTON ---------- */
  const handleShareLocation = (place) => {
    if (!place || !mapInstance.current) return;

    console.log("📤 Opening share modal for:", place.title);

    // Get current map position
    const center = mapInstance.current.getCenter();
    const zoom = mapInstance.current.getZoom();

    setShareLocation(place);
    setShareMapPosition({
      lat: center.lat,
      lng: center.lng,
      zoom: zoom,
    });
    setShareModalOpen(true);
  };

  /* ---------- SHOW PLACE DETAIL ---------- */
  const showPlaceDetail = async (place, map) => {
    const isFavOpen = favoritesSidebarRef.current.style.display === "block";
    sidebarRef.current.style.left = isFavOpen ? "380px" : "100px";
    sidebarRef.current.style.display = "block";

    window.updateTopBarPosition();
    setTimeout(() => window.updateTopBarPosition(), 50);

    // ✅ GLOBAL FUNCTION ĐỂ SET RATING (TỪ onclick trong HTML string)
    // GIỮ NGUYÊN rating nếu đã có (không reset khi re-render)
    if (typeof window.currentRating === "undefined") {
      window.currentRating = null; // ✅ ĐỔI 0 → null để validation chính xác
      console.log("🔢 Initialized window.currentRating: null");
    } else {
      console.log(
        "✅ Keeping existing window.currentRating:",
        window.currentRating
      );
    }

    window.setStarRating = (rating) => {
      console.log("⭐ setStarRating CALLED:", rating);

      // ✅ LƯU VÀO WINDOW TRƯỚC (ƯU TIÊN CAO NHẤT)
      window.currentRating = rating;

      // ✅ SAU ĐÓ MỚI CẬP NHẬT STATE
      setNewRating(rating);

      console.log(
        "✅ Rating saved - window:",
        window.currentRating,
        "state will update to:",
        rating
      );

      // ✅ CẬP NHẬT MÀU CÁC SAO NGAY LẬP TỨC
      for (let i = 1; i <= 5; i++) {
        const star = document.getElementById(`star-${i}`);
        if (star) {
          star.style.color = i <= rating ? "#ffca28" : "#ccc";
        }
      }
    };

    // ✅ Restore màu sao nếu đã có rating
    setTimeout(() => {
      const savedRating = window.currentRating ?? newRating ?? 0;
      if (savedRating > 0) {
        console.log("🎨 Restoring star colors for rating:", savedRating);
        for (let i = 1; i <= 5; i++) {
          const star = document.getElementById(`star-${i}`);
          if (star) {
            star.style.color = i <= savedRating ? "#ffca28" : "#ccc";
          }
        }
      }
    }, 100);

    let communityPhotos = [];
    let reviewsData = []; // ✅ Lưu reviews từ API trước khi setReviews (async)
    // Load reviews và ảnh cộng đồng
    try {
      const [reviewsRes, photosRes] = await Promise.all([
        axios.get(`${BASE_URL}/map-locations/${place.id}/feedback`),
        axios.get(`${BASE_URL}/location-images/location/${place.id}`),
      ]);
      reviewsData = reviewsRes.data.map((r) => ({
        FeedbackID: r.FeedbackID,
        rating: r.Rating,
        comment: r.Comment,
        timestamp: new Date(r.CreatedAt).toLocaleDateString("vi-VN"),
        userName: r.user?.FullName || "Ẩn danh",
        avatar: r.user?.profile?.Avatar || "/img/default-avatar.png",
        likes: r.Likes || 0,
        images: r.ImageUrls ? JSON.parse(r.ImageUrls) : [],
        imagesApproved: !!r.ImagesApproved,
      }));
      setReviews(reviewsData);
      communityPhotos = photosRes.data || [];
    } catch (error) {
      console.error("Error loading reviews/photos:", error);
      setReviews([]);
      communityPhotos = [];
    }
    communityPhotosRef.current.set(place.id, communityPhotos);

    const categoryName = place.categoryName || "Chưa phân loại";
    
    console.log('🖼️ [Sidebar Image Debug]', {
      placeId: place.id,
      placeTitle: place.title,
      placeImage: place.image,
      placeOldImage: place.oldImage,
      placeOldImageYear: place.oldImageYear,
    });

    sidebarRef.current.innerHTML = `
      <div style="padding:20px;position:relative">
        <div onclick="window.closeSidebar()" style="position:absolute;top:16px;left:16px;width:36px;height:36px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:10">
          <span style="font-size:1.4rem;color:#5f6368;font-weight:bold">×</span>
        </div>

        <img src="${
          place.image || "https://via.placeholder.com/360x180?text=Chưa+có+hình"
        }" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:16px" />

        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <h3 style="margin:0;font-size:1.2rem;color:#1a0dab;font-weight:600;line-height:1.4;flex:1;">
              ${place.title}
            </h3>
            <div style="background:#e8f0fe;padding:6px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;color:#1a73e8;white-space:nowrap;margin-left:8px;">
              ${categoryName}
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            
            ${
              place.oldImageYear
                ? `<span style="background:#fee2e2;padding:4px 10px;border-radius:16px;font-size:0.75rem;font-weight:600;color:#991b1b;white-space:nowrap;">📅 Năm: ${place.oldImageYear}</span>`
                : ""
            }
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:4px;margin-bottom:12px">
          <span style="color:#d50000;font-weight:bold;">${
            place.rating || 0
          }</span>
          ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(
      5 - Math.floor(place.rating || 0)
    )}
          <span style="color:#666;font-size:0.9rem">(${
            place.reviews || 0
          } đánh giá)</span>
        </div>

        <p style="margin:12px 0;font-size:0.95rem;color:#333;line-height:1.5">${
          place.desc || "Mô tả chưa có"
        }</p>

        <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:2px solid #dadce0">
          <button id="overview-tab" style="flex:1;padding:10px;border:none;background:${
            activeTab === "overview" ? "#e8f0fe" : "#f8f9fa"
          };color:${
      activeTab === "overview" ? "#1a73e8" : "#333"
    };cursor:pointer;font-weight:${
      activeTab === "overview" ? "600" : "normal"
    };font-size:0.9rem">Tổng quan</button>
          <button id="reviews-tab" style="flex:1;padding:10px;border:none;background:${
            activeTab === "reviews" ? "#e8f0fe" : "#f8f9fa"
          };color:${
      activeTab === "reviews" ? "#1a73e8" : "#333"
    };cursor:pointer;font-weight:${
      activeTab === "reviews" ? "600" : "normal"
    };font-size:0.9rem">Đánh giá</button>
        </div>

        <div id="content-area">
          ${
            activeTab === "overview"
              ? `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
              <button id="get-directions-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">Đường đi</button>
              <button id="share-location-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">Chia sẻ</button>
              <button id="save-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">Lưu</button>
              <button id="compare-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">So sánh</button>
            </div>
            <div id="route-details" style="display:none;font-size:0.9rem;color:#555;margin:16px 0;line-height:1.6"></div>
            <div style="margin-top:20px;border-top:1px solid #e5e7eb;padding-top:16px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${
                communityPhotos.length ? "8px" : "0"
              };">
                <h4 style="margin:0;font-size:1rem;color:#1a1c2b;">Ảnh cộng đồng</h4>
                <button id="open-photo-modal" style="padding:8px 14px;border:1px solid #1a73e8;background:#fff;color:#1a73e8;border-radius:999px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
                  <span>➕</span> Thêm ảnh
                </button>
              </div>
              ${
                communityPhotos.length
                  ? `<div id="community-photo-carousel" data-location-id="${place.id}" style="width:100%;"><!-- sẽ được cập nhật sau --></div>`
                  : `<div id="community-photo-carousel" data-location-id="${place.id}" style="display:none;"></div>`
              }
            </div>
          `
              : `
            <div style="display:flex;flex-direction:column;align-items:center;width:100%;">
              <div class="rating-summary-container" style="background:#f1f1f1;padding:16px;border-radius:8px;width:100%;margin-bottom:16px;text-align:center;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-weight:600;">${(
                    reviewsData.reduce((sum, r) => sum + r.rating, 0) /
                      Math.max(reviewsData.length, 1) || 0
                  ).toFixed(1)}</span>
                  <span style="color:#777;">${
                    reviewsData.length
                  } đánh giá</span>
                </div>
                <div style="margin-top:8px;">
                  <span style="color:#ffca28;">${"★".repeat(
                    Math.floor(
                      reviewsData.reduce((sum, r) => sum + r.rating, 0) /
                        Math.max(reviewsData.length, 1) || 0
                    )
                  )}${"☆".repeat(
                  5 -
                    Math.floor(
                      reviewsData.reduce((sum, r) => sum + r.rating, 0) /
                        Math.max(reviewsData.length, 1) || 0
                    )
                )}</span>
                </div>
              </div>

              <!-- Histogram and Write review button -->
              <div style="width:100%;display:flex;gap:12px;margin-bottom:16px;align-items:flex-start;">
                <div style="flex:1;">
                  ${(() => {
                    const counts = [0, 0, 0, 0, 0];
                    reviewsData.forEach((rv) => {
                      counts[5 - rv.rating] = (counts[5 - rv.rating] || 0) + 1;
                    });
                    const total = reviewsData.length || 1;
                    return `
                      <div class="rating-histogram" style="display:flex;flex-direction:column;gap:6px;">
                        ${[5, 4, 3, 2, 1]
                          .map((star, idx) => {
                            const num = reviewsData.filter(
                              (r) => r.rating === star
                            ).length;
                            const pct = Math.round(
                              (num / Math.max(reviewsData.length, 1)) * 100
                            );
                            return `
                            <div style="display:flex;align-items:center;gap:8px;">
                              <div style="width:36px">${star}★</div>
                              <div style="flex:1;background:#eee;border-radius:6px;height:10px;overflow:hidden;">
                                <div style="width:${pct}%;height:100%;background:#ffd54f;border-radius:6px"></div>
                              </div>
                              <div style="width:36px;text-align:right;color:#666">${pct}%</div>
                            </div>
                          `;
                          })
                          .join("")}
                      </div>
                    `;
                  })()}
                </div>
                <div style="width:160px;">
                  <button id="write-review-btn" style="width:100%;padding:12px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">Viết đánh giá</button>
                </div>
              </div>

              ${
                user && user.userId
                  ? `
              <div style="width:100%;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <span>Đánh giá của bạn: </span>
                  <div id="star-rating" style="display:flex;gap:2px;">
                    ${[1, 2, 3, 4, 5]
                      .map(
                        (i) => `
                      <span id="star-${i}" style="cursor:pointer;font-size:1.2rem;color:${
                          i <= (window.currentRating || newRating || 0)
                            ? "#ffca28"
                            : "#ccc"
                        };" onclick="window.setStarRating(${i})">★</span>
                    `
                      )
                      .join("")}
                  </div>
                </div>
                <textarea id="comment-input" placeholder="Viết bình luận..." style="width:100%;height:80px;padding:8px;border:1px solid #ccc;border-radius:4px;margin-bottom:8px;resize:vertical;">${newComment}</textarea>
                <div style="margin-bottom:8px;">
                  <label for="review-images" style="display:block;font-size:0.9rem;margin-bottom:4px;color:#555;">Thêm ảnh (tùy chọn, tối đa 5):</label>
                  <input type="file" id="review-images" accept="image/*" multiple style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;" />
                  <div id="image-preview" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;"></div>
                </div>
                <button id="submit-review-btn" style="width:100%;padding:10px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Gửi đánh giá</button>
              </div>
              `
                  : `
              <div style="width:100%;margin-bottom:16px;padding:16px;background:#fff3cd;border-radius:8px;text-align:center;">
                <p style="margin:0;color:#856404;">Vui lòng <a href="/login" style="color:#1a73e8;text-decoration:none;font-weight:600;">đăng nhập</a> để đánh giá địa điểm này</p>
              </div>
              `
              }

              <div id="reviews-list" style="width:100%;max-height:300px;overflow-y:auto;">
                ${
                  reviewsData.length > 0
                    ? reviewsData
                        .map(
                          (r) => `
                  <div style="padding:12px;border-bottom:1px solid #eee;display:flex;gap:12px;align-items:flex-start;">
                    <img src="${
                      r.avatar
                    }" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0" />
                    <div style="flex:1;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px;">
                        <div>
                          <div style="font-weight:600;color:#333">${
                            r.userName || "Ẩn danh"
                          }</div>
                          <div style="color:#ffca28;">${"★".repeat(
                            r.rating
                          )}${"☆".repeat(5 - r.rating)}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px">
                          <button class="like-btn" data-feedback-id="${
                            r.FeedbackID || ""
                          }" style="background:transparent;border:none;cursor:pointer;color:#666;display:flex;align-items:center;gap:6px">👍 <span class="like-count">${
                            r.likes
                          }</span></button>
                        </div>
                      </div>
                      <p style="margin:4px 0;color:#555;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;">${
                        r.comment
                      }</p>
                      ${
                        r.images && r.images.length > 0 && r.imagesApproved
                          ? `
                        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                          ${r.images
                            .map(
                              (img) =>
                                `<img src="${
                                  img.startsWith("http")
                                    ? img
                                    : `${BASE_URL}${img}`
                                }" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee"/>`
                            )
                            .join("")}
                        </div>
                      `
                          : ""
                      }
                      <div style="font-size:0.8rem;color:#888;margin-top:8px;">${
                        r.timestamp
                      }</div>
                    </div>
                  </div>
                `
                        )
                        .join("")
                    : '<p style="text-align:center;color:#999;padding:20px;">Chưa có đánh giá nào</p>'
                }
              </div>
            </div>
          `
          }
        </div>

        <div id="view-detail-section" style="${
          activeTab === "overview" ? "" : "display:none;"
        }margin-top:20px;">
          <div style="border:1px solid #e5e7eb;border-radius:12px;padding:18px;">
            <button id="view-detail-btn" style="width:100%;padding:14px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:1rem;margin-bottom:12px;">
              Xem chi tiết
            </button>
            <div style="font-size:0.9rem;color:#555;line-height:1.6">
              <div>Location: ${place.address || "Địa chỉ chưa có"}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    attachCommunityPhotoSection(place);

    // Attach event listeners for tabs
    const switchTab = (newTab) => {
      console.log("🔄 Switching tab to:", newTab);

      // ✅ UPDATE REACT STATE
      setActiveTab(newTab);

      // ✅ UPDATE DOM IMMEDIATELY (không đợi React re-render)
      const overviewBtn = document.getElementById("overview-tab");
      const reviewsBtn = document.getElementById("reviews-tab");
      const contentArea = document.getElementById("content-area");
      const detailSection = document.getElementById("view-detail-section");

      if (!contentArea) return;
      if (detailSection) {
        detailSection.style.display = newTab === "overview" ? "block" : "none";
      }

      if (overviewBtn && reviewsBtn) {
        if (newTab === "overview") {
          overviewBtn.style.background = "#e8f0fe";
          overviewBtn.style.color = "#1a73e8";
          overviewBtn.style.fontWeight = "600";
          reviewsBtn.style.background = "#f8f9fa";
          reviewsBtn.style.color = "#333";
          reviewsBtn.style.fontWeight = "normal";
        } else {
          reviewsBtn.style.background = "#e8f0fe";
          reviewsBtn.style.color = "#1a73e8";
          reviewsBtn.style.fontWeight = "600";
          overviewBtn.style.background = "#f8f9fa";
          overviewBtn.style.color = "#333";
          overviewBtn.style.fontWeight = "normal";
        }
      }

      // Re-render content area
      if (newTab === "overview") {
        const latestPhotos = communityPhotosRef.current.get(place.id) || [];
        contentArea.innerHTML = `
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
            <div id="community-photo-carousel" data-location-id="${
              place.id
            }" style="width:100%;">
              ${
                latestPhotos.length
                  ? "<!-- sẽ được cập nhật sau -->"
                  : '<p style="margin:0;color:#777;font-size:0.9rem;">Chưa có ảnh nào được duyệt.</p>'
              }
            </div>
          </div>
        `;
        attachCommunityPhotoSection(place);

        // Re-attach overview buttons
        document
          .getElementById("get-directions-btn")
          ?.addEventListener("click", () => {
            // Nếu chưa có vị trí người dùng, thử lấy lại
            if (!userLocation && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;
                  setUserLocation({ lat, lng });

                  // Cập nhật marker người dùng
                  if (userMarker.current) {
                    userMarker.current.setLatLng([lat, lng]);
                  } else {
                    const icon = L.divIcon({
                      html: `<div style="width:16px;height:16px;background:#4285f4;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                      className: "user-location-marker",
                      iconSize: [22, 22],
                      iconAnchor: [11, 11],
                    });
                    userMarker.current = L.marker([lat, lng], { icon }).addTo(
                      map
                    );
                    userMarker.current.bindPopup(
                      '<b style="color:#4285f4">Vị trí của bạn</b>'
                    );
                  }

                  // Tính đường
                  calculateRoute({ lat, lng }, place.position, map);
                },
                () => alert("⚠️ Vui lòng bật định vị để chỉ đường!")
              );
            } else if (userLocation) {
              // Đã có vị trí, tính đường luôn
              calculateRoute(userLocation, place.position, map);
            } else {
              alert("⚠️ Vui lòng bật định vị để chễ đường!");
            }
          });

        document
          .getElementById("share-location-btn")
          ?.addEventListener("click", () => {
            handleShareLocation(place);
          });

        document.getElementById("save-btn")?.addEventListener("click", () => {
          if (!user || !user.userId) {
            (async () => {
              const shouldLogin = await showLoginConfirmModal(
                "Bạn cần đăng nhập để lưu địa điểm vào yêu thích."
              );
              if (shouldLogin) {
                window.location.href = "/login";
              }
            })();
            return;
          }
          const fullPlace = places.find((p) => p.id === place.id) || place;
          const alreadySaved = getCurrentUserPlaceFavorites().some(
            (f) => f.id === fullPlace.id
          );
          if (alreadySaved) {
            alert("Đã có trong yêu thích!");
            return;
          }
          addPlaceToFavorites(fullPlace);
          alert("Đã lưu!");
        });

        document
          .getElementById("compare-btn")
          ?.addEventListener("click", () => setComparePlace(place));
      } else {
        // Reviews tab
        contentArea.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;width:100%;">
            <div style="background:#f1f1f1;padding:16px;border-radius:8px;width:100%;margin-bottom:16px;text-align:center;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:600;">${(
                  reviewsData.reduce((sum, r) => sum + r.rating, 0) /
                    Math.max(reviewsData.length, 1) || 0
                ).toFixed(1)}</span>
                <span style="color:#777;">${reviewsData.length} đánh giá</span>
              </div>
              <div style="margin-top:8px;">
                <span style="color:#ffca28;">${"★".repeat(
                  Math.floor(
                    reviewsData.reduce((sum, r) => sum + r.rating, 0) /
                      Math.max(reviewsData.length, 1) || 0
                  )
                )}${"☆".repeat(
          5 -
            Math.floor(
              reviewsData.reduce((sum, r) => sum + r.rating, 0) /
                Math.max(reviewsData.length, 1) || 0
            )
        )}</span>
              </div>
            </div>

            ${(() => {
              // ✅ Đang loading auth → Hiển thị loading state
              if (isAuthLoading) {
                return `
                  <div style="width:100%;margin-bottom:16px;padding:20px;text-align:center;">
                    <div style="display:inline-block;width:24px;height:24px;border:3px solid #e0e0e0;border-top-color:#1a73e8;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                    <style>@keyframes spin { to { transform: rotate(360deg); }}</style>
                    <p style="margin:8px 0 0 0;color:#666;font-size:0.9rem;">Đang kiểm tra đăng nhập...</p>
                  </div>
                `;
              }

              // ✅ Đã có user → Hiển thị form đánh giá
              if (user && user.userId) {
                return `
                  <div style="width:100%;margin-bottom:16px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                      <span>Đánh giá của bạn: </span>
                      <div id="star-rating" style="display:flex;gap:2px;">
                        ${[1, 2, 3, 4, 5]
                          .map((i) => {
                            const currentRating = window.currentRating || 0;
                            return `<span id="star-${i}" style="cursor:pointer;font-size:1.2rem;color:${
                              i <= currentRating ? "#ffca28" : "#ccc"
                            };" onclick="window.setStarRating(${i})">★</span>`;
                          })
                          .join("")}
                      </div>
                    </div>
                    <textarea id="comment-input" placeholder="Viết bình luận..." style="width:100%;height:80px;padding:8px;border:1px solid #ccc;border-radius:4px;margin-bottom:8px;resize:vertical;">${newComment}</textarea>
                    <button id="submit-review-btn" style="width:100%;padding:10px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Gửi đánh giá</button>
                  </div>
                `;
              }

              // ✅ Chưa đăng nhập → Hiển thị prompt
              return `
                <div style="width:100%;margin-bottom:16px;padding:16px;background:#fff3cd;border-radius:8px;text-align:center;">
                  <p style="margin:0;color:#856404;">Vui lòng <a href="#" id="login-to-review-link" style="color:#1a73e8;text-decoration:none;font-weight:600;">đăng nhập</a> để đánh giá địa điểm này</p>
                </div>
              `;
            })()}

            <div id="reviews-list" style="width:100%;max-height:300px;overflow-y:auto;">
              ${
                reviewsData.length > 0
                  ? reviewsData
                      .map(
                        (r) => `
                <div style="padding:12px;border-bottom:1px solid #eee;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-weight:600;color:#333;">${
                      r.userName || "Ẩn danh"
                    }</span>
                    <span style="color:#ffca28;">${"★".repeat(
                      r.rating
                    )}${"☆".repeat(5 - r.rating)}</span>
                  </div>
                  <p style="margin:4px 0;color:#555;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;">${
                    r.comment
                  }</p>
                  <span style="font-size:0.8rem;color:#888;">${
                    r.timestamp
                  }</span>
                </div>
              `
                      )
                      .join("")
                  : '<p style="text-align:center;color:#999;padding:20px;">Chưa có đánh giá nào</p>'
              }
            </div>
          </div>
        `;

        // Re-attach login link (CHỈ KHI USER CHƯA ĐĂNG NHẬP)
        if (!user || !user.userId) {
          document
            .getElementById("login-to-review-link")
            ?.addEventListener("click", (e) => {
              e.preventDefault();
              // Lưu thông tin địa điểm hiện tại vào localStorage để sau khi login quay lại
              localStorage.setItem(
                "returnToPlace",
                JSON.stringify({
                  placeId: place.id,
                  placeTitle: place.title,
                  openReviewTab: true,
                  timestamp: Date.now(),
                })
              );
              window.location.href = "/login";
            });
        }

        // Re-attach submit review button (CHỈ KHI USER ĐÃ ĐĂNG NHẬP)
        const submitBtn = document.getElementById("submit-review-btn");
        const imageInput = document.getElementById("review-images");
        const imagePreview = document.getElementById("image-preview");

        if (submitBtn && user && user.userId) {
          // ✅ Image input preview handler
          if (imageInput) {
            imageInput.addEventListener("change", (e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 5) {
                alert("⚠️ Chỉ được chọn tối đa 5 ảnh!");
                imageInput.value = "";
                return;
              }

              // Show preview
              if (imagePreview) {
                imagePreview.innerHTML = files
                  .map(
                    (f, idx) => `
                  <div style="position:relative;width:80px;height:80px;">
                    <img src="${URL.createObjectURL(
                      f
                    )}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:1px solid #ccc" />
                    <span style="position:absolute;top:-6px;right:-6px;background:#666;color:white;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;cursor:pointer;" data-remove-idx="${idx}">✕</span>
                  </div>
                `
                  )
                  .join("");

                // Attach remove handlers
                imagePreview
                  .querySelectorAll("[data-remove-idx]")
                  .forEach((btn) => {
                    btn.addEventListener("click", () => {
                      const idx = parseInt(btn.getAttribute("data-remove-idx"));
                      const dt = new DataTransfer();
                      Array.from(imageInput.files).forEach((f, i) => {
                        if (i !== idx) dt.items.add(f);
                      });
                      imageInput.files = dt.files;
                      imageInput.dispatchEvent(new Event("change"));
                    });
                  });
              }
            });
          }

          // ✅ ATTACH STARS CLICK HANDLERS (quan trọng!)
          for (let i = 1; i <= 5; i++) {
            const star = document.getElementById(`star-${i}`);
            if (star) {
              star.addEventListener("click", () => {
                console.log("⭐ Star clicked:", i);
                window.setStarRating(i);
              });
            }
          }

          submitBtn.addEventListener("click", async () => {
            const commentInput = document.getElementById("comment-input");
            const comment = commentInput?.value?.trim();

            // ✅ ĐỌC RATING TỪ WINDOW.CURRENTRATING (ƯU TIÊN) hoặc newRating state
            const currentRating = window.currentRating ?? newRating;

            // ✅ DEBUG LOG CHI TIẾT
            console.log("📊 [SUBMIT] Rating check:", {
              "window.currentRating": window.currentRating,
              "newRating state": newRating,
              "final currentRating": currentRating,
              type: typeof currentRating,
              comment: comment?.substring(0, 30),
            });

            // ✅ VALIDATION: rating phải là số từ 1-5 (KIỂM TRA CHÍNH XÁC)
            if (
              currentRating === null ||
              currentRating === undefined ||
              currentRating < 1 ||
              currentRating > 5
            ) {
              console.error("❌ Rating validation failed:", {
                currentRating,
                windowCurrentRating: window.currentRating,
                newRatingState: newRating,
                type: typeof currentRating,
                isNull: currentRating === null,
                isUndefined: currentRating === undefined,
              });
              alert(
                "🌟 Vui lòng chọn số sao (1-5 sao) trước khi gửi đánh giá!"
              );
              return;
            }
            if (!comment) {
              alert("💬 Vui lòng nhập bình luận!");
              return;
            }

            // ✅ AI MODERATION CHECK (standardized)
            let moderationForSend = null;
            try {
              const mod = await moderateText(comment);
              const aiAnalysis = mod?.detail || mod;
              console.log("🤖 [AI MODERATION] Result:", aiAnalysis);

              if (mod) {
                if (mod.action === "block" || mod.label === "toxic") {
                  alert(
                    `⚠️ Bình luận có nội dung không phù hợp. Vui lòng viết lại!`
                  );
                  submitBtn.disabled = false;
                  submitBtn.textContent = "Gửi đánh giá";
                  const commentInput = document.getElementById("comment-input");
                  if (commentInput) commentInput.value = "";
                  setNewComment("");
                  return;
                }

                if (mod.warn) {
                  const confirmSend = confirm(
                    `⚠️ AI phát hiện có thể vi phạm. Bạn có chắc muốn gửi?`
                  );
                  if (!confirmSend) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Gửi đánh giá";
                    return;
                  }
                }

                if (mod.label === "hate") {
                  moderationForSend = mod.detail || mod;
                }
              }
            } catch (aiError) {
              console.error(
                "❌ [AI MODERATION] Error:",
                aiError?.message || aiError
              );
              alert(
                `❌ AI kiểm duyệt không khả dụng. Vui lòng thử lại sau!\n\nLỗi: ${
                  aiError?.message || aiError
                }`
              );
              submitBtn.disabled = false;
              submitBtn.textContent = "Gửi đánh giá";
              return; // CHẶN CỨNG KHÔNG CHO GỬI NẾU AI LỖI
            }

            try {
              console.log("🚀 [SUBMIT] Sending to API:", {
                userId: user.userId,
                rating: currentRating,
                comment: comment,
                endpoint: `${BASE_URL}/map-locations/${place.id}/feedback`,
              });

              // ✅ Build FormData to send images + data
              const formData = new FormData();
              formData.append("userId", user.userId);
              formData.append("rating", currentRating);
              formData.append("comment", comment);

              // Add images if selected
              if (imageInput?.files) {
                Array.from(imageInput.files).forEach((file) => {
                  formData.append("images", file);
                });
              }

              await axios.post(
                `${BASE_URL}/map-locations/${place.id}/feedback`,
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );

              console.log("✅ [SUBMIT] Review submitted successfully!");

              // ✅ RESET FORM
              setNewRating(null); // ✅ Reset thành null
              setNewComment("");
              window.currentRating = null; // ✅ Reset thành null
              if (commentInput) commentInput.value = "";
              if (imageInput) imageInput.value = "";
              if (imagePreview) imagePreview.innerHTML = "";

              // ✅ RESET MÀU SAO VỀ MẶC ĐỊNH
              for (let i = 1; i <= 5; i++) {
                const star = document.getElementById(`star-${i}`);
                if (star) {
                  star.style.color = "#ccc";
                }
              }

              // ✅ RELOAD REVIEWS TỪ DATABASE
              const reviewsRes = await axios.get(
                `${BASE_URL}/map-locations/${place.id}/feedback`
              );
              const newReviewsList = reviewsRes.data.map((r) => ({
                FeedbackID: r.FeedbackID,
                rating: r.Rating,
                comment: r.Comment,
                timestamp: new Date(r.CreatedAt).toLocaleDateString("vi-VN"),
                userName: r.user?.FullName || "Ẩn danh",
                avatar: r.user?.profile?.Avatar || "/img/default-avatar.png",
                likes: r.Likes || 0,
                images: r.ImageUrls ? JSON.parse(r.ImageUrls) : [],
                imagesApproved: !!r.ImagesApproved,
              }));

              setReviews(newReviewsList);

              console.log(
                "✅ [SUBMIT] Reviews updated:",
                newReviewsList.length,
                "total reviews"
              );

              // ✅ CẬP NHẬT RATING SUMMARY TRỰC TIẾP
              setTimeout(() => {
                const avgRating =
                  newReviewsList.length > 0
                    ? (
                        newReviewsList.reduce((sum, r) => sum + r.rating, 0) /
                        newReviewsList.length
                      ).toFixed(1)
                    : "0.0";

                const ratingSummary = document.querySelector(
                  ".rating-summary-container"
                );
                if (ratingSummary) {
                  ratingSummary.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-weight:600;">${avgRating}</span>
                      <span style="color:#777;">${
                        newReviewsList.length
                      } đánh giá</span>
                    </div>
                    <div style="margin-top:8px;">
                      <span style="color:#ffca28;">${"★".repeat(
                        Math.floor(parseFloat(avgRating))
                      )}${"☆".repeat(
                    5 - Math.floor(parseFloat(avgRating))
                  )}</span>
                    </div>
                  `;
                  console.log("✅ Rating summary updated to:", avgRating);
                }

                const histogram = document.querySelector(".rating-histogram");
                if (histogram && newReviewsList.length > 0) {
                  const histogramHTML = [5, 4, 3, 2, 1]
                    .map((star) => {
                      const num = newReviewsList.filter(
                        (r) => r.rating === star
                      ).length;
                      const pct = Math.round(
                        (num / newReviewsList.length) * 100
                      );
                      return `
                      <div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:36px">${star}★</div>
                        <div style="flex:1;background:#eee;border-radius:6px;height:10px;overflow:hidden;">
                          <div style="width:${pct}%;height:100%;background:#ffd54f;border-radius:6px"></div>
                        </div>
                        <div style="width:36px;text-align:right;color:#666">${pct}%</div>
                      </div>
                    `;
                    })
                    .join("");
                  histogram.innerHTML = histogramHTML;
                  console.log("✅ Histogram updated");
                }
              }, 150);

              // ✅ UPDATE REVIEWS LIST IN DOM IMMEDIATELY (with avatar + like)
              const reviewsList = document.getElementById("reviews-list");
              if (reviewsList) {
                reviewsList.innerHTML =
                  newReviewsList.length > 0
                    ? newReviewsList
                        .map(
                          (r) => `
                  <div style="padding:12px;border-bottom:1px solid #eee;display:flex;gap:12px;align-items:flex-start;">
                    <img src="${
                      r.avatar
                    }" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0" />
                    <div style="flex:1;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px;">
                        <div>
                          <div style="font-weight:600;color:#333">${
                            r.userName || "Ẩn danh"
                          }</div>
                          <div style="color:#ffca28;">${"★".repeat(
                            r.rating
                          )}${"☆".repeat(5 - r.rating)}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px">
                          <button class="like-btn" data-feedback-id="${
                            r.FeedbackID || ""
                          }" style="background:transparent;border:none;cursor:pointer;color:#666;display:flex;align-items:center;gap:6px">👍 <span class="like-count">${
                            r.likes
                          }</span></button>
                        </div>
                      </div>
                      <p style="margin:4px 0;color:#555;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;">${
                        r.comment
                      }</p>
                      ${
                        r.images && r.images.length > 0 && r.imagesApproved
                          ? `
                        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                          ${r.images
                            .map(
                              (img) =>
                                `<img src="${
                                  img.startsWith("http")
                                    ? img
                                    : `${BASE_URL}${img}`
                                }" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee"/>`
                            )
                            .join("")}
                        </div>
                      `
                          : ""
                      }
                      <div style="font-size:0.8rem;color:#888;margin-top:8px;">${
                        r.timestamp
                      }</div>
                    </div>
                  </div>
                `
                        )
                        .join("")
                    : '<p style="text-align:center;color:#999;padding:20px;">Chưa có đánh giá nào</p>';

                // attach like handlers
                const likeButtons = reviewsList.querySelectorAll(".like-btn");
                likeButtons.forEach((btn) => {
                  btn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    const fid = btn.getAttribute("data-feedback-id");
                    if (!fid) return;
                    const countSpan = btn.querySelector(".like-count");
                    const current =
                      parseInt(countSpan.textContent || "0", 10) || 0;
                    countSpan.textContent = (current + 1).toString();
                    try {
                      await axios.post(
                        `${BASE_URL}/map-locations/${place.id}/feedback/${fid}/like`
                      );
                    } catch (err) {
                      console.error("Like failed", err);
                      countSpan.textContent = current.toString();
                      alert("Không thể like, thử lại sau");
                    }
                  });
                });
              }

              // ✅ No success message (user doesn't want it)
            } catch (error) {
              console.error("Error submitting review:", error);
              alert(
                `Có lỗi khi gửi đánh giá: ${
                  error.response?.data?.message || error.message
                }`
              );
            }
          });
        }
      }
    };

    document
      .getElementById("overview-tab")
      ?.addEventListener("click", () => switchTab("overview"));
    document
      .getElementById("reviews-tab")
      ?.addEventListener("click", () => switchTab("reviews"));

    document
      .getElementById("view-detail-btn")
      ?.addEventListener("click", () => showDetailModal(place));

    // ✅ TỰ ĐỘNG MỞ REVIEWS TAB NẾU USER ĐÃ LOGIN
    if (user && user.userId && activeTab === "overview") {
      console.log("📝 Auto-opening reviews tab for logged-in user");
      switchTab("reviews"); // switchTab sẽ attach handlers trong nó
    } else if (activeTab === "reviews" && user && user.userId) {
      // ✅ NẾU ĐÃ RENDER REVIEWS TAB TỪ ĐẦU → ATTACH HANDLERS NGAY
      console.log("📝 Initial reviews tab, attaching handlers");
      setTimeout(() => {
        // Attach stars
        for (let i = 1; i <= 5; i++) {
          const star = document.getElementById(`star-${i}`);
          if (star) {
            star.addEventListener("click", () => {
              console.log("⭐ Star clicked (initial):", i);
              window.setStarRating(i);
            });
          }
        }

        // Attach submit button
        const submitBtn = document.getElementById("submit-review-btn");
        if (submitBtn) {
          submitBtn.addEventListener("click", async () => {
            const commentInput = document.getElementById("comment-input");
            const comment = commentInput?.value?.trim();
            const currentRating = window.currentRating ?? newRating;

            console.log("Gửi đi:", { rating: currentRating, comment });

            if (!currentRating || currentRating < 1 || currentRating > 5) {
              console.error("❌ Rating validation failed");
              return alert("🌟 Chọn sao đi! (1-5 sao)");
            }
            if (!comment) return alert("Vui lòng nhập bình luận!");

            // ✅ AI MODERATION CHECK
            const aiConfig = getAiFeatureConfig();
            console.log("🔧 [DEBUG] AI Config:", aiConfig);
            console.log(
              "🔧 [DEBUG] moderateComment flag:",
              aiConfig.featureFlags.moderateComment
            );
            console.log(
              "🔧 [DEBUG] AI URL:",
              `${aiConfig.baseUrls[0]}${aiConfig.endpoints.moderateComment}`
            );

            if (aiConfig.featureFlags.moderateComment) {
              try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Đang kiểm tra AI...";

                console.log("🚀 [AI] Calling moderation API...");
                const moderationResponse = await axios.post(
                  `${aiConfig.baseUrls[0]}${aiConfig.endpoints.moderateComment}`,
                  { text: comment },
                  { timeout: 8000 }
                );

                console.log(
                  "✅ [AI] Response received:",
                  moderationResponse.data
                );
                const { toxicity, categories } = moderationResponse.data;
                console.log("🤖 [AI MODERATION] Result:", {
                  toxicity,
                  categories,
                  comment,
                });

                if (toxicity > 0.6) {
                  alert(
                    `⚠️ Bình luận có khả năng vi phạm (${(
                      toxicity * 100
                    ).toFixed(1)}%). Vui lòng viết lại!`
                  );
                  submitBtn.disabled = false;
                  submitBtn.textContent = "Gửi đánh giá";
                  return;
                } else if (toxicity > 0.4) {
                  const confirmSend = confirm(
                    `⚠️ AI phát hiện có thể vi phạm (${(toxicity * 100).toFixed(
                      1
                    )}%). Bạn có chắc muốn gửi?`
                  );
                  if (!confirmSend) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Gửi đánh giá";
                    return;
                  }
                }
                console.log("✅ [AI] Comment passed moderation check");
                submitBtn.textContent = "Gửi đánh giá";
                submitBtn.disabled = false;
              } catch (aiError) {
                console.error("❌ [AI MODERATION] Error:", aiError.message);
                console.error("❌ [AI MODERATION] Full error:", aiError);
                alert(
                  `❌ AI kiểm duyệt không khả dụng. Vui lòng thử lại sau!\n\nLỗi: ${aiError.message}`
                );
                submitBtn.disabled = false;
                submitBtn.textContent = "Gửi đánh giá";
                return; // CHẶN CỨNG KHÔNG CHO GỬI NẾU AI LỖI
              }
            }

            try {
              const payload = {
                userId: user.userId,
                rating: currentRating,
                comment: comment,
              };
              if (moderationForSend) payload.moderation = moderationForSend;

              await axios.post(
                `${BASE_URL}/map-locations/${place.id}/feedback`,
                payload
              );

              setNewRating(null);
              setNewComment("");
              window.currentRating = null;
              if (commentInput) commentInput.value = "";

              const reviewsRes = await axios.get(
                `${BASE_URL}/map-locations/${place.id}/feedback`
              );
              setReviews(
                reviewsRes.data.map((r) => ({
                  FeedbackID: r.FeedbackID,
                  rating: r.Rating,
                  comment: r.Comment,
                  timestamp: new Date(r.CreatedAt).toLocaleDateString("vi-VN"),
                  userName: r.user?.FullName || "Ẩn danh",
                  avatar: r.user?.profile?.Avatar || "/img/default-avatar.png",
                  likes: r.Likes || 0,
                  images: r.ImageUrls ? JSON.parse(r.ImageUrls) : [],
                  imagesApproved: !!r.ImagesApproved,
                }))
              );

              // ✅ No success message (user doesn't want it)
              switchTab("reviews");
            } catch (error) {
              console.error("Error:", error);
              alert(`Lỗi: ${error.response?.data?.message || error.message}`);
            }
          });
        }
      }, 100);
    }

    // Initialize handlers based on current tab
    if (activeTab === "overview") {
      document
        .getElementById("get-directions-btn")
        ?.addEventListener("click", () => {
          // Nếu chưa có vị trí người dùng, thử lấy lại
          if (!userLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setUserLocation({ lat, lng });

                // Cập nhật marker người dùng
                if (userMarker.current) {
                  userMarker.current.setLatLng([lat, lng]);
                } else {
                  const icon = L.divIcon({
                    html: `<div style="width:16px;height:16px;background:#4285f4;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                    className: "user-location-marker",
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                  });
                  userMarker.current = L.marker([lat, lng], { icon }).addTo(
                    map
                  );
                  userMarker.current.bindPopup(
                    '<b style="color:#4285f4">Vị trí của bạn</b>'
                  );
                }

                // Tính đường
                calculateRoute({ lat, lng }, place.position, map);
              },
              () => alert("⚠️ Vui lòng bật định vị để chỉ đường!")
            );
          } else if (userLocation) {
            // Đã có vị trí, tính đường luôn
            calculateRoute(userLocation, place.position, map);
          } else {
            alert("⚠️ Vui lòng bật định vị để chễ đường!");
          }
        });

      document
        .getElementById("share-location-btn")
        ?.addEventListener("click", () => {
          handleShareLocation(place);
        });

      document.getElementById("save-btn")?.addEventListener("click", () => {
        if (!user || !user.userId) {
          (async () => {
            const shouldLogin = await showLoginConfirmModal(
              "Bạn cần đăng nhập để lưu địa điểm vào yêu thích."
            );
            if (shouldLogin) {
              window.location.href = "/login";
            }
          })();
          return;
        }
        const fullPlace = places.find((p) => p.id === place.id) || place;
        const alreadySaved = getCurrentUserPlaceFavorites().some(
          (f) => f.id === fullPlace.id
        );
        if (alreadySaved) {
          alert("Đã có trong yêu thích!");
          return;
        }
        addPlaceToFavorites(fullPlace);
        alert("Đã lưu!");
      });

      document
        .getElementById("compare-btn")
        ?.addEventListener("click", () => setComparePlace(place));

      // Write review button
      document
        .getElementById("write-review-btn")
        ?.addEventListener("click", () => {
          switchTab("reviews");
          setTimeout(() => {
            const commentInput = document.getElementById("comment-input");
            if (commentInput) commentInput.focus();
          }, 150);
        });
    }
  };

  /* ---------- MODAL CHI TIẾT ---------- */
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
        <img src="${safeImageUrl(place.image, "https://via.placeholder.com/700xauto?text=Chưa+có+hình")}" style="width:100%;height:auto;object-fit:contain;border-radius:12px;" />
      </div>
      <div style="padding:20px;flex:1;overflow-y:auto;">
        <h3 style="margin:0 0 12px;font-size:1.4rem;font-weight:600;color:#1a0dab;">${
          place.title
        }</h3>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:16px;">
          <span style="color:#d50000;font-weight:bold;">${
            place.rating || 0
          }</span>
          ${"★".repeat(Math.floor(place.rating || 0))}${"☆".repeat(
      5 - Math.floor(place.rating || 0)
    )}
          <span style="color:#666;font-size:0.9rem;">(${
            place.reviews || 0
          } đánh giá)</span>
        </div>
        <p style="margin:0 0 20px;font-size:1rem;line-height:1.7;color:#333;">${
          place.fullDesc || "Chi tiết chưa có"
        }</p>
        <div style="padding:16px;background:#f8f9fa;border-radius:8px;font-size:0.95rem;color:#555;">
          <div style="margin-bottom:8px;"><strong>Địa chỉ:</strong> ${
            place.address || "Địa chỉ chưa có"
          }</div>
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

    // ✅ Đọc giá trị MỚI NHẤT từ ref (tránh stale closure)
    const currentUser = userRef.current;
    const currentIsAuthLoading = isAuthLoadingRef.current;

    // ✅ Kiểm tra auth state TRƯỚC KHI tạo modal
    console.log(
      "📸 Opening photo modal - isAuthLoading:",
      currentIsAuthLoading,
      "user:",
      currentUser?.userId
    );

    // ⚠️ Nếu đang loading auth, chờ
    if (currentIsAuthLoading) {
      console.log("⏳ Đang restore session, vui lòng đợi...");
      return;
    }

    // ⚠️ Nếu chưa đăng nhập, HIỂN THỊ MODAL XÁC NHẬN
    if (!currentUser || !currentUser.userId) {
      console.log("❌ User chưa đăng nhập");
      (async () => {
        const shouldLogin = await showLoginConfirmModal(
          "Bạn cần đăng nhập để thêm ảnh cộng đồng."
        );
        if (shouldLogin) {
          window.location.href = "/login";
        }
      })();
      return;
    }

    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;";
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePhotoUploadModal();
    });
    document.body.appendChild(overlay);
    uploadOverlayRef.current = overlay;

    const modal = document.createElement("div");
    modal.style.cssText =
      "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;max-width:420px;background:white;border-radius:20px;padding:24px;box-shadow:0 24px 60px rgba(15,23,42,0.25);z-index:10002;";
    modal.innerHTML = `
      <button id="close-photo-modal" style="position:absolute;top:12px;right:12px;width:34px;height:34px;border:none;border-radius:50%;background:#f1f5f9;color:#475569;font-size:1.1rem;cursor:pointer;">×</button>
      <h2 style="margin:0 0 8px;font-size:1.4rem;color:#1f2937;">Thêm ảnh cộng đồng</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:0.95rem;">Chia sẻ khoảnh khắc của bạn tại <strong>${
        place.title
      }</strong>. Ảnh sẽ được kiểm duyệt trước khi hiển thị.</p>
      ${
        currentUser && currentUser.userId
          ? `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="display:block;font-weight:600;margin-bottom:6px;color:#1f2937;">Chọn ảnh *</label>
            <input type="file" id="photo-modal-file" accept="image/*" style="width:100%;padding:10px;border:1px solid #d0d7e2;border-radius:10px;" />
          </div>
          <div>
            <label style="display:block;font-weight:600;margin-bottom:6px;color:#1f2937;">Năm chụp (tùy chọn)</label>
            <input type="number" id="photo-modal-year" placeholder="Ví dụ: 1998" min="1800" max="${
              new Date().getFullYear() + 1
            }" style="width:100%;padding:10px;border:1px solid #d0d7e2;border-radius:10px;" />
          </div>
          <div style="border:1px dashed #cbd5f5;border-radius:12px;height:150px;display:flex;align-items:center;justify-content:center;color:#94a3b8;text-align:center;" id="photo-modal-preview">Chưa chọn ảnh</div>
          <button id="photo-modal-submit" style="width:100%;padding:12px;border:none;border-radius:999px;background:#1a73e8;color:white;font-weight:600;font-size:1rem;cursor:pointer;">Gửi ảnh</button>
          <p id="photo-modal-status" style="margin:0;color:#475569;font-size:0.9rem;"></p>
        </div>
      `
          : `
        <div style="padding:16px;border:1px solid #fee2e2;border-radius:12px;background:#fff1f2;text-align:center;color:#b91c1c;">
          Bạn cần <a href="/login" id="photo-modal-login" style="color:#1a73e8;font-weight:600;">đăng nhập</a> để gửi ảnh.
        </div>
      `
      }
    `;
    document.body.appendChild(modal);
    uploadModalRef.current = modal;

    modal
      .querySelector("#close-photo-modal")
      ?.addEventListener("click", closePhotoUploadModal);

    if (!currentUser || !currentUser.userId) {
      modal
        .querySelector("#photo-modal-login")
        ?.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "/login";
        });
      return;
    }

    const fileInput = modal.querySelector("#photo-modal-file");
    const previewBox = modal.querySelector("#photo-modal-preview");
    const yearInput = modal.querySelector("#photo-modal-year");
    const submitBtn = modal.querySelector("#photo-modal-submit");
    const statusEl = modal.querySelector("#photo-modal-status");

    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) {
        previewBox.textContent = "Chưa chọn ảnh";
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      previewBox.innerHTML = `<img src="${previewUrl}" alt="Preview" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" />`;
    });

    submitBtn?.addEventListener("click", async () => {
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("Vui lòng chọn ảnh trước khi gửi.");
        return;
      }

      const formData = new FormData();
      formData.append("locationId", place.id);
      formData.append("userId", currentUser.userId);
      if (yearInput?.value) {
        formData.append("year", yearInput.value);
      }
      formData.append("image", fileInput.files[0]);

      submitBtn.disabled = true;
      submitBtn.textContent = "Đang gửi...";
      if (statusEl) statusEl.textContent = "";

      try {
        await axios.post(`${BASE_URL}/location-images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (statusEl) statusEl.textContent = "✅ Ảnh đã được gửi, chờ duyệt.";
        fileInput.value = "";
        if (previewBox) previewBox.textContent = "Chưa chọn ảnh";
        if (yearInput) yearInput.value = "";
        await refreshCommunityPhotos(place.id, place);
        setTimeout(() => {
          closePhotoUploadModal();
        }, 800);
      } catch (err) {
        console.error("Gửi ảnh thất bại", err);
        const msg =
          err?.response?.data?.message || "Gửi ảnh thất bại, vui lòng thử lại.";
        if (statusEl) statusEl.textContent = `❌ ${msg}`;
        else alert(msg);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Gửi ảnh";
      }
    });
  };

  const openPhotoPreview = ({ photos = [], startIndex = 0 } = {}) => {
    if (!Array.isArray(photos) || !photos.length) return;
    let currentIndex = Math.min(Math.max(startIndex, 0), photos.length - 1);

    const buildPhotoData = (idx) => {
      const p = photos[idx] || {};
      const rawSrc = p.ImagePath || p.imagePath || p.src || "";
      const src = rawSrc?.startsWith("http") ? rawSrc : `${BASE_URL}${rawSrc}`;
      return {
        src: src || "",
        year: p.Year || p.year || "Chưa rõ năm",
        userName: p.submittedBy || p.userName || "Ẩn danh",
      };
    };

    const getCurrentData = () => buildPhotoData(currentIndex);

    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);backdrop-filter:blur(3px);z-index:10050;display:flex;align-items:center;justify-content:center;padding:24px;";
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });

    overlay.innerHTML = `
      <div style="position:relative;width:100%;max-width:960px;max-height:92vh;background:#020617;border-radius:20px;padding:56px 20px 16px;box-shadow:0 30px 80px rgba(0,0,0,0.55);display:flex;flex-direction:column;gap:14px;font-family:system-ui;">
        <button id="preview-close" style="position:absolute;top:8px;right:8px;width:40px;height:40px;border:none;border-radius:50%;background:rgba(239,68,68,0.9);color:white;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.3);" onmouseover="this.style.background='rgba(220,38,38,1)'" onmouseout="this.style.background='rgba(239,68,68,0.9)'">×</button>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div style="display:flex;gap:10px;">
            <button id="preview-prev" style="padding:8px 14px;border:none;border-radius:999px;background:#1e293b;color:white;font-weight:600;cursor:pointer;font-size:0.85rem;">‹ Ảnh trước</button>
            <button id="preview-next" style="padding:8px 14px;border:none;border-radius:999px;background:#1a73e8;color:white;font-weight:600;cursor:pointer;font-size:0.85rem;">Ảnh tiếp ›</button>
          </div>
          <div style="display:flex;gap:10px;">
            <button id="preview-zoom-out" style="padding:8px 14px;border:none;border-radius:999px;background:#1e293b;color:white;font-weight:600;cursor:pointer;font-size:0.85rem;">−</button>
            <button id="preview-zoom-in" style="padding:8px 14px;border:none;border-radius:999px;background:#1a73e8;color:white;font-weight:600;cursor:pointer;font-size:0.85rem;">+</button>
            <button id="preview-reset" style="padding:8px 14px;border:none;border-radius:999px;background:#334155;color:white;font-weight:600;cursor:pointer;font-size:0.85rem;">Reset</button>
          </div>
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:14px;background:#020617;position:relative;">
          <img id="preview-image" src="" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:14px;transition:transform 0.2s ease;" />
        </div>
        <div style="margin-top:4px;padding:10px 4px 0;border-top:1px solid rgba(148,163,184,0.4);display:flex;justify-content:space-between;align-items:center;gap:12px;color:#e5e7eb;font-size:0.9rem;">
          <div style="display:flex;flex-direction:column;gap:2px;max-width:70%;">
            <span style="font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;">Ảnh cộng đồng</span>
            <span id="preview-user" style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">👤 </span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span id="preview-year" style="padding:6px 12px;border-radius:999px;background:#0f172a;color:#facc15;font-weight:600;font-size:0.85rem;white-space:nowrap;">📅 </span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const img = overlay.querySelector("#preview-image");
    const userLabel = overlay.querySelector("#preview-user");
    const yearLabel = overlay.querySelector("#preview-year");
    const zoomInBtn = overlay.querySelector("#preview-zoom-in");
    const zoomOutBtn = overlay.querySelector("#preview-zoom-out");
    const resetBtn = overlay.querySelector("#preview-reset");
    const closeBtn = overlay.querySelector("#preview-close");
    const prevBtn = overlay.querySelector("#preview-prev");
    const nextBtn = overlay.querySelector("#preview-next");
    let scale = 1;

    const applyScale = () => {
      img.style.transform = `scale(${scale})`;
      img.style.cursor = scale > 1 ? "grab" : "default";
    };

    const renderPhoto = () => {
      const data = getCurrentData();
      if (!data.src) return;
      img.src = data.src;
      userLabel.textContent = `👤 ${data.userName || "Ẩn danh"}`;
      yearLabel.textContent = `📅 ${data.year || "Chưa rõ năm"}`;
      scale = 1;
      applyScale();
    };

    renderPhoto();

    zoomInBtn?.addEventListener("click", () => {
      scale = Math.min(scale + 0.2, 3);
      applyScale();
    });

    zoomOutBtn?.addEventListener("click", () => {
      scale = Math.max(scale - 0.2, 0.5);
      applyScale();
    });

    resetBtn?.addEventListener("click", () => {
      scale = 1;
      applyScale();
    });

    closeBtn?.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    const gotoPhoto = (nextIndex) => {
      currentIndex = nextIndex;
      if (currentIndex < 0) currentIndex = photos.length - 1;
      if (currentIndex >= photos.length) currentIndex = 0;
      renderPhoto();
    };

    prevBtn?.addEventListener("click", () => gotoPhoto(currentIndex - 1));
    nextBtn?.addEventListener("click", () => gotoPhoto(currentIndex + 1));

    if (photos.length <= 1) {
      prevBtn?.setAttribute("disabled", "true");
      prevBtn.style.opacity = 0.4;
      nextBtn?.setAttribute("disabled", "true");
      nextBtn.style.opacity = 0.4;
    }

    overlay.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        gotoPhoto(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        gotoPhoto(currentIndex - 1);
      } else if (e.key === "Escape") {
        document.body.removeChild(overlay);
      }
    });
    overlay.setAttribute("tabindex", "-1");
    overlay.focus();
  };

  /* ---------- TÍNH ĐƯỜNG ĐI ---------- */
  const calculateRoute = async (from, to, map) => {
    const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${from.lng},${from.lat};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Không thể kết nối với máy chủ định tuyến");
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
        const polyline = L.polyline(coords, {
          color: "#4285f4",
          weight: 6,
          opacity: 0.9,
        }).addTo(map);
        currentRouteLayer.current = polyline;
        map.fitBounds(polyline.getBounds());

        const km = (route.distance / 1000).toFixed(1);
        const mins = Math.round(route.duration / 60);

        const routeDetails = document.getElementById("route-details");
        routeDetails.innerHTML = `
          <div style="position:relative;">
            <h4 style="margin:16px 0 8px;font-size:1rem;color:#333;font-weight:600;display:flex;align-items:center;justify-content:space-between;">
              Lộ trình
              <button id="close-route-btn" style="width:28px;height:28px;border:none;border-radius:50%;background:#ef4444;color:white;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">×</button>
            </h4>
            <div style="padding:16px;background:#f8f9fa;border-radius:8px">
              <div style="font-weight:600;color:#333;margin-bottom:8px">
                Thời gian: <span style="color:#1a73e8">${mins} phút</span> · Khoảng cách: <span style="color:#1a73e8">${km} km</span>
              </div>
            </div>
          </div>
        `;
        routeDetails.style.display = "block";

        // Xử lý nút đóng lộ trình
        const closeRouteBtn = document.getElementById("close-route-btn");
        if (closeRouteBtn) {
          closeRouteBtn.addEventListener("click", () => {
            // Ẩn route details
            routeDetails.style.display = "none";
            // Xóa polyline trên bản đồ
            if (currentRouteLayer.current) {
              map.removeLayer(currentRouteLayer.current);
              currentRouteLayer.current = null;
            }
          });
        }
      }
    } catch (err) {
      document.getElementById(
        "route-details"
      ).innerHTML = `<div style="color:#d50000;padding:10px">Không thể tìm đường: ${err.message}</div>`;
      document.getElementById("route-details").style.display = "block";
    }
  };

  /* ---------- YÊU THÍCH ---------- */
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
      <div style="margin-bottom:16px;font-size:0.9rem;color:#aaa;">
        Địa điểm đã lưu: <span class="fav-count" style="color:#0ff;">${userPlaceFavorites.length}</span>
      </div>
      <div id="favorites-list" style="color:white;"></div>
    `;

    const list = document.getElementById("favorites-list");
    if (userPlaceFavorites.length === 0) {
      list.innerHTML = `<div style="color:#aaa;text-align:center;padding:20px;">Chưa có địa điểm nào được lưu.</div>`;
    } else {
      list.innerHTML = userPlaceFavorites
        .map((fav) => {
          const place = places.find((p) => p.id === fav.id) || fav;
          return `
            <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #444;position:relative;">
              <img src="${safeImageUrl(place.image, "https://via.placeholder.com/60x60?text=Chưa+có+hình")}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" />
              <div style="flex:1;cursor:pointer;" onclick="window.showPlaceFromFav(${
                place.id
              })">
                <div style="font-weight:600;font-size:1rem;color:white;">${
                  place.title
                }</div>
                <div style="display:flex;align-items:center;gap:4px;font-size:0.85rem;color:#0ff;margin:4px 0;">
                  <span>${place.rating || 0}</span> ${"★".repeat(
            Math.floor(place.rating || 0)
          )}${"☆".repeat(5 - Math.floor(place.rating || 0))}
                  <span style="color:#aaa;">(${place.reviews || 0})</span>
                </div>
                <div style="font-size:0.85rem;color:#aaa;">${
                  place.desc || "Mô tả chưa có"
                }</div>
              </div>
              <div onclick="event.stopPropagation(); window.removeFromFavorites(${
                place.id
              })" style="position:absolute;top:12px;right:0;width:32px;height:32px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:0.2s;">
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
    const index = list.findIndex(
      (item) => item.submissionId === String(submissionId)
    );
    if (index !== -1) {
      openPhotoPreview({ photos: list, startIndex: index });
    }
  };

  window.showPlaceFromFav = (id) => {
    const userPlaceFavorites = getCurrentUserPlaceFavorites();
    const place =
      places.find((p) => p.id === id) ||
      userPlaceFavorites.find((f) => f.id === id);
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

  /* ---------- ĐÓNG SIDEBAR CHI TIẾT ---------- */
  window.closeSidebar = () => {
    sidebarRef.current.style.display = "none";
    clearCurrentRoute();

    window.updateTopBarPosition();
    setTimeout(() => window.updateTopBarPosition(), 50);
  };

  // ❌ REMOVED: Duplicate definition that was overriding the correct one in showPlaceDetail()
  // The correct window.setStarRating is defined inside showPlaceDetail() with proper window.currentRating update

  /* ---------- ĐỊNH VỊ NGƯỜI DÙNG ---------- */
  useEffect(() => {
    if (!mapInstance.current || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Lưu vị trí vào state
        setUserLocation({ lat, lng });

        if (userMarker.current) {
          mapInstance.current.removeLayer(userMarker.current);
        }

        const icon = L.divIcon({
          html: `<div style="width:16px;height:16px;background:#4285f4;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
          className: "user-location-marker",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        userMarker.current = L.marker([lat, lng], { icon }).addTo(
          mapInstance.current
        );
        userMarker.current
          .bindPopup('<b style="color:#4285f4">Vị trí của bạn</b>')
          .openPopup();
        mapInstance.current.setView([lat, lng], 14);
      },
      () => console.warn("Không thể lấy vị trí người dùng"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [mapInstance.current]);

  /* ---------- RETURN JSX ---------- */
  if (status === "failed") {
    return <div style={{ color: "red", padding: "20px" }}>Lỗi: {error}</div>;
  }

  return (
    <>
      <style>{`
        /* Custom popup styling */
        .custom-marker-popup .leaflet-popup-content-wrapper,
        .custom-marker-tooltip {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          padding: 0;
          overflow: hidden;
          pointer-events: auto !important;
        }
        
        .custom-marker-popup .leaflet-popup-content,
        .custom-marker-tooltip .leaflet-tooltip-content {
          margin: 0;
          width: auto !important;
          pointer-events: auto !important;
        }
        
        .custom-marker-popup .leaflet-popup-tip {
          background: white;
        }
        
        .leaflet-tooltip {
          pointer-events: auto !important;
        }
        
        .marker-popup-content:hover {
          background-color: #f8f9fa;
        }
        
        .marker-popup-content {
          transition: background-color 0.2s ease;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          pointer-events: auto !important;
        }
      `}</style>

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

      {/* ✅ NÚT VỆ TINH - ngay trên zoom controls */}
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

      {/* SO SÁNH ẢNH MODAL */}
      {comparePlace &&
        ReactDOM.createPortal(
          <CompareModal
            place={comparePlace}
            onClose={() => setComparePlace(null)}
          />,
          document.body
        )}

      {/* CHIA SẺ ĐỊA ĐIỂM MODAL */}
      {shareModalOpen &&
        ReactDOM.createPortal(
          <ShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            location={shareLocation}
            mapPosition={shareMapPosition}
          />,
          document.body
        )}
    </>
  );
};

export default MapPage;
