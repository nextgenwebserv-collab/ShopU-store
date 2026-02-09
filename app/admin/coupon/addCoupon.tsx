'use client';
import { useState } from 'react';

export default function AddCouponForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    discount: '',
    maxUsage: '',
    expiryDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        discount: Number(form.discount),
        maxUsage: Number(form.maxUsage),
      }),
    });
    if (res.ok) {
      setForm({ name: '', code: '', discount: '', maxUsage: '', expiryDate: '' });
      onSuccess();
    }
  };

  return (
    <div className="mb-4 rounded-lg border bg-white p-4 shadow">
      <h3 className="mb-4 text-lg font-medium">Add New Coupon</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <input
          className="rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Coupon Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Coupon Code"
          value={form.code}
          onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
          required
        />
        <input
          className="rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Discount %"
          type="number"
          value={form.discount}
          onChange={e => setForm({ ...form, discount: e.target.value })}
          required
        />
        <input
          className="rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Max Usage"
          type="number"
          value={form.maxUsage}
          onChange={e => setForm({ ...form, maxUsage: e.target.value })}
          required
        />
        <input
          className="rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          type="date"
          value={form.expiryDate}
          onChange={e => setForm({ ...form, expiryDate: e.target.value })}
          required
        />
        <div className="flex gap-2 md:col-span-5">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Create Coupon
          </button>
          <button
            type="button"
            onClick={() => onSuccess()}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
