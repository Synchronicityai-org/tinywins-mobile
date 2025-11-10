# Fix ESET Blocking Ngrok/Tunnel

## Issue
ESET Endpoint Security is blocking ngrok (used by Expo tunnel mode), causing the error:
```
CommandError: TypeError [ERR_INVALID_ARG_TYPE]: The "file" argument must be of type string. Received null
```

## Solution Options

### Option 1: Add Ngrok Exception in ESET (Recommended)

1. **Open ESET Endpoint Security**
2. **Go to Firewall/Rules**
3. **Add Exception for:**
   - **Application**: Look for ngrok.exe (usually in temp folders or node_modules)
   - **Or add network exception** for ngrok domains
4. **Allow outbound connections** for ngrok

### Option 2: Use LAN Mode (If Same Network)

If your phone and computer are on the same Wi-Fi:
```powershell
npx expo start --lan --clear
```

Then add ESET exception for Node.js and port 8081.

### Option 3: Temporarily Disable ESET Firewall (Testing Only)

1. Open ESET
2. Temporarily disable firewall
3. Test tunnel mode
4. Re-enable and add proper exceptions

### Option 4: Use Different Tunnel Service

If ngrok is blocked, you might need to:
- Configure ESET to allow ngrok
- Or use a VPN
- Or configure ESET's network rules

## Quick Test: LAN Mode

Try LAN mode first - it might work if ESET allows local network connections:

```powershell
npx expo start --lan --clear
```

Then in Expo Go, use: `exp://192.168.1.162:8081`

If this doesn't work, ESET is blocking local connections too, and you'll need to add exceptions.

