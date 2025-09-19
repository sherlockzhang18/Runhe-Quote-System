@echo off
REM 🔥 Windows Firewall Configuration for Quote System
REM Run this as Administrator to allow network access

echo 🔥 Configuring Windows Firewall for Quote System...
echo ================================================

REM Check if running as administrator
net session >nul 2>&1
if errorlevel 1 (
    echo ❌ This script must be run as Administrator!
    echo Right-click and select "Run as Administrator"
    pause
    exit /b 1
)

echo ✅ Running as Administrator!

REM Add firewall rule for port 3000
echo 🔧 Adding firewall rule for port 3000...
netsh advfirewall firewall add rule name="Quote System - Port 3000" dir=in action=allow protocol=TCP localport=3000

if errorlevel 0 (
    echo ✅ Firewall rule added successfully!
) else (
    echo ⚠️ Failed to add firewall rule. You may need to do this manually.
)

REM Display current IP address
echo.
echo 📋 Your current IP addresses:
echo =============================
ipconfig | findstr /C:"IPv4 Address"

echo.
echo 🎉 Firewall configuration completed!
echo =====================================
echo.
echo 🌐 Your Quote System should now be accessible from other devices:
echo    http://YOUR-IP-ADDRESS:3000
echo.
echo 💡 If you still can't access from other devices:
echo    1. Check Windows Defender Firewall settings
echo    2. Verify Docker Desktop is running
echo    3. Make sure other devices are on the same network
echo.
pause