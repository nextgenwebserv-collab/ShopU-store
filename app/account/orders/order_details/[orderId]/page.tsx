'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navroute from '@/app/components/Navroute';
import { CheckCircle, PackageCheck, Truck, MapPin, Loader, Phone, User } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

interface OrderItem {
  id: string;
  product: Product;
  price: number;
  quantity: number;
}

interface User {
  name: string;
  phoneNumber: string;
  addresses?: string;
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
  user: User;
}

const steps = [
  { label: 'Confirmed', icon: <CheckCircle className="h-7 w-7 text-white" /> },
  { label: 'Packed', icon: <PackageCheck className="h-7 w-7 text-white" /> },
  { label: 'Out For Delivery', icon: <Truck className="h-7 w-7 text-white" /> },
  { label: 'Arriving', icon: <MapPin className="h-7 w-7 text-white" /> },
];

const statusMap: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Confirmed',
  SHIPPED: 'Packed',
  OUT_FOR_DELIVERY: 'Out For Delivery',
  DELIVERED: 'Arriving',
};

export default function OrderDetails() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`, {
          credentials: 'include',
        });
        if (res.status === 401) {
          router.push('/');
          toast.error('Please login first.');
          return;
        }
        const data = await res.json();
        if (data?.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Navroute />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
            <p className="mt-4 text-gray-600">Loading your order details...</p>
          </div>
        </div>
      </Suspense>
    );
  }

  if (!order) {
    return <div className="min-h-[70vh] py-10 text-center text-gray-600">Order not found.</div>;
  }

  const mappedStatus = statusMap[order.status] || 'Pending';
  const currentStepIndex = steps.findIndex(step => step.label === mappedStatus);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

  return (
    <>
      <Navroute />
      {/* Desktop view */}
      <div className="hidden sm:block">
        <div>
          <div className="mx-auto max-w-7xl px-16 py-8 text-gray-800">
            <h2 className="text-primaryColor mb-4 text-xl font-semibold">
              Order <span className="text-secondaryColor">Details</span>
              <hr className="bg-background1 mt-1 h-1 w-32 rounded border-0" />
            </h2>

            <div className="flex justify-between">
              <div className="mt-4">
                <h3 className="mb-4 text-xl font-semibold">Order ID : #ORD{order.id.slice(-10)}</h3>
                <p className="text-primaryColor mt-1 text-sm">
                  Order date: <span className="text-gray-800">{formattedDate}</span> |
                  <span className="ml-2 text-green-600">Estimated delivery: {formattedDate}</span>
                </p>
              </div>
              <div className="mt-6 flex gap-4">
                <button className="border-primaryColor rounded border-2 px-8 text-gray-700">
                  📄 Invoice
                </button>
                <button className="bg-background1 rounded px-8 text-white">Need Help ?</button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mt-8 flex items-center justify-between rounded px-4 py-10">
              {/* Progress Lines */}
              {steps.slice(0, -1).map((_, index) => {
                const isCompleted = index < currentStepIndex;
                return (
                  <div
                    key={index}
                    className={`absolute top-1/2 z-0 mt-0.5 h-1 w-[25%] -translate-y-1/2 ${isCompleted ? 'bg-green-600' : 'bg-background1'}`}
                    style={{ left: `${12.5 + index * 25}%` }}
                  ></div>
                );
              })}

              {/* Step Circles */}
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isPending = step.label === 'Confirmed' && order.status === 'PENDING';

                return (
                  <div key={index} className="z-10 flex w-1/4 flex-col items-center text-center">
                    <span
                      className={`mb-2 text-sm font-semibold ${
                        isPending
                          ? 'text-green-600'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-primaryColor'
                      }`}
                    >
                      {isPending ? 'Pending' : step.label}
                    </span>
                    <div
                      className={`rounded-full p-2 ${
                        isPending ? 'bg-green-600' : isCompleted ? 'bg-green-600' : 'bg-background1'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className="mt-2 text-xs text-gray-600">Step {index + 1}</span>
                  </div>
                );
              })}
            </div>

            {/* Order Items */}
            {order.orderItems.map(item => (
              <div
                key={item.id}
                className="text-md my-12 flex items-center justify-between rounded bg-white px-16 py-3 font-medium shadow-sm"
              >
                <h3>#ORD{order.id.slice(-10)}</h3>
                <div className="flex items-center space-x-4">
                  <Image
                    src={item.product?.imageUrl || '/placeholder.png'}
                    alt={item.product?.name || 'Product Image'}
                    width={60}
                    height={60}
                    className="h-16 w-12 object-contain"
                  />
                </div>
                <div>
                  <p>{item.product?.name}</p>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div>
                  <p className="text-primaryColor">₹{item.price}</p>
                </div>
                <div className="text-right">
                  <p className={`text-md px-4 py-4 font-medium ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase().split('_').join(' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Customer Info */}
        <div>
          <h4 className="mb-8 px-20 text-xl font-semibold">Customer Details</h4>
          <div className="bg-background1">
            <div className="text-md mx-auto flex max-w-7xl flex-wrap justify-around gap-16 rounded px-18 py-8 text-white">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{order.user.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>+91 {order.user.phoneNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-white" />
                <span>{order.user.addresses || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        <div className="mx-auto max-w-md px-4 py-6 text-gray-800">
          <h2 className="text-primaryColor mb-6 text-lg font-semibold">
            Order <span className="text-secondaryColor">Details</span>
            <hr className="bg-background1 mt-1 w-28 rounded border-2" />
          </h2>

          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Order ID : #ORD{order.id.slice(-10)}</h3>
            <p className="text-primaryColor mt-1 text-sm">
              Order date: <span className="text-gray-800">{formattedDate}</span> |
              <span className="ml-2 text-green-600">Estimated delivery: {formattedDate}</span>
            </p>
          </div>

          {/* Invoice + Help Buttons */}
          <div className="mx-auto mt-8 w-52">
            <button className="border-primaryColor text-md mb-5 w-full rounded border py-2 text-gray-700">
              📄 Invoice
            </button>
            <button className="bg-background1 text-md w-full rounded py-2 text-white">
              Need Help ?
            </button>
          </div>

          <div className="relative mt-16 ml-10">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isNextCompleted = index + 1 <= currentStepIndex;
              const isLast = index === steps.length - 1;
              const isPending = step.label === 'Confirmed' && order.status === 'PENDING';

              return (
                <div key={index} className="relative flex items-start pb-18">
                  {!isLast && (
                    <div
                      className={`absolute top-8 left-[22px] h-full w-1 ${
                        isNextCompleted ? 'bg-green-600' : 'bg-background1'
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${
                      isPending ? 'bg-green-600' : isCompleted ? 'bg-green-600' : 'bg-background1'
                    }`}
                  >
                    {step.icon}
                  </div>

                  <div className="ml-4">
                    <p
                      className={`text-md font-semibold ${
                        isPending
                          ? 'text-green-600'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-primaryColor'
                      }`}
                    >
                      {isPending ? 'Pending' : step.label}
                    </p>
                    <p className="text-sm whitespace-pre-line text-gray-500">Step {index + 1}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Item Card */}
          {order.orderItems.map(item => (
            <div key={item.id} className="mb-6 rounded-lg bg-white px-6 py-4 shadow-sm">
              <div className="text-md mb-2 flex justify-between text-gray-600">
                <span className="font-medium text-black">#ORD{order.id.slice(-10)}</span>
                <span className="text-lg font-medium text-black">Qty: {item.quantity}</span>
              </div>
              <div className="mb-4 flex items-center gap-4 border-b border-gray-200 py-4">
                <Image
                  src={item.product?.imageUrl || '/pediasure.png'}
                  alt={
                    item.product?.name.length > 10
                      ? item.product?.name.slice(0, 10) + '…'
                      : item.product?.name || 'Product Image'
                  }
                  width={60}
                  height={60}
                  className="mb-2 w-16 rounded"
                />
                <div className="text-md flex-1 text-gray-800">
                  <h2 className="pr-2 font-medium">{item.product?.name}</h2>
                </div>
                <div className="flex justify-between text-lg text-gray-800">
                  <span className="text-primaryColor">₹{item.price}</span>
                </div>
              </div>
              <span
                className={`text-md rounded px-3 py-1 font-medium ${getStatusColor(order.status)}`}
              >
                {order.status.toUpperCase().split('_').join(' ')}
              </span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="mb-6 px-6 text-xl font-semibold">Customer Details</h4>
          <div className="bg-background1">
            <div className="flex flex-col gap-6 px-8 py-4 text-lg text-white">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6" />
                <span>{order.user.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-6 w-6" />
                <span>+91 {order.user.phoneNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-white" />
                <span>{order.user.addresses || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
