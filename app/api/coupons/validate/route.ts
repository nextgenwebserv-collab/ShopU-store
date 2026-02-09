import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();

    const coupon = await prisma.coupon.findFirst({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, message: 'Coupon not found' }, { status: 404 });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ valid: false, message: 'Coupon expired' }, { status: 400 });
    }

    if (coupon.maxUsage <= 0) {
      return NextResponse.json(
        { valid: false, message: 'Coupon usage limit reached' },
        { status: 400 }
      );
    }

    const discountAmount = (orderAmount * coupon.discount) / 100;
    const finalAmount = orderAmount - discountAmount;

    return NextResponse.json({
      valid: true,
      coupon,
      discountAmount,
      finalAmount,
    });
  } catch (err) {
    console.error('Error validating coupon:', err);
    return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 });
  }
}
