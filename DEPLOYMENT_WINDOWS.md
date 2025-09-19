# 🪟 WINDOWS SERVER DEPLOYMENT INSTRUCTIONS

## Simple Instructions for Windows Server

### What You Need:
- Windows Server 2019 or newer
- Administrator access
- Internet connection

### Step 1: Install Docker Desktop
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Run the installer as Administrator
3. Restart the server when prompted
4. Open Docker Desktop and wait for it to start

### Step 2: Get the Application Files
**Option A: Download ZIP (Easiest)**
1. Go to: https://github.com/sherlockzhang18/Runhe-Quote-System
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to `C:\quote-system`
5. Open Command Prompt as Administrator
6. Run: `cd C:\quote-system`

**Option B: Using Git (if available)**
```cmd
git clone https://github.com/sherlockzhang18/Runhe-Quote-System.git
cd Runhe-Quote-System
```

### Step 3: Run the Deployment Script
1. Right-click on `deploy-windows.bat`
2. Select "Run as Administrator"
3. Wait for the script to complete (5-10 minutes)

**That's it!** The script will do everything automatically.

### Step 4: Test the Application
1. Open a web browser
2. Go to: `http://localhost:3000`
3. You should see the Quote System login page

### If Something Goes Wrong:

**Check Docker is Running:**
- Look for Docker icon in system tray
- If not running, open Docker Desktop

**Restart Services:**
```cmd
cd C:\quote-system
docker-compose -f docker-compose.prod.yml restart
```

**View Error Logs:**
```cmd
cd C:\quote-system
docker-compose -f docker-compose.prod.yml logs
```

**Complete Reset:**
```cmd
cd C:\quote-system
docker-compose -f docker-compose.prod.yml down
deploy-windows.bat
```

### Daily Operations:
- **Backup database**: Double-click `backup.bat`
- **Update application**: Double-click `update.bat`
- **Check status**: Open Command Prompt and run:
  ```cmd
  cd C:\quote-system
  docker-compose -f docker-compose.prod.yml ps
  ```

### Important Notes:
- The application uses your existing .env file configuration
- The application runs on port 3000
- All data is automatically saved and persisted
- The server can be accessed from other computers using the server's IP address

### Firewall Configuration:
If you want to access from other computers:
1. Open Windows Firewall
2. Allow inbound connections on port 3000
3. Access using: `http://SERVER-IP:3000`

---

## Troubleshooting:
- **Port already in use**: Change PORT=3000 to PORT=3001 in .env file
- **Docker not starting**: Ensure Hyper-V is enabled in Windows Features
- **Slow performance**: Allocate more RAM to Docker Desktop (Settings > Resources)

## Emergency Contact:
If deployment fails, provide:
1. Windows Server version
2. Error messages from the script
3. Output of: `docker-compose -f docker-compose.prod.yml logs`