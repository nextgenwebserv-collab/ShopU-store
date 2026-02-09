import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { filters = {}, searchQuery = '', selectedCustomers } = body;
    // Build where clause based on filters
    const where: Prisma.UserWhereInput = {};

    if (selectedCustomers && selectedCustomers.length > 0) {
      where.id = { in: selectedCustomers };
    } else {
      if (filters.status === 'Active') {
        where.orders = { some: {} };
      } else if (filters.status === 'Inactive') {
        where.orders = { none: {} };
      }

      if (searchQuery) {
        where.OR = [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { phoneNumber: { contains: searchQuery } },
        ];
      }

      if (filters.minOrders) {
        // const minOrders = parseInt(filters.minOrders);
        where.orders = { ...where.orders, some: {} };
      }
    }

    // Fetch customers for export
    const customers = await prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        addresses: {
          where: { isDefault: true },
          select: {
            city: true,
            state: true,
            addressLine1: true,
            postalCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to CSV format
    const csvData = customers.map(customer => {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      const lastOrderDate =
        customer.orders.length > 0
          ? customer.orders.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0].createdAt
          : customer.createdAt;

      const defaultAddress = customer.addresses[0];

      return {
        'Customer ID': customer.id,
        Name: customer.name || 'N/A',
        Email: customer.email || 'N/A',
        'Phone Number': customer.phoneNumber,
        'Total Orders': totalOrders,
        'Total Spent': totalSpent.toFixed(2),
        'Last Order Date': lastOrderDate.toISOString().split('T')[0],
        Status: totalOrders > 0 ? 'Active' : 'Inactive',
        'Join Date': customer.createdAt.toISOString().split('T')[0],
        City: defaultAddress?.city || 'N/A',
        State: defaultAddress?.state || 'N/A',
        Address: defaultAddress?.addressLine1 || 'N/A',
        'Postal Code': defaultAddress?.postalCode || 'N/A',
      };
    });

    // Generate CSV content
    if (csvData.length === 0) {
      return NextResponse.json({ error: 'No customers found for export' }, { status: 400 });
    }

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row =>
        headers
          .map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(',')
      ),
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="customers-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[POST /api/admin/customers/export]', error);
    return NextResponse.json({ error: 'Failed to export customers' }, { status: 500 });
  }
}
