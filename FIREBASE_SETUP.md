# Firebase/Firestore Setup Guide

This project now uses Firestore as the database. Follow these steps to set up Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## 2. Enable Firestore

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Start in **production mode** (you can change security rules later)
4. Choose a location for your database

## 3. Create a Service Account

1. Go to Project Settings (gear icon) > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file - **keep this secure!**

## 4. Set Environment Variables

Add these to your `.env.local` file (or your deployment platform's environment variables):

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

### 📖 Detailed Instructions

**See [WHERE_TO_FIND_FIREBASE_CREDENTIALS.md](./WHERE_TO_FIND_FIREBASE_CREDENTIALS.md) for step-by-step instructions with screenshots on exactly where to find each value.**

Quick summary:
- **FIREBASE_PROJECT_ID**: Found in Firebase Console > Project Settings > General tab
- **FIREBASE_PRIVATE_KEY**: From the downloaded service account JSON file, copy the `private_key` field (keep the quotes and `\n` characters)
- **FIREBASE_CLIENT_EMAIL**: From the downloaded service account JSON file, copy the `client_email` field

## 5. Firestore Collections

The app uses these collections:
- `mobileMoneyInvoices` - Global mobile money invoices
- `companyInvoices` - Company-specific mobile money invoices (includes `companySlug` field)
- `brands` - Brand/company configurations

## 6. Create Firestore Indexes

Some queries require composite indexes. Firestore will automatically prompt you to create them when you first run the queries. You can also create them manually:

1. Go to Firestore Database > Indexes
2. Click "Create Index"
3. Create these indexes:

**For `companyInvoices` collection:**
- Collection ID: `companyInvoices`
- Fields to index:
  - `companySlug` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection

**Note**: Firestore will automatically show you the link to create the index when you first run a query that needs it. Just click the link in the error message.

## 7. Security Rules (Optional for Development)

For production, set up proper Firestore security rules. For development, you can use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (ONLY FOR DEVELOPMENT)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Important**: Update these rules for production to restrict access appropriately.

## 8. Migrating Existing Data

If you have existing data in JSON files, you'll need to migrate it:

1. Export your existing data from the `data/` directory
2. Use a migration script or Firebase Console to import the data
3. Ensure the data structure matches the Firestore collections

## Troubleshooting

- **"Missing Firebase configuration"**: Make sure all three environment variables are set
- **"Permission denied"**: Check your service account has proper permissions
- **Connection issues**: Verify your FIREBASE_PROJECT_ID matches your Firebase project

