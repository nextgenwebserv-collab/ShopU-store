import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('API ERROR at GET /api/account/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Verify the order belongs to the user
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder || existingOrder.userId !== user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['status', 'notes'] as const;
    const updateData: { status?: string; notes?: string } = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updateData[key as keyof typeof updateData] = body[key];
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('API ERROR at PATCH /api/account/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
