/**
 * Example/Test file showing how to use the address-to-company mapping feature
 * 
 * This file demonstrates the various ways to use the address-to-company
 * mapping system for both server-side and client-side operations.
 */

// Imports at top level
import {
  getCompanyByAddress,
  addCompanyAddress,
  removeCompanyAddress,
  updateCompanyAddress,
  getPrimaryCompanyAddress,
  getAllCompanyAddresses,
} from '@/lib/address-to-company';

// ============================================================================
// SERVER-SIDE USAGE (Node.js/Next.js API routes)
// ============================================================================

/**
 * Example 1: Lookup a company by blockchain address in an API route
 */
async function exampleLookupInRoute() {
  const address = '0x1234567890123456789012345678901234567890';
  const company = await getCompanyByAddress(address);

  if (!company) {
    console.log('No company found for this address');
    return;
  }

  console.log(`Company: ${company.name}`);
  console.log(`Slug: ${company.slug}`);
  console.log(`Number of addresses: ${company.addresses.length}`);
  
  // Get primary address
  const primaryAddress = company.addresses.find(a => a.isPrimary);
  if (primaryAddress) {
    console.log(`Primary address: ${primaryAddress.address}`);
  }
}

/**
 * Example 2: Add an address to a company
 */
async function exampleAddAddress() {
  try {
    // Add a blockchain address as primary
    const address = await addCompanyAddress(
      'fruity-gold',
      '0x1234567890123456789012345678901234567890',
      'blockchain',
      true
    );

    console.log(`Address added: ${address.id}`);
  } catch (error) {
    console.error(`Failed to add address: ${error}`);
  }
}

/**
 * Example 3: Get all addresses for a company
 */
async function exampleGetAllAddresses() {
  const companySlug = 'fruity-gold';
  const addresses = await getAllCompanyAddresses(companySlug);

  console.log(`Found ${addresses.length} addresses for ${companySlug}:`);
  addresses.forEach(addr => {
    const badge = addr.isPrimary ? ' [PRIMARY]' : '';
    console.log(`  - ${addr.type}: ${addr.address}${badge}`);
  });
}

/**
 * Example 4: Update an address (make it primary)
 */
async function exampleUpdateAddress() {
  const addressId = 'addr_1234567890_abc123';
  const updated = await updateCompanyAddress(addressId, {
    isPrimary: true
  });

  if (updated) {
    console.log(`Address updated successfully`);
  }
}

/**
 * Example 5: Remove an address
 */
async function exampleRemoveAddress() {
  const addressId = 'addr_1234567890_abc123';
  const success = await removeCompanyAddress(addressId);

  if (success) {
    console.log(`Address removed successfully`);
  }
}

/**
 * Example 6: Get the primary address for a company
 */
async function exampleGetPrimaryAddress() {
  const companySlug = 'fruity-gold';
  const address = await getPrimaryCompanyAddress(companySlug);

  if (address) {
    console.log(`Primary address: ${address.address}`);
  } else {
    console.log('No primary address set');
  }
}

// ============================================================================
// CLIENT-SIDE USAGE (React Components)
// ============================================================================

/**
 * Example 7: Using the useAddressLookup hook in a React component
 * See src/components/address-manager.tsx for a complete example component
 * that demonstrates the useAddressLookup hook and API integration.
 */

/**
 * Example 8: Using the AddressManager component in an admin page
 * The AddressManager component provides a complete UI for managing company addresses
 * 
 * Usage:
 * import { AddressManager } from '@/components/address-manager';
 * 
 * export function CompanyAdminPage() {
 *   return (
 *     <div>
 *       <AddressManager companySlug="fruity-gold" />
 *     </div>
 *   );
 * }
 */

// ============================================================================
// API ROUTE EXAMPLES
// ============================================================================

/**
 * Example 9: Using the API endpoints via fetch
 */

// Lookup a company by address
async function apiLookupCompany(address: string) {
  const response = await fetch(
    `/api/companies/address-lookup?address=${encodeURIComponent(address)}`
  );
  
  if (response.ok) {
    const company = await response.json();
    console.log(`Found company: ${company.name}`);
    return company;
  } else if (response.status === 404) {
    console.log('No company found for this address');
    return null;
  } else {
    throw new Error('Failed to lookup company');
  }
}

// Add an address to a company
async function apiAddAddress(
  companySlug: string,
  address: string,
  type: 'blockchain' | 'physical' = 'blockchain'
) {
  const response = await fetch(`/api/companies/${companySlug}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address,
      type,
      isPrimary: false
    })
  });

  if (response.ok) {
    const newAddress = await response.json();
    console.log(`Address added: ${newAddress.id}`);
    return newAddress;
  } else {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add address');
  }
}

// Get all addresses for a company
async function apiGetAddresses(companySlug: string) {
  const response = await fetch(`/api/companies/${companySlug}/addresses`);
  const data = await response.json();
  return data.addresses || [];
}

// Update an address
async function apiUpdateAddress(
  companySlug: string,
  addressId: string,
  updates: { isPrimary?: boolean }
) {
  const response = await fetch(
    `/api/companies/${companySlug}/addresses?id=${addressId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }
  );

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Failed to update address');
  }
}

// Delete an address
async function apiDeleteAddress(companySlug: string, addressId: string) {
  const response = await fetch(
    `/api/companies/${companySlug}/addresses?id=${addressId}`,
    { method: 'DELETE' }
  );

  if (response.ok) {
    console.log('Address deleted successfully');
    return true;
  } else {
    throw new Error('Failed to delete address');
  }
}

const examplesExport = {
  exampleLookupInRoute,
  exampleAddAddress,
  exampleGetAllAddresses,
  exampleUpdateAddress,
  exampleRemoveAddress,
  exampleGetPrimaryAddress,
  apiLookupCompany,
  apiAddAddress,
  apiGetAddresses,
  apiUpdateAddress,
  apiDeleteAddress
};

export default examplesExport;
