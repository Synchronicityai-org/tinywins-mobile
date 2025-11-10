# Expo Go Connection Troubleshooting

## Your Setup
- **Dev Server IP**: `192.168.1.162:8081`
- **Expo URL**: `exp://192.168.1.162:8081`

## Step-by-Step Fix

### Step 1: Kill All Node Processes
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Step 2: Check Network Connection
1. **Verify same Wi-Fi:**
   - Phone and computer must be on the **same Wi-Fi network**
   - Check your phone's Wi-Fi settings
   - Check your computer's Wi-Fi settings
   - They should show the same network name

2. **Check IP addresses:**
   - Computer IP: `192.168.1.162` (from your message)
   - Phone IP: Should be `192.168.1.XXX` (same subnet)
   - To check phone IP: Settings → Wi-Fi → Tap your network → See IP address

### Step 3: Start Expo with LAN Mode
```powershell
npx expo start --lan --clear
```

### Step 4: Check Windows Firewall
1. Open **Windows Defender Firewall**
2. Click **"Allow an app or feature through Windows Firewall"**
3. Find **Node.js** and make sure both **Private** and **Public** are checked
4. If Node.js isn't listed, click **"Allow another app"** and add Node.js

### Step 5: Test Connection
1. **On your computer**, open browser and go to:
   ```
   http://192.168.1.162:8081
   ```
   - Should show Expo DevTools
   - If this doesn't work, the server isn't accessible

2. **On your phone**, open Expo Go app:
   - Tap **"Enter URL manually"**
   - Type: `exp://192.168.1.162:8081`
   - Tap **"Connect"**

### Step 6: Alternative - Use Tunnel Mode
If LAN doesn't work, use tunnel (works across networks):
```powershell
npx expo start --tunnel --clear
```
- This will show a different URL (exp://xxx.tunnel.exp.direct:80)
- Use that URL in Expo Go

## Common Issues

### Issue 1: "Unable to connect"
- **Cause**: Firewall blocking port 8081
- **Fix**: Allow Node.js through Windows Firewall

### Issue 2: "Network request failed"
- **Cause**: Phone and computer on different networks
- **Fix**: Connect both to same Wi-Fi

### Issue 3: QR Code not scanning
- **Cause**: QR code might be for tunnel mode
- **Fix**: Use "Enter URL manually" with `exp://192.168.1.162:8081`

### Issue 4: Port already in use
- **Cause**: Another process using port 8081
- **Fix**: 
  ```powershell
  netstat -ano | findstr :8081
  # Note the PID, then:
  taskkill /PID <PID> /F
  ```

## Quick Test Commands

```powershell
# 1. Kill all Node processes
Get-Process -Name node | Stop-Process -Force

# 2. Start with LAN
npx expo start --lan --clear

# 3. Check if port is open
Test-NetConnection -ComputerName 192.168.1.162 -Port 8081
```

## If Nothing Works

Try tunnel mode (most reliable):
```powershell
npx expo start --tunnel --clear
```

This uses Expo's cloud service and works even if:
- Phone and computer are on different networks
- Firewall is blocking
- VPN is interfering

