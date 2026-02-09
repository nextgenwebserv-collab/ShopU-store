import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';

// In-memory cache with expiration
const searchCache = new Map<string, { data: unknown[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache TTL

const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
};
setInterval(cleanupCache, 5 * 60 * 1000);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get('name');
    const limit = Number(searchParams.get('limit') || '30');

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const trimmed = name.trim().toLowerCase();

    const cacheKey = `merged_${trimmed}_${limit}`;

    // check cache first
    if (searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({
          success: true,
          data: cached.data,
          cached: true,
        });
      }
    }

    /** --- MEDICINES SEARCH -- */
    const medicines = await prisma.medicine.findMany({
      where: {
        name: {
          contains: trimmed,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    /** --- PRODUCTS SEARCH -- */
    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: trimmed,
                  mode: 'insensitive',
                },
              },
              {
                subCategory: {
                  name: {
                    contains: trimmed,
                    mode: 'insensitive',
                  },
                },
              },
              {
                subCategory: {
                  category: {
                    name: {
                      contains: trimmed,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          },
        ],
      },

      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },

      take: limit,
      orderBy: { name: 'asc' },
    });

    // merge + tag type
    const results = [
      ...medicines.map(m => ({ ...m, type: 'medicine' })),
      ...products.map(p => ({ ...p, type: 'product' })),
    ].slice(0, limit); // enforce limit after merge

    // store cache
    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (err) {
    console.error('[MERGED_SEARCH_ERROR]', err);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
