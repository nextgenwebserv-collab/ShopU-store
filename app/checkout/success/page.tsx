'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Loader } from 'lucide-react';

// Create a separate component that uses useSearchParams
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const paymentMethod = searchParams.get('method');
  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If this was a real implementation, we would check the payment status here
    async function verifyPayment() {
      if (!orderId || !paymentId) return;

      setIsLoading(true);
      try {
        // Simulate payment verification
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Payment verification failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    verifyPayment();
  }, [orderId, paymentId]);

  const handleCardClick = (orderId: string) => {
    router.push(`/account/orders/order_details/${orderId}`);
  };
  return (
    <div className="min-h-[70vh] px-4 py-12">
      <div className="mx-auto max-w-xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="mb-4 h-12 w-12 animate-spin text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-700">Verifying your payment...</h2>
            <p className="mt-2 text-gray-500">Please wait while we confirm your order.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="mb-6 text-teal-500">
                <CheckCircle2 className="h-16 w-16" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-800">Order Placed Successfully!</h1>
              <p className="mb-6 text-center text-gray-600">
                {paymentMethod === 'cod'
                  ? 'Your order has been placed. We will deliver it to your doorstep soon!'
                  : 'Your payment was successful and your order has been placed.'}
              </p>

              {orderId && (
                <div className="mb-6 w-full rounded-lg bg-gray-50 p-4 text-center">
                  <p className="mb-2 text-sm text-gray-500">Order Reference</p>
                  <p className="font-mono font-medium text-gray-800">{orderId}</p>
                </div>
              )}

              {/* Desktop view */}
              <div className="flex hidden w-full items-center justify-center gap-8 text-sm text-white sm:flex">
                <Link
                  href="/"
                  className="bg-background1 inline-flex cursor-pointer items-center gap-1 rounded-lg p-3 transition-all hover:scale-102"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Home
                </Link>

                {orderId && (
                  <button
                    onClick={() => handleCardClick(orderId)}
                    className="bg-background1 inline-flex cursor-pointer items-center gap-2 rounded-lg p-3 transition-all hover:scale-102"
                  >
                    Check Order Status
                  </button>
                )}
              </div>

              {/* Mobile view */}
              <div className="flex w-full items-center justify-center gap-6 text-sm text-white sm:hidden">
                <Link
                  href="/"
                  className="bg-background1 inline-flex items-center gap-1 rounded-lg p-3 text-center"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Home
                </Link>

                {orderId && (
                  <button
                    onClick={() => handleCardClick(orderId)}
                    className="bg-background1 inline-flex items-center gap-2 rounded-lg px-2 py-3"
                  >
                    Check Order Status
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
            <p className="mt-4 text-gray-600">Loading order confirmation...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
