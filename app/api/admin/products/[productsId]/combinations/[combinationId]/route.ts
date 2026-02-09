import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { createCombinationSchema } from '@/lib/schema/adminSchema';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productsId: string; combinationId: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { combinationId } = await params;

    await prisma.productVariantCombination.delete({
      where: {
        id: combinationId,
      },
    });

    return NextResponse.json({ message: 'Combination deleted successfully' });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete combination' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productsId: string; combinationId: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { combinationId } = await params;
    const body = await req.json();
    const parsed = createCombinationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { price, stock, imageUrl, variantValueIds } = parsed.data;

    await prisma.combinationValue.deleteMany({
      where: { combinationId },
    });

    const updatedCombination = await prisma.productVariantCombination.update({
      where: { id: combinationId },
      data: {
        price,
        stock,
        imageUrl,
        values: {
          create: variantValueIds.map((id: string) => ({
            variantValueId: id,
          })),
        },
      },
      include: {
        values: {
          include: {
            variantValue: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCombination);
  } catch (err) {
    console.error('PUT error:', err);
    return NextResponse.json({ error: 'Failed to update combination' }, { status: 500 });
  }
}
