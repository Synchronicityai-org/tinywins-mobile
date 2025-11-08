# Troubleshooting: "Request Timeout" Error

## Common Causes and Solutions

### 1. Network Connectivity Issues

**Problem**: Your phone and computer aren't on the same network, or firewall is blocking the connection.

**Solutions**:

**Option A: Use Tunnel Mode (Recommended)**
```bash
npx expo start --tunnel
```
This uses Expo's tunnel service to connect even if you're on different networks.

**Option B: Check Network**
- Ensure both devices are on the same Wi-Fi network
- Try disabling VPN if you're using one
- Check Windows Firewall isn't blocking Node.js/Expo

**Option C: Use LAN Mode Explicitly**
```bash
npx expo start --lan
```

### 2. Metro Bundler Not Starting Properly

**Problem**: The bundler might be stuck or crashed.

**Solutions**:

**Clear Cache and Restart**:
```bash
# Stop the current process (Ctrl+C)
npx expo start --clear
```

**Kill Existing Processes**:
```bash
# On Windows PowerShell
Get-Process -Name node | Stop-Process -Force

# Then restart
npx expo start --clear
```

### 3. Port Already in Use

**Problem**: Another process is using port 8081 or 19000.

**Solutions**:

**Check and Kill Process on Port**:
```bash
# On Windows PowerShell
netstat -ano | findstr :8081
# Note the PID, then:
taskkill /PID <PID> /F

# Or use a different port
npx expo start --port 8082
```

### 4. Amplify Configuration Error

**Problem**: The app might be trying to connect to the backend during initialization and timing out.

**Solutions**:

**Check amplify_outputs.json**:
- Ensure the file exists in the project root
- Verify it's valid JSON (no syntax errors)
- Check that the API URL is correct

**Temporarily Disable Backend Calls**:
We can add error handling to prevent crashes during initialization.

### 5. Expo Go App Issues

**Problem**: Expo Go app might be outdated or have cached data.

**Solutions**:
- Update Expo Go to the latest version
- Clear Expo Go app cache:
  - iOS: Delete and reinstall Expo Go
  - Android: Settings → Apps → Expo Go → Clear Cache
- Try restarting your phone

### 6. Development Build Required

**Problem**: Some native modules might require a development build instead of Expo Go.

**Solutions**:
- For now, we're using Expo Go which should work
- If issues persist, we might need to create a development build

## Step-by-Step Troubleshooting

### Step 1: Verify Setup
```bash
# Check Node version
node --version

# Check Expo CLI
npx expo --version

# Verify dependencies
npm install
```

### Step 2: Clear Everything
```bash
# Clear npm cache
npm cache clean --force

# Clear Expo cache
npx expo start --clear

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Step 3: Try Different Connection Methods

**Method 1: Tunnel (Works across networks)**
```bash
npx expo start --tunnel
```

**Method 2: LAN (Same network)**
```bash
npx expo start --lan
```

**Method 3: Localhost (Simulator/Emulator only)**
```bash
npx expo start --localhost
```

### Step 4: Check for Errors

Look for these in the terminal:
- "Unable to resolve module" - Missing dependency
- "Network request failed" - Backend connectivity issue
- "Port already in use" - Port conflict
- "EADDRINUSE" - Port conflict

### Step 5: Test on Web First

Test if the app works in the browser:
```bash
npm run web
```

If web works but mobile doesn't, it's likely a network/connection issue.

## Quick Fixes to Try

### Fix 1: Restart Everything
```bash
# 1. Stop Expo (Ctrl+C)
# 2. Kill Node processes
Get-Process -Name node | Stop-Process -Force
# 3. Clear and restart
npx expo start --clear --tunnel
```

### Fix 2: Check Firewall
1. Open Windows Defender Firewall
2. Allow Node.js through firewall
3. Allow Expo through firewall

### Fix 3: Use Tunnel Mode
```bash
npx expo start --tunnel
```
This is the most reliable method and works even on different networks.

### Fix 4: Check amplify_outputs.json
Make sure the file exists and is valid:
```bash
# Check if file exists
ls amplify_outputs.json

# Validate JSON (on Windows PowerShell)
Get-Content amplify_outputs.json | ConvertFrom-Json
```

## If Nothing Works

### Option 1: Use Web Version
```bash
npm run web
```
Test the app in browser first to verify it's not a code issue.

### Option 2: Check Metro Bundler Logs
Look at the terminal output when you run `npm start`. Common errors:
- Module resolution errors
- Import errors
- Configuration errors

### Option 3: Create a Minimal Test
Temporarily comment out Amplify initialization to see if that's causing the timeout:

```typescript
// In app/_layout.tsx, temporarily comment out:
// configureAmplify();
```

If the app loads without Amplify, the issue is with backend connectivity.

## Getting More Information

### Enable Verbose Logging
```bash
npx expo start --clear --verbose
```

### Check Network Connection
```bash
# Test if you can reach the backend
curl https://ioplijwclvbq3ogrc7owelmsme.appsync-api.us-east-2.amazonaws.com/graphql
```

### Check Expo Status
Visit: https://status.expo.dev/

## Still Having Issues?

1. **Check Expo Go Version**: Make sure it's the latest
2. **Try Different Device**: Test on another phone/tablet
3. **Check Internet Connection**: Ensure stable connection
4. **Review Error Messages**: Look for specific error codes in terminal
5. **Check Expo Forums**: Search for similar issues

## Most Common Solution

**90% of timeout issues are solved by using tunnel mode:**

```bash
npx expo start --tunnel --clear
```

This uses Expo's cloud service to tunnel the connection, bypassing most network issues.

