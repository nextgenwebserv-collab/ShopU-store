'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import Navroute from '@/app/components/Navroute';

interface Product {
  name: string;
  imageUrl: string;
}

interface OrderItem {
  productId: string;
  price: number;
  quantity: number;
  image?: string;
  product?: Product;
}

interface Order {
  id: string;
  userId: string;
  orderItems?: OrderItem[];
  totalAmount: number;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) {
          const err = await res.json();
          if (res.status === 401) {
            router.push('/');
            toast.error('Please login first.');
          } else {
            toast.error(err.message || 'Something went wrong');
          }
          return;
        }
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-indigo-500';
      case 'shipped':
        return 'text-purple-600';
      case 'out_for_delivery':
        return 'text-orange-600';
      case 'delivered':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  const handleCardClick = (orderId: string) => {
    router.push(`/account/orders/order_details/${orderId}`);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Navroute />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {isLoading ? (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-4 text-gray-600">Loading your orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <p className="min-h-[70vh] text-center text-gray-500">You have no orders.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden px-13 sm:block">
              <h2 className="text-primaryColor mb-4 text-xl font-semibold">
                Order <span className="text-secondaryColor">List</span>
                <hr className="bg-background1 mt-1 h-1 w-24 rounded border-0" />
              </h2>
              <table className="min-w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-md bg-[#D5F3F6] text-center text-gray-800">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {orders.flatMap(order =>
                    (order.orderItems ?? []).map((item, index) => (
                      <tr
                        key={`${order.id}-${index}`}
                        className="text-md rounded-md text-center shadow-sm shadow-gray-300"
                      >
                        <td className="p-4 text-gray-700">#ORD{order.id.slice(-10)}</td>
                        <td className="flex items-center justify-center gap-3 p-4">
                          <Image
                            src={item.product?.imageUrl || '/placeholder.png'}
                            alt={
                              item.product?.name
                                ? item.product.name.length > 5
                                  ? item.product.name.slice(0, 5) + '...'
                                  : item.product.name
                                : 'Product'
                            }
                            width={55}
                            height={55}
                            className="rounded"
                            onClick={() => handleCardClick(order.id)}
                          />
                        </td>
                        <td className="text-primaryColor p-4 font-medium">₹{item.price}</td>
                        <td className="p-4">{item.quantity}</td>
                        <td className="p-4">{formatDate(order.createdAt)}</td>
                        <td className={`p-4 font-medium ${getStatusColor(order.status)}`}>
                          {order.status?.toUpperCase().split('_').join(' ')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 sm:hidden">
              <h2 className="text-primaryColor mb-4 text-lg font-medium">
                Order <span className="text-secondaryColor">List</span>
                <hr className="bg-background1 mt-1 h-1 w-24 rounded border-0" />
              </h2>
              {orders.flatMap(order =>
                (order.orderItems ?? []).map((item, index) => (
                  <div
                    key={`${order.id}-${index}`}
                    className="mb-6 rounded-lg bg-white px-6 py-4 shadow-sm"
                  >
                    <div className="text-md mb-2 flex justify-between text-gray-600">
                      <span className="font-medium text-black">#ORD{order.id.slice(-10)}</span>
                      <span className="text-lg font-medium text-black">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div
                      onClick={() => handleCardClick(order.id)}
                      className="mb-4 flex items-center gap-6 border-b border-gray-200 py-4"
                    >
                      <Image
                        src={item.product?.imageUrl || '/Placeholder.png'}
                        alt={
                          item.product?.name
                            ? item.product.name.length > 15
                              ? item.product.name.slice(0, 15) + '...'
                              : item.product.name
                            : 'Product'
                        }
                        width={60}
                        height={60}
                        className="rounded"
                      />
                      <div className="text-md flex-1 text-gray-800">
                        <h2 className="pr-2 font-medium">{item.product?.name}</h2>
                        <h2 className="text-lg">Qty: {item.quantity}</h2>
                      </div>
                      <div className="flex justify-between text-lg text-gray-800">
                        <span className="text-primaryColor">₹{item.price}</span>
                      </div>
                    </div>
                    <span className={`p-4 font-medium ${getStatusColor(order.status)}`}>
                      {order.status?.toUpperCase().split('_').join(' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </Suspense>
  );
}
