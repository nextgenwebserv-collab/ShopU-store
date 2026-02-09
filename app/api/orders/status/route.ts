import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '../../../../lib/client';

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Please login to continue shopping' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { role: true },
    });
    // console.log("user", user)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    console.log('userabu', user.role);
    const body = await req.json();
    console.log('body', body);
    const { orderId, status, itemId } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    if (itemId) {
      // Update status for a specific item
      await prisma.orderItem.update({
        where: { id: itemId },
        data: { status },
      });
    } else {
      // Update status for the entire order
      await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Status update API error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update status',
        message: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}
