import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: true, message: 'Need to login first' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    const userId = payload.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
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

    return NextResponse.json({ success: true, error: false, orders });
  } catch (err) {
    console.error('[GET /api/account/orders]', err);
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
