import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25'); // Increased default limit
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build optimized where clause
    const where: Prisma.UserWhereInput = {};

    if (status === 'Active') {
      where.orders = { some: {} };
    } else if (status === 'Inactive') {
      where.orders = { none: {} };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
      ];
    }

    // Run queries in parallel with optimized includes
    const [customers, totalCustomers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          // Only get essential order data for performance
          orders: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1, // Only get the latest order for performance
          },
          // Only get default address
          addresses: {
            where: { isDefault: true },
            select: {
              city: true,
              state: true,
            },
            take: 1,
          },
          // Get order count separately for better performance
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Get order totals in a separate optimized query
    const customerIds = customers.map(c => c.id);
    const orderTotals = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        userId: { in: customerIds },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Create a map for quick lookup
    const orderTotalsMap = new Map(
      orderTotals.map(total => [total.userId, Number(total._sum.totalAmount || 0)])
    );

    // Transform data efficiently
    const transformedCustomers = customers.map(customer => {
      const totalOrders = customer._count.orders;
      const totalSpent = orderTotalsMap.get(customer.id) || 0;
      const lastOrderDate =
        customer.orders.length > 0 ? customer.orders[0].createdAt : customer.createdAt;
      const defaultAddress = customer.addresses[0];

      return {
        id: customer.id,
        name: customer.name || 'N/A',
        email: customer.email || 'N/A',
        phoneNumber: customer.phoneNumber || 'N/A',
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrderDate.toISOString(),
        status: (totalOrders > 0 ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
        joinDate: customer.createdAt.toISOString(),
        city: defaultAddress?.city || 'N/A',
        state: defaultAddress?.state || 'N/A',
      };
    });

    return NextResponse.json({
      success: true,
      customers: transformedCustomers,
      pagination: {
        page,
        limit,
        total: totalCustomers,
        pages: Math.ceil(totalCustomers / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/customers]', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
