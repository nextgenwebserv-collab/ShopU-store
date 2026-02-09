/**
 * Utility functions for payment processing
 */
import crypto from 'crypto';

/**
 * Interface for payment provider and status
 */
export interface PaymentStatusMapping {
  paymentStatus: string;
  provider: string;
}

/**
 * Interface for payment object
 */
export interface Payment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  [key: string]: unknown; // For any additional properties
}

/**
 * Interface for Razorpay verification parameters
 */
export interface RazorpayVerificationParams {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}

/**
 * Maps a payment provider's status to an internal order status.
 *
 * @param paymentStatus - Status received from payment gateway
 * @param provider - Payment provider name (e.g., 'razorpay', 'stripe')
 * @returns Internal order status ('PENDING', 'CONFIRMED', 'PAYMENT_FAILED', etc.)
 */
export function mapPaymentStatusToOrderStatus(paymentStatus: string, provider: string): string {
  const status = paymentStatus.toUpperCase();
  const providerUpperCase = provider.toUpperCase();

  // Standard status mapping
  if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'CAPTURED') {
    return 'PROCESSING';
  }

  if (status === 'FAILED' || status === 'FAILURE') {
    return 'CANCELLED';
  }

  if (status === 'REFUNDED') {
    return 'RETURNED';
  }

  // Provider-specific status mapping
  if (providerUpperCase === 'RAZORPAY') {
    if (status === 'AUTHORIZED') return 'PROCESSING';
    if (status === 'CREATED') return 'PENDING';
  }

  if (providerUpperCase === 'COD') {
    return 'PENDING';
  }

  // Default fallback
  return 'PENDING';
}

/**
 * Verifies the Razorpay signature to ensure the request is genuine.
 *
 * @param params - The verification parameters
 * @returns True if signature is valid, else false
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
  secret,
}: RazorpayVerificationParams): boolean {
  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return expectedSignature === signature;
}

/**
 * Formats raw payment object for client/frontend use.
 * Removes sensitive fields.
 *
 * @param payment - Raw payment object
 * @returns Formatted payment object or null
 */
export function formatPaymentForClient(payment: Payment) {
  if (!payment) return null;

  return {
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    orderId: payment.orderId,
    // Optional client-safe metadata
    paymentMethod: payment.metadata?.paymentMethod,
    // Add or remove fields as needed
  };
}

/**
 * Validates payment amount against order amount to prevent tampering
 *
 * @param paymentAmount - Amount from the payment provider
 * @param orderAmount - Expected amount from the order
 * @param tolerance - Acceptable difference (default: 0)
 * @returns Boolean indicating if the amounts match within tolerance
 */
export function validatePaymentAmount(
  paymentAmount: number,
  orderAmount: number,
  tolerance: number = 0
): boolean {
  const diff = Math.abs(paymentAmount - orderAmount);
  return diff <= tolerance;
}

/**
 * Checks if Razorpay configuration is valid
 *
 * @returns Boolean indicating if the configuration is valid
 */
export function isRazorpayConfigValid(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  return Boolean(keyId && keySecret && keyId.length > 0 && keySecret.length > 0);
}

/**
 * Creates Razorpay compatible amount (converts to paise)
 *
 * @param amount - Amount in rupees
 * @returns Amount in paise as an integer
 */
export function createRazorpayAmount(amount: number | string): number {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.round(numericAmount * 100); // Convert to paise and ensure it's an integer
}

/**
 * Map a payment provider to a formatted display name
 */
export function formatPaymentProvider(provider: string | undefined): string {
  if (!provider) return 'Unknown';

  const providerMap: Record<string, string> = {
    RAZORPAY: 'Razorpay',
    COD: 'Cash on Delivery',
    PAYTM: 'Paytm',
    CARD: 'Credit/Debit Card',
    UPI: 'UPI',
    WALLET: 'Wallet',
    NETBANKING: 'Net Banking',
  };

  return providerMap[provider.toUpperCase()] || provider;
}

/**
 * Track tracking status for display
 */
export function getTrackingDisplayStatus(status: string): {
  label: string;
  color: string;
  icon: string;
} {
  const statusKey = status?.toLowerCase() || 'unknown';

  const statusMap: Record<string, { label: string; color: string; icon: string }> = {
    delivered: {
      label: 'Delivered',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: 'check-circle',
    },
    'out for delivery': {
      label: 'Out for Delivery',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: 'truck',
    },
    'in transit': {
      label: 'In Transit',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: 'truck',
    },
    shipped: {
      label: 'Shipped',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: 'package',
    },
    pending: {
      label: 'Pending',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: 'clock',
    },
    processing: {
      label: 'Processing',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: 'refresh-cw',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: 'x-circle',
    },
    returned: {
      label: 'Returned',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: 'rotate-ccw',
    },
  };

  return (
    statusMap[statusKey] || {
      label: status || 'Unknown',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: 'help-circle',
    }
  );
}
