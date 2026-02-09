// 'use client';

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { useCart } from '@/app/hooks/useCart';
// import { Loader, ChevronUp, X, ShoppingBag } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useLocation } from '../context/LocationContext';
// import dynamic from 'next/dynamic';

// // Updated CartItem interface to match the one expected by CartItemList
// export interface CartItem {
//   id: string;
//   quantity: number;
//   product?: {
//     name?: string;
//     price?: number;
//     imageUrl?: string;
//   };
//   medicine?: {
//     name?: string;
//     price?: number;
//     imageUrl?: string;
//   };
// }

// interface CartModalProps {
//   isOpen: boolean;
//   onCloseAction: () => void;
// }

// // Lazy-load the CartItemList component
// const CartItemList = dynamic(() => import('./cart/CartItemList'), {
//   loading: () => (
//     <div className="flex min-h-[50vh] items-center justify-center">
//       <div className="flex flex-col items-center gap-3">
//         <Loader className="h-8 w-8 animate-spin text-teal-600" />
//         <p className="text-sm text-gray-500">Loading your cart...</p>
//       </div>
//     </div>
//   ),
// });

// export default function CartModal({ isOpen, onCloseAction }: CartModalProps) {
//   const { cartItems: rawCartItems, isLoading, refreshCart, totals } = useCart();
//   const [processingAction, setProcessingAction] = useState<{ [key: string]: string }>({});
//   const router = useRouter();
//   const { location } = useLocation();

//   const deliveryAddress = useMemo(
//     () =>
//       location ? `${location.address}, PIN: ${location.pincode}` : 'Please set delivery location',
//     [location]
//   );

//   // Transform cart items to match expected interface
//   const cartItems = useMemo(() => {
//     return rawCartItems.map(item => ({
//       id: item.id,
//       quantity: item.quantity,
//       product: {
//         name: item.product?.name || item.medicine?.name || 'Unknown Item',
//         price: typeof (item.product?.price || item.medicine?.price) === 'string'
//           ? parseFloat((item.product?.price || item.medicine?.price) as string)
//           : (item.product?.price || item.medicine?.price),
//         imageUrl: item.product?.imageUrl || item.medicine?.imageUrl,
//       },
//     }));
//   }, [rawCartItems]);

//   // Memoized item total to avoid recalculation
//   const itemTotal = useMemo(() => totals?.subtotal || 0, [totals]);

//   // Refresh cart data when modal is opened, using a ref to avoid unnecessary refreshes
//   useEffect(() => {
//     let mounted = true;

//     if (isOpen) {
//       // Use a slight delay to prioritize UI rendering first
//       const timer = setTimeout(() => {
//         if (mounted) refreshCart();
//       }, 100);
//       return () => {
//         clearTimeout(timer);
//         mounted = false;
//       };
//     }
//   }, [isOpen, refreshCart]);

//   useEffect(() => {
//     const handleCloseCartModal = () => {
//       onCloseAction();
//     };

//     window.addEventListener('closeCartModal', handleCloseCartModal);

//     return () => {
//       window.removeEventListener('closeCartModal', handleCloseCartModal);
//     };
//   }, [onCloseAction]);

//   const handleProceedToCheckout = useCallback(
//     (e: React.MouseEvent) => {
//       // Stop event propagation to prevent modal closing
//       e.preventDefault();
//       e.stopPropagation();

//       // Close the cart modal
//       onCloseAction();
//       // Navigate to checkout page
//       router.push('/checkout');
//     },
//     [onCloseAction, router]
//   );

//   if (!isOpen) return null;

//   const renderCartContent = () => {
//     if (isLoading && cartItems.length === 0) {
//       return (
//         <div className="flex min-h-[50vh] items-center justify-center">
//           <div className="flex flex-col items-center gap-3">
//             <Loader className="h-8 w-8 animate-spin text-teal-600" />
//             <p className="text-sm text-gray-500">Loading your cart...</p>
//           </div>
//         </div>
//       );
//     }

//     if (cartItems.length === 0) {
//       return (
//         <div className="min-h-[50vh] px-4 py-8 sm:px-6">
//           <div className="flex flex-col items-center justify-center py-8 sm:py-12">
//             <div className="mb-6 rounded-full bg-teal-50 p-6 sm:p-8">
//               <ShoppingBag className="h-12 w-12 text-teal-400 sm:h-16 sm:w-16" />
//             </div>
//             <h2 className="mb-2 text-xl font-semibold text-gray-800 sm:text-2xl">
//               Your cart is empty
//             </h2>
//             <p className="mb-6 px-4 text-center text-sm text-gray-500 sm:text-base">
//               Looks like you haven&apos;t added any items to your cart yet.
//             </p>
//             <button
//               onClick={onCloseAction}
//               className="bg-background1 cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-white transition-all hover:bg-teal-700 active:scale-95"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-0">
//         <CartItemList
//           cartItems={cartItems}
//           processingAction={processingAction}
//           setProcessingAction={setProcessingAction}
//         />

//         {/* Bill Details */}
//         <div className="border-t border-gray-200 bg-white">
//           <div className="border-b border-teal-100 bg-teal-50 px-4 py-3">
//             <h2 className="text-base font-semibold text-teal-800">Bill Details</h2>
//           </div>
//           <div className="space-y-3 p-4">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-900">Item Total:</span>
//               <span className="text-primaryColor font-medium">₹{itemTotal.toFixed(0)}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-900">Shipping:</span>
//               <span className="font-medium text-green-500">Free</span>
//             </div>
//             <div className="flex justify-between border-t border-gray-100 pt-3">
//               <span className="font-semibold">Total:</span>
//               <span className="text-primaryColor text-lg font-semibold">
//                 ₹{itemTotal.toFixed(0)}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Cancellation Policy */}
//         <div className="border-t border-gray-200 bg-white">
//           <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
//             <h2 className="text-base font-semibold text-gray-800">Cancellation Policy</h2>
//           </div>
//           <div className="space-y-2 p-4 text-xs text-gray-600 sm:text-sm">
//             <p>Orders cannot be cancelled once packed for delivery.</p>
//             <p>In case of unexpected delays, a refund will be provided, if applicable.</p>
//           </div>
//         </div>

//         {/* Delivery Address */}
//         <div className="border-t border-gray-200 bg-white">
//           <div className="flex items-start justify-between gap-3 p-4">
//             <div className="flex items-start gap-2">
//               <div className="mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 border-teal-500"></div>
//               <div>
//                 <p className="mb-1 text-sm font-medium text-gray-900">Delivery Address</p>
//                 <p className="text-xs text-gray-600">{deliveryAddress}</p>
//               </div>
//             </div>
//             <button
//               onClick={() => {
//                 onCloseAction();
//                 router.push('/');
//               }}
//               className="flex-shrink-0 rounded-lg px-3 py-1 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
//             >
//               Change
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="animate-fadeIn fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm">
//       <div className="animate-slideRight relative h-screen max-h-screen w-full max-w-sm transform overflow-hidden rounded-r-2xl bg-white shadow-2xl transition-all sm:max-w-md sm:rounded-r-3xl lg:max-w-md">
//         {/* Header */}
//         <div className="bg-background1 relative px-4 py-4">
//           <button
//             onClick={onCloseAction}
//             className="absolute top-3 right-3 rounded-full p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:top-4 sm:right-4"
//           >
//             <X className="h-5 w-5 sm:h-6 sm:w-6" />
//           </button>

//           <div className="flex items-center gap-3">
//             <div className="rounded-full bg-white/20 p-2">
//               <ShoppingBag className="h-5 w-5 text-white sm:h-6 sm:w-6" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-white sm:text-2xl">Cart</h1>
//               <p className="text-sm text-teal-100">
//                 {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex h-[calc(100vh-80px)] flex-col">
//           <div className="hidden flex-1 overflow-y-auto sm:block">{renderCartContent()}</div>
//           <div className="max-h-[68vh] flex-1 overflow-y-auto sm:hidden">{renderCartContent()}</div>
//           {/* Footer - Checkout Button */}
//           {cartItems.length > 0 && (
//             <div className="border-t border-gray-100 bg-white p-4 sm:p-6">
//               <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
//                 <div className="text-center sm:text-left">
//                   <p className="text-lg font-bold text-gray-800 sm:text-xl">
//                     ₹{itemTotal.toFixed(0)}
//                   </p>
//                   <p className="text-xs text-gray-500">Inclusive of all taxes</p>
//                 </div>
//                 <button
//                   onClick={handleProceedToCheckout}
//                   className="bg-background1 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:w-auto sm:px-6 sm:py-3"
//                 >
//                   Proceed to Pay
//                   <ChevronUp className="rotate-90 transform" size={18} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/app/hooks/useCart';
import { Loader, ChevronUp, X, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
//import { useLocation } from '../context/LocationContext';
import dynamic from 'next/dynamic';

// Updated CartItem interface to match the one expected by CartItemList
export interface CartItem {
  id: string;
  quantity: number;
  product?: {
    name?: string;
    price?: number;
    imageUrl?: string;
  };
  medicine?: {
    name?: string;
    price?: number;
    imageUrl?: string;
  };
}

interface CartModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

// Lazy-load the CartItemList component
const CartItemList = dynamic(() => import('./cart/CartItemList'), {
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500">Loading your cart...</p>
      </div>
    </div>
  ),
});

export default function CartModal({ isOpen, onCloseAction }: CartModalProps) {
  const { cartItems: rawCartItems, isLoading, refreshCart, totals } = useCart();
  const [processingAction, setProcessingAction] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  //  const { location } = useLocation();

  /*  const deliveryAddress = useMemo(
    () =>
      location ? `${location.address}, PIN: ${location.pincode}` : 'Please set delivery location',
    [location]
  ); */

  // Transform cart items to match expected interface
  const cartItems = useMemo(() => {
    return rawCartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        name: item.product?.name || item.medicine?.name || 'Unknown Item',
        price: (() => {
          const rawPrice = item.product?.price || item.medicine?.price;
          if (typeof rawPrice === 'string') {
            const parsed = parseFloat(rawPrice);
            return isNaN(parsed) ? undefined : parsed;
          }
          return rawPrice;
        })(),
        imageUrl: item.product?.imageUrl || '/Paracetamol.jpg',
      },
    }));
  }, [rawCartItems]);

  // Memoized item total to avoid recalculation
  const itemTotal = useMemo(() => totals?.subtotal || 0, [totals]);

  const deliveryFee = useMemo(() => {
    if (itemTotal < 200) return 49;
    if (itemTotal < 300) return 28;
    return 0;
  }, [itemTotal]);

  // Example: platform charges fixed ₹10
  const platformFee = 9;

  // Final total including charges
  const grandTotal = useMemo(
    () => itemTotal + deliveryFee + platformFee,
    [itemTotal, deliveryFee, platformFee]
  );

  // Refresh cart data when modal is opened, using a ref to avoid unnecessary refreshes
  useEffect(() => {
    let mounted = true;

    if (isOpen) {
      // Use a slight delay to prioritize UI rendering first
      const timer = setTimeout(() => {
        if (mounted) refreshCart();
      }, 100);
      return () => {
        clearTimeout(timer);
        mounted = false;
      };
    }
  }, [isOpen, refreshCart]);

  useEffect(() => {
    const handleCloseCartModal = () => {
      onCloseAction();
    };

    window.addEventListener('closeCartModal', handleCloseCartModal);

    return () => {
      window.removeEventListener('closeCartModal', handleCloseCartModal);
    };
  }, [onCloseAction]);

  const handleProceedToCheckout = useCallback(
    (e: React.MouseEvent) => {
      // Stop event propagation to prevent modal closing
      e.preventDefault();
      e.stopPropagation();

      // Close the cart modal
      onCloseAction();
      // Navigate to checkout page
      router.push('/checkout');
    },
    [onCloseAction, router]
  );

  if (!isOpen) return null;

  const renderCartContent = () => {
    if (isLoading && cartItems.length === 0) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading your cart...</p>
          </div>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <div className="min-h-[50vh] px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="mb-6 rounded-full bg-teal-50 p-6 sm:p-8">
              <ShoppingBag className="h-12 w-12 text-teal-400 sm:h-16 sm:w-16" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800 sm:text-2xl">
              Your cart is empty
            </h2>
            <p className="mb-6 px-4 text-center text-sm text-gray-500 sm:text-base">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <button
              onClick={onCloseAction}
              className="bg-background1 cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-white transition-all hover:bg-teal-700 active:scale-95"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        <CartItemList
          cartItems={cartItems}
          processingAction={processingAction}
          setProcessingAction={setProcessingAction}
        />
        {/* Bill Details */}
        <div className="border-t border-gray-200 bg-white">
          <div className="border-b border-teal-100 bg-teal-50 px-4 py-3">
            <h2 className="text-base font-semibold text-teal-800">Bill Details</h2>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Item Total:</span>
              <span className="text-primaryColor font-medium">₹{itemTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Delivery Fee:</span>
              {deliveryFee === 0 ? (
                <span className="font-medium text-green-500">Free</span>
              ) : (
                <span className="text-primaryColor font-medium">₹{deliveryFee}</span>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Platform Charges:</span>
              <span className="text-primaryColor font-medium">₹{platformFee}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="font-semibold">Total:</span>
              <span className="text-primaryColor text-lg font-semibold">
                ₹{grandTotal.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="border-t border-gray-200 bg-white">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
            <h2 className="text-base font-semibold text-gray-800">Cancellation and Refund</h2>
          </div>
          <div className="space-y-2 p-4 text-xs text-gray-600 sm:text-sm">
            <p>
              Orders cannot be cancelled once packed for delivery.
              <br />
              In case of unexpected delays, a refund will be provided if applicable.
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        {/* <div className="border-t border-gray-200 bg-white">
          <div className="flex items-start justify-between gap-3 p-4">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 border-teal-500"></div>
              <div>
                <p className="mb-1 text-sm font-medium text-gray-900">Delivery Address</p>
                <p className="text-xs text-gray-600">{deliveryAddress}</p>
              </div>
            </div>
            <button
              onClick={() => {
                onCloseAction();
                router.push('/');
              }}
              className="flex-shrink-0 rounded-lg px-3 py-1 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
            >
              Change
            </button>
          </div>
        </div> */}
      </div>
    );
  };

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm">
      <div className="animate-slideRight relative h-screen max-h-screen w-full max-w-sm transform overflow-hidden rounded-r-2xl bg-white shadow-2xl transition-all sm:max-w-md sm:rounded-r-3xl lg:max-w-md">
        {/* Header */}
        <div className="bg-background1 relative px-4 py-3">
          <button
            onClick={onCloseAction}
            className="absolute top-3 right-3 rounded-full p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:top-4 sm:right-4"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2">
              <ShoppingBag className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">Cart</h1>
              <p className="text-sm text-teal-100">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100vh-80px)] flex-col">
          <div className="no-scrollbar hidden flex-1 overflow-y-auto sm:block">
            {renderCartContent()}
          </div>
          <div className="max-h-[68vh] flex-1 overflow-y-auto sm:hidden">{renderCartContent()}</div>
          {/* Footer - Checkout Button */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 bg-white p-4 sm:p-6">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="text-lg font-bold text-gray-800 sm:text-xl">
                    ₹{grandTotal.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="bg-background1 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:w-auto sm:px-6 sm:py-3"
                >
                  Proceed to Pay
                  <ChevronUp className="rotate-90 transform" size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
