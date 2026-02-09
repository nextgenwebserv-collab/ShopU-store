// /api/admin/subcategory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { createSubCategorySchema } from '@/lib/schema/adminSchema';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { success: false, error: true, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');

  try {
    const subCategories = await prisma.subCategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
    });

    return NextResponse.json({ success: true, error: false, subCategories }, { status: 200 });
  } catch (error) {
    console.error('Somthing wents wrong:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSubCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { name, categoryId } = parsed.data;

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, error: true, message: 'Name and categoryId are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.subCategory.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        categoryId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: true, message: 'Already exists subcategory!' },
        { status: 409 }
      );
    }

    const newSubCategory = await prisma.subCategory.create({
      data: { name, categoryId },
    });

    return NextResponse.json(
      { success: true, error: false, message: 'Subcategory Added!', newSubCategory },
      { status: 200 }
    );
  } catch (err) {
    console.error('Somthing wents wrong:', err);
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}
