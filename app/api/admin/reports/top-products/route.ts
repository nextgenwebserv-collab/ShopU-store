import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get top products by total quantity sold
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for the top products
    const topProductsData = await Promise.all(
      topProducts.map(async item => {
        if (!item.productId) {
          return {
            name: 'Unknown Product',
            sales: item._sum.quantity || 0,
          };
        }

        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          name: product?.name || 'Unknown Product',
          sales: item._sum.quantity || 0,
        };
      })
    );

    return NextResponse.json(topProductsData);
  } catch (error) {
    console.error('[POST /api/admin/reports/top-products]', error);
    return NextResponse.json({ error: 'Failed to fetch top products data' }, { status: 500 });
  }
}
