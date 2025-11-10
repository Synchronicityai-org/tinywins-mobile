# Quick Fix: ESET Blocking Expo Go

## The Problem
ESET Endpoint Security is blocking the connection between your phone and computer.

## Fastest Solution: Use Tunnel Mode

Tunnel mode bypasses local firewall issues:

```powershell
# Kill existing processes
Get-Process -Name node | Stop-Process -Force

# Start with tunnel
npx expo start --tunnel --clear
```

This will show a URL like: `exp://xxx.tunnel.exp.direct:80`
- Use this URL in Expo Go app
- Works even with ESET blocking local connections

## Or: Add ESET Exception

1. **Open ESET Endpoint Security**
   - Right-click ESET icon in system tray
   - Open the application

2. **Go to Firewall/Rules**
   - Look for "Firewall" or "Network Protection"
   - Find "Rules" or "Exceptions"

3. **Add Node.js**
   - Application: `C:\Program Files\nodejs\node.exe`
   - Action: Allow (Inbound & Outbound)

4. **Add Port 8081**
   - Port: 8081
   - Protocol: TCP
   - Action: Allow

## Recommended: Use Tunnel

Tunnel mode is easiest and works immediately:
- No firewall configuration needed
- Works across any network
- Works with VPN
- Works with ESET blocking

Just run: `npx expo start --tunnel --clear`

