import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';

// PUT - update cart item quantity
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: cartItemId } = await params;
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const userId = payload.id;

    const { quantity } = await req.json();

    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    // Find the cart item and check if it belongs to the user
    const cartItem = await prisma.cartItem.findMany({
      where: {
        id: cartItemId,
        userId,
      },
      include: {
        medicine: true,
        product: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ success: false, error: 'Cart item not found' }, { status: 404 });
    }

    // Update the cart item quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true, medicine: true },
    });

    return NextResponse.json({ success: true, cartItem: updatedCartItem });
  } catch (error) {
    console.error('[PUT /api/cart/[id]]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE - remove an item from the cart
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: cartItemId } = await params;
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const userId = payload.id;
    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ success: false, error: 'Cart item not found' }, { status: 404 });
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('[DELETE /api/cart/[id]]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
