export const revalidate = 3600;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/client';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
