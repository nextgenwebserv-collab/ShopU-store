import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        address: true,
        orderItems: {
          include: {
            product: {
              include: {
                productImages: true,
              },
            },
            combination: {
              include: {
                values: {
                  include: {
                    variantValue: {
                      include: {
                        variantType: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[GET /api/admin/orders/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
