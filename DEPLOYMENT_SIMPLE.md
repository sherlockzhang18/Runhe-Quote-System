# 🚀 SIMPLE DEPLOYMENT INSTRUCTIONS

## For the Server Operator (No Technical Knowledge Required)

### What You Need:
- A Linux server (Ubuntu/CentOS/Debian)
- Internet connection
- Root or sudo access

### Step 1: Get the Files
**Option A: Download ZIP (Easiest)**
1. Go to: https://github.com/sherlockzhang18/Runhe-Quote-System
2. Click the green "Code" button
3. Click "Download ZIP"
4. Upload the ZIP file to your server
5. Unzip it: `unzip Runhe-Quote-System-main.zip`
6. Go into the folder: `cd Runhe-Quote-System-main`

**Option B: Using Git (if available)**
```bash
git clone https://github.com/sherlockzhang18/Runhe-Quote-System.git
cd Runhe-Quote-System
```

### Step 2: Install Docker (Only if not installed)
```bash
# Copy and paste this entire command:
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh && sudo apt-get update && sudo apt-get install -y docker-compose-plugin
```

### Step 3: Run the Magic Script
```bash
# Just run this ONE command:
sudo ./deploy.sh
```

**That's it!** The script will:
- ✅ Check everything is installed
- ✅ Use your existing .env configuration
- ✅ Set up the database
- ✅ Start the application
- ✅ Create backup and update scripts

### Step 4: Check if it Worked
After the script finishes, you should see:
```
🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉
```

Test it by opening a web browser and going to:
- `http://your-server-ip:3000`

### If Something Goes Wrong:
1. Run this to see what's happening:
   ```bash
   sudo docker-compose -f docker-compose.prod.yml logs
   ```

2. To restart everything:
   ```bash
   sudo docker-compose -f docker-compose.prod.yml restart
   ```

3. To completely stop and start again:
   ```bash
   sudo docker-compose -f docker-compose.prod.yml down
   sudo ./deploy.sh
   ```

### Important Notes:
- The script uses your existing .env file configuration
- The application will be available at port 3000
- All data is automatically saved and backed up

### Daily Operations:
- **Backup database**: `sudo ./backup.sh`
- **Update application**: `sudo ./update.sh`
- **Check if running**: `sudo docker-compose -f docker-compose.prod.yml ps`

---

## Emergency Contact:
If anything doesn't work, send this information:
1. What error message you see
2. Your server operating system (Ubuntu, CentOS, etc.)
3. Output of: `sudo docker-compose -f docker-compose.prod.yml logs`
