'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Image from 'next/image';
import useAddToCart from '../hooks/handleAddToCart';
interface Product {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  features: string[];
  isOnSale: boolean;
}

interface ProductFromApi {
  imageUrl: string;
  id: string | number;
  name: string;
  price: number;
  discount?: number;
  description?: string;
  subCategory?: {
    name: string;
  };
}

const DealOfTheWeek = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 6,
    hours: 20,
    minutes: 60,
    seconds: 0,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(2);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleAddToCart, addingProductId } = useAddToCart();

  // Fetch deals
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products/featured?discount=true&limit=4');
        if (res.ok) {
          const data = await res.json();
          const dealsProducts: Product[] =
            data.products?.map((product: ProductFromApi) => ({
              id: String(product.id),
              name: product.name ?? 'Unnamed Product',
              price: `₹${product.price}`,
              imageUrl: product.imageUrl ?? '/Sirum.png',
              features: [
                product.description?.substring(0, 40) || 'Quality product',
                product.subCategory?.name || 'Essential item',
                `${product.discount ?? 20}% discount`,
              ].filter(Boolean),
              isOnSale: true,
            })) || [];
          setProducts(dealsProducts);
          setCurrentIndex(0);
        } else {
          console.log('Error fetching deals:');
        }
      } catch (err) {
        console.error('Error fetching deals:', err);
        setProducts([
          {
            id: 1,
            name: 'Moov Pain Relief Ointment',
            imageUrl: '/Sirum.png',
            price: '₹165',
            features: ['Relieves pain', 'Soothes muscles', 'Quick relief'],
            isOnSale: true,
          },
          {
            id: 2,
            name: 'Vitamin C 500mg Sugarless',
            imageUrl: '/Sirum.png',
            price: '₹199',
            features: ['Boost immunity', 'No sugar', 'Tasty chewables'],
            isOnSale: false,
          },
        ]);
        setCurrentIndex(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.days === 0 && prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          return prev;
        }

        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };

        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle responsive view
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 640 ? 1 : 2);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + itemsPerPage < products.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-gray-200"></div>
              <div className="h-4 w-24 rounded bg-gray-200"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-48 rounded-lg bg-gray-200"></div>
            <div className="h-48 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  const ProductCard = () => (
    <>
      {/* Desktop view */}
      <div
        className={`grid hidden gap-4 sm:grid ${itemsPerPage === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
      >
        {visibleProducts.map(product => (
          <div key={product.id} className="rounded-lg">
            <div className="flex gap-4 sm:flex-row">
              <div className="relative">
                <div className="flex h-70 w-65 items-center justify-center bg-white">
                  <Image
                    src={product.imageUrl}
                    alt="Sirum logo"
                    width={400}
                    height={300}
                    className="w-full p-4 transition-transform duration-300 hover:scale-102"
                  />
                </div>
                {product.isOnSale && (
                  <span className="bg-background2 absolute top-3 left-3 rounded-lg px-2.5 py-0.5 text-xs text-white">
                    Sale
                  </span>
                )}
              </div>
              <div className="flex-1 border-2 border-gray-200 p-4">
                <h3 className="text-lg font-medium">
                  {product.name.length > 40 ? product.name.slice(0, 40) + '…' : product.name}
                </h3>
                <p className="text-primaryColor text-xl font-bold">{product.price}</p>
                <ul className="mt-2 space-y-1">
                  {product.features.filter(Boolean).map((f, i) => (
                    <li
                      key={`${product.id}-${i}`}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="text-secondaryColor h-3 w-3" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleAddToCart(product.id.toString())}
                  disabled={addingProductId === product.id}
                  className="bg-background1 mt-4 flex cursor-pointer items-center gap-1 rounded px-4 py-1 text-white"
                >
                  {addingProductId === product.id ? (
                    <span className="text-md">Adding...</span>
                  ) : (
                    <span>ADD</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile view */}
      <div
        className={`grid gap-2 pt-2 sm:hidden ${itemsPerPage === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
      >
        {visibleProducts.map(product => (
          <div key={product.id} className="rounded-lg">
            <div className="flex gap-2 sm:flex-row">
              <div className="relative">
                <div className="flex h-full w-auto items-center justify-center bg-white">
                  <Image
                    src={product.imageUrl}
                    alt="Sirum logo"
                    width={180}
                    height={150}
                    className="py-4"
                  />
                </div>
                {product.isOnSale && (
                  <span className="bg-background2 absolute top-3 left-3 rounded-lg px-2.5 py-0.5 text-xs text-white">
                    Sale
                  </span>
                )}
              </div>
              <div className="flex-1 border-2 border-gray-200 p-2">
                <div className="mx-auto flex flex-col">
                  <h3 className="text-md font-medium">
                    {product.name.length > 40 ? product.name.slice(0, 40) + '…' : product.name}
                  </h3>
                  <p className="text-primaryColor text-lg font-bold">{product.price}</p>
                  <ul className="mt-2 space-y-1">
                    {product.features.filter(Boolean).map((f, i) => (
                      <li
                        key={`${product.id}-${i}`}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <Check className="text-secondaryColor h-3 w-3" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleAddToCart(product.id.toString())}
                  disabled={addingProductId === product.id}
                  className="bg-background1 mt-4 flex cursor-pointer items-center gap-1 rounded px-3 text-white"
                >
                  {addingProductId === product.id ? (
                    <span className="text-md">Adding...</span>
                  ) : (
                    <span>ADD</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop view */}
      <section className="mx-auto hidden max-w-6xl px-14 py-8 sm:block md:px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-primaryColor text-2xl font-semibold">
              Deal of <span className="text-secondaryColor">The Week</span>
            </h2>
            <div className="flex justify-center gap-2 sm:justify-start">
              {['days', 'hours', 'minutes', 'seconds'].map(unit => (
                <div
                  key={unit}
                  className="bg-background2 rounded px-2 py-1.5 text-center text-sm font-medium text-white"
                >
                  <div className="text-base font-bold">
                    {timeLeft[unit as keyof typeof timeLeft]}
                  </div>
                  <div className="capitalize">{unit}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                currentIndex === 0 ? 'bg-gray-200 text-gray-400' : 'bg-background1 text-white'
              }`}
            >
              <ChevronLeft />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex + itemsPerPage >= products.length}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                currentIndex + itemsPerPage >= products.length
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-background1 text-white'
              }`}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
        <ProductCard />
      </section>

      {/* Mobile view*/}
      <section className="block p-4 sm:hidden">
        <div className="mb-4 flex items-center justify-center gap-2">
          <h2 className="text-primaryColor mt-1 text-center text-lg font-semibold">
            Deal of <span className="text-secondaryColor">The Week</span>
            <hr className="mt-1 w-36 border-2" />
          </h2>
          <div className="flex justify-center gap-1">
            {['days', 'hours', 'minutes', 'seconds'].map(unit => (
              <div
                key={unit}
                className="bg-background2 rounded px-1.5 py-1 text-center text-xs font-medium text-white"
              >
                <div className="text-sm font-medium">{timeLeft[unit as keyof typeof timeLeft]}</div>
                <div className="capitalize">{unit}</div>
              </div>
            ))}
          </div>
        </div>
        <ProductCard />
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              currentIndex === 0 ? 'bg-gray-200 text-gray-400' : 'bg-background1 text-white'
            }`}
          >
            <ChevronLeft />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex + itemsPerPage >= products.length}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              currentIndex + itemsPerPage >= products.length
                ? 'bg-gray-200 text-gray-400'
                : 'bg-background1 text-white'
            }`}
          >
            <ChevronRight />
          </button>
        </div>
      </section>
    </>
  );
};

export default DealOfTheWeek;
