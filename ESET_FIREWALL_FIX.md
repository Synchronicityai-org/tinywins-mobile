# Fix Expo Go Connection - ESET Endpoint Security

## Issue
ESET Endpoint Security is managing your firewall, so we need to add an exception in ESET, not Windows Defender.

## Solution: Add Exception in ESET

### Step 1: Open ESET Endpoint Security

1. Look for the ESET icon in your system tray (bottom right)
2. Right-click the ESET icon
3. Click "Open ESET Endpoint Security" (or similar)

### Step 2: Navigate to Firewall Settings

1. In ESET, go to **"Firewall"** or **"Network Protection"**
2. Look for **"Rules"** or **"Exceptions"** or **"Applications"**

### Step 3: Add Node.js Exception

**Option A: Add Node.js Application**
1. Find **"Add Application"** or **"Add Rule"**
2. Browse to: `C:\Program Files\nodejs\node.exe`
3. Set to **"Allow"** for both Inbound and Outbound
4. Save

**Option B: Add Port Exception**
1. Find **"Port Rules"** or **"Port Exceptions"**
2. Add rule:
   - **Port**: `8081`
   - **Protocol**: TCP
   - **Direction**: Both (Inbound/Outbound)
   - **Action**: Allow
3. Save

**Option C: Add Network Zone Exception**
1. Find **"Network Zones"** or **"Trusted Networks"**
2. Add your local network: `192.168.1.0/24`
3. Set to **"Trusted"** or **"Allow"**

### Step 4: Add Expo Exception

Also add:
- **Application**: `C:\Users\<YourUsername>\AppData\Roaming\npm\node_modules\expo-cli\bin\expo.js`
- Or the Expo CLI path
- Set to **"Allow"**

### Step 5: Restart Expo

After adding exceptions:
```powershell
Get-Process -Name node | Stop-Process -Force
npx expo start --lan --clear
```

## Alternative: Temporarily Disable ESET Firewall

If you can't find the settings:
1. Open ESET Endpoint Security
2. Temporarily disable firewall (for testing only)
3. Try connecting Expo Go
4. Re-enable firewall after testing
5. Then add proper exceptions

## Quick Test

After adding exceptions, test:
1. On phone browser: `http://192.168.1.162:8081`
2. Should see Expo DevTools
3. If this works, Expo Go should connect

## If ESET UI is Different

ESET Endpoint Security interfaces vary. Look for:
- "Firewall" section
- "Network Protection"
- "Rules and Policies"
- "Application Rules"
- "Port Rules"

The key is to allow:
- **Node.js** (node.exe)
- **Port 8081** (TCP)
- **Expo CLI**

## Still Not Working?

Use tunnel mode (bypasses local firewall):
```powershell
npx expo start --tunnel --clear
```

