// /app/api/medicine/search/route.ts
//only for testing purpose

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { Medicine, Prisma } from '@prisma/client';

// In-memory cache with expiration
const searchCache = new Map<string, { data: Medicine[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache TTL

// Clean up expired cache entries
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupCache, 5 * 60 * 1000);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const limit = Number(searchParams.get('limit') || '30');
    const page = Number(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // If neither name nor type is provided, return all medicines with limit
    if (!name && !type) {
      // Create a cache key for generic queries
      const cacheKey = `all_medicines_${limit}_${page}`;

      // Check cache first
      if (searchCache.has(cacheKey)) {
        const cachedResult = searchCache.get(cacheKey);
        if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
          return NextResponse.json({
            success: true,
            data: cachedResult.data,
            cached: true,
          });
        }
      }

      const medicines = await prisma.medicine.findMany({
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
      });

      // Store in cache
      searchCache.set(cacheKey, {
        data: medicines,
        timestamp: Date.now(),
      });

      return NextResponse.json({ success: true, data: medicines });
    }

    // Handle searching by name
    if (name && name.trim() !== '') {
      // Create a cache key from the query parameters
      const cacheKey = `${name.trim().toLowerCase()}_${limit}_${page}`;

      // Check if we have a cached result
      if (searchCache.has(cacheKey)) {
        const cachedResult = searchCache.get(cacheKey);
        if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
          return NextResponse.json({
            success: true,
            data: cachedResult.data,
            cached: true,
          });
        }
      }

      // Optimize query by creating a basic search index within the query
      // Use startsWith for faster matching if appropriate
      const searchTerms = name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 1);

      const medicines = await prisma.medicine.findMany({
        where: {
          OR: [
            // Exact match (fast)
            { name: { equals: name, mode: 'insensitive' } },
            // Starts with match (fast)
            { name: { startsWith: name, mode: 'insensitive' } },
            // Contains match for individual terms (slower but comprehensive)
            ...searchTerms.map(term => ({
              name: { contains: term, mode: Prisma.QueryMode.insensitive },
            })),
          ],
        },
        take: limit,
        skip: offset,
        orderBy: [
          // Order by name ascending
          {
            name: 'asc',
          },
        ],
      });

      // Store in cache
      searchCache.set(cacheKey, {
        data: medicines,
        timestamp: Date.now(),
      });

      return NextResponse.json({ success: true, data: medicines });
    }

    // Handle filtering by type
    if (type) {
      const cacheKey = `type_${type.toLowerCase()}_${limit}_${page}`;

      // Check cache first
      if (searchCache.has(cacheKey)) {
        const cachedResult = searchCache.get(cacheKey);
        if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
          return NextResponse.json({
            success: true,
            data: cachedResult.data,
            cached: true,
          });
        }
      }

      const medicines = await prisma.medicine.findMany({
        where: {
          type: { contains: type, mode: 'insensitive' },
        },
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
      });

      // Store in cache
      searchCache.set(cacheKey, {
        data: medicines,
        timestamp: Date.now(),
      });

      return NextResponse.json({ success: true, data: medicines });
    }

    // Default response
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('[MEDICINE_SEARCH_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
