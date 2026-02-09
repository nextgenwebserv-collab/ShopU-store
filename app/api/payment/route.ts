import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';

// GET - fetch payment by orderId
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 });
    }

    // Verify token and get user details
    const payload = verifyToken(token);
    const userId = payload.id;

    // Get orderId from query parameters
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // Verify the order belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Fetch payment details
    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        userId,
      },
      include: {
        order: true, // Include order details for more comprehensive information
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('[GET /api/payment]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}
