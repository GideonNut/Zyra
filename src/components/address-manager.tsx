import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CompanyAddress {
  id: string;
  companySlug: string;
  address: string;
  type: 'blockchain' | 'physical';
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressManagerProps {
  companySlug: string;
}

export function AddressManager({ companySlug }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<CompanyAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [addressType, setAddressType] = useState<'blockchain' | 'physical'>('blockchain');
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${companySlug}/addresses`);
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    loadAddresses();
  }, [companySlug, loadAddresses]);

  async function addAddress() {
    if (!newAddress.trim()) {
      setError('Address is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/companies/${companySlug}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: newAddress.trim(),
          type: addressType,
          isPrimary,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Address added successfully');
        setNewAddress('');
        setAddressType('blockchain');
        setIsPrimary(false);
        setIsOpen(false);
        loadAddresses();
      } else {
        setError(data.error || 'Failed to add address');
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Failed to add address');
    } finally {
      setLoading(false);
    }
  }

  async function deleteAddress(addressId: string) {
    if (!confirm('Are you sure you want to remove this address?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${companySlug}/addresses?id=${addressId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('Address removed successfully');
        loadAddresses();
      } else {
        setError('Failed to remove address');
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Failed to remove address');
    } finally {
      setLoading(false);
    }
  }

  async function setPrimaryAddress(addressId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${companySlug}/addresses?id=${addressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (res.ok) {
        setSuccess('Primary address updated');
        loadAddresses();
      } else {
        setError('Failed to update primary address');
      }
    } catch (err) {
      console.error('Error updating primary address:', err);
      setError('Failed to update primary address');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Addresses</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Address to Company</DialogTitle>
              <DialogDescription>
                Add a blockchain wallet or physical address for this company
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="0x... or physical address"
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value as 'blockchain' | 'physical')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="blockchain">Blockchain Address</option>
                  <option value="physical">Physical Address</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isPrimary" className="cursor-pointer">
                  Set as primary address
                </Label>
              </div>

              <Button
                onClick={addAddress}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Adding...' : 'Add Address'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded text-sm">
          {success}
        </div>
      )}

      {addresses.length === 0 ? (
        <p className="text-gray-500 text-sm">No addresses added yet</p>
      ) : (
        <div className="space-y-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-3 border rounded-lg flex justify-between items-start ${
                addr.isPrimary ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm truncate">{addr.address}</p>
                <div className="flex gap-2 mt-1">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100">
                    {addr.type}
                  </span>
                  {addr.isPrimary && (
                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      Primary
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-2">
                {!addr.isPrimary && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrimaryAddress(addr.id)}
                    disabled={loading}
                  >
                    Set Primary
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteAddress(addr.id)}
                  disabled={loading}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
