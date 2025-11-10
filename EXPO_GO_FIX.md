# Fix Expo Go Connection

## Your Expo Dev Server URL

Based on your message, your Expo dev server is at:
**`exp://192.168.1.162:8081`**

## Option 1: Use Expo Go App (Recommended)

1. **Make sure your phone and computer are on the same Wi-Fi network**

2. **Start Expo with LAN mode:**
   ```powershell
   npx expo start --lan --clear
   ```

3. **Open Expo Go app on your phone:**
   - iOS: Use Camera app to scan QR code
   - Android: Open Expo Go app → "Scan QR code"

4. **Or enter URL manually:**
   - In Expo Go app, tap "Enter URL manually"
   - Type: `exp://192.168.1.162:8081`

## Option 2: Use Tunnel Mode (If LAN doesn't work)

```powershell
npx expo start --tunnel --clear
```

This uses Expo's cloud service and works even on different networks.

## Option 3: Test exp:// URL in Browser (Not Recommended)

You mentioned `exp://192.168.1.162:8081` - this is an Expo protocol URL that won't work in a regular browser. It's designed for Expo Go app.

However, you can test if the dev server is accessible by visiting:
- `http://192.168.1.162:8081` in your browser
- This should show Expo DevTools

## Why Mobile Will Work Better

When you use Expo Go on a real device:
- The expo.io redirect URI works properly
- Deep linking works correctly
- OAuth callbacks are handled by the app
- No browser redirect issues

## Quick Test

1. **Check if dev server is running:**
   - Visit `http://192.168.1.162:8081` in browser
   - Should see Expo DevTools

2. **Try Expo Go:**
   - Open Expo Go app
   - Enter: `exp://192.168.1.162:8081`
   - App should load

3. **Test Google Sign-In:**
   - Once app loads in Expo Go
   - Click "Sign in with Google"
   - Should see Google accounts
   - After selecting account, should redirect back to app

## Troubleshooting Expo Go

If Expo Go still doesn't connect:

1. **Check firewall:**
   - Windows Firewall might be blocking port 8081
   - Allow Node.js through firewall

2. **Check network:**
   - Phone and computer must be on same Wi-Fi
   - Try disabling VPN if you have one

3. **Try different port:**
   ```powershell
   npx expo start --lan --port 8082
   ```

4. **Kill and restart:**
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   npx expo start --lan --clear
   ```

