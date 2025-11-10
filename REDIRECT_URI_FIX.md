# Redirect URI Mismatch Fix

## Current Error
`redirect_mismatch` - The redirect URI in the OAuth request doesn't match what's configured in Cognito.

## Solution Options

### Option 1: Add Your Expo Web Port to Cognito (Recommended)

1. **Find your Expo web port:**
   - When you run `npx expo start --web`, check the console
   - It will show something like: `Web is waiting on http://localhost:8081`
   - Note the port number (could be 8081, 19006, or another port)

2. **Add to Cognito:**
   - Go to AWS Console → Cognito → User Pools
   - Select: `us-east-2_6L23Phzl2`
   - Go to: App integration → App clients
   - Click: `ogv5cavllk2e3r2fncpcvheic` → Edit
   - Under "Hosted UI" → "Allowed callback URLs", add:
     - `http://localhost:8081/callback` (replace 8081 with your actual port)
   - Under "Allowed sign-out URLs", add the same
   - Save changes
   - Wait 1-2 minutes for changes to propagate

### Option 2: Use Existing Redirect URI (Quick Fix)

If you want to test quickly without adding a new URI, we can temporarily use `http://localhost:3000/` which is already configured. However, this will redirect to the web app, not the mobile app.

## Check What Redirect URI Is Being Used

The code logs the redirect URI. Check your browser console for:
```
Web platform (Expo web) detected, using redirect URI: http://localhost:XXXX/callback
```

Make sure that exact URI (with the correct port) is added to Cognito.

## For Mobile Testing (Expo Go)

For mobile devices, the code uses:
- `https://auth.expo.io/@anonymous/tinywins-mobile` (already configured)

This should work without any changes.

