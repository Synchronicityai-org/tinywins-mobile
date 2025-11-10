# Windows Firewall Fix for Expo Go

## Step-by-Step Instructions

### Step 1: Add Inbound Rule for Port 8081

1. **In the left pane, click "Inbound Rules"** (not Connection Security Rules)

2. **In the right "Actions" pane, click "New Rule..."**

3. **Rule Type:**
   - Select **"Port"**
   - Click **Next**

4. **Protocol and Ports:**
   - Select **TCP**
   - Select **"Specific local ports"**
   - Enter: `8081`
   - Click **Next**

5. **Action:**
   - Select **"Allow the connection"**
   - Click **Next**

6. **Profile:**
   - Check all three: **Domain**, **Private**, **Public**
   - Click **Next**

7. **Name:**
   - Name: `Expo Dev Server Port 8081`
   - Description: `Allow Expo development server on port 8081`
   - Click **Finish**

### Step 2: Add Outbound Rule for Node.js

1. **In the left pane, click "Outbound Rules"**

2. **In the right "Actions" pane, click "New Rule..."**

3. **Rule Type:**
   - Select **"Program"**
   - Click **Next**

4. **Program:**
   - Select **"This program path:"**
   - Click **Browse**
   - Navigate to: `C:\Program Files\nodejs\node.exe`
   - (If not there, search for `node.exe` on your system)
   - Click **Next**

5. **Action:**
   - Select **"Allow the connection"**
   - Click **Next**

6. **Profile:**
   - Check all three: **Domain**, **Private**, **Public**
   - Click **Next**

7. **Name:**
   - Name: `Node.js - Allow Expo`
   - Description: `Allow Node.js to make outbound connections for Expo`
   - Click **Finish**

### Step 3: Add Inbound Rule for Node.js (if needed)

1. **In the left pane, click "Inbound Rules"**

2. **In the right "Actions" pane, click "New Rule..."**

3. **Rule Type:**
   - Select **"Program"**
   - Click **Next**

4. **Program:**
   - Select **"This program path:"**
   - Click **Browse**
   - Navigate to: `C:\Program Files\nodejs\node.exe`
   - Click **Next**

5. **Action:**
   - Select **"Allow the connection"**
   - Click **Next**

6. **Profile:**
   - Check all three: **Domain**, **Private**, **Public**
   - Click **Next**

7. **Name:**
   - Name: `Node.js - Allow Inbound`
   - Description: `Allow Node.js to receive inbound connections for Expo`
   - Click **Finish**

## After Adding Rules

1. **Restart Expo:**
   ```powershell
   npx expo start --lan --clear
   ```

2. **Test Expo Go:**
   - Scan QR code
   - App should now load

## Note About ESET

If you still have issues after adding Windows Firewall rules, you may also need to configure **ESET Endpoint Security** separately. ESET has its own firewall that can override Windows Firewall settings.

