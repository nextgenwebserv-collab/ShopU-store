import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { connectToRedis } from '@/redis/redisClient';
import { cache } from '@/redis/helper';
import { rateLimit } from '@/redis/rateLimit';

interface ProductResponse {
  success: boolean;
  products: unknown[];
  total: number;
  currentPage: number;
  totalPages: number;
  fromCache: boolean;
}

export async function GET(req: NextRequest) {
  try {
    // Redis connection
    await connectToRedis();

    // Rate Limiting (per IP)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-ip';

    const rate = await rateLimit.check(ip, 100, 60); // 100 req / 60 sec

    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests, please try later',
          retryAfter: rate.retryAfter,
        },
        { status: 429 }
      );
    }

    // Read query params
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Number(searchParams.get('limit') || '20'));
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;

    // Cache key
    const cacheKey = `featured_products_${category || 'all'}_page_${page}_limit_${limit}`;

    console.log('Checking cache -->', cacheKey);

    // Cache check
    const cached = await cache.get<ProductResponse>(cacheKey);

    if (cached) {
      console.log('CACHE HIT');
      return NextResponse.json({
        ...cached,
        fromCache: true,
      });
    }

    console.log('CACHE MISS');

    // prisma where clause
    const whereClause = {
      imageUrl: { not: '' },
      ...(category && {
        subCategory: {
          category: {
            name: {
              contains: category,
              mode: 'insensitive' as const,
            },
          },
        },
      }),
    };

    // DB queries (parallel)
    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
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
      }),
    ]);

    // Product transformation
    const productsWithDiscount = products.map(product => {
      const discount = (Number(product.id) % 30) + 10;
      const originalPrice = Math.ceil(Number(product.price) * (100 / (100 - discount)));

      return {
        ...product,
        discount,
        originalPrice,
        featured: true,
      };
    });

    // Response object
    const responseData: ProductResponse = {
      success: true,
      products: productsWithDiscount,
      total: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      fromCache: false,
    };

    // Save to cache
    console.log('Saving data into cache...');
    cache.set(cacheKey, responseData, 60 * 5).catch(console.error);

    return NextResponse.json(responseData);
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
