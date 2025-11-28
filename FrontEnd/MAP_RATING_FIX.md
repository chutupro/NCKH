# 🐛 FIX: Rating Validation Failed + F5 Mất User - Map Review

## Vấn đề

### 🐛 **Lỗi 1: F5 → Mất user authentication**
**Triệu chứng:**
```
✅ Login Google thành công
✅ Vào map, mở đánh giá
❌ Ấn F5 → "Vui lòng đăng nhập để đánh giá"
```

**Root cause:**
- `useAuthRestore` chạy và restore user thành công ✅
- Nhưng sidebar đã render HTML string với `user = null` ❌
- Sau khi user được restore, **HTML không tự động re-render** ❌
- → Form vẫn hiển thị "Vui lòng đăng nhập" dù user đã có

### 🐛 **Lỗi 2: Chọn sao + comment → Vẫn báo "Vui lòng chọn số sao"**
**Triệu chứng:**
```
✅ Chọn 5 sao → Console log: "Star clicked: 5"
❌ Nhấn "Gửi đánh giá" → Lỗi: "Rating validation failed"
❌ window.currentRating = null (RESET!)
```

**Root cause:**
1. **Duplicate `window.setStarRating` definition** (line 1541) ❌
   - Definition cũ chỉ update UI + state, **KHÔNG update `window.currentRating`**
   - Chạy SAU definition đúng ở `showPlaceDetail()` → **OVERRIDE**!
   
2. **useEffect replace form KHÔNG restore `window.currentRating`** ❌
   - F5 → user restore → replace login prompt với review form
   - Render form với `savedRating` nhưng **QUÊN set lại `window.currentRating`**
   - → Click star → `window.currentRating` vẫn null!

## 📊 Log phân tích

### LỖI 1: F5 MẤT USER
```javascript
// Khi load trang
[Auth Restore] Attempting to restore session...
[Auth Restore] ✅ Session restored successfully { userId: 4, email: '...' }

// Nhưng sidebar vẫn hiển thị
"Vui lòng đăng nhập để đánh giá" // ❌ HTML không update!
```

### LỖI 2: RATING VALIDATION
```javascript
// Click sao
⭐ Star clicked: 5  // ← Log từ event listener
// ❌ KHÔNG có log "setStarRating CALLED" → Function bị override!

// Submit
📊 [SUBMIT] Rating check: null  // ❌ window.currentRating = null!
Rating validation failed
```

**Nguyên nhân:**
```javascript
// showPlaceDetail() - Line 899 (ĐÚNG)
window.setStarRating = (rating) => {
  window.currentRating = rating; // ✅ Update window
  setNewRating(rating);          // ✅ Update state
};

// Line 1541 (SAI - OVERRIDE CÁI TRÊN!)
window.setStarRating = (rating) => {
  setNewRating(rating);  // ❌ THIẾU: window.currentRating = rating
};
```

## ✅ Giải pháp đã áp dụng

### 1. **Fix duplicate `window.setStarRating`**: XÓA cái cũ
```javascript
// ❌ REMOVED: Duplicate definition ở line 1541
// window.setStarRating = (rating) => { ... }

// ✅ GIỮ NGUYÊN: Definition đúng trong showPlaceDetail()
window.setStarRating = (rating) => {
  console.log('⭐ setStarRating CALLED:', rating);
  
  // ✅ LƯU VÀO WINDOW TRƯỚC (ƯU TIÊN CAO NHẤT)
  window.currentRating = rating;
  
  // ✅ SAU ĐÓ MỚI CẬP NHẬT STATE
  setNewRating(rating);
  
  // Update UI
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`star-${i}`);
    if (star) {
      star.style.color = i <= rating ? "#ffca28" : "#ccc";
    }
  }
};
```

### 2. **Fix useEffect replace form**: Restore `window.currentRating`
```javascript
// Lấy rating hiện tại (nếu có)
const savedRating = window.currentRating ?? newRating ?? 0;

// Render form với savedRating
loginPromptContainer.outerHTML = reviewFormHTML;

// ✅ KHÔI PHỤC LẠI window.currentRating (QUAN TRỌNG!)
if (savedRating > 0) {
  window.currentRating = savedRating;
  console.log('🔄 [User Restored] Restored window.currentRating:', savedRating);
}
```

### 3. **Fix F5 mất user**: Smart re-render review form
```javascript
useEffect(() => {
  if (!user || !user.userId) return;
  if (!sidebarRef.current) return;
  if (activeTab !== 'reviews') return; // ← CHỈ update tab reviews
  
  // Delay để đảm bảo DOM ready
  setTimeout(() => {
    // Tìm "Vui lòng đăng nhập" prompt
    const loginPrompt = document.querySelector('#login-to-review-link');
    if (!loginPrompt) return; // Form đã đúng rồi
    
    console.log('✅ [User Restored] Replacing login prompt with review form');
    
    // Replace với form đánh giá + restore window.currentRating
    // ...
  }, 300);
}, [user?.userId, activeTab]);
```

## 🧪 Cách test

### Test Case 1: F5 sau khi login
1. Login Google
2. Vào Map → Click marker
3. Chuyển tab "Đánh giá"
4. **Ấn F5**
5. ✅ Expected: Form đánh giá vẫn hiển thị (không còn "Vui lòng đăng nhập")

### Test Case 2: Chọn sao + submit
1. Đảm bảo đã login
2. Mở map → Click marker → Tab "Đánh giá"
3. Click chọn 5 sao
4. Nhập comment: "Test review"
5. Click "Gửi đánh giá"
6. ✅ Expected: Submit thành công, không báo lỗi validation

### Expected logs:
```
⭐ setStarRating CALLED: 5
✅ Rating saved - window: 5 state will update to: 5
📊 [SUBMIT] Rating check: { window.currentRating: 5, newRating state: 5, final currentRating: 5 }
🚀 [SUBMIT] Sending to API: { userId: 4, rating: 5, comment: "Test review" }
✅ [SUBMIT] Review submitted successfully!
```

## 📝 Files thay đổi

**File:** `FrontEnd/src/pages/map/MapPage.jsx`

**Changes:**
1. ✅ **XÓA duplicate `window.setStarRating`** ở line 1541 (override function đúng)
2. ✅ **Thêm restore `window.currentRating`** trong useEffect replace form
3. ✅ Thêm `useEffect` để replace login prompt khi user restore
4. ✅ Smart replace: Chỉ update phần cần thiết, không reset rating
5. ✅ Re-attach event listeners sau khi replace HTML
6. ✅ Delay 300ms để đảm bảo DOM ready

## 🎯 Kết quả

### Trước khi fix:
- ❌ F5 → Mất form đánh giá
- ❌ Chọn sao → Click OK nhưng `window.currentRating` không update (do function bị override)
- ❌ Submit → Rating = null → Validation fail

### Sau khi fix:
- ✅ F5 → Form vẫn hiển thị đúng
- ✅ Chọn sao → `window.currentRating` update chính xác
- ✅ Submit → Rating được gửi đúng
- ✅ UI update chính xác
- ✅ Không reset rating khi restore user

---

**Tóm lại:** 
1. F5 mất user → Fix bằng smart re-render chỉ phần form
2. Rating validation fail → **Root cause: Duplicate `window.setStarRating` override function đúng**
3. Fix: Xóa duplicate + restore `window.currentRating` trong useEffect

**Test ngay và báo kết quả nhé!** 🚀

---

## 🎨 BONUS: Review hiển thị ngay sau khi submit

### Cách hoạt động:
1. Submit review thành công
2. **Fetch lại reviews mới** từ database
3. **Update state `reviews`**
4. **Manually update DOM** (vì HTML render bằng string, không auto-update)
5. ✅ Review mới hiển thị NGAY LẬP TỨC (không cần reload page!)

### Code implementation:
```javascript
// Sau khi POST thành công
const reviewsRes = await axios.get(`${BASE_URL}/map-locations/${place.id}/feedback`);
const newReviewsList = reviewsRes.data.map(r => ({
  rating: r.Rating,
  comment: r.Comment,
  timestamp: new Date(r.CreatedAt).toLocaleDateString('vi-VN'),
  userName: r.user?.FullName || 'Ẩn danh'
}));

setReviews(newReviewsList);

// ✅ UPDATE DOM IMMEDIATELY
const reviewsList = document.getElementById('reviews-list');
if (reviewsList) {
  reviewsList.innerHTML = newReviewsList.map(r => `
    <div style="padding:12px;border-bottom:1px solid #eee;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <span style="font-weight:600;color:#333;">${r.userName || 'Ẩn danh'}</span>
        <span style="color:#ffca28;">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
      </div>
      <p style="margin:4px 0;color:#555;line-height:1.4;">${r.comment}</p>
      <span style="font-size:0.8rem;color:#888;">${r.timestamp}</span>
    </div>
  `).join("");
}

// Show success toast (không dùng alert nữa)
const successMsg = document.createElement('div');
successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-weight:600;';

document.body.appendChild(successMsg);
setTimeout(() => successMsg.remove(), 3000);
```

### UX Improvements:
- ❌ **Trước:** Alert popup che mất UI → User phải click OK mới thấy review
- ✅ **Sau:** Toast notification góc phải → Tự động biến mất sau 3s → Review hiển thị NGAY!
