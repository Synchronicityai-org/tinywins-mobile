# Google OAuth Redirect URI Fix

## Current Issue

Getting `redirect_mismatch` error when trying to sign in with Google. The redirect URI in the OAuth request doesn't match what's configured in Cognito.

## Solution

The code has been updated to use the correct redirect URI based on the platform:

### For Web (Expo Web):
- **Redirect URI**: `http://localhost:8081/callback` (or your current origin + `/callback`)
- This needs to be added to Cognito app client allowed callback URLs

### For Mobile (Expo Go or Native):
- **Redirect URI**: `https://auth.expo.io/@anonymous/tinywins-mobile` (from amplify_outputs.json)
- Or: `tinywinsmobile://callback` (for native builds)

## Required Action: Add Redirect URI to Cognito

You need to add the web redirect URI to your Cognito app client:

1. Go to AWS Console → Cognito → User Pools
2. Select: `us-east-2_6L23Phzl2`
3. Go to: App integration → App clients
4. Click: `ogv5cavllk2e3r2fncpcvheic` → Edit
5. Under "Hosted UI" → "Allowed callback URLs", add:
   - `http://localhost:8081/callback` (for Expo web development)
   - `http://localhost:3000/callback` (if testing on port 3000)
   - Or your actual web URL + `/callback`
6. Under "Allowed sign-out URLs", add the same
7. Save changes

## Testing

After adding the redirect URI:

1. Wait 1-2 minutes for changes to propagate
2. Restart your Expo app
3. Try "Sign in with Google" again
4. Check console logs for the redirect URI being used

## Note About "Login Page Cannot Be Displayed"

If you're seeing "Login page cannot be displayed" in Cognito Hosted UI, this could mean:
1. The OAuth domain is having issues
2. The domain needs to be reactivated
3. There's a network/connectivity issue

Since tinywins.ai Google login works, the Cognito configuration should be fine. The issue is likely just the redirect URI mismatch.

## Current Redirect URIs in amplify_outputs.json

From your config, these are already configured:
- `http://localhost:3000/` (web app)
- `https://www.tinywins.ai/` (web app production)
- `tinywinsmobile://callback` (mobile)
- `https://auth.expo.io/@anonymous/tinywins-mobile` (Expo Go)

The mobile app will use the expo.io URI automatically when running on mobile.

