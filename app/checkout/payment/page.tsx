'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/app/hooks/useCart';
import { useLocation } from '@/app/context/LocationContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader, MapPin, CreditCard } from 'lucide-react';
import {
  VisaIcon,
  MastercardIcon,
  MaestroIcon,
  AmexIcon,
  UpiIcon,
} from '@/app/components/ui/PaymentIcons';
import { mapPaymentStatusToOrderStatus } from '@/lib/payment-utils';
import { prepareOrderItems, validateCartItems, logCheckoutEvent } from '@/lib/checkout-utils';
import Navroute from '@/app/components/Navroute';

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

type Address = {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
};

// Create a separate component that uses useSearchParams
function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cartItems, clearCart, isLoading } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<string>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const isAddressLoading = false;
  const { addressId } = useLocation();
  const selectedAddressId = searchParams.get('addressId') || addressId;
  const [addressDetails, setAddressDetails] = useState<Address | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('selectedAddress');
    if (stored) {
      try {
        setAddressDetails(JSON.parse(stored) as Address);
      } catch (err) {
        console.error('Failed to parse stored address', err);
      }
    }
  }, []);

  // Calculate amount
  useEffect(() => {
    if (cartItems.length > 0) {
      const total = cartItems.reduce((sum, item) => {
        const price = Number(item.product?.price || item.medicine?.price || 0);
        return sum + price * item.quantity;
      }, 0);
      setAmount(total);
    } else if (searchParams.get('amount')) {
      setAmount(parseFloat(searchParams.get('amount') || '0'));
    }
  }, [cartItems, searchParams]);

  const deliveryFee = (() => {
    if (amount < 200) return 49;
    if (amount < 300) return 28;
    return 0;
  })();

  // Example: platform charges fixed ₹9
  const platformFee = 9;

  const grandTotal = amount + deliveryFee + platformFee;

  // Redirect to /checkout if no address selected
  useEffect(() => {
    if (!isLoading && !isAddressLoading && !selectedAddressId) {
      router.push('/checkout');
    }
  }, [isLoading, isAddressLoading, selectedAddressId, router]);

  // Redirect to home if cart empty
  useEffect(() => {
    if (!isLoading && cartItems.length === 0 && !searchParams.get('amount')) {
      router.push('/');
    }
  }, [isLoading, cartItems, router, searchParams]);

  useEffect(() => {
    setError(null);
  }, [selectedMethod]);

  // Add a function to ensure Razorpay is loaded properly
  const ensureRazorpayLoaded = (): Promise<boolean> => {
    return new Promise(resolve => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentProcessing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      if (!selectedAddressId || !addressDetails) {
        setError('Please select a delivery address first');
        setIsProcessing(false);
        return;
      }

      if (!amount || amount <= 0) {
        setError('Invalid order amount');
        setIsProcessing(false);
        return;
      }

      if (!validateCartItems(cartItems)) {
        setError('Invalid cart items. Please try adding items to your cart again.');
        setIsProcessing(false);
        return;
      }

      // Prepare validated order items
      const validItems = prepareOrderItems(cartItems);
      if (validItems.length === 0) {
        setError('No valid items in cart');
        setIsProcessing(false);
        return;
      }

      const addressData = { id: selectedAddressId };

      logCheckoutEvent('Processing payment', {
        address: addressData,
        totalAmount: grandTotal,
        paymentMethod: selectedMethod,
        itemCount: validItems.length,
      });

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: addressData,
          totalAmount: grandTotal,
          paymentMethod: selectedMethod === 'cod' ? 'COD' : 'ONLINE',
          items: validItems,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(
          errorData.error || `Order creation failed with status: ${orderResponse.status}`
        );
      }

      const orderData = await orderResponse.json();
      if (!orderData.success) throw new Error(orderData.error || 'Order creation failed');

      const createdOrderId = orderData.orderId || orderData.order?.id;
      if (!createdOrderId) throw new Error('No order ID returned from API');

      if (selectedMethod === 'cod') {
        await clearCart();
        router.push('/checkout/success?method=cod&orderId=' + createdOrderId);
        return;
      }

      const response = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrderId,
          amount: grandTotal,
          currency: 'INR',
          paymentMethod: selectedMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Payment gateway error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Payment gateway initiation failed');
      }

      // Ensure Razorpay is loaded
      const isRazorpayLoaded = await ensureRazorpayLoaded();
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please try again.');
      }

      console.log('Initializing Razorpay with options:', {
        ...data,
        key: '***hidden***',
        amount: data.amount,
        order_id: data.order_id,
      });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: data.name || 'ShopU',
        description: data.description || `Payment for order ${createdOrderId}`,
        order_id: data.order_id,
        prefill: data.prefill || {},
        notes: {
          ...(data.notes || {}),
          paymentMethod: selectedMethod,
        },
        theme: data.theme || { color: '#0d9488' },
        handler: (response: RazorpayHandlerResponse) => {
          handlePaymentSuccess(response, createdOrderId);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            handlePaymentCancellation(createdOrderId);
          },
        },
      };

      try {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (razorpayError) {
        console.error('Razorpay initialization error:', razorpayError);
        throw new Error('Could not open payment gateway. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (response: RazorpayHandlerResponse, orderId: string) => {
    try {
      await fetch('/api/payment/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          providerPaymentId: response.razorpay_payment_id,
          status: 'SUCCESS',
          provider: 'RAZORPAY',
          metadata: {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            paymentMethod: selectedMethod,
            statusMapped: mapPaymentStatusToOrderStatus('SUCCESS', 'RAZORPAY'),
          },
        }),
      });

      await clearCart();
      router.push('/checkout/success?method=online&orderId=' + orderId);
    } catch (error) {
      console.error('Callback error:', error);
      await clearCart();
      router.push('/checkout/success?method=online&orderId=' + orderId);
    }
  };

  const handlePaymentCancellation = async (orderId: string) => {
    try {
      await fetch('/api/payment/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: 'CANCELLED',
          provider: 'RAZORPAY',
          metadata: {
            cancelledAt: new Date().toISOString(),
            reason: 'User cancelled payment',
            paymentMethod: selectedMethod,
            statusMapped: mapPaymentStatusToOrderStatus('CANCELLED', 'RAZORPAY'),
          },
        }),
      });
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-xl bg-gray-50">
      {/* <header className="bg-white shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
          </div>
        </div>
      </header> */}
      <Navroute />
      <div className="container mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            {/* Address */}
            <div className="rounded-lg bg-white p-4 shadow-md">
              <h2 className="mb-2 text-lg font-medium text-gray-800">Delivery Address</h2>
              {addressDetails ? (
                <div className="flex items-start gap-3 rounded-lg border border-teal-100 bg-teal-50 p-4">
                  <MapPin className="text-primaryColor mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{addressDetails?.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {addressDetails?.addressLine1}
                      {addressDetails?.addressLine2 ? `, ${addressDetails.addressLine2}` : ''},{' '}
                      {addressDetails?.city}, {addressDetails?.state} {addressDetails?.postalCode}
                    </p>
                    <p className="text-sm text-gray-600">+91 {addressDetails?.phoneNumber}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-yellow-800">No delivery address selected.</p>
                  <button
                    onClick={() => router.push('/checkout')}
                    className="mt-2 text-sm text-teal-600 hover:underline"
                  >
                    Go back to select an address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-medium text-gray-800">Payment Method</h2>
              <form onSubmit={handlePaymentProcessing}>
                <div className="mb-6 space-y-3">
                  {/* Card */}
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment-method"
                        value="card"
                        checked={selectedMethod === 'card'}
                        onChange={() => setSelectedMethod('card')}
                        className="h-4 w-4 text-teal-600"
                        disabled={isProcessing}
                      />
                      <span className="ml-3 text-gray-700">Credit or Debit Card</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <VisaIcon className="h-5" />
                      <MastercardIcon className="h-5" />
                      <MaestroIcon className="h-5" />
                      <AmexIcon className="h-5" />
                    </div>
                  </label>

                  {/* UPI */}
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment-method"
                        value="upi"
                        checked={selectedMethod === 'upi'}
                        onChange={() => setSelectedMethod('upi')}
                        className="h-4 w-4 text-teal-600"
                        disabled={isProcessing}
                      />
                      <span className="ml-3 text-gray-700">UPI</span>
                    </div>
                    <UpiIcon className="h-6" />
                  </label>

                  {/* COD */}
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment-method"
                        value="cod"
                        checked={selectedMethod === 'cod'}
                        onChange={() => setSelectedMethod('cod')}
                        className="h-4 w-4 text-teal-600"
                        disabled={isProcessing}
                      />
                      <span className="ml-3 text-gray-700">Cash on Delivery</span>
                    </div>
                    <div className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                      Available
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !addressDetails}
                  className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3 font-medium transition-colors ${addressDetails && !isProcessing ? 'bg-background1 text-white' : 'cursor-not-allowed bg-gray-200 text-gray-500'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {selectedMethod === 'cod' ? 'Placing Order...' : 'Processing Payment...'}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pay Now - ₹{grandTotal.toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="sticky top-4 rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-medium text-gray-800">Order Summary</h2>
              <div className="mb-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600' : 'text-gray-800'}>
                    {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Charges</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-lg">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Inclusive of all taxes</p>
                </div>
              </div>

              {cartItems.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-800">Items</h3>
                  <div className="max-h-60 space-y-2 overflow-auto pr-2">
                    {cartItems.map(item => {
                      const name = item.product?.name || item.medicine?.name || 'Item';
                      const price = Number(item.product?.price || item.medicine?.price || 0);
                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {name} x {item.quantity}
                          </span>
                          <span>₹{(price * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
            <p className="mt-4 text-gray-600">Loading payment page...</p>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
