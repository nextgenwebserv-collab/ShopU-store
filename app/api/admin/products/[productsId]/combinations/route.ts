import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { createCombinationSchema } from '@/lib/schema/adminSchema';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productsId: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productsId } = await params;
    const body = await request.json();

    const parsed = createCombinationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { price, stock, imageUrl, variantValueIds } = parsed.data;

    if (
      !price ||
      !stock ||
      !imageUrl ||
      !variantValueIds ||
      !Array.isArray(variantValueIds) ||
      variantValueIds.length === 0
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const combination = await prisma.productVariantCombination.create({
      data: {
        price,
        stock,
        imageUrl,
        productId: productsId,
        values: {
          create: variantValueIds.map((id: string) => ({
            variantValueId: id,
          })),
        },
      },
      include: {
        values: true,
      },
    });

    return NextResponse.json(combination);
  } catch (error) {
    console.error('[POST /api/admin/products/[productsId]/combinations]', error);
    return NextResponse.json({ error: 'Failed to create combination' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ productsId: string }> }) {
  try {
    const { productsId } = await params;

    const combinations = await prisma.productVariantCombination.findMany({
      where: { productId: productsId },
      include: {
        values: {
          include: {
            variantValue: true,
          },
        },
      },
    });

    return NextResponse.json(combinations);
  } catch (error) {
    console.error('[GET /api/admin/products/[productsId]/combinations]', error);
    return NextResponse.json({ error: 'Failed to fetch combinations' }, { status: 500 });
  }
}
