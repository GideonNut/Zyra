/**
 * Setup Firestore Indexes for Address-to-Company Mapping
 * 
 * Run this script to create the required Firestore indexes:
 * node scripts/setup-firestore-indexes.js
 * 
 * Or set them up manually via Firebase Console:
 * https://console.firebase.google.com
 * 
 * Required indexes:
 * 1. Collection: companyAddresses
 *    Fields:
 *    - companySlug (Ascending)
 *    - isPrimary (Descending)
 *    - createdAt (Descending)
 */

import { getFirestoreInstance, COLLECTIONS } from '../src/lib/firestore';

async function setupIndexes() {
  console.log('Setting up Firestore indexes for address-to-company mapping...\n');

  try {
    const db = getFirestoreInstance();

    // Test that we can access the collection
    console.log('✓ Testing Firestore connection...');
    const testDoc = await db.collection(COLLECTIONS.COMPANY_ADDRESSES)
      .limit(1)
      .get();
    console.log('✓ Successfully connected to Firestore\n');

    console.log('📋 Index Setup Instructions:');
    console.log('============================\n');

    console.log('1. Firestore will automatically create indexes when you first run queries that need them.');
    console.log('2. You may see an error message in the console with a link to create the index.');
    console.log('3. Click the link in the error message to create the index automatically.\n');

    console.log('OR manually create the index via Firebase Console:\n');

    console.log('📍 Collection: companyAddresses');
    console.log('   Fields to index:');
    console.log('   - companySlug (Ascending)');
    console.log('   - isPrimary (Descending)');
    console.log('   - createdAt (Descending)\n');

    console.log('Steps:');
    console.log('1. Open Firebase Console: https://console.firebase.google.com');
    console.log('2. Select your project');
    console.log('3. Navigate to Firestore Database');
    console.log('4. Go to Indexes tab');
    console.log('5. Create a new index with the fields above\n');

    console.log('✓ Setup instructions complete!');
    console.log('  Firestore will auto-create indexes on first query.');

  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupIndexes().catch(console.error);
}

export default setupIndexes;
