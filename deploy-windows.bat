@echo off
REM 🚀 Quote System - Windows Deployment Script
REM This script will automatically deploy thecho 📋 IMPORTANT INFORMATION:
echo ------------------------
echo 🌐 Application URL: http://localhost:3000
echo 🌐 Network Access: http://YOUR-IP-ADDRESS:3000
echo 📁 Environment: Using existing .env file
echo.
echo 📋 Network Access Instructions:
echo   1. Find your IP: ipconfig (look for IPv4 Address)
echo   2. Access from other devices: http://YOUR-IP:3000
echo   3. Make sure Windows Firewall allows port 3000tire application on Windows

echo 🚀 Starting Quote System Deployment for Windows...
echo ================================================

REM Check if Docker is running
docker version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running or not installed!
    echo Please install Docker Desktop and make sure it's running.
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker is running!

REM Check if .env file exists
echo 📝 Checking environment configuration...
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please make sure the .env file is included in your project directory.
    pause
    exit /b 1
)

echo ✅ Using existing .env file!

REM Stop any existing services
echo 🛑 Stopping any existing services...
docker-compose down 2>nul
docker-compose -f docker-compose.prod.yml down 2>nul
echo ✅ Existing services stopped!

REM Build and start services
echo 🏗️ Building and starting services (this may take a few minutes)...
docker-compose -f docker-compose.prod.yml up -d --build

if errorlevel 1 (
    echo ❌ Failed to start services!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo ✅ Services started!

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Run database migrations
echo 🗄️ Setting up database schema...
docker-compose -f docker-compose.prod.yml exec -T app npm run drizzle:migrate

if errorlevel 1 (
    echo ⚠️ Database migration might have failed, but continuing...
)

REM Check if services are running
echo 🔍 Verifying deployment...
docker-compose -f docker-compose.prod.yml ps

REM Create backup script
echo 📋 Creating backup script...
(
echo @echo off
echo REM Database backup script
echo echo Creating database backup...
echo docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres quotes_db ^> backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
echo echo Backup completed!
echo pause
) > backup.bat

REM Create update script
echo 🔄 Creating update script...
(
echo @echo off
echo REM Update application script
echo echo Updating application...
echo.
echo REM Pull latest changes (if using git^)
echo if exist ".git" (
echo     git pull origin main
echo ^)
echo.
echo REM Rebuild and restart services
echo docker-compose -f docker-compose.prod.yml down
echo docker-compose -f docker-compose.prod.yml up -d --build
echo.
echo echo Update completed!
echo pause
) > update.bat

echo.
echo 🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉
echo ========================================
echo.
echo ✅ Your Quote System is now running!
echo.
echo 📋 IMPORTANT INFORMATION:
echo ------------------------
echo 🌐 Application URL: http://localhost:3000
echo � Environment: Using existing .env file
echo.
echo 📁 Files created:
echo   - .env (environment configuration)
echo   - backup.bat (database backup script)
echo   - update.bat (application update script)
echo.
echo 🔧 Useful commands:
echo   - Check status: docker-compose -f docker-compose.prod.yml ps
echo   - View logs: docker-compose -f docker-compose.prod.yml logs app
echo   - Stop services: docker-compose -f docker-compose.prod.yml down
echo   - Restart services: docker-compose -f docker-compose.prod.yml restart
echo.
echo 💾 To backup database: double-click backup.bat
echo 🔄 To update application: double-click update.bat
echo.
echo ✅ Deployment completed! Your system is ready to use.
echo 🌐 Open your browser and go to: http://localhost:3000
echo 🌐 For network access: Find your IP and use http://YOUR-IP:3000
echo.
echo 💡 Quick IP check: ipconfig ^| findstr IPv4
echo.
pause