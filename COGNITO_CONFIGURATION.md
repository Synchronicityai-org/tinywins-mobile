# Cognito User Pool Configuration

## Current User Pool

**User Pool ID**: `us-east-2_6L23Phzl2`  
**User Pool Name**: `amplifyAuthUserPool4BA7F805-EyhR8wxuhmVi`  
**App Client ID**: `ogv5cavllk2e3r2fncpcvheic`

## Required Configuration Steps

### Step 1: Navigate to Your User Pool

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **Amazon Cognito** → **User pools**
3. Find and click on: **amplifyAuthUserPool4BA7F805-EyhR8wxuhmVi** (ID: `us-east-2_6L23Phzl2`)

### Step 2: Configure App Client Settings

1. In the User Pool, go to **App integration** tab
2. Scroll down to **App clients and analytics**
3. Click on the app client: **ogv5cavllk2e3r2fncpcvheic**
4. Click **Edit** button

### Step 3: Configure Hosted UI

1. Scroll to **Hosted UI** section
2. Under **Allowed callback URLs**, add these URLs (one per line):
   ```
   tinywinsmobile://callback
   https://auth.expo.io/@anonymous/tinywins-mobile
   exp://localhost:8081
   ```

3. Under **Allowed sign-out URLs**, add the same URLs:
   ```
   tinywinsmobile://callback
   https://auth.expo.io/@anonymous/tinywins-mobile
   exp://localhost:8081
   ```

4. Under **OAuth 2.0 grant types**, ensure these are checked:
   - ✅ Authorization code grant
   - ✅ Implicit grant (optional, but can help)

5. Under **OpenID Connect scopes**, ensure these are checked:
   - ✅ openid
   - ✅ email
   - ✅ profile
   - ✅ aws.cognito.signin.user.admin

6. Click **Save changes**

### Step 4: Verify Identity Provider

1. In the User Pool, go to **Sign-in experience** tab
2. Scroll to **Federated identity provider sign-in**
3. Ensure **Google** is listed and enabled
4. If not, you'll need to configure Google as an identity provider

### Step 5: Verify Domain

1. In the User Pool, go to **App integration** tab
2. Scroll to **Domain** section
3. Verify the domain is active: `94ecad802bbb0c7a4fc4.auth.us-east-2.amazoncognito.com`
4. If not active, you may need to create/activate it

## Quick Checklist

- [ ] User Pool: `us-east-2_6L23Phzl2` selected
- [ ] App Client: `ogv5cavllk2e3r2fncpcvheic` edited
- [ ] Callback URLs added: `tinywinsmobile://callback` and Expo URL
- [ ] Sign-out URLs added: Same as callback URLs
- [ ] OAuth grant types: Authorization code grant enabled
- [ ] OIDC scopes: openid, email, profile enabled
- [ ] Google identity provider: Enabled
- [ ] Domain: Active

## Testing After Configuration

1. Save all changes in AWS Console
2. Wait 1-2 minutes for changes to propagate
3. Restart your Expo app
4. Try "Sign in with Google" again
5. Check console logs for any errors

## Common Issues

### "Invalid redirect_uri parameter"
- **Cause**: Redirect URI not in allowed list
- **Fix**: Add the exact redirect URI to "Allowed callback URLs"

### "An error occurred with request page"
- **Cause**: Usually redirect URI mismatch or OAuth not properly configured
- **Fix**: Verify all URLs match exactly (case-sensitive, no trailing slashes)

### "Identity provider not found"
- **Cause**: Google not configured as identity provider
- **Fix**: Configure Google in Sign-in experience → Federated identity provider

## Current Configuration Values

From `amplify_outputs.json`:
- **User Pool ID**: `us-east-2_6L23Phzl2`
- **App Client ID**: `ogv5cavllk2e3r2fncpcvheic`
- **OAuth Domain**: `94ecad802bbb0c7a4fc4.auth.us-east-2.amazoncognito.com`
- **Region**: `us-east-2`
- **Redirect URIs to add**:
  - `tinywinsmobile://callback`
  - `https://auth.expo.io/@anonymous/tinywins-mobile`

