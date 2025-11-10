# Add Redirect URI to Cognito - Step by Step

## The Redirect URI You Need to Add

**`http://localhost:8081/callback`**

## Step-by-Step Instructions

1. **Open AWS Console:**
   - Go to: https://console.aws.amazon.com/cognito/
   - Make sure you're in the correct region: **us-east-2**

2. **Navigate to Your User Pool:**
   - Click on "User pools" in the left sidebar
   - Find and click on: **amplifyAuthUserPool4BA7F805-EyhR8wxuhmVi**
   - (User Pool ID: `us-east-2_6L23Phzl2`)

3. **Go to App Clients:**
   - Click on the **"App integration"** tab
   - Scroll down to **"App clients and analytics"** section
   - Click on the app client: **ogv5cavllk2e3r2fncpcvheic**
   - Click the **"Edit"** button

4. **Add Redirect URI:**
   - Scroll down to the **"Hosted UI"** section
   - Under **"Allowed callback URLs"**, you'll see a text area
   - Add this EXACT line (one per line):
     ```
     http://localhost:8081/callback
     ```
   - Under **"Allowed sign-out URLs"**, add the same:
     ```
     http://localhost:8081/callback
     ```

5. **Save:**
   - Scroll to the bottom
   - Click **"Save changes"**
   - Wait 1-2 minutes for changes to propagate

6. **Verify:**
   - After saving, scroll back to "Hosted UI"
   - Make sure `http://localhost:8081/callback` appears in both lists
   - Check for typos (no trailing slashes, correct port)

## Important Notes

- The URI must match EXACTLY (case-sensitive)
- No trailing slashes: `http://localhost:8081/callback` (not `/callback/`)
- Include the port number: `8081`
- Use `http://` not `https://` for localhost

## After Adding

1. Wait 1-2 minutes
2. Restart your Expo app
3. Try Google sign-in again
4. You should now see the Google account selection page

## If It Still Doesn't Work

1. Check the browser console for the exact redirect URI being used
2. Verify it matches exactly what you added to Cognito
3. Make sure you saved the changes in Cognito
4. Wait a bit longer (sometimes takes 2-3 minutes)

