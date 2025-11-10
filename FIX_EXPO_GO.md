# Fix Expo Go Connection - Step by Step

## Current Status
✅ Port 8081 is listening
✅ Your IP: `192.168.1.162`
✅ Server is running

## Fix Steps

### Step 1: Verify Same Wi-Fi Network

**On your phone:**
1. Go to Settings → Wi-Fi
2. Check the network name
3. Tap on the network to see IP address
4. Should be `192.168.1.XXX` (same as your computer)

**On your computer:**
- Network should be the same name as phone

### Step 2: Allow Node.js Through Firewall

1. Press `Windows Key` and type "Firewall"
2. Click "Windows Defender Firewall"
3. Click "Allow an app or feature through Windows Defender Firewall"
4. Click "Change settings" (if needed)
5. Find "Node.js" in the list
6. Check both "Private" and "Public" boxes
7. If Node.js isn't listed:
   - Click "Allow another app..."
   - Click "Browse"
   - Navigate to: `C:\Program Files\nodejs\node.exe`
   - Click "Add"
   - Check both "Private" and "Public"
8. Click "OK"

### Step 3: Restart Expo with LAN

```powershell
# Kill existing processes
Get-Process -Name node | Stop-Process -Force

# Start with LAN mode
npx expo start --lan --clear
```

### Step 4: Connect from Phone

**Option A: Enter URL Manually (Most Reliable)**
1. Open Expo Go app on your phone
2. Tap "Enter URL manually"
3. Type: `exp://192.168.1.162:8081`
4. Tap "Connect"

**Option B: Scan QR Code**
1. Look at the terminal for QR code
2. In Expo Go app, tap "Scan QR code"
3. Scan the code

### Step 5: If Still Doesn't Work - Use Tunnel

Tunnel mode works even if networks are different:

```powershell
npx expo start --tunnel --clear
```

This will show a URL like: `exp://xxx.tunnel.exp.direct:80`
- Use this URL in Expo Go app
- Works across any network

## Quick Test

**Test 1: Can you access dev server from browser?**
- Open browser on your computer
- Go to: `http://192.168.1.162:8081`
- Should see Expo DevTools
- If this doesn't work, firewall is blocking

**Test 2: Can phone reach computer?**
- On phone, open browser
- Go to: `http://192.168.1.162:8081`
- Should see Expo DevTools
- If this doesn't work, they're on different networks

## Most Common Fix

**90% of issues are solved by:**
1. Allowing Node.js through Windows Firewall
2. Making sure phone and computer are on same Wi-Fi
3. Using tunnel mode if networks are different

## If VPN is Running

If you have a VPN active:
- Try disabling it temporarily
- Or use tunnel mode (works with VPN)

