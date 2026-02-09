/**
 * Utility functions for the checkout process
 */

type CartItem = {
  id: string;
  quantity: number;
  product?: { id: string; price: number | string; name?: string };
  medicine?: { id: string; price: number | string; name?: string };
  productId?: string;
  medicineId?: string;
  combinationId?: string;
};

/**
 * Validates cart items to ensure they meet minimum requirements
 * @param cartItems Array of cart items
 * @returns Boolean indicating if all items are valid
 */
export function validateCartItems(cartItems: CartItem[]): boolean {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return false;
  }

  return cartItems.every(item => {
    // Validate each item has either product or medicine reference
    const hasValidRef = item.product?.id || item.medicine?.id || item.productId || item.medicineId;
    // Validate quantity
    const hasValidQuantity =
      item.quantity && typeof item.quantity === 'number' && item.quantity > 0;
    // Validate price exists somewhere
    const hasValidPrice = item.product?.price || item.medicine?.price;

    return hasValidRef && hasValidQuantity && hasValidPrice;
  });
}

/**
 * Prepares order items from cart items, ready for API submission
 * @param cartItems Array of cart items
 * @returns Normalized array of order items
 */
export function prepareOrderItems(cartItems: CartItem[]) {
  return cartItems
    .map(item => ({
      productId: item.product?.id || item.productId || null,
      medicineId: item.medicine?.id || item.medicineId || null,
      quantity: item.quantity,
      price: parseFloat((item.product?.price || item.medicine?.price || 0).toString()),
      combinationId: item.combinationId || null,
      trackingInfo: null, // Initialize tracking info as null
    }))
    .filter(item => (item.productId || item.medicineId) && item.quantity > 0);
}

/**
 * Validates an address ID
 * @param addressId The ID to validate
 * @returns Boolean indicating if the ID appears valid
 */
export function validateAddressId(addressId: string | null | undefined): boolean {
  return Boolean(addressId && typeof addressId === 'string' && addressId.length > 0);
}

/**
 * Validates a tracking number
 * @param trackingNumber The tracking number to validate
 * @returns Boolean indicating if the tracking number appears valid
 */
export function validateTrackingNumber(trackingNumber: string | null | undefined): boolean {
  // Basic validation: tracking number should be non-empty string with at least 8 characters
  return Boolean(
    trackingNumber && typeof trackingNumber === 'string' && trackingNumber.length >= 8
  );
}

/**
 * Formats a tracking number for display
 * @param trackingNumber The tracking number to format
 * @returns Formatted tracking number or placeholder text
 */
export function formatTrackingNumber(trackingNumber: string | null | undefined): string {
  if (!trackingNumber) return 'Not available';

  // Format based on length for readability
  if (trackingNumber.length > 12) {
    return `${trackingNumber.substring(0, 4)}-${trackingNumber.substring(4, 8)}-${trackingNumber.substring(8)}`;
  }

  return trackingNumber;
}

/**
 * Logs checkout events (can be expanded to use analytics)
 * @param event Event name/description
 * @param data Optional data to log with the event
 */
export function logCheckoutEvent(event: string, data?: unknown): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`Checkout Event: ${event}`, data || '');
  }
  // In production, you could send this to an analytics service
  // Example: analyticsService.trackEvent(event, data);
}
