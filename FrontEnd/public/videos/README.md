# Hướng dẫn đặt video 4K vào đây

## Đặt video của bạn vào thư mục này:

```
FrontEnd/public/videos/danang-login-bg.mp4
FrontEnd/public/videos/danang-login-bg.webm (optional)
```

## Nếu video 4K quá nặng, tối ưu bằng lệnh:

### Tạo MP4 (1080p, web-optimized):
```powershell
ffmpeg -i your-4k-video.mp4 `
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" `
    -c:v libx264 `
    -crf 28 `
    -preset slow `
    -profile:v high `
    -level 4.0 `
    -movflags +faststart `
    -c:a aac `
    -b:a 128k `
    danang-login-bg.mp4
```

### Tạo WebM (fallback):
```powershell
ffmpeg -i your-4k-video.mp4 `
    -vf "scale=1920:1080" `
    -c:v libvpx-vp9 `
    -crf 30 `
    -b:v 0 `
    danang-login-bg.webm
```

## Kích thước khuyến nghị:
- **MP4**: 5-10 MB
- **WebM**: 3-8 MB
- **Độ dài**: 10-15 giây
- **Seamless loop**: Đảm bảo frame cuối giống frame đầu

## Tạo poster image (thumbnail khi chưa load video):
```powershell
ffmpeg -i danang-login-bg.mp4 -vframes 1 -vf "scale=1920:1080" -q:v 2 ../images/danang-poster.jpg
```

---

**Video của bạn nên có:**
- ✅ Cảnh Cầu Rồng Đà Nẵng từ quá khứ → hiện tại
- ✅ Ánh sáng ấm (warm amber tones)
- ✅ Chuyển động chậm, cinematic
- ✅ Seamless loop (lặp lại mượt mà)
