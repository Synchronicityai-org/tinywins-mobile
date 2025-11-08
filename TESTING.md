# Testing Guide for TinyWins Mobile App

## Prerequisites

1. **Expo Go App** installed on your mobile device:
   - iOS: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: Download from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Development Environment**:
   - Node.js installed (v18+ recommended, though v20+ is ideal)
   - npm or yarn package manager
   - Expo CLI (comes with `npx expo`)

## Starting the Development Server

### Option 1: Start with QR Code (Recommended for Physical Devices)

```bash
npm start
```

This will:
- Start the Metro bundler
- Display a QR code in the terminal
- Open Expo DevTools in your browser

### Option 2: Start for Specific Platform

```bash
# For iOS Simulator (macOS only)
npm run ios

# For Android Emulator
npm run android

# For Web Browser
npm run web
```

## Testing on Different Platforms

### 1. Testing on Physical Device (Expo Go)

**Steps:**
1. Run `npm start` in your terminal
2. Open Expo Go app on your phone
3. **For iOS**: Use the Camera app to scan the QR code
4. **For Android**: Open Expo Go app and tap "Scan QR code", then scan the code
5. The app will load on your device

**Note**: Make sure your phone and computer are on the same Wi-Fi network.

### 2. Testing on iOS Simulator (macOS only)

**Steps:**
1. Install Xcode from the Mac App Store
2. Open Xcode and install iOS Simulator
3. Run `npm run ios`
4. The simulator will open automatically

### 3. Testing on Android Emulator

**Steps:**
1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Start the emulator
4. Run `npm run android`

### 4. Testing on Web Browser

**Steps:**
1. Run `npm run web`
2. The app will open in your default browser at `http://localhost:8081`

**Note**: Some native features (like deep linking) may not work in the web version.

## Testing Authentication Flows

### Test 1: Email/Password Sign Up

1. **Navigate to Sign Up**:
   - App should start at login screen
   - Tap "Don't have an account? Sign Up"

2. **Fill in Sign Up Form**:
   - Enter a valid email address
   - Enter a password that meets requirements:
     - At least 8 characters
     - Contains uppercase letter
     - Contains lowercase letter
     - Contains a number
     - Contains a symbol
   - Confirm password

3. **Submit**:
   - Tap "Sign Up" button
   - You should see a success message
   - You'll be redirected to login screen

4. **Verify Email** (if required):
   - Check your email for verification code
   - Use the verification code if prompted

### Test 2: Email/Password Sign In

1. **Enter Credentials**:
   - Enter the email you used to sign up
   - Enter your password

2. **Sign In**:
   - Tap "Sign In" button
   - You should be redirected to the home screen
   - You should see "Welcome to TinyWins!" message
   - You should see your email/username displayed

3. **Verify Authentication State**:
   - The app should show you're signed in
   - You should be able to see the home screen content

### Test 3: Google OAuth Sign In

**Important**: Before testing Google OAuth, ensure:
- The redirect URIs are configured in your Cognito app client:
  - `tinywinsmobile://callback` (for production)
  - `https://auth.expo.io/@<your-expo-username>/tinywins-mobile` (for Expo dev)

**Steps:**
1. On the login screen, tap "Sign in with Google"
2. You should be redirected to Google sign-in page (in browser or in-app browser)
3. Sign in with your Google account
4. You should be redirected back to the app
5. You should be automatically signed in and see the home screen

**Troubleshooting Google OAuth**:
- If redirect doesn't work, check that the redirect URI in Cognito matches exactly
- For Expo Go, you may need to use the Expo-specific redirect URI
- Check browser console/device logs for errors

### Test 4: Sign Out

1. **From Home Screen**:
   - Tap "Sign Out" button
   - You should be redirected to login screen
   - Authentication state should be cleared

2. **Verify**:
   - Try navigating back - you should be redirected to login
   - Protected routes should not be accessible

### Test 5: Protected Routes

1. **While Signed Out**:
   - Try to access protected routes (tabs)
   - You should be automatically redirected to login

2. **While Signed In**:
   - Navigate between tabs
   - All tabs should be accessible
   - No redirect to login should occur

## Testing Navigation

### Test Navigation Flow

1. **Unauthenticated State**:
   - App starts → Should show login screen
   - Try to access tabs → Should redirect to login

2. **Authenticated State**:
   - After sign in → Should show home tab
   - Tap "Explore" tab → Should navigate to explore screen
   - Navigation should be smooth

## Common Issues and Troubleshooting

### Issue: "Network request failed" or "Cannot connect to backend"

**Solutions**:
1. Check that `amplify_outputs.json` exists in project root
2. Verify the GraphQL API URL is correct
3. Check your internet connection
4. Verify the backend is running and accessible

### Issue: "User is not authenticated" errors

**Solutions**:
1. Check that Cognito User Pool ID and Client ID are correct in `amplify_outputs.json`
2. Verify the region is correct (`us-east-2`)
3. Check that the user exists in the Cognito User Pool
4. Try signing out and signing back in

### Issue: OAuth redirect not working

**Solutions**:
1. Verify redirect URIs in Cognito app client settings
2. For Expo Go, use: `https://auth.expo.io/@<username>/tinywins-mobile`
3. For production, use: `tinywinsmobile://callback`
4. Check that the deep link scheme matches in `app.json` (`tinywinsmobile`)

### Issue: App crashes on startup

**Solutions**:
1. Check Metro bundler logs for errors
2. Verify all dependencies are installed: `npm install`
3. Clear cache: `npx expo start --clear`
4. Check that `amplify_outputs.json` is valid JSON

### Issue: TypeScript errors

**Solutions**:
1. Run `npm run lint` to see all errors
2. Check that all imports are correct
3. Verify TypeScript version compatibility

## Debugging Tips

### 1. Enable Debug Logging

Add to your code temporarily:
```typescript
// In src/context/AuthContext.tsx
console.log('Auth state:', { isAuthenticated, user, isLoading });
```

### 2. Check Metro Bundler Logs

The terminal running `npm start` will show:
- Compilation errors
- Runtime errors
- Network requests

### 3. Use React Native Debugger

1. Shake your device (or press `Cmd+D` on iOS simulator, `Cmd+M` on Android)
2. Select "Debug" or "Open Debugger"
3. Chrome DevTools will open

### 4. Check Device Logs

**iOS**:
```bash
# In a separate terminal
npx react-native log-ios
```

**Android**:
```bash
# In a separate terminal
npx react-native log-android
```

### 5. Test API Connectivity

You can test if the backend is reachable:
```bash
# Test GraphQL endpoint
curl -X POST https://ioplijwclvbq3ogrc7owelmsme.appsync-api.us-east-2.amazonaws.com/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: da2-wy7eueevn5ghfexh6euqy3fsla" \
  -d '{"query":"{ __schema { queryType { name } } }"}'
```

## Testing Checklist

### Authentication
- [ ] Can sign up with email/password
- [ ] Can sign in with email/password
- [ ] Can sign in with Google (if configured)
- [ ] Can sign out
- [ ] Protected routes redirect to login when not authenticated
- [ ] Can access protected routes when authenticated

### Navigation
- [ ] App starts at login screen when not authenticated
- [ ] App starts at home screen when authenticated
- [ ] Can navigate between tabs
- [ ] Deep linking works (for OAuth callbacks)

### Error Handling
- [ ] Invalid credentials show error message
- [ ] Network errors are handled gracefully
- [ ] Loading states are shown during async operations

### Configuration
- [ ] `amplify_outputs.json` is present and valid
- [ ] Amplify is configured correctly
- [ ] OAuth redirect URIs are configured in Cognito

## Next Steps After Testing

Once basic authentication is working:

1. **Implement GraphQL Queries**: Add actual queries to `src/services/api/data-service.ts`
2. **Build Feature Screens**: Create screens for milestones, diary, profiles, etc.
3. **Test Data Operations**: Test CRUD operations with the backend
4. **Add Error Handling**: Improve error messages and user feedback
5. **Add Loading States**: Show loading indicators during API calls

## Quick Start Commands

```bash
# Start development server
npm start

# Clear cache and start
npx expo start --clear

# Run on specific platform
npm run ios      # iOS Simulator (macOS only)
npm run android  # Android Emulator
npm run web      # Web browser

# Check for errors
npm run lint
```

## Need Help?

- Check Expo documentation: https://docs.expo.dev
- Check AWS Amplify documentation: https://docs.amplify.aws
- Check React Native documentation: https://reactnative.dev/docs/getting-started

