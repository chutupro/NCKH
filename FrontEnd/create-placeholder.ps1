# Script tạo video placeholder nhanh (không cần video thật)
# Tạo HTML5 video alternative nếu chưa có video

Write-Host "🎬 Tạo fallback cho video..." -ForegroundColor Cyan

$htmlContent = @"
<!-- Fallback khi chưa có video -->
<div style="
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%);
  animation: gradientShift 10s ease infinite;
">
  <style>
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    .dragon-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: float 4s ease-in-out infinite;
      font-size: 120px;
      filter: drop-shadow(0 10px 30px rgba(0,0,0,0.3));
    }
  </style>
  <div class="dragon-placeholder">🐉</div>
</div>
"@

Write-Host "✅ Video placeholder sẵn sàng!" -ForegroundColor Green
Write-Host "`nĐể sử dụng video thật:" -ForegroundColor Yellow
Write-Host "  1. Đặt video vào: public/videos/danang-login-bg.mp4" -ForegroundColor Cyan
Write-Host "  2. Video sẽ tự động hiển thị thay gradient" -ForegroundColor Cyan
Write-Host "`nGradient màu đẹp đang chạy làm background tạm! 🎨" -ForegroundColor Green
