import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: true, message: 'Please login first' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    const userId = payload.id;

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order || order.userId !== userId) {
      return NextResponse.json({ message: 'Order not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
