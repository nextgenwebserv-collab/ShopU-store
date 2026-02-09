import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // console.log('[GET /api/admin/customers/stats]');
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date ranges
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total customers
    const totalCustomers = await prisma.user.count();

    // Active customers (customers who have placed at least one order)
    const activeCustomers = await prisma.user.count({
      where: {
        orders: {
          some: {},
        },
      },
    });

    // New customers this month
    const newThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: thisMonth,
        },
      },
    });

    // New customers last month for growth calculation
    const newLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: thisMonth,
        },
      },
    });

    // Calculate customer growth
    const customerGrowth =
      newLastMonth > 0 ? ((newThisMonth - newLastMonth) / newLastMonth) * 100 : 0;

    // Calculate average order value and total revenue
    const orderStats = await prisma.order.aggregate({
      _avg: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Orders this month vs last month for growth calculation
    const ordersThisMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: thisMonth,
        },
      },
    });

    const ordersLastMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: thisMonth,
        },
      },
    });

    const ordersGrowth =
      ordersLastMonth > 0 ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0;

    // Revenue this month vs last month
    const revenueThisMonth = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: thisMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const revenueLastMonth = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: thisMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const revenueThisMonthAmount = Number(revenueThisMonth._sum.totalAmount || 0);
    const revenueLastMonthAmount = Number(revenueLastMonth._sum.totalAmount || 0);
    const revenueGrowth =
      revenueLastMonthAmount > 0
        ? ((revenueThisMonthAmount - revenueLastMonthAmount) / revenueLastMonthAmount) * 100
        : 0;

    // Total products count
    const totalProducts = await prisma.product.count();

    const avgOrderValue = orderStats._avg.totalAmount || 0;
    const totalRevenue = Number(orderStats._sum.totalAmount || 0);
    const totalOrders = orderStats._count.id || 0;

    return NextResponse.json({
      totalCustomers,
      activeCustomers,
      newThisMonth,
      avgOrderValue: Number(avgOrderValue),
      totalRevenue,
      totalOrders,
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
