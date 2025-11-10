# Quick Fix Guide

## Issue 1: Expo Go Not Loading

### Try These Steps:

1. **Kill all Node processes:**
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

2. **Start Expo with tunnel (most reliable):**
   ```powershell
   npx expo start --tunnel --clear
   ```
   This uses Expo's cloud service and works even if your phone and computer are on different networks.

3. **If tunnel doesn't work, try LAN:**
   ```powershell
   npx expo start --lan --clear
   ```
   Make sure your phone and computer are on the same Wi-Fi network.

4. **Check if QR code appears:**
   - You should see a QR code in the terminal
   - Open Expo Go app on your phone
   - Scan the QR code

5. **Alternative: Enter URL manually:**
   - In Expo Go app, tap "Enter URL manually"
   - Type the URL shown in terminal (usually `exp://...`)

## Issue 2: Google Sign-In Not Working

The redirect URI needs to match exactly what's in Cognito.

### Quick Fix:

1. **Check console logs** when you click "Sign in with Google"
2. **Look for:** `Using redirect URI: http://localhost:XXXX/callback`
3. **Add that EXACT URI to Cognito:**
   - Go to: https://console.aws.amazon.com/cognito/
   - User Pool: `us-east-2_6L23Phzl2`
   - App clients → `ogv5cavllk2e3r2fncpcvheic` → Edit
   - Hosted UI → Allowed callback URLs
   - Add the exact URI from console
   - Save and wait 1-2 minutes

## For Now: Focus on Web Testing

Since Expo Go is having issues, let's get Google sign-in working on web first:

1. Run: `npm run web`
2. Check console for redirect URI
3. Add it to Cognito
4. Test Google sign-in on web
5. Once web works, we'll fix Expo Go

## Most Common Expo Go Issues:

- **Network**: Use `--tunnel` flag
- **Firewall**: Allow Node.js through Windows Firewall
- **Port conflict**: Kill processes on port 8081
- **Cache**: Use `--clear` flag

