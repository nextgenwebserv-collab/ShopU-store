// /api/admin/category

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { isAdmin } from '@/lib/auth';
import { createCategorySchema } from '@/lib/schema/adminSchema';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { success: false, error: true, message: 'Unauthorized access' },
      { status: 401 }
    );
  }
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
    });
    return NextResponse.json({ success: true, error: false, categories }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { success: false, error: true, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { name } = parsed.data;

    if (!name) {
      return NextResponse.json(
        { success: false, error: true, message: 'Name is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: true, message: 'Already exists category!' },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({ data: { name } });

    return NextResponse.json({ success: true, error: false, data: newCategory }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to create category' },
      { status: 500 }
    );
  }
}
