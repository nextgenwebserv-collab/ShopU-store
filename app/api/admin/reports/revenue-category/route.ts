import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get revenue by category
    const categoryRevenue = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true,
      },
    });

    // Get product categories and calculate revenue
    const categoryData = new Map<string, number>();
    const colors = ['#0891b2', '#059669', '#dc2626', '#ea580c', '#7c3aed', '#f59e0b', '#8b5cf6'];

    await Promise.all(
      categoryRevenue
        .filter(item => item.productId !== null)
        .map(async item => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId! },
            select: { subCategoryId: true },
          });

          if (product?.subCategoryId) {
            const currentRevenue = categoryData.get(product.subCategoryId) || 0;
            const itemRevenue = Number(item._sum.price || 0) * Number(item._sum.quantity || 0);
            categoryData.set(product.subCategoryId, currentRevenue + itemRevenue);
          }
        })
    );

    // Calculate total revenue for percentage calculation
    const totalRevenue = Array.from(categoryData.values()).reduce((sum, value) => sum + value, 0);

    // Convert to required format
    const revenueCategoryData = Array.from(categoryData.entries())
      .map(([name, revenue], index) => ({
        name,
        value: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories

    return NextResponse.json(revenueCategoryData);
  } catch (error) {
    console.error('[POST /api/admin/reports/revenue-category]', error);
    return NextResponse.json({ error: 'Failed to fetch revenue category data' }, { status: 500 });
  }
}
