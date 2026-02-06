# Address-to-Company Mapping

This document describes the address-to-company mapping feature, which allows you to associate blockchain wallets and physical addresses with companies.

## Overview

The address-to-company mapping system enables you to:
- Map blockchain addresses (wallet addresses) to companies
- Map physical addresses (business locations) to companies
- Lookup a company by its associated address
- Manage multiple addresses per company
- Set a primary address for each company

## Features

### 1. **Multiple Address Types**
- **Blockchain addresses**: Wallet addresses, smart contract addresses, etc.
- **Physical addresses**: Business locations, office addresses, etc.

### 2. **Primary Address**
Each company can have one primary address, which can be used as the default for operations.

### 3. **Address Normalization**
Blockchain addresses are automatically normalized to lowercase for consistency.

### 4. **Duplicate Prevention**
The system prevents adding the same address to a company twice.

## Database Structure

### Firestore Collection: `companyAddresses`

```typescript
interface CompanyAddress {
  id: string;                          // Unique address ID
  companySlug: string;                 // Reference to company
  address: string;                     // The address (normalized)
  type: 'blockchain' | 'physical';     // Address type
  isPrimary: boolean;                  // Is this the primary address?
  createdAt: string;                   // ISO timestamp
  updatedAt: string;                   // ISO timestamp
}
```

## API Endpoints

### 1. **Lookup Company by Address**

```
GET /api/companies/address-lookup?address=0x...
```

Returns the company associated with the given address.

**Query Parameters:**
- `address` (required): The address to lookup

**Response:**
```json
{
  "slug": "fruity-gold",
  "name": "Fruity Gold",
  "addresses": [
    {
      "id": "addr_1234567890_abc123",
      "companySlug": "fruity-gold",
      "address": "0x1234567890abcdef",
      "type": "blockchain",
      "isPrimary": true,
      "createdAt": "2025-02-06T10:00:00Z",
      "updatedAt": "2025-02-06T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Missing address parameter
- `404`: No company found for this address
- `500`: Server error

### 2. **Get Company Addresses**

```
GET /api/companies/[slug]/addresses
```

Get all addresses associated with a company.

**Response:**
```json
{
  "addresses": [
    {
      "id": "addr_1234567890_abc123",
      "companySlug": "fruity-gold",
      "address": "0x1234567890abcdef",
      "type": "blockchain",
      "isPrimary": true,
      "createdAt": "2025-02-06T10:00:00Z",
      "updatedAt": "2025-02-06T10:00:00Z"
    }
  ]
}
```

### 3. **Add Address to Company**

```
POST /api/companies/[slug]/addresses
```

Add a new address to a company.

**Request Body:**
```json
{
  "address": "0x1234567890abcdef",
  "type": "blockchain",
  "isPrimary": false
}
```

**Parameters:**
- `address` (required): The address to add
- `type` (optional): "blockchain" or "physical" (default: "blockchain")
- `isPrimary` (optional): Set as primary address (default: false)

**Response:** Returns the created address object (201)

**Errors:**
- `400`: Address is required
- `500`: Failed to add (e.g., address already exists)

### 4. **Update Address**

```
PATCH /api/companies/[slug]/addresses?id=...
```

Update an existing address.

**Query Parameters:**
- `id` (required): The address ID to update

**Request Body:**
```json
{
  "isPrimary": true,
  "type": "blockchain"
}
```

**Errors:**
- `400`: Address ID is required
- `404`: Address not found
- `500`: Failed to update

### 5. **Delete Address**

```
DELETE /api/companies/[slug]/addresses?id=...
```

Remove an address from a company.

**Query Parameters:**
- `id` (required): The address ID to delete

**Response:**
```json
{
  "success": true
}
```

## Usage Examples

### TypeScript/Node.js

#### Lookup a Company by Address

```typescript
import { getCompanyByAddress } from '@/lib/address-to-company';

// Lookup by blockchain address
const company = await getCompanyByAddress('0x1234567890abcdef');

if (company) {
  console.log(`Found company: ${company.name}`);
  console.log(`Addresses: ${company.addresses.map(a => a.address).join(', ')}`);
}
```

#### Add an Address to a Company

```typescript
import { addCompanyAddress } from '@/lib/address-to-company';

const address = await addCompanyAddress(
  'fruity-gold',
  '0x1234567890abcdef',
  'blockchain',
  true // Set as primary
);

console.log(`Added address: ${address.id}`);
```

#### Get All Addresses for a Company

```typescript
import { getAllCompanyAddresses } from '@/lib/address-to-company';

const addresses = await getAllCompanyAddresses('fruity-gold');

addresses.forEach(addr => {
  console.log(`${addr.type}: ${addr.address} ${addr.isPrimary ? '(primary)' : ''}`);
});
```

### React Hook

```tsx
import { useAddressLookup } from '@/hooks/useAddressLookup';

function AddressLookupComponent() {
  const { company, loading, error, lookup, reset } = useAddressLookup();

  const handleLookup = async () => {
    const address = '0x1234567890abcdef';
    const result = await lookup(address);
    
    if (result) {
      console.log(`Found company: ${result.name}`);
    }
  };

  return (
    <div>
      <button onClick={handleLookup} disabled={loading}>
        {loading ? 'Looking up...' : 'Lookup Address'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {company && (
        <div>
          <h3>{company.name}</h3>
          <p>Company slug: {company.slug}</p>
          <p>Total addresses: {company.addresses.length}</p>
        </div>
      )}
    </div>
  );
}
```

### React Component (Admin)

```tsx
import { AddressManager } from '@/components/address-manager';

export function CompanySettings() {
  return (
    <div>
      <h2>Manage Company</h2>
      <AddressManager companySlug="fruity-gold" />
    </div>
  );
}
```

## Firestore Security Rules

For development, you can use permissive rules. For production, consider restricting access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companyAddresses/{document=**} {
      // Allow read/write for authenticated users (adjust as needed)
      allow read, write: if request.auth != null;
    }
  }
}
```

## Firestore Indexes

The following composite indexes are recommended for optimal performance:

```
Collection: companyAddresses
Fields:
  1. companySlug (Ascending)
  2. isPrimary (Descending)
  3. createdAt (Descending)
```

Firestore will prompt you to create this index when you first run queries that need it.

## Implementation Checklist

- [x] Create `address-to-company.ts` utility library
- [x] Create API endpoint for address lookup (`/api/companies/address-lookup`)
- [x] Create API endpoint for managing company addresses (`/api/companies/[slug]/addresses`)
- [x] Create React hook (`useAddressLookup`)
- [x] Create React component (`AddressManager`)
- [x] Update Firestore collections constants
- [ ] Setup Firestore indexes
- [ ] Add to admin dashboard UI
- [ ] Write integration tests
- [ ] Add documentation

## Next Steps

1. **Create Firestore Index**: Navigate to Firebase Console and create the composite index for `companyAddresses`
2. **Integrate into Admin UI**: Add the `AddressManager` component to the company settings page
3. **Testing**: Test the address lookup functionality with real blockchain and physical addresses
4. **Production**: Update Firestore security rules for your production environment
