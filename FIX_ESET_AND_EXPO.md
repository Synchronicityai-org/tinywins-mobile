# Fix ESET to Allow Expo Go - Complete Guide

## The Problem
ESET Endpoint Security is blocking:
1. **Ngrok** → Tunnel mode fails
2. **App bundle download** → QR code scans but app doesn't load

## Solution: Configure ESET

### Step 1: Open ESET Endpoint Security
1. Right-click **ESET icon** in system tray (bottom right corner)
2. Click **"Open ESET Endpoint Security"**

### Step 2: Navigate to Firewall/Network Protection
- Look for **"Firewall"** or **"Network Protection"** in the main menu
- Click on it

### Step 3: Add Node.js Exception
1. Go to **"Rules"** or **"Applications"** or **"Exceptions"**
2. Click **"Add"** or **"New Rule"**
3. **Application**: Browse to `C:\Program Files\nodejs\node.exe`
   - If not there, search for `node.exe` on your system
4. **Action**: **Allow** (both Inbound and Outbound)
5. **Save**

### Step 4: Add Port 8081 Exception
1. Still in Firewall/Rules
2. Add **Port Rule**:
   - **Type**: Port
   - **Port**: `8081`
   - **Protocol**: TCP
   - **Direction**: Both (Inbound/Outbound)
   - **Action**: Allow
3. **Save**

### Step 5: Add Network Zone (Optional)
1. Go to **"Network Zones"** or **"Trusted Networks"**
2. Add: `192.168.1.0/24` (your local network)
3. Set to **"Trusted"** or **"Home Network"**

### Step 6: Restart Expo
After adding exceptions:
```powershell
npx expo start --lan --clear
```

### Step 7: Test
1. Scan QR code with Expo Go
2. App should now load

## If ESET UI is Different

ESET interfaces vary. Look for these sections:
- **Firewall** → **Rules** → **Applications**
- **Network Protection** → **Firewall Rules**
- **Advanced Settings** → **Network** → **Firewall**

Key: Allow Node.js and Port 8081

## Alternative: Check Terminal for Errors

When you scan the QR code, check the terminal for:
- Red error messages
- "Unable to resolve module" errors
- Network errors
- Any error that might prevent the app from loading

Share any errors you see in the terminal when scanning the QR code.

