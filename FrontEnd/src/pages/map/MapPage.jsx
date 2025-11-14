// src/pages/map/MapPage.jsx
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

/* ---------- COMPONENT ---------- */
const MapPage = () => {
  const dispatch = useDispatch();
  const { places, status, error } = useSelector((state) => state.mapLocations);
  const { user, isAuthLoading } = useAppContext(); // ✅ LẤY USER + AUTH LOADING STATE
  
  // ✅ RESTORE SESSION SAU KHI F5 (quan trọng!)
  useAuthRestore();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const sidebarRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const currentPlace = useRef(null);
  const currentRouteLayer = useRef(null);
  const hoverPopupRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const favoritesSidebarRef = useRef(null);
  const allMarkersRef = useRef(new Map());
  const tileLayerRef = useRef(null); // ✅ Ref cho tile layer

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
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [comparePlace, setComparePlace] = useState(null);

  /* ---------- KIỂM TRA REDIRECT SAU KHI LOGIN ---------- */
  useEffect(() => {
    if (!user || !user.userId) return;
    
    // Kiểm tra xem có địa điểm cần quay lại không
    const returnToPlaceData = localStorage.getItem('returnToPlace');
    if (!returnToPlaceData) return;
    
    try {
      const placeData = JSON.parse(returnToPlaceData);
      // Kiểm tra timestamp để tránh dữ liệu cũ (chỉ trong vòng 10 phút)
      if (Date.now() - placeData.timestamp > 10 * 60 * 1000) {
        localStorage.removeItem('returnToPlace');
        return;
      }
      
      // Xóa dữ liệu sau khi đọc
      localStorage.removeItem('returnToPlace');
      
      // Tìm địa điểm trong danh sách places
      const placeToOpen = places.find(p => p.id === placeData.placeId);
      if (placeToOpen) {
        // Set activeTab thành reviews nếu user muốn đánh giá
        if (placeData.openReviewTab) {
          setActiveTab('reviews');
        }
        // Mở sidebar cho địa điểm đó sau 500ms để đảm bảo map đã load xong
        setTimeout(() => {
          showPlaceDetail(placeToOpen, mapInstance.current);
        }, 500);
      }
    } catch (error) {
      console.error('Error parsing returnToPlace data:', error);
      localStorage.removeItem('returnToPlace');
    }
  }, [user, places]);

  // ✅ RE-RENDER FORM ĐÁNH GIÁ SAU KHI USER RESTORE (KHÔNG RESET RATING)
  useEffect(() => {
    if (!user || !user.userId) return;
    if (!sidebarRef.current) return;
    if (!currentPlace.current) return;
    
    const isVisible = sidebarRef.current.style && sidebarRef.current.style.display === 'block';
    if (!isVisible) return;
    
    // Chỉ update nếu đang ở tab reviews
    if (activeTab !== 'reviews') return;
    
    console.log('🔄 [User Restored] Updating review form for user:', user.email);
    
    // Delay để đảm bảo DOM đã ready
    const timer = setTimeout(() => {
      try {
        // Tìm content area
        const contentArea = sidebarRef.current.querySelector('#reviews-tab-content, [style*="display:flex;flex-direction:column"]');
        if (!contentArea) return;
        
        // Kiểm tra xem có đang hiển thị "Vui lòng đăng nhập" không
        const loginPrompt = contentArea.querySelector('#login-to-review-link');
        if (!loginPrompt) return; // Form đã đúng rồi
        
        console.log('✅ [User Restored] Replacing login prompt with review form');
        
        // Replace login prompt với form đánh giá
        const loginPromptContainer = loginPrompt.closest('[style*="background:#fff3cd"]');
        if (loginPromptContainer && loginPromptContainer.parentNode) {
          // Lấy rating hiện tại (nếu có)
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
            console.log('🔄 [User Restored] Restored window.currentRating:', savedRating);
          }
          
          // Re-attach event listeners
          const submitBtn = document.getElementById("submit-review-btn");
          const imageInput = document.getElementById("review-images");
          const imagePreview = document.getElementById("image-preview");
          
          if (submitBtn) {
            // Attach image input preview handler
            if (imageInput) {
              imageInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 5) {
                  alert('⚠️ Chỉ được chọn tối đa 5 ảnh!');
                  imageInput.value = '';
                  return;
                }
                
                // Show preview
                if (imagePreview) {
                  imagePreview.innerHTML = files.map((f, idx) => `
                    <div style="position:relative;width:80px;height:80px;">
                      <img src="${URL.createObjectURL(f)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:1px solid #ccc" />
                      <span style="position:absolute;top:-6px;right:-6px;background:#666;color:white;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;cursor:pointer;" data-remove-idx="${idx}">✕</span>
                    </div>
                  `).join('');
                  
                  // Attach remove handlers
                  imagePreview.querySelectorAll('[data-remove-idx]').forEach(btn => {
                    btn.addEventListener('click', () => {
                      const idx = parseInt(btn.getAttribute('data-remove-idx'));
                      const dt = new DataTransfer();
                      Array.from(imageInput.files).forEach((f, i) => {
                        if (i !== idx) dt.items.add(f);
                      });
                      imageInput.files = dt.files;
                      imageInput.dispatchEvent(new Event('change'));
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
                  console.log('⭐ Star clicked:', i);
                  window.setStarRating(i);
                });
              }
            }
            
            // Attach submit handler
            submitBtn.addEventListener("click", async () => {
              const commentInput = document.getElementById("comment-input");
              const comment = commentInput?.value?.trim();
              
              const currentRating = window.currentRating ?? newRating;
              
              console.log('📊 [SUBMIT] Rating check:', {
                'window.currentRating': window.currentRating,
                'newRating state': newRating,
                'final currentRating': currentRating,
                'type': typeof currentRating,
                'comment': comment?.substring(0, 30)
              });
              
              if (currentRating === null || currentRating === undefined || currentRating < 1 || currentRating > 5) {
                console.error('❌ Rating validation failed:', {
                  currentRating,
                  windowCurrentRating: window.currentRating,
                  newRatingState: newRating,
                  type: typeof currentRating,
                  isNull: currentRating === null,
                  isUndefined: currentRating === undefined
                });
                alert("🌟 Vui lòng chọn số sao (1-5 sao) trước khi gửi đánh giá!");
                return;
              }
              if (!comment) {
                alert("💬 Vui lòng nhập bình luận!");
                return;
              }
              
              try {
                console.log('🚀 [SUBMIT] Sending to API:', {
                  userId: user.userId,
                  rating: currentRating,
                  comment: comment,
                  endpoint: `${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`
                });
                
                // ✅ Build FormData to send images + data
                const formData = new FormData();
                formData.append('userId', user.userId);
                formData.append('rating', currentRating);
                formData.append('comment', comment);
                
                // Add images if selected
                if (imageInput?.files) {
                  Array.from(imageInput.files).forEach(file => {
                    formData.append('images', file);
                  });
                }
                
                await axios.post(`${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                console.log('✅ [SUBMIT] Review submitted successfully!');
                
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
                const reviewsRes = await axios.get(`${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`);
                const newReviewsList = reviewsRes.data.map(r => ({
                  rating: r.Rating,
                  comment: r.Comment,
                  timestamp: new Date(r.CreatedAt).toLocaleDateString('vi-VN'),
                  userName: r.user?.FullName || 'Ẩn danh'
                }));
                
                setReviews(newReviewsList);
                
                console.log('✅ [SUBMIT] Reviews updated:', newReviewsList.length, 'total reviews');
                
                // Update reviews list in DOM immediately (with avatar + like button)
                const reviewsList = document.getElementById('reviews-list');
                if (reviewsList) {
                  reviewsList.innerHTML = newReviewsList.length > 0 ? newReviewsList.map(r => `
                    <div style="padding:12px;border-bottom:1px solid #eee;display:flex;gap:12px;align-items:flex-start;">
                      <img src="${r.avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0" />
                      <div style="flex:1;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px;">
                          <div>
                            <div style="font-weight:600;color:#333">${r.userName || 'Ẩn danh'}</div>
                            <div style="color:#ffca28;">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
                          </div>
                          <div style="display:flex;align-items:center;gap:8px">
                            <button class="like-btn" data-feedback-id="${r.FeedbackID || ''}" style="background:transparent;border:none;cursor:pointer;color:#666;display:flex;align-items:center;gap:6px">👍 <span class="like-count">${r.likes}</span></button>
                          </div>
                        </div>
                        <p style="margin:4px 0;color:#555;line-height:1.4;">${r.comment}</p>
                        ${r.images && r.images.length > 0 && r.imagesApproved ? `
                          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                            ${r.images.map(img => `<img src="${img.startsWith('http')?img:`${BASE_URL}${img}`}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee"/>`).join('')}
                          </div>
                        ` : ''}
                        <div style="font-size:0.8rem;color:#888;margin-top:8px;">${r.timestamp}</div>
                      </div>
                    </div>
                  `).join("") : '<p style="text-align:center;color:#999;padding:20px;">Chưa có đánh giá nào</p>';

                  // Attach like button handlers
                  const likeButtons = reviewsList.querySelectorAll('.like-btn');
                  likeButtons.forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                      e.preventDefault();
                      const fid = btn.getAttribute('data-feedback-id');
                      if (!fid) return;
                      const countSpan = btn.querySelector('.like-count');
                      // Optimistic UI
                      const current = parseInt(countSpan.textContent || '0', 10) || 0;
                      countSpan.textContent = (current + 1).toString();
                      try {
                        await axios.post(`${BASE_URL}/map-locations/${place.id}/feedback/${fid}/like`);
                      } catch (err) {
                        console.error('Like failed', err);
                        countSpan.textContent = current.toString();
                        alert('Không thể like, thử lại sau');
                      }
                    });
                  });
                }
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-weight:600;';
                successMsg.textContent = '✅ Đã gửi đánh giá thành công!';
                document.body.appendChild(successMsg);
                setTimeout(() => successMsg.remove(), 3000);
              } catch (error) {
                console.error("Error submitting review:", error);
                alert(`Có lỗi khi gửi đánh giá: ${error.response?.data?.message || error.message}`);
              }
            });
          }
        }
      } catch (err) {
        console.error('Error updating review form:', err);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [user?.userId, activeTab]);

  // ✅ HANDLE isAuthLoading CHANGES - FIX "Đang kiểm tra đăng nhập..." STUCK
  useEffect(() => {
    console.log('🔍 [isAuthLoading useEffect] Triggered:', { isAuthLoading, activeTab, userEmail: user?.email });
    
    if (isAuthLoading) return; // Chỉ chạy khi isAuthLoading = false
    if (!sidebarRef.current) return;
    if (!currentPlace.current) return;
    
    const isVisible = sidebarRef.current.style && sidebarRef.current.style.display === 'block';
    if (!isVisible) {
      console.log('⚠️ [isAuthLoading=false] Sidebar not visible, skipping');
      return;
    }
    
    // Chỉ update nếu đang ở tab reviews
    if (activeTab !== 'reviews') {
      console.log('⚠️ [isAuthLoading=false] Not on reviews tab, skipping');
      return;
    }
    
    console.log('🔄 [isAuthLoading=false] Updating review form. User:', user?.email || 'null');
    
    // Delay để đảm bảo DOM đã ready
    const timer = setTimeout(() => {
      try {
        // Tìm content area
        const contentArea = sidebarRef.current.querySelector('#reviews-tab-content, [style*="display:flex;flex-direction:column"]');
        if (!contentArea) return;
        
        // Kiểm tra xem có đang hiển thị "Đang kiểm tra đăng nhập..." không
        // Spinner có text trong <p> tag
        const loadingText = Array.from(contentArea.querySelectorAll('p')).find(p => 
          p.textContent.includes('Đang kiểm tra đăng nhập')
        );
        if (!loadingText) {
          console.log('✅ [isAuthLoading=false] No loading spinner found, DOM already updated');
          return; // Không còn spinner
        }
        
        // Tìm container div chứa spinner (parent of <p>)
        const loadingSpinner = loadingText.closest('div[style*="text-align:center"]');
        if (!loadingSpinner) {
          console.log('⚠️ [isAuthLoading=false] Found loading text but no container div');
          return;
        }
        
        console.log('✅ [isAuthLoading=false] Removing loading spinner and showing form/login prompt');
        
        // Xác định nội dung thay thế dựa trên user state
        let replacementHTML = '';
        
        if (user && user.userId) {
          // User đã đăng nhập - hiển thị form đánh giá
          const savedRating = window.currentRating ?? newRating ?? 0;
          
          replacementHTML = `
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
        const spinnerContainer = loadingSpinner.closest('div');
        if (spinnerContainer && spinnerContainer.parentNode) {
          spinnerContainer.outerHTML = replacementHTML;
          
          // ✅ RE-ATTACH EVENT LISTENERS
          if (user && user.userId) {
            // Restore window.currentRating
            const savedRating = window.currentRating ?? newRating ?? 0;
            if (savedRating > 0) {
              window.currentRating = savedRating;
              console.log('🔄 [isAuthLoading=false] Restored window.currentRating:', savedRating);
            }
            
            // Re-attach event listeners for review form
            const submitBtn = document.getElementById("submit-review-btn");
            const imageInput = document.getElementById("review-images");
            const imagePreview = document.getElementById("image-preview");
            
            if (imageInput) {
              imageInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 5) {
                  alert('⚠️ Chỉ được chọn tối đa 5 ảnh!');
                  imageInput.value = '';
                  return;
                }
                
                // Show preview
                if (imagePreview) {
                  imagePreview.innerHTML = files.map((f, idx) => `
                    <div style="position:relative;width:80px;height:80px;">
                      <img src="${URL.createObjectURL(f)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:1px solid #ccc" />
                      <span style="position:absolute;top:-6px;right:-6px;background:#666;color:white;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;cursor:pointer;" data-remove-idx="${idx}">✕</span>
                    </div>
                  `).join('');
                  
                  // Attach remove handlers
                  imagePreview.querySelectorAll('[data-remove-idx]').forEach(btn => {
                    btn.addEventListener('click', () => {
                      const idx = parseInt(btn.getAttribute('data-remove-idx'));
                      const dt = new DataTransfer();
                      Array.from(imageInput.files).forEach((f, i) => {
                        if (i !== idx) dt.items.add(f);
                      });
                      imageInput.files = dt.files;
                      imageInput.dispatchEvent(new Event('change'));
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
                  console.log('⭐ Star clicked:', i);
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
                  alert("🌟 Vui lòng chọn số sao (1-5 sao) trước khi gửi đánh giá!");
                  return;
                }
                if (!comment) {
                  alert("💬 Vui lòng nhập bình luận!");
                  return;
                }
                
                // Handle image upload and submission
                const files = imageInput ? Array.from(imageInput.files) : [];
                const formData = new FormData();
                formData.append('userId', user.userId);
                formData.append('rating', currentRating);
                formData.append('comment', comment);
                files.forEach(file => formData.append('images', file));
                
                try {
                  submitBtn.disabled = true;
                  submitBtn.textContent = 'Đang gửi...';
                  
                  console.log('🚀 [SUBMIT] Submitting to:', {
                    url: `${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`,
                    placeId: currentPlace.current.id,
                    currentPlace: currentPlace.current
                  });
                  
                  await axios.post(`${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                  });
                  alert('✅ Đã gửi đánh giá thành công!');
                  commentInput.value = '';
                  if (imageInput) imageInput.value = '';
                  if (imagePreview) imagePreview.innerHTML = '';
                  window.currentRating = 0;
                  setNewRating(0);
                  // Refresh reviews
                  const res = await axios.get(`${BASE_URL}/map-locations/${currentPlace.current.id}/feedback`);
                  showPlaceDetail(currentPlace.current, res.data || []);
                } catch (err) {
                  console.error('Error submitting review:', err);
                  alert('❌ Lỗi khi gửi đánh giá: ' + (err.response?.data?.message || err.message));
                } finally {
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Gửi đánh giá';
                }
              });
            }
          } else {
            // Attach login link handler
            const loginLink = document.getElementById("login-to-review-link");
            if (loginLink) {
              loginLink.addEventListener("click", (e) => {
                e.preventDefault();
                console.log('🔗 Login link clicked');
                // Trigger login modal or redirect
                window.location.href = '/auth/login';
              });
            }
          }
        }
      } catch (err) {
        console.error('❌ [isAuthLoading=false] Error updating DOM:', err);
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
      sidebarRef.current.style.backgroundColor = isSidebarDark ? "#1a1a1a" : "#ffffff";
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

  /* ---------- LỌC DANH MỤC → LÀM MỜ MARKER (KHÔNG XÓA) ---------- */
  useEffect(() => {
    if (!mapInstance.current || !places.length) return;

    allMarkersRef.current.forEach((marker, placeId) => {
      const place = places.find((p) => p.id === placeId);
      if (!place) return;

      const isVisible = selectedCategory === null || place.categoryId === selectedCategory;

      if (isVisible) {
        // Hiển thị marker
        if (!mapInstance.current.hasLayer(marker)) {
          marker.addTo(mapInstance.current);
        }
        marker.setOpacity(1);
        if (marker.getElement()) {
          marker.getElement().style.filter = "";
        }
      } else {
        // Ẩn hoàn toàn marker (xóa khỏi map)
        if (mapInstance.current.hasLayer(marker)) {
          mapInstance.current.removeLayer(marker);
        }
      }
    });
  }, [selectedCategory, places]);

  /* ---------- HIGHLIGHT MARKER (DÙNG setIcon → KHÔNG LỖI LAYOUT) ---------- */
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

          // ÉP VẼ LẠI SAU KHI ZOOM
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

        // ÉP VẼ LẠI SAU KHI ZOOM
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

    const isSaved = favorites.some((f) => f.id === place.id);

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

  /* ---------- SHOW PLACE DETAIL ---------- */
  const showPlaceDetail = async (place, map) => {
    const isFavOpen = favoritesSidebarRef.current.style.display === "block";
    sidebarRef.current.style.left = isFavOpen ? "380px" : "100px";
    sidebarRef.current.style.display = "block";

    window.updateTopBarPosition();
    setTimeout(() => window.updateTopBarPosition(), 50);

    // ✅ GLOBAL FUNCTION ĐỂ SET RATING (TỪ onclick trong HTML string)
    // GIỮ NGUYÊN rating nếu đã có (không reset khi re-render)
    if (typeof window.currentRating === 'undefined') {
      window.currentRating = null; // ✅ ĐỔI 0 → null để validation chính xác
      console.log('🔢 Initialized window.currentRating: null');
    } else {
      console.log('✅ Keeping existing window.currentRating:', window.currentRating);
    }
    
    window.setStarRating = (rating) => {
      console.log('⭐ setStarRating CALLED:', rating);
      
      // ✅ LƯU VÀO WINDOW TRƯỚC (ƯU TIÊN CAO NHẤT)
      window.currentRating = rating;
      
      // ✅ SAU ĐÓ MỚI CẬP NHẬT STATE
      setNewRating(rating);
      
      console.log('✅ Rating saved - window:', window.currentRating, 'state will update to:', rating);
      
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
        console.log('🎨 Restoring star colors for rating:', savedRating);
        for (let i = 1; i <= 5; i++) {
          const star = document.getElementById(`star-${i}`);
          if (star) {
            star.style.color = i <= savedRating ? "#ffca28" : "#ccc";
          }
        }
      }
    }, 100);

    // Load reviews từ API
    try {
      const reviewsRes = await axios.get(`${BASE_URL}/map-locations/${place.id}/feedback`);
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
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    }

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
                  <input type="file" id="review-images" accept="image/*" multiple style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;" />
                  <div id="image-preview" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;"></div>
                </div>
                <button id="submit-review-btn" style="width:100%;padding:10px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Gửi đánh giá</button>
              </div>
              ` : `
              <div style="width:100%;margin-bottom:16px;padding:16px;background:#fff3cd;border-radius:8px;text-align:center;">
                <p style="margin:0;color:#856404;">Vui lòng <a href="/login" style="color:#1a73e8;text-decoration:none;font-weight:600;">đăng nhập</a> để đánh giá địa điểm này</p>
              </div>
              `}

              <div id="reviews-list" style="width:100%;max-height:300px;overflow-y:auto;">
                ${reviews.length > 0 ? reviews.map(r => `
                  <div style="padding:12px;border-bottom:1px solid #eee;display:flex;gap:12px;align-items:flex-start;">
                    <img src="${r.avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0" />
                    <div style="flex:1;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px;">
                        <div>
                          <div style="font-weight:600;color:#333">${r.userName || 'Ẩn danh'}</div>
                          <div style="color:#ffca28;">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px">
                          <button class="like-btn" data-feedback-id="${r.FeedbackID || ''}" style="background:transparent;border:none;cursor:pointer;color:#666;display:flex;align-items:center;gap:6px">👍 <span class="like-count">${r.likes}</span></button>
                        </div>
                      </div>
                      <p style="margin:4px 0;color:#555;line-height:1.4;">${r.comment}</p>
                      ${r.images && r.images.length > 0 && r.imagesApproved ? `
                        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                          ${r.images.map(img => `<img src="${img.startsWith('http')?img:`${BASE_URL}${img}`}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee"/>`).join('')}
                        </div>
                      ` : ''}
                      <div style="font-size:0.8rem;color:#888;margin-top:8px;">${r.timestamp}</div>
                    </div>
                  </div>
                `).join("") : '<p style="text-align:center;color:#999;padding:20px;">Chưa có đánh giá nào</p>'}
              </div>
            </div>
          `}
        </div>

        ${activeTab === "overview" ? `
          <button id="view-detail-btn" style="width:100%;padding:14px;background:#1a73e8;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:1rem">
            Xem chi tiết
          </button>
          <div style="font-size:0.9rem;color:#555;margin:16px 0;line-height:1.6">
            <div>Location: ${place.address || "Địa chỉ chưa có"}</div>
          </div>
        ` : ""}
      </div>
    `;

    // Attach event listeners for tabs
    const switchTab = (newTab) => {
      console.log('🔄 Switching tab to:', newTab);
      
      // ✅ UPDATE REACT STATE
      setActiveTab(newTab);
      
      // ✅ UPDATE DOM IMMEDIATELY (không đợi React re-render)
      const overviewBtn = document.getElementById("overview-tab");
      const reviewsBtn = document.getElementById("reviews-tab");
      const contentArea = document.getElementById("content-area");
      
      if (!contentArea) return;
      
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
        contentArea.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            <button id="get-directions-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">Đường đi</button>
            <button id="share-location-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">Chia sẻ</button>
            <button id="save-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">Lưu</button>
            <button id="compare-btn" style="padding:10px;border:1px solid #dadce0;border-radius:8px;background:#f8f9fa;color:#333;cursor:pointer;font-size:0.85rem;text-align:center">So sánh</button>
          </div>
          <div id="route-details" style="display:none;font-size:0.9rem;color:#555;margin:16px 0;line-height:1.6"></div>
        `;
        
        // Re-attach overview buttons
        document.getElementById("get-directions-btn")?.addEventListener("click", () => {
          if (!userMarker.current) return alert("Vui lòng bật định vị!");
          calculateRoute(userMarker.current.getLatLng(), place.position, map);
        });
        
        document.getElementById("save-btn")?.addEventListener("click", () => {
          const fullPlace = places.find(p => p.id === place.id) || place;
          if (!favorites.some(f => f.id === fullPlace.id)) {
            const updated = [...favorites, fullPlace];
            setFavorites(updated);
            localStorage.setItem("favorites", JSON.stringify(updated));
            alert("Đã lưu!");
          } else {
            alert("Đã có trong yêu thích!");
          }
        });
        
        document.getElementById("compare-btn")?.addEventListener("click", () => setComparePlace(place));
        
      } else {
        // Reviews tab
        contentArea.innerHTML = `
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
                        ${[1, 2, 3, 4, 5].map(i => {
                          const currentRating = window.currentRating || 0;
                          return `<span id="star-${i}" style="cursor:pointer;font-size:1.2rem;color:${i <= currentRating ? "#ffca28" : "#ccc"};" onclick="window.setStarRating(${i})">★</span>`;
                        }).join("")}
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
              ${reviews.length > 0 ? reviews.map(r => `
                <div style="padding:12px;border-bottom:1px solid #eee;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-weight:600;color:#333;">${r.userName || 'Ẩn danh'}</span>
                    <span style="color:#ffca28;">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
                  </div>
                  <p style="margin:4px 0;color:#555;line-height:1.4;">${r.comment}</p>
                  <span style="font-size:0.8rem;color:#888;">${r.timestamp}</span>
                </div>
              `).join("") : '<p style="text-align:center;color:#999;padding:20px;">Chưa có đánh giá nào</p>'}
            </div>
          </div>
        `;
        
        // Re-attach login link (CHỈ KHI USER CHƯA ĐĂNG NHẬP)
        if (!user || !user.userId) {
          document.getElementById("login-to-review-link")?.addEventListener("click", (e) => {
            e.preventDefault();
            // Lưu thông tin địa điểm hiện tại vào localStorage để sau khi login quay lại
            localStorage.setItem('returnToPlace', JSON.stringify({
              placeId: place.id,
              placeTitle: place.title,
              openReviewTab: true,
              timestamp: Date.now()
            }));
            window.location.href = '/login';
          });
        }
        
        // Re-attach submit review button (CHỈ KHI USER ĐÃ ĐĂNG NHẬP)
        const submitBtn = document.getElementById("submit-review-btn");
        const imageInput = document.getElementById("review-images");
        const imagePreview = document.getElementById("image-preview");
        
        if (submitBtn && user && user.userId) {
          // ✅ Image input preview handler
          if (imageInput) {
            imageInput.addEventListener('change', (e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 5) {
                alert('⚠️ Chỉ được chọn tối đa 5 ảnh!');
                imageInput.value = '';
                return;
              }
              
              // Show preview
              if (imagePreview) {
                imagePreview.innerHTML = files.map((f, idx) => `
                  <div style="position:relative;width:80px;height:80px;">
                    <img src="${URL.createObjectURL(f)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:1px solid #ccc" />
                    <span style="position:absolute;top:-6px;right:-6px;background:#666;color:white;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;cursor:pointer;" data-remove-idx="${idx}">✕</span>
                  </div>
                `).join('');
                
                // Attach remove handlers
                imagePreview.querySelectorAll('[data-remove-idx]').forEach(btn => {
                  btn.addEventListener('click', () => {
                    const idx = parseInt(btn.getAttribute('data-remove-idx'));
                    const dt = new DataTransfer();
                    Array.from(imageInput.files).forEach((f, i) => {
                      if (i !== idx) dt.items.add(f);
                    });
                    imageInput.files = dt.files;
                    imageInput.dispatchEvent(new Event('change'));
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
                console.log('⭐ Star clicked:', i);
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
            console.log('📊 [SUBMIT] Rating check:', {
              'window.currentRating': window.currentRating,
              'newRating state': newRating,
              'final currentRating': currentRating,
              'type': typeof currentRating,
              'comment': comment?.substring(0, 30)
            });
            
            // ✅ VALIDATION: rating phải là số từ 1-5 (KIỂM TRA CHÍNH XÁC)
            if (currentRating === null || currentRating === undefined || currentRating < 1 || currentRating > 5) {
              console.error('❌ Rating validation failed:', {
                currentRating,
                windowCurrentRating: window.currentRating,
                newRatingState: newRating,
                type: typeof currentRating,
                isNull: currentRating === null,
                isUndefined: currentRating === undefined
              });
              alert("🌟 Vui lòng chọn số sao (1-5 sao) trước khi gửi đánh giá!");
              return;
            }
            if (!comment) {
              alert("💬 Vui lòng nhập bình luận!");
              return;
            }
            
            try {
              console.log('🚀 [SUBMIT] Sending to API:', {
                userId: user.userId,
                rating: currentRating,
                comment: comment,
                endpoint: `${BASE_URL}/map-locations/${place.id}/feedback`
              });
              
              // ✅ Build FormData to send images + data
              const formData = new FormData();
              formData.append('userId', user.userId);
              formData.append('rating', currentRating);
              formData.append('comment', comment);
              
              // Add images if selected
              if (imageInput?.files) {
                Array.from(imageInput.files).forEach(file => {
                  formData.append('images', file);
                });
              }
              
              await axios.post(`${BASE_URL}/map-locations/${place.id}/feedback`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              
              console.log('✅ [SUBMIT] Review submitted successfully!');
              
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
              const reviewsRes = await axios.get(`${BASE_URL}/map-locations/${place.id}/feedback`);
              const newReviewsList = reviewsRes.data.map(r => ({
                rating: r.Rating,
                comment: r.Comment,
                timestamp: new Date(r.CreatedAt).toLocaleDateString('vi-VN'),
                userName: r.user?.FullName || 'Ẩn danh',
                avatar: r.user?.profile?.Avatar || '/img/default-avatar.png',
                likes: r.Likes || 0,
                images: r.ImageUrls ? JSON.parse(r.ImageUrls) : [],
                imagesApproved: !!r.ImagesApproved,
              }));

              setReviews(newReviewsList);
              
              console.log('✅ [SUBMIT] Reviews updated:', newReviewsList.length, 'total reviews');
              
              // ✅ UPDATE REVIEWS LIST IN DOM IMMEDIATELY (with avatar + like)
              const reviewsList = document.getElementById('reviews-list');
              if (reviewsList) {
                reviewsList.innerHTML = newReviewsList.length > 0 ? newReviewsList.map(r => `
                  <div style="padding:12px;border-bottom:1px solid #eee;display:flex;gap:12px;align-items:flex-start;">
                    <img src="${r.avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0" />
                    <div style="flex:1;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px;">
                        <div>
                          <div style="font-weight:600;color:#333">${r.userName || 'Ẩn danh'}</div>
                          <div style="color:#ffca28;">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px">
                          <button class="like-btn" data-feedback-id="${r.FeedbackID || ''}" style="background:transparent;border:none;cursor:pointer;color:#666;display:flex;align-items:center;gap:6px">👍 <span class="like-count">${r.likes}</span></button>
                        </div>
                      </div>
                      <p style="margin:4px 0;color:#555;line-height:1.4;">${r.comment}</p>
                      ${r.images && r.images.length > 0 && r.imagesApproved ? `
                        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                          ${r.images.map(img => `<img src="${img.startsWith('http')?img:`${BASE_URL}${img}`}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee"/>`).join('')}
                        </div>
                      ` : ''}
                      <div style="font-size:0.8rem;color:#888;margin-top:8px;">${r.timestamp}</div>
                    </div>
                  </div>
                `).join("") : '<p style="text-align:center;color:#999;padding:20px;">Chưa có đánh giá nào</p>';

                // attach like handlers
                const likeButtons = reviewsList.querySelectorAll('.like-btn');
                likeButtons.forEach(btn => {
                  btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const fid = btn.getAttribute('data-feedback-id');
                    if (!fid) return;
                    const countSpan = btn.querySelector('.like-count');
                    const current = parseInt(countSpan.textContent || '0', 10) || 0;
                    countSpan.textContent = (current + 1).toString();
                    try {
                      await axios.post(`${BASE_URL}/map-locations/${place.id}/feedback/${fid}/like`);
                    } catch (err) {
                      console.error('Like failed', err);
                      countSpan.textContent = current.toString();
                      alert('Không thể like, thử lại sau');
                    }
                  });
                });
              }
              
              // ✅ SHOW SUCCESS MESSAGE (tốt hơn alert)
              const successMsg = document.createElement('div');
              successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-weight:600;';
              successMsg.textContent = '✅ Đã gửi đánh giá thành công!';
              document.body.appendChild(successMsg);
              setTimeout(() => successMsg.remove(), 3000);
            } catch (error) {
              console.error("Error submitting review:", error);
              alert(`Có lỗi khi gửi đánh giá: ${error.response?.data?.message || error.message}`);
            }
          });
        }
      }
    };
    
    document.getElementById("overview-tab")?.addEventListener("click", () => switchTab("overview"));
    document.getElementById("reviews-tab")?.addEventListener("click", () => switchTab("reviews"));

    document.getElementById("view-detail-btn")?.addEventListener("click", () => showDetailModal(place));
    
    // ✅ TỰ ĐỘNG MỞ REVIEWS TAB NẾU USER ĐÃ LOGIN
    if (user && user.userId && activeTab === "overview") {
      console.log('📝 Auto-opening reviews tab for logged-in user');
      switchTab("reviews"); // switchTab sẽ attach handlers trong nó
    } else if (activeTab === "reviews" && user && user.userId) {
      // ✅ NẾU ĐÃ RENDER REVIEWS TAB TỪ ĐẦU → ATTACH HANDLERS NGAY
      console.log('📝 Initial reviews tab, attaching handlers');
      setTimeout(() => {
        // Attach stars
        for (let i = 1; i <= 5; i++) {
          const star = document.getElementById(`star-${i}`);
          if (star) {
            star.addEventListener("click", () => {
              console.log('⭐ Star clicked (initial):', i);
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
            
            console.log('Gửi đi:', { rating: currentRating, comment });
            
            if (!currentRating || currentRating < 1 || currentRating > 5) {
              console.error('❌ Rating validation failed');
              return alert("🌟 Chọn sao đi! (1-5 sao)");
            }
            if (!comment) return alert("Vui lòng nhập bình luận!");
            
            try {
              await axios.post(`${BASE_URL}/map-locations/${place.id}/feedback`, {
                userId: user.userId,
                rating: currentRating,
                comment: comment
              });
              
              setNewRating(null);
              setNewComment("");
              window.currentRating = null;
              if (commentInput) commentInput.value = "";
              
              const reviewsRes = await axios.get(`${BASE_URL}/map-locations/${place.id}/feedback`);
              setReviews(reviewsRes.data.map(r => ({
                rating: r.Rating,
                comment: r.Comment,
                timestamp: new Date(r.CreatedAt).toLocaleDateString('vi-VN'),
                userName: r.user?.FullName || 'Ẩn danh'
              })));
              
              alert("Đã gửi đánh giá thành công!");
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
      document.getElementById("get-directions-btn")?.addEventListener("click", () => {
        if (!userMarker.current) return alert("Vui lòng bật định vị!");
        calculateRoute(userMarker.current.getLatLng(), place.position, map);
      });

      document.getElementById("save-btn")?.addEventListener("click", () => {
        const fullPlace = places.find(p => p.id === place.id) || place;
        if (!favorites.some(f => f.id === fullPlace.id)) {
          const updated = [...favorites, fullPlace];
          setFavorites(updated);
          localStorage.setItem("favorites", JSON.stringify(updated));
          alert("Đã lưu!");
        } else {
          alert("Đã có trong yêu thích!");
        }
      });

      document.getElementById("compare-btn")?.addEventListener("click", () => setComparePlace(place));

      // Write review button
      document.getElementById('write-review-btn')?.addEventListener('click', () => {
        switchTab('reviews');
        setTimeout(() => {
          const commentInput = document.getElementById('comment-input');
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

  /* ---------- YÊU THÍCH ---------- */
  const showFavoritesSidebar = () => {
    favoritesSidebarRef.current.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;font-size:1.4rem;font-weight:600;color:white;">Mục yêu thích</h3>
        <div onclick="window.closeFavoritesSidebar()" style="width:36px;height:36px;background:#444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          <span style="font-size:1.6rem;color:#aaa;">×</span>
        </div>
      </div>
      <div style="margin-bottom:16px;font-size:0.9rem;color:#aaa;">
        <span style="margin-right:8px;">Lock</span> Riêng tư · <span class="fav-count">${favorites.length}</span> địa điểm
      </div>
      <div id="favorites-list" style="color:white;"></div>
    `;

    const list = document.getElementById("favorites-list");
    if (favorites.length === 0) {
      list.innerHTML = `<div style="color:#aaa;text-align:center;padding:20px;">Chưa có địa điểm nào được lưu.</div>`;
    } else {
      list.innerHTML = favorites
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
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    showFavoritesSidebar();
  };

  window.showPlaceFromFav = (id) => {
    const place = places.find((p) => p.id === id) || favorites.find((f) => f.id === id);
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

  /* ---------- RETURN JSX ---------- */
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
          <CompareModal place={comparePlace} onClose={() => setComparePlace(null)} />,
          document.body
        )}
    </>
  );
};

export default MapPage;