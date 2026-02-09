import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sales data for the last 7 weeks
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7 * 7); // 7 weeks ago

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    // Group orders by week
    const weeklyData = new Map<string, number>();

    orders.forEach(order => {
      const weekStart = new Date(order.createdAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      const weekKey = `Week ${Math.ceil((endDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24 * 7))}`;

      const currentAmount = weeklyData.get(weekKey) || 0;
      weeklyData.set(weekKey, currentAmount + Number(order.totalAmount));
    });

    // Convert to array format
    const salesTrendData = Array.from(weeklyData.entries())
      .map(([week, sales]) => ({ week, sales }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return NextResponse.json(salesTrendData);
  } catch (error) {
    console.error('[POST /api/admin/reports/sales-trend]', error);
    return NextResponse.json({ error: 'Failed to fetch sales trend' }, { status: 500 });
  }
}
