import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        addresses: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('[GET /api/admin/customers/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch customer details' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if customer has orders
    const customerWithOrders = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });

    if (!customerWithOrders) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    if (customerWithOrders.orders.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete customer with existing orders',
        },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('[DELETE /api/admin/customers/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, phoneNumber } = body;

    if (!name && !email && !phoneNumber) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 });
    }

    const updateData: Partial<{ name: string; email: string; phoneNumber: string }> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error('[PUT /api/admin/customers/[id]]', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
