import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId: orderItemId } = await params;
    const { status, reason } = await req.json();

    // Validate status
    const validStatuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get current order item
    const currentOrderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
    });

    if (!currentOrderItem) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    // Use transaction to update status and handle stock changes
    const result = await prisma.$transaction(async tx => {
      // Update order item status
      const updated = await tx.orderItem.update({
        where: { id: orderItemId },
        data: { status, reason },
      });

      // Handle stock restoration for cancellations/returns
      if (
        ['CANCELLED', 'RETURNED'].includes(status) &&
        !['CANCELLED', 'RETURNED'].includes(currentOrderItem.status)
      ) {
        if (currentOrderItem.combinationId) {
          await tx.productVariantCombination.update({
            where: { id: currentOrderItem.combinationId },
            data: {
              stock: {
                increment: currentOrderItem.quantity,
              },
            },
          });
        } else if (currentOrderItem.productId) {
          await tx.product.update({
            where: { id: currentOrderItem.productId },
            data: {
              stock: {
                increment: currentOrderItem.quantity,
              },
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `Order item status updated to ${status}`,
      orderItem: result,
    });
  } catch (error) {
    console.error('[ADMIN ORDER ITEM STATUS UPDATE]', error);
    return NextResponse.json({ error: 'Failed to update order item status' }, { status: 500 });
  }
}
