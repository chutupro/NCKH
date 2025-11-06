# PowerShell script test Media Service upload
# Yêu cầu: PowerShell 7+ (pwsh)

param(
    [Parameter(Mandatory=$true)]
    [string]$ImagePath,
    
    [Parameter(Mandatory=$false)]
    [string]$Type = "avatar",
    
    [Parameter(Mandatory=$false)]
    [string]$Category = ""
)

Write-Host "🧪 Testing Media Service Upload" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Kiểm tra file tồn tại
if (-not (Test-Path $ImagePath)) {
    Write-Host "❌ File không tồn tại: $ImagePath" -ForegroundColor Red
    exit 1
}

# Lấy thông tin file
$fileInfo = Get-Item $ImagePath
Write-Host "📁 File: $($fileInfo.Name)" -ForegroundColor Yellow
Write-Host "📏 Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Yellow

# Kiểm tra extension
$validExts = @('.jpg', '.jpeg', '.png', '.mp4', '.mov')
if ($fileInfo.Extension -notin $validExts) {
    Write-Host "❌ File phải là: .jpg, .jpeg, .png, .mp4, .mov" -ForegroundColor Red
    exit 1
}

# Kiểm tra size
if ($fileInfo.Length -gt 50MB) {
    Write-Host "❌ File quá lớn (> 50MB)" -ForegroundColor Red
    exit 1
}

# Token test (user-123)
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx"

# Prepare multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$fileBin = [System.IO.File]::ReadAllBytes($ImagePath)
$enc = [System.Text.Encoding]::GetEncoding("iso-8859-1")

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$($fileInfo.Name)`"",
    "Content-Type: application/octet-stream",
    "",
    $enc.GetString($fileBin),
    "--$boundary",
    "Content-Disposition: form-data; name=`"type`"",
    "",
    $Type
)

if ($Category) {
    $bodyLines += @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"category`"",
        "",
        $Category
    )
}

$bodyLines += "--$boundary--"

$body = $bodyLines -join "`r`n"

Write-Host ""
Write-Host "📤 Uploading..." -ForegroundColor Yellow
Write-Host "   Type: $Type" -ForegroundColor Gray
if ($Category) {
    Write-Host "   Category: $Category" -ForegroundColor Gray
}

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3001/upload" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
        } `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body
    
    if ($response.StatusCode -eq 201) {
        Write-Host ""
        Write-Host "✅ Upload thành công!" -ForegroundColor Green
        Write-Host ""
        
        $result = $response.Content | ConvertFrom-Json
        
        Write-Host "📋 Response:" -ForegroundColor Cyan
        Write-Host "   URL: $($result.url)" -ForegroundColor White
        Write-Host "   Filename: $($result.filename)" -ForegroundColor Gray
        Write-Host "   Size: $([math]::Round($result.size / 1KB, 2)) KB" -ForegroundColor Gray
        
        # Mở browser để xem ảnh
        Write-Host ""
        $confirm = Read-Host "Mở ảnh trong browser? (y/n)"
        if ($confirm -eq 'y') {
            Start-Process $result.url
        }
        
        # Mở folder chứa file
        Write-Host ""
        $confirmFolder = Read-Host "Mở folder chứa file? (y/n)"
        if ($confirmFolder -eq 'y') {
            if ($Category) {
                $folderPath = "storage\$Category\user-123"
            } else {
                $folderPath = "storage\$Type\user-123"
            }
            explorer $folderPath
        }
    }
} catch {
    Write-Host ""
    Write-Host "❌ Upload thất bại!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
