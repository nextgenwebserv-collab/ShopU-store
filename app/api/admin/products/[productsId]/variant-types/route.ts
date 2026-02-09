import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { createVariantTypeSchema } from '@/lib/schema/adminSchema';

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

    const parsed = createVariantTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { name } = parsed.data;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const variantType = await prisma.variantType.create({
      data: {
        name,
        productId: productsId,
      },
    });

    return NextResponse.json(variantType);
  } catch (error) {
    console.error('[POST /api/admin/products/[productsId]/variant-types]', error);
    return NextResponse.json({ error: 'Failed to create variant type' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productsId');

    let variantTypes;
    if (productId) {
      variantTypes = await prisma.variantType.findMany({
        where: { productId },
        include: { values: true }, // include variant values if needed
      });
    } else {
      variantTypes = await prisma.variantType.findMany({
        include: { values: true },
      });
    }

    return NextResponse.json(variantTypes, { status: 200 });
  } catch (error) {
    let message = 'Unknown error';

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { error: 'Failed to fetch variant types', details: message },
      { status: 500 }
    );
  }
}
