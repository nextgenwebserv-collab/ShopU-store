'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, Loader, AlertCircle, Truck } from 'lucide-react';
import OrderStatusUpdater from '@/app/components/OrderStatusUpdater';
import LiveTracking from '@/app/components/LiveTracking';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  status: string;
  product?: {
    name?: string;
    productImage?: { url: string }[];
  } | null;
  trackingNumber?: string | null;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string | null;
  user?: {
    id: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  address?: {
    fullName?: string;
    phoneNumber?: string;
    addressLine1?: string;
    addressLine2?: string | null;
    city?: string;
    state?: string;
    postalCode?: string;
  } | null;
  orderItems: OrderItem[];
  payments?: {
    id: string;
    amount: number;
    status: string;
    provider: string;
    createdAt: string;
  }[];
}

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/admin/orders/${id}`);
        const data = await res.json();
        // console.log("arbazz", data)
        if (!res.ok || !data.success || !data.order) {
          throw new Error(data.message || 'Failed to load order data');
        }

        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) fetchOrderDetails();
  }, [id]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusColor = (status: string = '') => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (order) {
      setOrder({ ...order, status: newStatus });
    }
  };

  const handleItemStatusUpdate = (itemId: string, newStatus: string) => {
    if (order) {
      const updatedItems = order.orderItems.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      );
      setOrder({ ...order, orderItems: updatedItems });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-lg bg-red-100 p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h3 className="mt-2 text-lg font-semibold text-gray-800">Error</h3>
          <p className="text-sm text-gray-600">{error || 'Order not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded bg-teal-600 px-4 py-2 text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      <div className="mb-6 flex flex-col justify-between md:flex-row">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(-6)}</h1>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Calendar className="mr-1 h-4 w-4" />
            {formatDate(order.createdAt)}
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <p className="mb-1 text-sm font-semibold text-gray-700">Order Status</p>
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            onStatusChange={handleStatusUpdate}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-medium">Customer</h2>
          {order.user ? (
            <div>
              <p className="font-semibold">{order.user.name || 'N/A'}</p>
              <p className="text-sm text-gray-600">{order.user.email || 'N/A'}</p>
              <p className="text-sm text-gray-600">{order.user.phoneNumber || 'N/A'}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Customer data not available</p>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-medium">Shipping Address</h2>
          {order.address ? (
            <div className="text-sm text-gray-700">
              <p>{order.address.fullName}</p>
              <p>{order.address.phoneNumber}</p>
              <p>{order.address.addressLine1}</p>
              {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
              <p>
                {order.address.city}, {order.address.state} {order.address.postalCode}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">Address not available</p>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-medium">Payment Info</h2>
          <p className="text-sm">Method: {order.paymentMethod}</p>
          <p className="text-sm">Total: ₹{Number(order.totalAmount).toFixed(2)}</p>
          {order.payments?.length ? (
            <div className="mt-2 border-t pt-2 text-sm">
              {order.payments.map(payment => (
                <div key={payment.id} className="mb-1">
                  <div className="flex justify-between">
                    <span>{payment.provider}</span>
                    <span>₹{payment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                    <span className={`rounded px-2 py-0.5 ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {order.trackingNumber && (
        <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-medium">Tracking</h2>
          <p className="flex items-center gap-2 text-sm text-gray-700">
            <Truck className="h-4 w-4" />
            {order.trackingNumber}
          </p>
          <div className="mt-4">
            <LiveTracking awb={order.trackingNumber} orderId={order.id} isAdmin />
          </div>
        </div>
      )}

      <div className="mt-6 rounded-lg border bg-white shadow-sm">
        <h2 className="border-b bg-gray-50 px-6 py-3 text-lg font-semibold">Order Items</h2>
        <ul className="divide-y">
          {order.orderItems.map(item => (
            <li key={item.id} className="flex flex-col p-6 sm:flex-row">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-md border bg-gray-100">
                {item.product?.productImage?.[0]?.url ? (
                  <Image
                    src={item.product.productImage[0].url}
                    alt={item.product.name || 'Product'}
                    fill
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-base font-semibold">
                  {item.product?.name || 'Unnamed product'}
                </h3>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                <p className="mt-1 text-sm font-medium text-gray-800">₹{item.price}</p>
                {item.trackingNumber && (
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Truck className="mr-1 h-4 w-4" />
                    {item.trackingNumber}
                  </div>
                )}
                <div className="mt-3">
                  <OrderStatusUpdater
                    orderId={order.id}
                    itemId={item.id}
                    currentStatus={item.status}
                    onStatusChange={newStatus => handleItemStatusUpdate(item.id, newStatus)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
