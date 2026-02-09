export const revalidate = 300;

import { NextRequest, NextResponse } from 'next/server';
import { Prisma, prisma } from '@/lib/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    let whereClause: Prisma.ProductWhereInput = {};

    if (subCategoryId) {
      whereClause = { subCategoryId };
    } else if (categoryId) {
      whereClause = {
        subCategory: {
          categoryId,
        },
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      take: limit,
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },

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

    return NextResponse.json({ products });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const product = await prisma.product.create({
      data,
      include: {
        subCategory: true,
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
