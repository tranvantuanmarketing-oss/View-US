@echo off
chcp 65001 >nul
:: ==============================================================================
:: Kho Mẫu Reel v1.6 - Khởi Động Trên Windows
:: ==============================================================================
cd /d "%~dp0"

set PORT=8088
echo ==========================================================
echo 🎬 DANG KHOI DONG KHO MAU REEL STUDIO (PORT %PORT%)...
echo ==========================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May cua ban chua cai dat Node.js!
    echo Vui long truy cap https://nodejs.org de tai va cai dat Node.js (ban LTS).
    echo Nhan phim bat ky de thoat...
    pause >nul
    exit /b 1
)

start "" cmd /c "timeout /t 1 /nobreak >nul & start http://localhost:%PORT%"

node server.js
pause
