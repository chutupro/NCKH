# Script nén video 4K xuống 1080p cho web
# Yêu cầu: Cài ffmpeg (choco install ffmpeg)

$inputVideo = "video-4k.mp4"  # ← Đổi tên file của bạn
$outputDir = "public\videos\"

Write-Host "Đang nén video cho web..." -ForegroundColor Green

# Nén MP4 (1080p, tối ưu cho web)
ffmpeg -i $inputVideo `
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" `
    -c:v libx264 `
    -crf 28 `
    -preset slow `
    -profile:v high `
    -level 4.0 `
    -movflags +faststart `
    -c:a aac `
    -b:a 128k `
    -ar 44100 `
    "$outputDir\danang-login-bg.mp4"

Write-Host "✓ Tạo MP4 thành công!" -ForegroundColor Green

# Nén WebM (fallback cho các trình duyệt không support MP4)
ffmpeg -i $inputVideo `
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" `
    -c:v libvpx-vp9 `
    -crf 30 `
    -b:v 0 `
    -deadline good `
    -c:a libopus `
    -b:a 96k `
    "$outputDir\danang-login-bg.webm"

Write-Host "✓ Tạo WebM thành công!" -ForegroundColor Green

# Tạo poster image (thumbnail)
ffmpeg -i "$outputDir\danang-login-bg.mp4" `
    -vframes 1 `
    -vf "scale=1920:1080" `
    -q:v 2 `
    "public\images\danang-poster.jpg"

Write-Host "`n✅ HOÀN TẤT!" -ForegroundColor Green
Write-Host "File đã tạo:" -ForegroundColor Yellow
Write-Host "  - $outputDir\danang-login-bg.mp4" -ForegroundColor Cyan
Write-Host "  - $outputDir\danang-login-bg.webm" -ForegroundColor Cyan
Write-Host "  - public\images\danang-poster.jpg" -ForegroundColor Cyan

# Hiển thị kích thước
$mp4Size = (Get-Item "$outputDir\danang-login-bg.mp4").Length / 1MB
$webmSize = (Get-Item "$outputDir\danang-login-bg.webm").Length / 1MB
Write-Host "`nKích thước:" -ForegroundColor Yellow
Write-Host "  MP4:  $([math]::Round($mp4Size, 2)) MB" -ForegroundColor Cyan
Write-Host "  WebM: $([math]::Round($webmSize, 2)) MB" -ForegroundColor Cyan

if ($mp4Size -gt 10) {
    Write-Host "`n⚠️  Cảnh báo: File MP4 > 10MB, có thể load chậm!" -ForegroundColor Red
    Write-Host "   Cân nhắc tăng CRF (28 → 32) để giảm dung lượng" -ForegroundColor Yellow
}
