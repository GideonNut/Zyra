# Quick Start: Firebase Setup in 5 Minutes

## Step 1: Get Your Credentials (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **⚙️ Project Settings** → **Service Accounts** tab
3. Click **"Generate new private key"** → Download JSON file
4. Open the JSON file and copy these 3 values:

```json
{
  "project_id": "← COPY THIS → FIREBASE_PROJECT_ID",
  "client_email": "← COPY THIS → FIREBASE_CLIENT_EMAIL",
  "private_key": "← COPY THIS → FIREBASE_PRIVATE_KEY"
}
```

## Step 2: Add to .env.local (1 minute)

Create `.env.local` in your project root:

```env
FIREBASE_PROJECT_ID=paste-project-id-here
FIREBASE_CLIENT_EMAIL=paste-client-email-here
FIREBASE_PRIVATE_KEY="paste-private-key-here"
```

⚠️ **Important:** Keep quotes around `FIREBASE_PRIVATE_KEY` and keep `\n` characters as-is.

## Step 3: Enable Firestore (1 minute)

1. In Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Choose **Production mode**
4. Select a location

## Step 4: Test It (1 minute)

1. Restart your server: `npm run dev`
2. Visit: `http://localhost:3000/api/test-firebase`
3. See `"success": true`? ✅ You're done!

---

**Need more details?** See [WHERE_TO_FIND_FIREBASE_CREDENTIALS.md](./WHERE_TO_FIND_FIREBASE_CREDENTIALS.md)

