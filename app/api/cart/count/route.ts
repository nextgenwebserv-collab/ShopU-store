import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';

// GET - get the total number of items in the user's cart
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 });
    }

    const payload = verifyToken(token);

    const userId = payload.id;

    // Count total items in cart (sum of quantities)
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      select: { quantity: true },
    });

    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const uniqueItemCount = cartItems.length;

    return NextResponse.json({
      success: true,
      count: {
        items: itemCount,
        uniqueItems: uniqueItemCount,
      },
    });
  } catch (error) {
    console.error('[GET /api/cart/count]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cart count' },
      { status: 500 }
    );
  }
}
