# Enable Firestore Database

You're getting a "NOT_FOUND" error, which means Firestore hasn't been enabled in your Firebase project yet.

## Quick Fix: Enable Firestore

### Step 1: Go to Firestore Database
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click **"Firestore Database"** (or "Build" → "Firestore Database")

### Step 2: Create Database
1. You'll see a button that says **"Create database"** - click it
2. Choose **"Start in production mode"** (you can change security rules later)
3. Click **"Next"**

### Step 3: Choose Location
1. Select a location closest to your users (e.g., `us-central`, `europe-west`, etc.)
2. Click **"Enable"**
3. Wait a few seconds for Firestore to initialize

### Step 4: Test Again
Once Firestore is enabled, test your connection again:
- Visit: `http://localhost:3000/api/test-firebase`
- You should now see `"success": true` ✅

## Alternative: Check if Firestore is Already Enabled

If you think Firestore is already enabled:

1. Go to Firebase Console → Firestore Database
2. If you see a data viewer with collections, it's enabled
3. If you see "Create database" button, it's not enabled yet

## Still Getting Errors?

After enabling Firestore, if you still get errors:

1. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Verify your environment variables:**
   - Make sure `.env.local` is in the project root
   - Check that all three variables are set correctly
   - Restart the server after changing `.env.local`

3. **Check the error message:**
   - Visit `http://localhost:3000/api/test-firebase` in your browser
   - The error message will tell you exactly what's wrong

