# How to Test if Firebase is Working

## Quick Test

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:3000/api/test-firebase
   ```

3. **Check the response:**

   ✅ **If Firebase is working correctly**, you'll see:
   ```json
   {
     "success": true,
     "message": "Firebase Firestore is connected and working!",
     "collections": {
       "brands": { "exists": true, "count": 0 },
       "mobileMoneyInvoices": { "exists": true, "count": 0 },
       "companyInvoices": { "exists": true, "count": 0 }
     },
     "timestamp": "2024-01-01T12:00:00.000Z"
   }
   ```

   ❌ **If there's an error**, you'll see:
   ```json
   {
     "success": false,
     "error": "Missing Firebase configuration",
     "details": {
       "required": ["FIREBASE_PROJECT_ID", "FIREBASE_PRIVATE_KEY", "FIREBASE_CLIENT_EMAIL"],
       "check": "Make sure these are set in your .env.local file"
     }
   }
   ```

## Common Issues and Solutions

### 1. Missing Environment Variables

**Error:** `Missing Firebase configuration`

**Solution:**
- Create a `.env.local` file in your project root
- Add the three required variables (see `FIREBASE_SETUP.md`)
- Restart your development server

### 2. Invalid Private Key Format

**Error:** `Failed to initialize Firebase: Invalid key format`

**Solution:**
- Make sure `FIREBASE_PRIVATE_KEY` includes the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the quotes around the value
- Make sure `\n` characters are preserved (they should be actual newlines in the key)

### 3. Permission Denied

**Error:** `Permission denied` or `403 Forbidden`

**Solution:**
- Check that your service account has "Firestore Admin" or "Editor" role
- Verify the `FIREBASE_CLIENT_EMAIL` matches your service account email
- Make sure Firestore is enabled in your Firebase project

### 4. Wrong Project ID

**Error:** `Project not found` or connection errors

**Solution:**
- Verify `FIREBASE_PROJECT_ID` matches your Firebase project ID exactly
- Check Firebase Console > Project Settings > General for the correct Project ID

## Testing with Real Data

Once the connection test passes, you can test with real operations:

### Test Creating a Brand

```bash
curl -X POST http://localhost:3000/api/admin/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "slug": "test-company",
    "description": "A test company"
  }'
```

### Test Reading Brands

```bash
curl http://localhost:3000/api/admin/companies
```

### Check Firestore Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database
4. You should see your collections: `brands`, `mobileMoneyInvoices`, `companyInvoices`
5. Check if data appears when you create records

## Using Browser DevTools

1. Open your browser's Developer Tools (F12)
2. Go to the Network tab
3. Navigate to `http://localhost:3000/api/test-firebase`
4. Check the response in the Network tab
5. Look for any errors in the Console tab

## Server Logs

Check your terminal where `npm run dev` is running. You should see:

- ✅ `✅ Firebase initialized successfully for project: your-project-id` (on first connection)
- ❌ Any error messages will also appear here

## Next Steps

Once Firebase is working:
1. ✅ Test endpoint returns success
2. ✅ You can create/read brands
3. ✅ You can create/read invoices
4. ✅ Data appears in Firestore Console

If all tests pass, Firebase is fully configured and working! 🎉

