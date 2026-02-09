'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/app/hooks/useCart';
import { Loader, Trash2, Tag, X } from 'lucide-react';
import Link from 'next/link';
import { FaRegEdit } from 'react-icons/fa';
import { useLocation } from '../context/LocationContext';
import { useRouter } from 'next/navigation';
import { logCheckoutEvent, validateAddressId } from '@/lib/checkout-utils';
import AddAddressForm from '../components/AddAddress';
import Navroute from '../components/Navroute';
import toast from 'react-hot-toast';

type Address = {
  id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
};

type Coupon = {
  id: string;
  name: string;
  code: string;
  discount: number;
  maxUsage: number;
  expiryDate: string;
};

export default function CheckoutPage() {
  const { cartItems, isLoading } = useCart();
  const { setAddressId } = useLocation();
  const [subtotal, setSubtotal] = useState(0);
  const router = useRouter();

  const [address, setAddress] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);
  // Coupon related states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    console.log('fetching address ');

    const fetchAddress = async () => {
      try {
        setIsLoadingAddress(true);
        const res = await fetch('/api/account/address', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        console.log('res status', res.status);

        if (!res.ok) {
          console.log('Failed to fetch address');
        }
        const json = await res.json();
        console.log('address list:', json?.address || []);
        setAddress(json?.address || []);
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setIsLoadingAddress(false);
      }
    };
    fetchAddress();
  }, []);

  useEffect(() => {
    logCheckoutEvent('Address selection changed', selectedAddressId);
  }, [selectedAddressId]);

  useEffect(() => {
    const total = cartItems.reduce((sum: number, item) => {
      const itemPrice: number = Number(item.product?.price ?? item.medicine?.price ?? 0);
      const quantity: number = typeof item.quantity === 'number' ? item.quantity : 0;
      return Number(sum) + itemPrice * quantity;
    }, 0);
    setSubtotal(total);
  }, [cartItems]);

  // Apply coupon function
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch(`/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          orderAmount: subtotal,
        }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setCouponError('Failed to apply coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Remove coupon function
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Calculate discount amount
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;

  // Delivery fee calculation
  const deliveryFee = (() => {
    if (subtotal < 200) return 49;
    if (subtotal < 300) return 28;
    return 0;
  })();

  // Platform charges fixed ₹9
  const platformFee = 9;

  const grandTotal = subtotal + deliveryFee + platformFee - discountAmount;

  const handleProceedToPayment = () => {
    if (!validateAddressId(selectedAddressId)) {
      alert('Please select a valid delivery address');
      return;
    }

    const selectedAddr = address.find(addr => addr.id === selectedAddressId);
    if (selectedAddr) {
      // Save full address in context
      setAddressId(selectedAddressId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedAddress', JSON.stringify(selectedAddr));
        // Also save applied coupon if any
        if (appliedCoupon) {
          localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
        }
      }
    }

    if (grandTotal <= 0) {
      alert('Invalid order amount');
      return;
    }

    const paymentUrl = appliedCoupon
      ? `/checkout/payment?addressId=${selectedAddressId}&amount=${grandTotal}&couponId=${appliedCoupon.id}`
      : `/checkout/payment?addressId=${selectedAddressId}&amount=${grandTotal}`;

    router.push(paymentUrl);
  };

  const handleAddressSave = (newAddress: Address) => {
    if (formMode === 'edit') {
      // Update existing address
      setAddress(prev => prev.map(addr => (addr.id === newAddress.id ? newAddress : addr)));
    } else {
      // Add new address
      setAddress(prev => [...prev, newAddress]);
    }
    setSelectedAddressId(newAddress.id ?? '');
  };

  if (isLoading || isLoadingAddress) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="mb-2 text-2xl font-medium text-gray-700">Your cart is empty</h2>
            <p className="mb-6 text-center text-gray-500">
              You need to add items to your cart before checkout.
            </p>
            <Link
              href="/"
              className="bg-background1 rounded-lg px-6 py-3 text-white transition-all hover:bg-teal-700"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDelAddress = async (id: string) => {
    try {
      setRemovingProductId(id);
      const res = await fetch(`/api/account/address/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setAddress(prev => prev.filter(addr => addr.id !== id));
      } else {
        console.error('Delete failed:', await res.text());
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setRemovingProductId(null);
    }
  };

  return (
    <>
      <Navroute />
      <div className="min-h-[60vh] p-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 text-2xl font-bold text-gray-800">Checkout</h1>

          <div className="mb-4 rounded-lg bg-white px-6 py-4 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">Delivery Address</h2>

            {address.length === 0 ? (
              <div className="py-4 text-center">
                <p className="mb-3 text-gray-600">No saved addresses found.</p>
                <button
                  onClick={() => {
                    setFormMode('add');
                    setShowAddAddressForm(true);
                    setSelectedAddress(null);
                  }}
                  className="text-teal-600 hover:underline"
                >
                  + Add a new address
                </button>
              </div>
            ) : (
              <div className="relative space-y-4">
                {address.map(address => (
                  <div
                    key={address.id}
                    className={`cursor-pointer rounded-lg border px-2 py-3 ${
                      selectedAddressId === address.id
                        ? 'border-[#7ECACE] bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAddressId(address.id ?? '')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id ?? '')}
                          className="mt-1 h-4 w-4 text-teal-600"
                        />
                        <div>
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-gray-600">
                            {address.addressLine1}
                            {address.addressLine2 ? `, ${address.addressLine2}` : ''},{' '}
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-600">+91 {address.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="text-primaryColor flex items-center justify-between gap-4 p-2">
                        <button
                          className="cursor-pointer text-lg"
                          onClick={() => {
                            setFormMode('edit');
                            setSelectedAddress(address);
                            setShowAddAddressForm(true);
                          }}
                        >
                          <FaRegEdit className="h-5 w-5" />
                        </button>
                        <button
                          className="cursor-pointer py-2 text-xl"
                          onClick={() => handleDelAddress(address.id ?? '')}
                          disabled={removingProductId === address.id}
                        >
                          {removingProductId === address.id ? (
                            <Loader className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (address.length >= 3) {
                        toast.error('You can only save up to 3 addresses.');
                        return;
                      }
                      setShowAddAddressForm(true);
                    }}
                    disabled={address.length >= 3}
                    className="text-sm text-teal-600 hover:underline disabled:opacity-50"
                  >
                    + Add another address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Coupon Code Section */}
          <div className="mb-4 rounded-lg bg-white px-6 py-4 shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Tag className="h-5 w-5" />
              Apply Coupon Code
            </h2>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    {appliedCoupon.code} - {appliedCoupon.discount}% OFF
                  </span>
                  <span className="text-sm text-green-600">
                    (Save ₹{discountAmount.toFixed(2)})
                  </span>
                </div>
                <button onClick={removeCoupon} className="text-green-600 hover:text-green-800">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#7ECACE] focus:ring-1 focus:ring-[#7ECACE] focus:outline-none"
                    disabled={isApplyingCoupon}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className={`rounded-lg px-4 py-2 font-medium ${
                      isApplyingCoupon || !couponCode.trim()
                        ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                        : 'bg-primaryColor text-white'
                    }`}
                  >
                    {isApplyingCoupon ? <Loader className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-sm text-red-600">{couponError}</p>}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold">Your Order Summary</h2>
            <div className="mb-6 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-medium text-green-600">Free</span>
                ) : (
                  <span>₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span>Platform Charges</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t pt-2 font-medium">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-yellow-800">
                Please review your order details before proceeding to payment.
              </p>
            </div>

            <div className="flex hidden justify-between sm:flex">
              <Link
                href="/"
                className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-100"
              >
                Continue Shopping
              </Link>
              <button
                className={`rounded-lg ${
                  !selectedAddressId || address.length === 0
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-background1'
                } cursor-pointer px-6 py-2 text-white transition-transform duration-300 hover:scale-102`}
                onClick={handleProceedToPayment}
                disabled={!selectedAddressId || address.length === 0}
              >
                Proceed to Pay
              </button>
            </div>
            <div className="flex justify-between gap-4 sm:hidden">
              <Link
                href="/"
                className="rounded-lg border border-gray-300 px-2 py-3 text-gray-700 hover:bg-gray-100"
              >
                Continue Shopping
              </Link>
              <button
                className={`rounded-lg ${
                  !selectedAddressId || address.length === 0
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-background1'
                } cursor-pointer px-6 py-3 text-white transition-transform duration-300 hover:scale-102`}
                onClick={handleProceedToPayment}
                disabled={!selectedAddressId || address.length === 0}
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>

        {showAddAddressForm && (
          <AddAddressForm
            formMode={formMode}
            initialData={selectedAddress}
            onCancel={() => {
              setShowAddAddressForm(false);
              setSelectedAddress(null);
              setFormMode('add');
            }}
            onSave={data => {
              handleAddressSave(data);
              setShowAddAddressForm(false);
              setSelectedAddress(null);
              setFormMode('add');
            }}
          />
        )}
      </div>
    </>
  );
}
