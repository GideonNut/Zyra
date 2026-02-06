import { useState, useCallback } from 'react';

interface CompanyAddress {
  id: string;
  companySlug: string;
  address: string;
  type: 'blockchain' | 'physical';
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanyWithAddresses {
  slug: string;
  name: string;
  addresses: CompanyAddress[];
}

interface UseAddressLookupState {
  company: CompanyWithAddresses | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to lookup a company by address
 * Example usage:
 * const { company, loading, error, lookup } = useAddressLookup();
 * await lookup('0x123...');
 */
export function useAddressLookup() {
  const [state, setState] = useState<UseAddressLookupState>({
    company: null,
    loading: false,
    error: null,
  });

  const lookup = useCallback(async (address: string) => {
    setState({ company: null, loading: true, error: null });

    try {
      const response = await fetch(
        `/api/companies/address-lookup?address=${encodeURIComponent(address)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setState({
            company: null,
            loading: false,
            error: 'No company found for this address',
          });
          return null;
        }
        throw new Error('Failed to lookup company');
      }

      const data = await response.json();
      setState({
        company: data,
        loading: false,
        error: null,
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to lookup company';
      setState({
        company: null,
        loading: false,
        error: message,
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ company: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    lookup,
    reset,
  };
}
