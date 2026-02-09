import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/client';
import { verifyRazorpaySignature, mapPaymentStatusToOrderStatus } from '@/lib/payment-utils';

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 });
    }

    // Verify token and get user details
    const payload = verifyToken(token);
    const userId = payload.id;

    // Get payment details from request body
    const {
      orderId,
      providerPaymentId,
      status,
      provider = 'RAZORPAY',
      metadata = {},
    } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    console.log(
      `[Payment Callback] Processing payment callback for orderId: ${orderId}, provider: ${provider}, status: ${status}`
    );

    // Find existing payment for this order
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: orderId,
        userId: userId,
      },
    });

    if (!existingPayment) {
      console.log(`[Payment Callback] No existing payment found for order: ${orderId}`);

      // Create new payment record if none exists
      const newPayment = await prisma.payment.create({
        data: {
          orderId,
          userId,
          amount: 0, // This will be updated from order amount
          currency: 'INR',
          provider,
          status: status || 'PENDING',
          providerPaymentId,
          metadata: {
            ...metadata,
            createdAt: new Date().toISOString(),
          },
        },
      });

      // Update order status based on payment status
      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: metadata.statusMapped || 'PENDING',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment created successfully',
        paymentId: newPayment.id,
      });
    }

    // For Razorpay payments, verify the signature
    if (
      provider === 'RAZORPAY' &&
      metadata.razorpay_order_id &&
      metadata.razorpay_signature &&
      providerPaymentId &&
      status === 'SUCCESS'
    ) {
      const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!razorpaySecret) {
        console.error('Razorpay secret key not found in environment');
        return NextResponse.json(
          { success: false, error: 'Payment verification configuration error' },
          { status: 500 }
        );
      }

      const isValid = verifyRazorpaySignature({
        orderId: metadata.razorpay_order_id,
        paymentId: providerPaymentId,
        signature: metadata.razorpay_signature,
        secret: razorpaySecret,
      });

      if (!isValid) {
        console.error(`[Payment Callback] Invalid Razorpay signature for order: ${orderId}`);
        return NextResponse.json(
          { success: false, error: 'Invalid payment signature' },
          { status: 400 }
        );
      }

      console.log(`[Payment Callback] Razorpay signature verified for order: ${orderId}`);
    }

    // Map payment status to order status
    const mappedStatus = metadata.statusMapped || mapPaymentStatusToOrderStatus(status, provider);

    // Update existing payment
    const updatedPayment = await prisma.payment.update({
      where: {
        id: existingPayment.id,
      },
      data: {
        status: status || existingPayment.status,
        providerPaymentId: providerPaymentId || existingPayment.providerPaymentId,
        metadata: {
          ...((existingPayment.metadata as Record<string, unknown>) || {}),
          ...metadata,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    // Update order status based on payment status
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: mappedStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully',
      paymentId: updatedPayment.id,
    });
  } catch (error) {
    console.error('[POST /api/payment/callback]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment callback' },
      { status: 500 }
    );
  }
}
