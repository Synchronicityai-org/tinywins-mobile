# Fix ESET to Allow Expo Go

## The Problem
ESET Endpoint Security is blocking:
1. **Ngrok** (for tunnel mode) - causing tunnel errors
2. **Node.js connections** (for LAN mode) - app scans but doesn't load

## Solution: Add Exceptions in ESET

### Step 1: Open ESET Endpoint Security
1. Right-click ESET icon in system tray (bottom right)
2. Click "Open ESET Endpoint Security"

### Step 2: Add Node.js Exception
1. Go to **"Firewall"** or **"Network Protection"**
2. Click **"Rules"** or **"Applications"**
3. Click **"Add"** or **"New Rule"**
4. **Application**: Browse to `C:\Program Files\nodejs\node.exe`
5. **Action**: Allow (both Inbound and Outbound)
6. **Save**

### Step 3: Add Port Exception
1. Still in Firewall/Rules
2. Add **Port Rule**:
   - **Port**: `8081`
   - **Protocol**: TCP
   - **Direction**: Both (Inbound/Outbound)
   - **Action**: Allow
3. **Save**

### Step 4: Add Network Zone Exception (Optional but Recommended)
1. Go to **"Network Zones"** or **"Trusted Networks"**
2. Add your local network: `192.168.1.0/24`
3. Set to **"Trusted"** or **"Home Network"**

### Step 5: Allow Ngrok (For Tunnel Mode)
1. In Firewall/Rules
2. Add exception for ngrok (if you want tunnel mode)
3. Or allow outbound connections to ngrok domains

### Step 6: Restart Expo
After adding exceptions:
```powershell
npx expo start --lan --clear
```

## Alternative: Temporarily Disable ESET Firewall

If you can't find the settings:
1. Open ESET
2. Temporarily disable firewall (for testing)
3. Try connecting Expo Go
4. Re-enable and add proper exceptions

## Check if It's Working

After adding exceptions:
1. Start Expo: `npx expo start --lan --clear`
2. Scan QR code with Expo Go
3. App should load

If app still doesn't load after adding exceptions, there might be a code error. Check the terminal for error messages.

