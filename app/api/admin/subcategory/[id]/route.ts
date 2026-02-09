import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { updateSubCategorySchema } from '@/lib/schema/adminSchema';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');

  try {
    const subCategories = await prisma.subCategory.findMany({
      where: categoryId ? { categoryId } : undefined, //fetches category under category id if avl else all subCategories
      include: { category: true },
    });

    return NextResponse.json(subCategories, { status: 200 });
  } catch (error) {
    console.error('Somthing wents wrong:', error);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.subCategory.delete({ where: { id } });
    return NextResponse.json({ message: 'Subcategory deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: subCategoryId } = await params;
    const body = await req.json();
    const parsed = updateSubCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { name, categoryId } = parsed.data;

    const updatedSubCategory = await prisma.subCategory.update({
      where: { id: subCategoryId },
      data: { name, categoryId },
    });

    return NextResponse.json(updatedSubCategory);
  } catch (error) {
    console.error('[PUT /api/admin/subcategories/[id]]', error);
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 });
  }
}
