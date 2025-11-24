# Where to Find Firebase Credentials

This guide shows you exactly where to find each Firebase credential in the Firebase Console.

## Step 1: Go to Firebase Console

1. Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your project (or create a new one if you haven't)

## Step 2: Get Your Project ID

### Option A: From Project Settings
1. Click the **gear icon (⚙️)** next to "Project Overview" at the top left
2. Click **"Project settings"**
3. In the **"General"** tab, scroll down to **"Your apps"** section
4. Look for **"Project ID"** - this is your `FIREBASE_PROJECT_ID`

### Option B: From Project Overview
1. On the main dashboard, look at the top left
2. You'll see your project name
3. The **Project ID** is shown right below it (or in parentheses)

**Example:**
```
Project: My Awesome App
Project ID: my-awesome-app-12345
```

---

## Step 3: Get Service Account Credentials (Private Key & Client Email)

### Step 3.1: Navigate to Service Accounts
1. Click the **gear icon (⚙️)** next to "Project Overview"
2. Click **"Project settings"**
3. Go to the **"Service accounts"** tab (at the top)

### Step 3.2: Generate New Private Key
1. You'll see a section titled **"Firebase Admin SDK"**
2. Make sure **"Node.js"** is selected in the dropdown
3. Click the **"Generate new private key"** button
4. A warning dialog will appear - click **"Generate key"**
5. A JSON file will automatically download to your computer

### Step 3.3: Extract Values from JSON File
Open the downloaded JSON file (it will look something like this):

```json
{
  "type": "service_account",
  "project_id": "my-awesome-app-12345",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@my-awesome-app-12345.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Step 3.4: Copy the Values

From this JSON file, copy these three values:

1. **FIREBASE_PROJECT_ID** = `"project_id"` value
   ```
   Example: "my-awesome-app-12345"
   ```

2. **FIREBASE_CLIENT_EMAIL** = `"client_email"` value
   ```
   Example: "firebase-adminsdk-xxxxx@my-awesome-app-12345.iam.gserviceaccount.com"
   ```

3. **FIREBASE_PRIVATE_KEY** = `"private_key"` value
   ```
   Example: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   ```
   
   ⚠️ **IMPORTANT:** Keep the entire key including:
   - The quotes
   - `-----BEGIN PRIVATE KEY-----`
   - All the characters in between
   - `-----END PRIVATE KEY-----`
   - The `\n` characters (they represent newlines)

---

## Step 4: Add to Your .env.local File

1. In your project root, create or open `.env.local` file
2. Add the values like this:

```env
FIREBASE_PROJECT_ID=my-awesome-app-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@my-awesome-app-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Important Notes:

- **FIREBASE_PRIVATE_KEY** must be in quotes (`"..."`)
- Keep the `\n` characters as they are (don't replace them with actual newlines)
- The private key should be on one line with `\n` in it
- Don't share this file or commit it to Git (it's already in .gitignore)

---

## Visual Guide

### Finding Project ID:
```
Firebase Console
├── Project Overview
│   └── [Gear Icon] → Project settings
│       └── General tab
│           └── Project ID: "my-awesome-app-12345" ← COPY THIS
```

### Finding Service Account Credentials:
```
Firebase Console
├── Project Overview
│   └── [Gear Icon] → Project settings
│       └── Service accounts tab
│           └── Firebase Admin SDK
│               └── [Generate new private key] ← CLICK THIS
│                   └── Downloads JSON file
│                       └── Open JSON file
│                           ├── "project_id" → FIREBASE_PROJECT_ID
│                           ├── "client_email" → FIREBASE_CLIENT_EMAIL
│                           └── "private_key" → FIREBASE_PRIVATE_KEY
```

---

## Quick Checklist

- [ ] Opened Firebase Console
- [ ] Found Project ID from Project Settings
- [ ] Went to Service Accounts tab
- [ ] Generated new private key (downloaded JSON file)
- [ ] Opened the JSON file
- [ ] Copied `project_id` → `FIREBASE_PROJECT_ID`
- [ ] Copied `client_email` → `FIREBASE_CLIENT_EMAIL`
- [ ] Copied `private_key` → `FIREBASE_PRIVATE_KEY` (with quotes)
- [ ] Added all three to `.env.local` file
- [ ] Restarted development server

---

## Troubleshooting

### "I can't find the Service Accounts tab"
- Make sure you're in Project Settings (gear icon)
- It's the second tab at the top, after "General"

### "The private key looks weird with \n"
- That's correct! Keep the `\n` characters as they are
- The entire key should be on one line with `\n` in it
- Make sure it's wrapped in quotes

### "I get an error about invalid key format"
- Make sure the private key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep it all on one line with `\n` characters
- Make sure it's wrapped in double quotes

### "Where is my .env.local file?"
- It should be in the root of your project (same folder as `package.json`)
- If it doesn't exist, create it
- Make sure it's named exactly `.env.local` (with the dot at the beginning)

---

## Security Reminder

⚠️ **Keep your service account key secure!**
- Never commit `.env.local` to Git
- Never share your private key publicly
- If you accidentally share it, regenerate a new key immediately
- The downloaded JSON file contains sensitive credentials - delete it after copying the values

---

## Test Your Configuration

After adding the credentials, test them:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/api/test-firebase`

3. If you see `"success": true`, you're all set! ✅

If you see errors, check the error message - it will tell you exactly what's wrong.

