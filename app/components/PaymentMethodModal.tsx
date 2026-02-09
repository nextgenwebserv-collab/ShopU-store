'use client';

import { useState, useEffect } from 'react';
import { X, Loader, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/hooks/useCart';
import { useLocation } from '@/app/context/LocationContext';
import { VisaIcon, MastercardIcon, MaestroIcon, AmexIcon, UpiIcon } from './ui/PaymentIcons';
import { mapPaymentStatusToOrderStatus } from '@/lib/payment-utils';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  amount: number;
  selectedAddressId?: string;
}

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
}

interface AddressDetails {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber?: string;
}
export default function PaymentMethodModal({
  isOpen,
  onCloseAction,
  amount,
  selectedAddressId,
}: PaymentMethodModalProps) {
  const { cartItems, clearCart } = useCart();
  const { location, setAddressId } = useLocation();
  const [selectedMethod, setSelectedMethod] = useState<string>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null);
  const router = useRouter();

  // Fetch the selected address details if we have an ID
  useEffect(() => {
    async function fetchAddressDetails() {
      if (selectedAddressId) {
        try {
          const response = await fetch(`/api/addresses/${selectedAddressId}`);
          const data = await response.json();

          if (data.success) {
            setAddressDetails(data.address);
            // Make sure location context is updated with this address
            setAddressId(selectedAddressId);
          }
        } catch (error) {
          console.error('Failed to fetch address details:', error);
        }
      }
    }

    if (isOpen && selectedAddressId) {
      fetchAddressDetails();
    }
  }, [isOpen, selectedAddressId, setAddressId]);

  useEffect(() => {
    setError(null);
  }, [selectedMethod]);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle backdrop click - only close if clicking the backdrop itself AND not processing
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Don't close if we're processing a payment
    if (isProcessing) {
      return;
    }

    // Only close if clicking the backdrop itself (not any child elements)
    if (e.target === e.currentTarget) {
      onCloseAction();
    }
  };

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

  const handlePaymentSelection = async (e: React.MouseEvent) => {
    // Prevent all event propagation
    e.preventDefault();
    e.stopPropagation();

    console.log('Selected payment method:', selectedMethod);
    setIsProcessing(true);
    setError(null);

    try {
      // Check if we have valid address info from either source
      const hasValidAddress =
        (selectedAddressId && addressDetails) || (location && location.address);
      console.log('Selected address ID:', selectedAddressId);

      if (!hasValidAddress) {
        setError('Please select a delivery address first');
        setIsProcessing(false);
        return;
      }

      if (!amount || amount <= 0) {
        setError('Invalid order amount');
        setIsProcessing(false);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        setError('No items in cart');
        setIsProcessing(false);
        return;
      }

      // Close the cart modal but NOT the payment modal
      const closeCartEvent = new CustomEvent('closeCartModal');
      window.dispatchEvent(closeCartEvent);

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.product?.id || item.productId,
        medicineId: item.medicine?.id || item.medicineId,
        quantity: item.quantity,
        price: item.product?.price || item.medicine?.price || 0,
        combinationId: item.combinationId || null,
      }));

      const validItems = orderItems.filter(
        item =>
          (item.productId || item.medicineId) &&
          item.quantity > 0 &&
          typeof item.price === 'number' &&
          item.price > 0
      );

      if (validItems.length === 0) {
        setError('Invalid cart items');
        setIsProcessing(false);
        return;
      }

      // Prepare the address data
      let addressData;
      if (selectedAddressId && addressDetails) {
        addressData = { id: selectedAddressId };
      } else {
        addressData = {
          fullAddress: location?.address,
          pincode: location?.pincode,
        };
      }

      // Create the order first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: addressData,
          totalAmount: amount,
          paymentMethod: selectedMethod === 'cod' ? 'COD' : 'ONLINE',
          items: validItems,
        }),
      });

      console.log('Order response:', orderResponse);
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const createdOrderId = orderData.orderId || orderData.order?.id;
      if (!createdOrderId) {
        throw new Error('No order ID returned from API');
      }

      // Handle COD orders
      if (selectedMethod === 'cod') {
        await clearCart();
        onCloseAction();
        router.push('/checkout/success?method=cod&orderId=' + createdOrderId);
        return;
      }

      // For online payments (card and UPI), initialize Razorpay
      const response = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrderId,
          amount: amount,
          currency: 'INR',
          paymentMethod: selectedMethod,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('Payment initiation failed:', data);
        throw new Error(data.error || 'Payment initiation failed. Please try again.');
      }

      // Ensure Razorpay is loaded
      const isLoaded = await ensureRazorpayLoaded();

      if (!isLoaded || typeof window === 'undefined' || typeof window.Razorpay === 'undefined') {
        throw new Error('Payment gateway not loaded. Please refresh and try again.');
      }

      // Define RazorpayHandlerResponse interface for the payment response
      interface RazorpayHandlerResponse {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }

      // Create the options object with proper typing
      const options: RazorpayOptions = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.order_id,
        prefill: data.prefill || {},
        notes: {
          ...(data.notes || {}),
          paymentMethod: selectedMethod,
        },
        theme: data.theme || { color: '#0d9488' },
        handler: function (response: RazorpayHandlerResponse) {
          handlePaymentSuccess(response, createdOrderId);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            handlePaymentCancellation(createdOrderId);
          },
        },
      };

      console.log('Initializing Razorpay with options:', { ...options, key: '***hidden***' });

      // Initialize Razorpay
      try {
        const razorpay = new window.Razorpay(options);
        razorpay.open();

        // DON'T close the payment modal here - it will be closed in the success handler
      } catch (razorpayError) {
        console.error('Razorpay error:', razorpayError);
        setError('Failed to open payment gateway. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setError(
        error instanceof Error ? error.message : 'Payment processing error. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  // Modify the handlePaymentSuccess function to properly handle the response
  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  const handlePaymentSuccess = async (
    response: RazorpaySuccessResponse,
    orderId: string
  ): Promise<void> => {
    console.log('Payment successful:', response);
    try {
      // Update payment status via callback
      const callbackResponse = await fetch('/api/payment/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
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

      if (!callbackResponse.ok) {
        console.error('Payment callback returned error:', await callbackResponse.json());
        setError(
          'Payment was processed but we could not update your order status. Please contact support.'
        );
        return;
      }

      // Clear cart and close modal
      await clearCart();
      onCloseAction();

      // Redirect to success page
      router.push('/checkout/success?method=online&orderId=' + orderId);
    } catch (error) {
      console.error('Payment callback error:', error);
      // Still clear cart and redirect as payment was processed
      await clearCart();
      onCloseAction();
      router.push('/checkout/success?method=online&orderId=' + orderId);
    }
  };

  const handlePaymentCancellation = async (orderId: string) => {
    try {
      await fetch('/api/payment/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
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
      console.error('Payment cancellation error:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="animate-slideUp relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-gray-200 p-4">
          <button
            onClick={onCloseAction}
            className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-800">Payment Method</h2>
          <p className="mt-1 text-sm text-gray-600">Total: ₹{amount.toFixed(2)}</p>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Address Info */}
          <div
            className={`border ${
              location?.address || (selectedAddressId && addressDetails)
                ? 'border-green-100 bg-green-50'
                : 'border-amber-100 bg-amber-50'
            } mb-4 rounded-lg p-3`}
          >
            <div className="flex items-start gap-2">
              <MapPin
                className={`h-5 w-5 ${
                  location?.address || (selectedAddressId && addressDetails)
                    ? 'text-green-500'
                    : 'text-amber-500'
                } mt-0.5`}
              />
              <div>
                <h4
                  className={`text-sm font-medium ${
                    location?.address || (selectedAddressId && addressDetails)
                      ? 'text-green-700'
                      : 'text-amber-700'
                  }`}
                >
                  {location?.address || (selectedAddressId && addressDetails)
                    ? 'Delivery address selected'
                    : 'No delivery address selected'}
                </h4>
                {addressDetails ? (
                  <p className="mt-1 text-xs text-green-600">
                    {addressDetails.fullName}, {addressDetails.addressLine1}, {addressDetails.city}
                  </p>
                ) : location?.address ? (
                  <p className="mt-1 text-xs text-green-600">
                    {typeof location.address === 'string'
                      ? location.address
                      : `${location.address.addressLine1}, ${location.address.city}`}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-amber-600">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onCloseAction();
                        router.push('/account/addresses?redirect=checkout');
                      }}
                      className="font-medium underline hover:text-amber-700"
                      disabled={isProcessing}
                    >
                      Add a delivery address
                    </button>{' '}
                    to continue
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <p className="mb-2 text-gray-600">How would you like to pay?</p>
          <div className="space-y-3">
            {/* Card */}
            <label
              className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              onClick={e => e.stopPropagation()}
            >
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
                <span className="ml-3 text-gray-700">Credit or Debit</span>
              </div>
              <div className="flex items-center space-x-1">
                <VisaIcon className="h-5" />
                <MastercardIcon className="h-5" />
                <MaestroIcon className="h-5" />
                <AmexIcon className="h-5" />
              </div>
            </label>

            {/* UPI */}
            <label
              className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              onClick={e => e.stopPropagation()}
            >
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
            <label
              className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              onClick={e => e.stopPropagation()}
            >
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
            </label>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handlePaymentSelection}
            disabled={isProcessing || (!location?.address && !addressDetails)}
            className={`flex w-full items-center justify-center rounded-lg py-3 font-medium transition-colors ${
              (location?.address || addressDetails) && !isProcessing
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'cursor-not-allowed bg-gray-200 text-gray-500'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {selectedMethod === 'cod' ? 'Placing Order...' : 'Processing Payment...'}
              </>
            ) : (
              `Place Order - ₹${amount.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
