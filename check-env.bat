@echo off
REM 🔍 Environment File Checker
REM This script helps diagnose .env file issues

echo 🔍 Quote System - Environment File Checker
echo ==========================================

echo 📁 Current directory: %cd%
echo.

echo 🔍 Checking for project files...
if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json not found
)

if exist "docker-compose.prod.yml" (
    echo ✅ docker-compose.prod.yml found
) else (
    echo ❌ docker-compose.prod.yml not found
)

echo.
echo 🔍 Checking for .env file...

REM Method 1: Standard check
if exist ".env" (
    echo ✅ .env file found (standard check)
) else (
    echo ❌ .env file not found (standard check)
)

REM Method 2: Dir command
dir /a .env >nul 2>&1
if not errorlevel 1 (
    echo ✅ .env file found (dir command)
) else (
    echo ❌ .env file not found (dir command)
)

echo.
echo 📋 All .env related files:
dir /b | findstr "env"

echo.
echo 📋 File attributes for .env:
dir /a .env

echo.
echo 📋 First few lines of .env (if exists):
if exist ".env" (
    echo ===============================
    more /e +1 .env | head -5
    echo ===============================
) else (
    echo .env file not accessible
)

echo.
echo 🔧 If .env is missing, here's what to check:
echo 1. Make sure you copied the .env file to this directory
echo 2. Check if it's named exactly ".env" (not ".env.txt")
echo 3. Verify file permissions
echo 4. Try creating a new .env file if needed
echo.

pause