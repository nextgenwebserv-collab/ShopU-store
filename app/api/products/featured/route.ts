import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') || '20');
    const page = Number(searchParams.get('page') || '1');
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;

    const totalCount = await prisma.product.count({
      where: {
        ...(category && {
          subCategory: {
            category: {
              name: {
                contains: category,
                mode: 'insensitive',
              },
            },
          },
        }),
      },
    });

    // Paginated product fetch
    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            imageUrl: {
              not: '',
            },
          },
        ],
        ...(category && {
          subCategory: {
            category: {
              name: {
                contains: category,
                mode: 'insensitive',
              },
            },
          },
        }),
      },
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ stock: 'desc' }, { price: 'asc' }],
      skip,
      take: limit,
    });

    // Add discount/originalPrice field
    const productsWithDiscount = products.map(product => {
      const discount = Math.floor(Math.random() * 40) + 10;
      const originalPrice = Math.ceil(Number(product.price) * (100 / (100 - discount)));
      return {
        ...product,
        discount,
        originalPrice,
        featured: true,
      };
    });

    return NextResponse.json({
      success: true,
      products: productsWithDiscount,
      total: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
