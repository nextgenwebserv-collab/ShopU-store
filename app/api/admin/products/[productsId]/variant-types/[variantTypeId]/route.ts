import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { updateVariantTypeSchema } from '@/lib/schema/adminSchema';
import { isAdmin } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productsId: string; variantTypeId: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { variantTypeId } = await params;
    const parsed = updateVariantTypeSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.variantType.update({
      where: { id: variantTypeId },
      data: {
        name: parsed.data.name,
      },
    });

    return NextResponse.json({ success: true, variantType: updated });
  } catch (error) {
    console.error('[PUT /variant-types/:variantTypeId]', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productsId: string; variantTypeId: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { variantTypeId } = await params;

    await prisma.variantType.delete({
      where: { id: variantTypeId },
    });

    return NextResponse.json({ success: true, message: 'Variant type deleted' });
  } catch (error) {
    console.error('[DELETE /variant-types/:variantTypeId]', error);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
