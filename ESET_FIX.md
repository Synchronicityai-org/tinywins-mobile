# Fixing ESET Antivirus Blocking Expo Tunnel

## Problem
ESET Endpoint Security is blocking ngrok (used by Expo tunnel mode), causing:
- "Potentially unsafe application removed" alert
- "spawn EPERM" error when trying to use `--tunnel`

## Solutions

### Solution 1: Add Exception in ESET (Recommended)

1. **Open ESET Endpoint Security**
2. **Go to Settings** → **Computer Protection** → **Antivirus and antispyware**
3. **Click "Edit" next to Real-time file system protection**
4. **Go to "Exclusions" tab**
5. **Add these exclusions:**

   **Files and folders:**
   - `C:\Users\<YourUsername>\AppData\Roaming\npm` (or wherever npm global packages are)
   - `C:\Users\<YourUsername>\AppData\Local\Temp` (temporary files)
   - Your project folder: `C:\Users\vkulkarni\source\repos\mobile\tinywins-mobile`

   **Processes:**
   - `node.exe`
   - `ngrok.exe` (if it exists)

6. **Save and restart Expo**

### Solution 2: Use LAN Mode Instead (Easier)

If you're on the same network, use LAN mode instead of tunnel:

```bash
npx expo start --lan --clear
```

This doesn't require ngrok and should work without ESET blocking it.

### Solution 3: Temporarily Disable ESET (Quick Test)

**Only for testing - re-enable after:**

1. Right-click ESET icon in system tray
2. Select "Temporarily disable protection"
3. Choose a time period (e.g., 15 minutes)
4. Run: `npx expo start --tunnel --clear`
5. **Remember to re-enable ESET after testing!**

### Solution 4: Add ngrok to ESET Exclusions

1. Open ESET
2. Go to **Advanced Settings** → **Detection Engine** → **Exclusions**
3. Add:
   - **File path**: `*ngrok*`
   - **Process**: `node.exe`
4. Save and restart

## Recommended Approach

**For Development:**
1. Use **LAN mode** if you're on the same Wi-Fi network:
   ```bash
   npx expo start --lan --clear
   ```

2. If you need tunnel mode (different networks), add ESET exclusions as shown in Solution 1.

## Verify the Fix

After adding exclusions:
1. Close all terminals
2. Run: `npx expo start --tunnel --clear`
3. Should work without ESET blocking

## Alternative: Use Regular Mode (No Tunnel)

If you're on the same network, you don't need tunnel:

```bash
# Regular mode (same network)
npx expo start --clear

# Or explicitly LAN
npx expo start --lan --clear
```

