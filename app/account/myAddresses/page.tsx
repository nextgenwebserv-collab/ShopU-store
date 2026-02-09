'use client';

import { useState, useEffect, Suspense } from 'react';
import AddAddress from '@/app/components/AddAddress';
import { UserAddress } from '@prisma/client';
import Navroute from '@/app/components/Navroute';
import { Edit, Home, Loader, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Define the Address type to match what AddAddress component expects
type Address = {
  id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
};

export default function AddressPage() {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const router = useRouter();
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/account/address', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.status === 401) {
        router.push('/');
        toast.error('Please login first.');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setAddresses(data.address || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = () => {
    fetchAddresses();
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: UserAddress) => {
    const editableAddress: Address = {
      id: address.id,
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || undefined,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      phoneNumber: address.phoneNumber,
    };
    setEditingAddress(editableAddress);
    setShowForm(true);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (addressId: string) => {
    try {
      setDeletingId(addressId); // Start loader
      const res = await fetch(`/api/account/address/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Address Deleted!');
        fetchAddresses();
      } else {
        console.error('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Navroute />
      <div className="min-h-screen px-4 py-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <h2 className="text-primaryColor mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
            My <span className="text-secondaryColor">Addresses</span>
            <hr className="bg-background1 mt-1 w-32 rounded border-2" />{' '}
          </h2>

          {/* Add New Address */}
          <button
            onClick={() => {
              if (addresses.length >= 3) {
                return;
              }
              setEditingAddress(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 text-sm font-medium text-green-700 hover:underline disabled:opacity-50"
            disabled={addresses.length >= 3}
          >
            <Plus className="h-4 w-4" />
            Add new address
          </button>

          {loading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
                <p className="mt-4 text-gray-600">Loading your addresses...</p>
              </div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="min-h-[60vh] text-center text-gray-500">
              No addresses found. Add your first address to get started.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Address Card */}
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className="flex items-center justify-between gap-6 rounded-md bg-white px-6 py-4 shadow-sm shadow-gray-300"
                >
                  <div className="flex items-center gap-5 text-gray-800">
                    <div>
                      <Home className="text-primaryColor" />
                    </div>
                    <div className="text-md">
                      <span>
                        {addr.fullName}, {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''} {addr.city},{' '}
                        {addr.state},{' '}
                      </span>
                      <span>
                        {addr.country} {addr.postalCode}
                      </span>
                      <br />
                      <span className="hidden sm:block">Phone: {addr.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="cursor-pointer text-sm text-blue-600"
                    >
                      <Edit className="h-5 w-5 text-gray-500" />
                    </button>

                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="cursor-pointer text-gray-500 hover:text-red-500 disabled:opacity-60"
                      disabled={deletingId === addr.id}
                    >
                      {deletingId === addr.id ? (
                        <Loader className="h-5 w-5 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <AddAddress
          formMode={editingAddress ? 'edit' : 'add'}
          initialData={editingAddress}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
          onSave={handleSave}
        />
      )}
    </Suspense>
  );
}
