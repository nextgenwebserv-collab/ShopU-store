import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { getUserFromToken } from '@/lib/auth'; // implement this helper

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderItemId } = await params;

    // Authenticate user
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Need to login first' }, { status: 401 });
    }

    const user = await getUserFromToken(token); // implement JWT decoding + DB lookup
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { status, reason } = await req.json();

    // Validate status
    if (!['CANCELLED', 'RETURNED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch order item and ensure ownership
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem || orderItem.order.userId !== user.id) {
      return NextResponse.json({ error: 'Order not found or not authorized' }, { status: 404 });
    }

    // Status rules
    if (orderItem.status !== 'PENDING' && status === 'CANCELLED') {
      return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 });
    }

    if (orderItem.status !== 'DELIVERED' && status === 'RETURNED') {
      return NextResponse.json({ error: 'Only delivered orders can be returned' }, { status: 400 });
    }

    // Use a transaction to update status and restore stock
    const result = await prisma.$transaction(async tx => {
      // Update status
      const updated = await tx.orderItem.update({
        where: { id: orderItemId },
        data: {
          status,
          reason,
        },
      });

      // Restore stock quantity if the order is cancelled or returned
      if (['CANCELLED', 'RETURNED'].includes(status)) {
        if (orderItem.combinationId) {
          // Restore variant stock
          await tx.productVariantCombination.update({
            where: { id: orderItem.combinationId },
            data: {
              stock: {
                increment: orderItem.quantity,
              },
            },
          });
        } else if (orderItem.productId) {
          // Restore product stock
          await tx.product.update({
            where: { id: orderItem.productId },
            data: {
              stock: {
                increment: orderItem.quantity,
              },
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json({ success: true, updated: result });
  } catch (err) {
    console.error('[ORDER STATUS UPDATE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
