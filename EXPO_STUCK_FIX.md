# Expo Server Stuck - Quick Fixes

## If Expo is Stuck on "Waiting on http://localhost:8081"

### Quick Fix 1: Kill and Restart
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Wait a moment
Start-Sleep -Seconds 2

# Restart
npx expo start --lan --clear
```

### Quick Fix 2: Check for Port Conflict
```powershell
# Check what's using port 8081
netstat -ano | findstr :8081

# If something else is using it, kill that process
# (Use the PID from netstat output)
taskkill /PID <PID> /F
```

### Quick Fix 3: Try Different Port
```powershell
npx expo start --lan --port 8082 --clear
```

### Quick Fix 4: Check Metro Bundler
Sometimes Metro gets stuck during initial build. Try:
```powershell
# Clear everything
npx expo start --clear --reset-cache
```

### Quick Fix 5: Check for Errors
Look in the terminal for:
- Module resolution errors
- Import errors
- Configuration errors
- Any red error messages

## Most Common Cause
Metro bundler is building the app for the first time and it's taking a while. This can take 2-5 minutes on first run, especially with:
- Large node_modules
- Many dependencies
- Slow disk/CPU

## What to Check
1. **Is the terminal showing any activity?** (Even if slow)
2. **Any error messages?** (Red text)
3. **CPU usage?** (Is Node.js using CPU?)

If it's actually building (CPU usage, occasional output), just wait - it will finish.

If it's completely frozen (no CPU, no output), kill and restart.

