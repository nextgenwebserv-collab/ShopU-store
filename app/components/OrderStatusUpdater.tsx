'use client';

import { useState } from 'react';
import { Check, Loader } from 'lucide-react';

interface OrderStatusUpdaterProps {
  orderId: string;
  itemId?: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

export default function OrderStatusUpdater({
  orderId,
  itemId,
  currentStatus,
  onStatusChange,
}: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/orders/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          itemId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setStatus(newStatus);
      setSuccess(true);
      if (onStatusChange) onStatusChange(newStatus);

      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <select
          value={status}
          onChange={e => handleStatusChange(e.target.value)}
          disabled={loading}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>
              {option.replace('_', ' ')}
            </option>
          ))}
        </select>

        {loading && <Loader className="h-4 w-4 animate-spin text-blue-500" />}
        {success && <Check className="h-4 w-4 text-green-500" />}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
