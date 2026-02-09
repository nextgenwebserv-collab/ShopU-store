'use client';
import { useEffect, useState } from 'react';
import AddCouponForm from './addCoupon';

interface Coupon {
  id: string;
  name: string;
  code: string;
  discount: number;
  maxUsage: number;
  expiryDate: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchCoupons = async () => {
    const res = await fetch('/api/coupons');
    const data = await res.json();
    setCoupons(data);
  };

  const deleteCoupon = async (id: string) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchCoupons(); // Refresh the list
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="p-6">
      {/* Header with Add Coupon button aligned to right */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Add Coupon
        </button>
      </div>

      {showForm && (
        <AddCouponForm
          onSuccess={() => {
            fetchCoupons();
            setShowForm(false);
          }}
        />
      )}

      {/* Table with updated styling to match the design */}
      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left font-medium text-gray-600">Name</th>
              <th className="p-3 text-left font-medium text-gray-600">Code</th>
              <th className="p-3 text-left font-medium text-gray-600">Discount</th>
              <th className="p-3 text-left font-medium text-gray-600">Max Usage</th>
              <th className="p-3 text-left font-medium text-gray-600">Expiry</th>
              <th className="p-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c: Coupon) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.code}</td>
                <td className="p-3">{c.discount}%</td>
                <td className="p-3">{c.maxUsage}</td>
                <td className="p-3">{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
