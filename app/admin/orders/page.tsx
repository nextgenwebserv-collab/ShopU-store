'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Filter, Loader, Package } from 'lucide-react';
import OrderStatusUpdater from '../../components/OrderStatusUpdater';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: {
    id: string;
    product: {
      name: string;
    };
  }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filterStatus) {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || 'Failed to load orders');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Error fetching orders:', err);
      } else {
        setError('An unexpected error occurred.');
        console.error('Unknown error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2">{error}</p>
        <button onClick={fetchOrders} className="mt-4 rounded-md bg-teal-600 px-4 py-2 text-white">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>

        <p>Track and manage all customer orders across medicine and supply categories.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium">Filter by status:</span>
        </div>
        <select
          value={filterStatus}
          onChange={e => {
            setFilterStatus(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="rounded-md border px-3 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      <Package className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="mt-2">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-blue-600">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          #{order.id.slice(-6)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{order.user.name}</div>
                        <div className="text-xs text-gray-500">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusUpdater
                          orderId={order.id}
                          currentStatus={order.status}
                          onStatusChange={newStatus => handleStatusChange(order.id, newStatus)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-teal-600 hover:text-teal-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="rounded-md border border-gray-300 p-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center rounded-md border border-gray-300 px-4 py-2">
                  <span className="text-sm">
                    {pagination.page} / {pagination.pages}
                  </span>
                </div>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="rounded-md border border-gray-300 p-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
