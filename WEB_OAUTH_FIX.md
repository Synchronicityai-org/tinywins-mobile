# Fix OAuth on Web - Current Issue

## Problem

When you click "Sign in with Google" on web:
1. ✅ Google accounts page shows (good!)
2. ✅ You select an account
3. ✅ Cognito redirects to `https://auth.expo.io/@anonymous/tinywins-mobile?code=...`
4. ❌ Expo.io shows an error because it can't redirect to mobile app on web

## Solution Options

### Option 1: Use Expo Go on Mobile (Best Solution)

The expo.io redirect URI is designed for mobile apps. On a real device with Expo Go:

1. **Get Expo Go working:**
   ```powershell
   npx expo start --lan --clear
   ```

2. **On your phone:**
   - Open Expo Go app
   - Enter URL: `exp://192.168.1.162:8081`
   - Or scan QR code

3. **Test Google sign-in:**
   - It will work perfectly on mobile
   - Expo.io will redirect back to the app correctly

### Option 2: Manual Code Extraction (For Web Testing)

When you see the expo.io page with the code:

1. **Copy the code from the URL:**
   - URL: `https://auth.expo.io/@anonymous/tinywins-mobile?code=99957ee7-ad59-4e32-b6e6-7948979ac98c`
   - Copy the code part: `99957ee7-ad59-4e32-b6e6-7948979ac98c`

2. **Navigate to:**
   ```
   http://localhost:8081/callback?code=99957ee7-ad59-4e32-b6e6-7948979ac98c
   ```
   (Replace with your actual code)

3. **The callback screen will:**
   - Extract the code
   - Exchange it for tokens
   - Sign you in

### Option 3: Add localhost:8081 to Cognito (For Web)

1. **Add to Cognito:**
   - Go to Cognito → User Pool → App clients → Edit
   - Hosted UI → Allowed callback URLs
   - Add: `http://localhost:8081/callback`
   - Save

2. **Update code to use localhost:8081:**
   - Change redirect URI to `http://localhost:8081/callback`
   - This will redirect directly to your app (no expo.io)

## Recommended: Fix Expo Go

The easiest solution is to get Expo Go working on your phone. The expo.io redirect is designed for mobile and will work perfectly there.

## Quick Test

Try this in your browser console when on the expo.io page:
```javascript
const code = new URLSearchParams(window.location.search).get('code');
if (code) {
  window.location.href = `http://localhost:8081/callback?code=${code}`;
}
```

This will extract the code and redirect to your app's callback.

