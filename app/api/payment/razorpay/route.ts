import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/client';
import { mapPaymentStatusToOrderStatus } from '@/lib/payment-utils';

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

    // Get order details from request body
    const { orderId, amount, currency = 'INR', paymentMethod = 'card' } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    console.log(
      `[Razorpay] Processing payment for orderId: ${orderId}, amount: ${amount}, method: ${paymentMethod}`
    );

    // Verify the order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        user: true,
        address: true,
      },
    });

    if (!order) {
      console.error(`[Razorpay] Order not found or does not belong to user: ${orderId}`);
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Get the Razorpay key ID from environment variables
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay environment variables are not set');
      return NextResponse.json(
        { success: false, error: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    // Generate a unique receipt ID
    const receiptId = `receipt_${Date.now()}_${orderId.substring(0, 8)}`;

    // Create Razorpay order using fetch to their API
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: Math.round(parseFloat(amount.toString()) * 100), // Convert to paise
        currency,
        receipt: receiptId,
        notes: {
          orderId: orderId,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error(`[Razorpay] API error:`, errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to create Razorpay order' },
        { status: 500 }
      );
    }

    const razorpayData = await razorpayResponse.json();
    const razorpayOrderId = razorpayData.id;

    if (!razorpayOrderId) {
      console.error('[Razorpay] No order ID returned from Razorpay');
      return NextResponse.json(
        { success: false, error: 'Failed to create payment order' },
        { status: 500 }
      );
    }

    console.log(`[Razorpay] Created Razorpay order: ${razorpayOrderId}`);

    // Create a payment record in the database
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        amount: parseFloat(amount.toString()),
        currency,
        provider: 'RAZORPAY',
        status: 'PENDING',
        providerPaymentId: razorpayOrderId,
        metadata: {
          initiatedBy: userId,
          initiatedAt: new Date().toISOString(),
          paymentMethod: paymentMethod,
          razorpayReceiptId: receiptId,
          initialOrderStatus: mapPaymentStatusToOrderStatus('PENDING', 'RAZORPAY'),
        },
      },
    });

    console.log(`[Razorpay] Payment record created: ${payment.id}`);

    // Return data needed for client-side Razorpay integration
    return NextResponse.json({
      success: true,
      key: razorpayKeyId,
      amount: Math.round(parseFloat(amount.toString()) * 100), // Convert to paise
      currency,
      name: 'ShopU',
      description: `Payment for order ${orderId}`,
      order_id: razorpayOrderId,
      prefill: {
        name: order.user?.name || 'Customer',
        email: order.user?.email || '',
        contact: order.user?.phoneNumber || order.address?.phoneNumber || '',
      },
      notes: {
        address: order.address
          ? `${order.address.addressLine1}, ${order.address.city}`
          : 'Not provided',
        orderId: orderId,
        paymentMethod: paymentMethod,
      },
      theme: {
        color: '#0d9488',
      },
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('[POST /api/payment/razorpay]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
