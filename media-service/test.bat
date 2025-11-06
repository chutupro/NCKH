@echo off
echo ====================================
echo Testing Media Service
echo ====================================
echo.

REM Tạo token test
set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx

echo 1. Test Health Check
echo.
curl -X POST http://localhost:3001/health
echo.
echo.

echo 2. Test Upload (ban dau se fail vi khong co file)
echo Vui long dung Postman hoac Thunder Client de test upload
echo.
echo POST http://localhost:3001/upload
echo Authorization: Bearer %TOKEN%
echo Content-Type: multipart/form-data
echo.
echo Body:
echo   - file: [chon file anh]
echo   - type: avatar
echo.

echo 3. Service info:
echo URL: http://localhost:3001
echo Storage: media-service/storage/
echo.
pause
