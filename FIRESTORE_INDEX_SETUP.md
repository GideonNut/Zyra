# Firestore Index Setup Guide

This guide walks you through setting up the required Firestore index for the address-to-company mapping feature.

## What Index is Needed?

Firestore requires a composite index for the `companyAddresses` collection to efficiently query addresses by company and primary status:

**Collection:** `companyAddresses`

**Index Fields:**
1. `companySlug` (Ascending)
2. `isPrimary` (Descending)
3. `createdAt` (Descending)

## Option 1: Automatic Setup (Recommended)

Firestore will automatically prompt you to create the index when you first run a query that needs it. Here's what happens:

1. Try to use the address management feature (add/view addresses)
2. You'll see a console error with a link like:
   ```
   https://console.firebase.google.com/v1/projects/{projectId}/databases/(default)/indexes?create_composite=...
   ```
3. Click the link and Firebase Console will show a "Create Index" button
4. Click "Create Index" - it will be created automatically

## Option 2: Manual Setup via Firebase Console

If you don't want to wait for the automatic prompt:

1. **Open Firebase Console:**
   - Go to https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Database:**
   - In the left sidebar, click "Firestore Database"
   - Click the "Indexes" tab

3. **Create Composite Index:**
   - Click "Create Index"
   - **Collection ID:** `companyAddresses`
   - **Add fields to index:**
     - Field: `companySlug`, Type: `Ascending` ✓
     - Field: `isPrimary`, Type: `Descending` ✓
     - Field: `createdAt`, Type: `Descending` ✓
   - Click "Create Index"

4. **Wait for Index Creation:**
   - Status will show "Building..." 
   - Takes usually 1-5 minutes
   - Once complete, status changes to "Enabled"

## Option 3: Via Script (Development)

Run the setup script:

```bash
npm run setup:firestore-indexes
```

This script will guide you through the setup process.

## Verify Index is Ready

Once the index is created:
- Visit the admin dashboard: `/admin/companies/[company-slug]`
- Scroll to "Address Management" section
- Try adding an address - it should work without errors

## Index Creation Time

- Typically completes in 1-5 minutes
- Large databases may take longer
- You'll be notified in Firebase Console when complete

## Troubleshooting

### Error: "FAILED_PRECONDITION: index not ready"
This means the index is still being created. Wait a few minutes and try again.

### Error: "PERMISSION_DENIED"
Check your Firestore security rules. Make sure you have read/write access to `companyAddresses` collection.

### Index doesn't appear to be created
- Refresh the Firebase Console
- Check that you're in the correct project
- Verify the index fields match exactly (case-sensitive)

## Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companyAddresses/{document=**} {
      // Restrict access as needed for your app
      allow read, write: if request.auth != null;
    }
  }
}
```

For development only:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companyAddresses/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Related Documentation

- [ADDRESS_MAPPING.md](../ADDRESS_MAPPING.md) - Feature documentation
- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/indexes)
