export const revalidate = 600;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        subCategory: {
          include: { category: true },
        },
        productImages: true,
        variantTypes: {
          include: {
            values: true,
          },
        },
        combinations: {
          include: {
            values: {
              include: {
                variantValue: {
                  include: {
                    variantType: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error('[GET /api/products/[id]]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}
