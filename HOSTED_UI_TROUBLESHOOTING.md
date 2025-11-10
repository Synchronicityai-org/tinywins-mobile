# Hosted UI "Login pages unavailable" Troubleshooting

## Current Situation

- **Web app (tinywins-dev)**: Google login works ✅
- **AWS Console Hosted UI**: Shows "Login pages unavailable" ❌
- **Mobile app**: Getting `redirect_mismatch` error

## Analysis

The fact that the web app's Google login works means:
1. ✅ Cognito User Pool is configured correctly
2. ✅ Google Identity Provider is set up correctly
3. ✅ OAuth domain is working (when accessed through OAuth flow)
4. ✅ Redirect URIs are configured correctly

The "Login pages unavailable" error in AWS Console might be:
- A display issue when accessing Hosted UI directly (not through OAuth flow)
- A temporary Cognito issue
- Not affecting the actual OAuth functionality

## Solution

Since the web app works, we're using the **same redirect URIs** that the web app uses:
- `http://localhost:3000/` (for localhost development)
- `https://www.tinywins.ai/` (for production)

These are already in your `amplify_outputs.json` and should work.

## Testing Steps

1. **For Web (Expo Web)**:
   - The app will use `http://localhost:3000/` as redirect URI
   - After Google sign-in, it will redirect to `http://localhost:3000/` with the code
   - You'll need to handle the callback there, or set up a redirect handler

2. **For Mobile (Expo Go or Native)**:
   - The app will use `https://auth.expo.io/@anonymous/tinywins-mobile`
   - This should work with `expo-web-browser`

## If Hosted UI Still Shows Error

If you need to fix the Hosted UI display issue:

1. **Check Domain Status**:
   - Go to Cognito → User Pool → App integration → Domain
   - Verify domain `94ecad802bbb0c7a4fc4.auth.us-east-2.amazoncognito.com` is active
   - Try clicking "View Hosted UI" link

2. **Reactivate Domain** (if needed):
   - If domain is inactive, you may need to reactivate it
   - Or create a new domain

3. **Check Customizations**:
   - Go to App integration → Hosted UI → Customize
   - If there are custom CSS/JS, try disabling them temporarily

## Important Note

Even if the Hosted UI shows "Login pages unavailable" in the AWS Console, the OAuth flow might still work when accessed through the proper OAuth URL with correct parameters. The web app working is proof of this.

## Next Steps

1. Try Google sign-in in the mobile app
2. Check console logs for the redirect URI being used
3. Verify the redirect URI matches what's in `amplify_outputs.json`
4. The OAuth flow should work even if Hosted UI preview doesn't

