# Debugging OAuth Redirect Mismatch

## Current Issue
Unable to see Google account selection page - getting redirect_mismatch error immediately.

## Steps to Debug

1. **Check Console Logs:**
   When you click "Sign in with Google", check the browser console for:
   - `Using redirect URI: ...`
   - `Redirect URI (original): ...`
   - `Redirect URI (encoded): ...`

2. **Verify in Cognito:**
   - Go to AWS Console → Cognito → User Pools
   - Select: `us-east-2_6L23Phzl2`
   - Go to: App integration → App clients
   - Click: `ogv5cavllk2e3r2fncpcvheic` → Edit
   - Scroll to "Hosted UI"
   - Check "Allowed callback URLs"
   - The redirect URI from console logs must match EXACTLY (case-sensitive)

3. **Common Issues:**
   - Trailing slashes: `https://auth.expo.io/@anonymous/tinywins-mobile` vs `https://auth.expo.io/@anonymous/tinywins-mobile/`
   - Case sensitivity: `Expo` vs `expo`
   - Protocol: `http://` vs `https://`
   - Port numbers: `localhost:3000` vs `localhost:8081`

4. **Current Configuration:**
   From `amplify_outputs.json`, these URIs are configured:
   - `http://localhost:3000/`
   - `https://www.tinywins.ai/`
   - `https://tinywins-dev.d3brd080icmk8j.amplifyapp.com/`
   - `tinywinsmobile://callback`
   - `https://auth.expo.io/@anonymous/tinywins-mobile`

5. **What the Code Uses:**
   - **Web**: `https://auth.expo.io/@anonymous/tinywins-mobile` (from config)
   - **Mobile**: `https://auth.expo.io/@anonymous/tinywins-mobile` (from config)

## Quick Fix

If you're still getting redirect_mismatch:

1. Copy the exact redirect URI from console logs
2. Go to Cognito and check if it's in the allowed list
3. If not, add it EXACTLY as shown (no changes)
4. Save and wait 1-2 minutes
5. Try again

## Alternative: Test on Mobile Device

For proper testing:
- Use Expo Go on a real iOS/Android device
- The expo.io redirect URI works better on mobile
- The OAuth flow is designed for mobile apps

