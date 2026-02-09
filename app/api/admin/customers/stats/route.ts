import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date ranges
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Use Promise.all to run all queries in parallel for maximum performance
    const [
      totalCustomers,
      activeCustomers,
      newThisMonth,
      newLastMonth,
      orderAggregation,
      ordersThisMonth,
      ordersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      totalProducts,
    ] = await Promise.all([
      // Total customers count
      prisma.user.count(),

      // Active customers (with at least one order)
      prisma.user.count({
        where: {
          orders: {
            some: {},
          },
        },
      }),

      // New customers this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: thisMonth,
          },
        },
      }),

      // New customers last month
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth,
          },
        },
      }),

      // Order statistics in one query
      prisma.order.aggregate({
        _avg: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Orders this month
      prisma.order.count({
        where: {
          createdAt: {
            gte: thisMonth,
          },
        },
      }),

      // Orders last month
      prisma.order.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth,
          },
        },
      }),

      // Revenue this month
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: thisMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Revenue last month
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Total products
      prisma.product.count(),
    ]);

    // Calculate growth percentages
    const customerGrowth =
      newLastMonth > 0 ? ((newThisMonth - newLastMonth) / newLastMonth) * 100 : 0;
    const ordersGrowth =
      ordersLastMonth > 0 ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0;

    const revenueThisMonthAmount = Number(revenueThisMonth._sum.totalAmount || 0);
    const revenueLastMonthAmount = Number(revenueLastMonth._sum.totalAmount || 0);
    const revenueGrowth =
      revenueLastMonthAmount > 0
        ? ((revenueThisMonthAmount - revenueLastMonthAmount) / revenueLastMonthAmount) * 100
        : 0;

    return NextResponse.json({
      totalCustomers,
      activeCustomers,
      newThisMonth,
      avgOrderValue: Number(orderAggregation._avg.totalAmount || 0),
      totalRevenue: Number(orderAggregation._sum.totalAmount || 0),
      totalOrders: orderAggregation._count.id || 0,
      totalProducts,
      revenueGrowth: Number(revenueGrowth.toFixed(1)),
      ordersGrowth: Number(ordersGrowth.toFixed(1)),
      customerGrowth: Number(customerGrowth.toFixed(1)),
    });
  } catch (error) {
    console.error('[GET /api/admin/customers/stats]', error);
    return NextResponse.json({ error: 'Failed to fetch customer stats' }, { status: 500 });
  }
}
