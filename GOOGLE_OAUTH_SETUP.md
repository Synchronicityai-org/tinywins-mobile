# Google OAuth Setup Instructions

## Current Issue: "An error occurred with request page"

This error typically means the redirect URI is not properly configured in your AWS Cognito User Pool.

## Required Configuration Steps

### 1. Add Redirect URIs to Cognito App Client

You need to add these redirect URIs to your Cognito app client in AWS Console:

1. Go to AWS Console → Cognito → User Pools
2. Select your user pool: `us-east-2_6L23Phzl2`
3. Go to "App integration" → "App clients"
4. Click on your app client: `ogv5cavllk2e3r2fncpcvheic`
5. Click "Edit" → "Hosted UI"
6. Under "Allowed callback URLs", add:
   - `tinywinsmobile://callback`
   - `https://auth.expo.io/@anonymous/tinywins-mobile` (for Expo Go)
   - `exp://localhost:8081` (for local development)
7. Under "Allowed sign-out URLs", add the same URLs
8. Save changes

### 2. Verify OAuth Domain

Make sure the OAuth domain is active:
- Domain: `94ecad802bbb0c7a4fc4.auth.us-east-2.amazoncognito.com`
- This should be active in Cognito → User Pool → App integration → Domain

### 3. Verify Google Identity Provider

Ensure Google is configured as an identity provider:
- Go to Cognito → User Pool → Sign-in experience → Federated identity provider sign-in
- Google should be listed and enabled

## Testing

After adding the redirect URIs:

1. Restart the app
2. Try "Sign in with Google" again
3. The browser should open and you should be able to sign in
4. After signing in, you should be redirected back to the app

## Troubleshooting

### If you still get "An error occurred with request page":

1. **Check the redirect URI matches exactly**:
   - The URI in the code must match EXACTLY what's in Cognito
   - No trailing slashes
   - Case-sensitive
   - Scheme must match (`tinywinsmobile://` not `TinyWinsMobile://`)

2. **Check the OAuth URL in console logs**:
   - Look for "OAuth URL:" in the logs
   - Copy the URL and open it in a browser
   - See what error Cognito shows

3. **Verify the app client settings**:
   - OAuth 2.0 grant types should include "Authorization code grant"
   - OpenID Connect scopes should include: `openid`, `email`, `profile`

4. **Check network connectivity**:
   - Make sure the device can reach the Cognito domain
   - Try opening the OAuth URL manually in a browser

## Alternative: Use Expo-Specific Redirect

For Expo Go, you might need to use:
```
https://auth.expo.io/@<your-expo-username>/tinywins-mobile
```

Replace `<your-expo-username>` with your actual Expo username, or use `@anonymous` if you're not logged into Expo.

## Current Configuration

The app is currently configured to use:
- **Redirect URI**: `tinywinsmobile://callback` (for production builds)
- **Expo Redirect URI**: `https://auth.expo.io/@anonymous/tinywins-mobile` (for Expo Go)

Both of these MUST be added to your Cognito app client's allowed callback URLs.

