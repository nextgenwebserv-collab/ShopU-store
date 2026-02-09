import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin authorization
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;
    const { status } = await req.json();

    // Validate status
    const validStatuses = [
      'PENDING',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get the current order with its items
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { orderItems: true },
    });

    // If the order is cancelled and wasn't already cancelled, restore stock
    if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
      await restoreStockForOrder(orderId);
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('[ADMIN ORDER STATUS UPDATE]', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

// Helper function to restore stock for all items in an order
async function restoreStockForOrder(orderId: string) {
  // Get all order items
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
  });

  // Restore stock for each item
  for (const item of orderItems) {
    if (item.combinationId) {
      // Restore variant stock
      await prisma.productVariantCombination.update({
        where: { id: item.combinationId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    } else if (item.productId) {
      // Restore product stock
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
  }
}
