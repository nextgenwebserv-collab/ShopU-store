'use client';

import React, { useRef } from 'react';
import ProductCardWrapper from './ProductCardWrapper';
import HealthCategoryGrid from '../components/HealthCategoryGrid';
import { useWishlist } from '../hooks/useWishlist';
import { useProducts } from '../hooks/useProduct';
import useAddToCart from '../hooks/handleAddToCart';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HealthCategory {
  id: string;
  name: string;
  image: string;
}

const ShopUHealthComponent: React.FC = () => {
  const { favorites, toggleFavorite } = useWishlist();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { handleAddToCart, addingProductId } = useAddToCart();

  const { products, loading, error } = useProducts({
    limit: 10,
  });

  const healthCategories: HealthCategory[] = [
    { id: 'diabetes', name: 'Diabetes Care', image: '/Diabetise.jpg' },
    { id: 'cardiac', name: 'Cardiac Care', image: '/cardiac.jpg' },
    { id: 'elderly', name: 'Elderly Care', image: '/elderly.jpg' },
    { id: 'oral', name: 'Oral Care', image: '/oral.jpg' },
    { id: 'stomach', name: 'Stomach Care', image: '/stomach.jpg' },
    { id: 'pain', name: 'Pain Relief', image: '/pain.jpg' },
    { id: 'liver', name: 'Liver Care', image: '/liver.jpg' },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -690 : 690,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="min-h-xl">
      {/* ✅ Desktop View */}
      <div className="mx-auto hidden w-[90%] max-w-7xl px-4 py-6 sm:block">
        {/* ✅ Health Categories */}
        <HealthCategoryGrid healthCategories={healthCategories} />

        {/* ✅ Super Saver Section */}
        <div className="mx-auto py-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-primaryColor text-xl font-semibold">
              Super Saver <span className="text-secondaryColor">Up to 50% off</span>
              <hr className="bg-background1 mt-1 h-1 rounded border-0" />
            </h2>
            <button className="bg-background1 flex cursor-pointer rounded py-2 pr-2 pl-3 text-sm font-medium text-white">
              View All <ChevronRight size={20} />
            </button>
          </div>

          <div className="relative">
            {/* Scroll Arrows */}
            <button
              onClick={() => scroll('left')}
              className="bg-background1 absolute top-1/2 left-[-15px] z-10 hidden h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full text-white shadow-md sm:flex"
            >
              <ChevronLeft size={20} className="mr-1" />
            </button>

            {loading ? (
              <div className="no-scrollbar flex gap-4 overflow-x-auto px-1">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="min-w-[210px] animate-pulse">
                    <div className="mb-2 h-52 rounded-lg bg-gray-200"></div>
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-secondaryColor py-8 text-center">
                Failed to load super saver products. Please try again.
              </div>
            ) : products.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No super saver products available.
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth py-4"
              >
                {products
                  .filter(product => (product.discount ?? 0) >= 40)
                  .map(product => (
                    <div key={product.id} className="max-w-[210px] min-w-[210px]">
                      <ProductCardWrapper
                        key={product.id}
                        product={product}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        handleAddToCart={handleAddToCart}
                        addingProductId={addingProductId}
                      />
                    </div>
                  ))}
              </div>
            )}

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              className="bg-background1 absolute top-1/2 right-[-10px] z-10 hidden h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full text-white shadow-md sm:flex"
            >
              <ChevronRight size={20} className="ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile View */}
      <div className="p-4 sm:hidden">
        <HealthCategoryGrid healthCategories={healthCategories} />

        <div className="py-4">
          <div className="my-4 flex items-center justify-between">
            <h2 className="text-primaryColor text-lg font-medium">
              Super Saver <span className="text-secondaryColor">Up to 50% off</span>
              <hr className="bg-background1 mt-1 rounded border-2" />
            </h2>
            <button className="bg-background text-md text-primaryColor cursor-pointer rounded px-3 py-1 font-semibold">
              View All <span className="text-lg">{'>'}</span>
            </button>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth py-1">
            {loading ? (
              [...Array(2)].map((_, index) => (
                <div key={index} className="min-w-[170px] animate-pulse">
                  <div className="mb-2 h-52 rounded-lg bg-gray-200"></div>
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                </div>
              ))
            ) : error ? (
              <div className="text-secondaryColor py-8 text-center">
                Failed to load super saver. Please try again.
              </div>
            ) : products.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No super saver product available.
              </div>
            ) : (
              products
                .filter(product => (product.discount ?? 0) >= 40)
                .map(product => (
                  <div key={product.id} className="max-w-[160px] min-w-[160px] flex-shrink-0">
                    <ProductCardWrapper
                      key={product.id}
                      product={product}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      handleAddToCart={handleAddToCart}
                      addingProductId={addingProductId}
                    />
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopUHealthComponent;
