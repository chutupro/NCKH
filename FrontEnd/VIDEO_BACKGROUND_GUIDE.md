# Hướng dẫn tạo Video Background cho Login/Register

## Yêu cầu video

### Thông số kỹ thuật:
- **Thời lượng**: 10-15 giây
- **Độ phân giải**: 1920x1080 (16:9) hoặc 2560x1080 (21:9)
- **Format**: MP4 (H.264) + WebM (VP9) để tối ưu
- **Kích thước**: Tối đa 5-10MB (nén để web load nhanh)
- **FPS**: 24-30fps
- **Loop**: Seamless loop (khung cuối giống khung đầu)

### Nội dung 3 scenes:

#### Scene 1: Đà Nẵng Xưa (0-5s)
- Sông Hàn buổi chiều, ánh vàng ấm
- Thuyền gỗ nhỏ trên sông
- Bờ sông hoang sơ, cây cối
- Camera: Slow pan từ trái sang phải
- Tông màu: Warm sepia, golden hour

#### Scene 2: Xây Dựng Cầu Rồng (5-10s)
- Time-lapse cầu Rồng mọc lên từ móng
- Khung sắt dần hoàn thiện
- Ánh sáng chuyển từ chiều → tối
- Camera: Slow zoom in
- Tông màu: Dần mạnh hơn, ánh đèn xây dựng

#### Scene 3: Cầu Rồng Hiện Đại (10-15s)
- Ban đêm, cầu sáng rực
- Phun lửa (fire effect) nhẹ nhàng
- Skyline Đà Nẵng phía sau
- Phản chiếu sông Hàn lung linh
- Camera: Slow orbit
- Tông màu: Vàng cam + xanh cyan nhẹ

---

## Cách 1: Thuê Freelancer (Recommended)

### Fiverr
1. Tìm "3d architectural animation" hoặc "cinematic video"
2. Budget: $50-200
3. Gửi brief chi tiết ở trên
4. Thời gian: 5-10 ngày

### Upwork
1. Post job: "3D Cinematic Video - Da Nang Dragon Bridge"
2. Attach references (YouTube videos tương tự)
3. Budget: $100-300
4. Chọn freelancer có portfolio về architecture/city

---

## Cách 2: AI Video Generation

### RunwayML Gen-2
```
Prompt:
"Cinematic 3D animation of Da Nang Dragon Bridge, Vietnam. 
Scene 1: Historical Han River with wooden boats at golden hour
Scene 2: Time-lapse construction of Dragon Bridge
Scene 3: Modern Dragon Bridge at night with fire breathing, warm amber lighting
Camera: slow cinematic movement, 16:9, 4K quality"
```

### Pika Labs
1. Discord: pika.art
2. `/create` command với prompt trên
3. Upscale + extend để đủ 15s

---

## Cách 3: Stock Video + Edit

### Tìm footage:
- **Envato Elements**: "Da Nang aerial" + "Dragon Bridge"
- **Pexels**: Free footage Đà Nẵng
- **Shutterstock**: Professional clips

### Edit trong DaVinci Resolve (Free):
1. Import 3-4 clips
2. Color grade: warm orange LUT
3. Add transitions: crossfade slow
4. Export: H.264, 1080p, 5Mbps

---

## Sau khi có video:

### 1. Tối ưu video:
```bash
# Cài ffmpeg
# Convert to MP4 (nén)
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k danang-login-bg.mp4

# Convert to WebM (fallback)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 danang-login-bg.webm

# Tạo poster image (frame đầu)
ffmpeg -i danang-login-bg.mp4 -vframes 1 -f image2 danang-poster.jpg
```

### 2. Copy vào project:
```
FrontEnd/
  public/
    videos/
      danang-login-bg.mp4
      danang-login-bg.webm
    images/
      danang-poster.jpg
```

### 3. Test:
```bash
cd FrontEnd
npm run dev
# Truy cập http://localhost:5173/login
```

---

## Placeholder tạm thời

Nếu chưa có video, tạm dùng:
1. Ảnh tĩnh Đà Nẵng làm background
2. CSS gradient animation
3. Particle effects (Three.js)

Mình đã setup sẵn code, chỉ cần bỏ video vào là chạy!

---

## Tips khi làm việc với designer:

✅ **Cung cấp references:**
- YouTube: "Da Nang drone 4K"
- Behance: "architectural animation"
- Tìm motion style bạn thích

✅ **Brief rõ ràng:**
- Duration chính xác
- Tông màu (warm amber)
- Camera movement (slow, cinematic)
- No text/logo trong video

✅ **Deliverables:**
- MP4 + WebM
- Under 10MB
- Seamless loop
- Source files (nếu cần chỉnh sau)

---

**Contact me if you need help finding the right freelancer!**
