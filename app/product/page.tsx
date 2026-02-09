import { Suspense } from 'react';
import { ChevronDown, Loader, SlidersVertical } from 'lucide-react';
import Navroute from '../components/Navroute';
import Sidebar from '../components/FilterSidebar';
import ProductGridClient from './ProductGridClient';
import { cache } from '@/redis/helper';
import { prisma } from '@/lib/client';
import { connectToRedis } from '@/redis/redisClient';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  packaging?: string;
  rating?: number;
  reviews?: number;
  imageUrl?: string;
  category?: string;
  description?: string;
}

async function getProductsFromRedis(
  category?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<Product[]> {
  try {
    await connectToRedis();

    const cacheKey = `products_${category || 'all'}_${minPrice || 0}_${maxPrice || 999999}`;

    // Check Redis cache first
    console.log('Checking Redis cache:', cacheKey);
    const cachedProducts = await cache.get<Product[]>(cacheKey);

    if (cachedProducts) {
      console.log('Cache hit - returning cached products');
      return cachedProducts;
    }

    console.log('Cache miss - fetching from database');

    // Build where clause based on category filter
    const whereClause = {
      imageUrl: { not: '' },
      price: {
        gte: minPrice || 0,
        lte: maxPrice || 999999,
      },
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

    // Fetch products from database
    const products = await prisma.product.findMany({
      where: whereClause,
      take: 100,
      include: {
        subCategory: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ stock: 'desc' }, { price: 'asc' }],
    });

    // Map and add discount calculation
    const productsWithDiscount: Product[] = products.map(product => {
      const discount = (Number(product.id) % 30) + 10;
      const originalPrice = Math.ceil(Number(product.price) * (100 / (100 - discount)));

      return {
        id: String(product.id),
        name: product.name,
        price: Number(product.price),
        originalPrice,
        discount,
        stock: product.stock,
        packaging: product.packaging || undefined,
        rating: 4.5,
        reviews: 100,
        imageUrl: product.imageUrl,
        category: product.subCategory?.category?.name,
        description: product.description,
      };
    });

    // Store in Redis cache for 5 minutes
    console.log('Saving products to Redis cache');
    await cache.set(cacheKey, productsWithDiscount, 60 * 5);

    return productsWithDiscount;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

interface ProductPageProps {
  searchParams: Promise<{ category?: string; minPrice?: string; maxPrice?: string }>;
}

async function ProductPageContent({ searchParams }: ProductPageProps) {
  const params = await searchParams;
  const category = params.category && params.category !== 'All' ? params.category : undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const products = await getProductsFromRedis(category, minPrice, maxPrice);

  if (products.length === 0) {
    return (
      <>
        <Navroute />
        <div className="min-h-[70vh] pt-4 text-center text-gray-500">No products found.</div>
      </>
    );
  }

  return (
    <>
      <Navroute />
      <div className="min-h-xl bg-background p-4 md:px-2 lg:px-8">
        {/* Desktop view */}
        <div className="mx-auto hidden max-w-7xl justify-between gap-6 px-6 py-4 sm:flex md:px-6 lg:px-10">
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-md font-semibold">
                You searched for:{' '}
                <span className="text-primaryColor text-lg capitalize">{category || 'All'}</span>
              </div>
              <select className="rounded bg-white py-2 pr-8 pl-4 text-sm shadow outline-none">
                <option>Default Sorting</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {/* Product Grid - Client Component */}
            <ProductGridClient products={products} />
          </main>
        </div>

        {/* Mobile view */}
        <div className="flex justify-between sm:hidden">
          <main className="flex-1 space-y-2">
            <div className="text-md mb-4 items-end justify-between">
              <div className="mb-2 px-2 font-semibold">
                You searched for:{' '}
                <span className="text-primaryColor text-lg capitalize">{category || 'All'}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                    <SlidersVertical size={20} className="text-primaryColor" />
                    Filter
                  </button>
                  <button className="flex items-center gap-1 rounded-full border border-gray-300 bg-white p-2">
                    Sort By <ChevronDown size={22} className="text-primaryColor" />
                  </button>
                </div>
                <div className="text-xs">
                  Showing 1-{Math.min(20, products.length)} of {products.length} results
                </div>
              </div>
            </div>

            {/* Product Grid - Client Component */}
            <ProductGridClient products={products} isMobile={true} />
          </main>
        </div>
      </div>
    </>
  );
}

export default function ProductPage({ searchParams }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      }
    >
      <ProductPageContent searchParams={searchParams} />
    </Suspense>
  );
}
