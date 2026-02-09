'use client';

import React, { useRef } from 'react';
import ProductCardWrapper from './ProductCardWrapper';
import { useWishlist } from '../hooks/useWishlist';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useAddToCart from '../hooks/handleAddToCart';
import { useRouter } from 'next/navigation';
import { useProducts } from '../hooks/useProduct';

const EverydayEssentialsSection = () => {
  const { favorites, toggleFavorite } = useWishlist();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { handleAddToCart, addingProductId } = useAddToCart();
  const router = useRouter();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -690 : 690,
        behavior: 'smooth',
      });
    }
  };

  const { products, loading, error } = useProducts({
    limit: 10,
  });

  const handleCardClick = () => {
    router.push('/product');
  };

  return (
    <section className="max-h-xl">
      {/* Desktop view */}
      <div className="container mx-auto hidden w-[90%] max-w-7xl px-4 py-6 sm:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-primaryColor text-xl font-semibold">
            Everyday <span className="text-secondaryColor">Essentials</span>
            <hr className="bg-background1 mt-1 h-1 w-48 rounded border-0" />
          </h2>
          <button
            className="bg-background1 flex cursor-pointer rounded py-2 pr-2 pl-3 text-sm font-medium text-white"
            onClick={handleCardClick}
          >
            View All <ChevronRight size={20} />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="bg-background1 absolute top-1/2 left-[-15px] z-10 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full text-white shadow-md"
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
              Failed to load everyday essentials products. Please try again.
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No everyday essentials products available.
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth py-4"
            >
              {products.map(product => (
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

          <button
            onClick={() => scroll('right')}
            className="bg-background1 absolute top-1/2 right-[-10px] z-10 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full text-white shadow-md"
          >
            <ChevronRight size={20} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Mobile view */}
      <div className="px-4 py-6 sm:hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-primaryColor mb-4 text-lg font-medium">
            Everyday <span className="text-secondaryColor">Essential</span>
            <hr className="bg-background1 mt-1 w-40 rounded border-2" />{' '}
          </h2>

          <button
            className="bg-background text-md text-primaryColor cursor-pointer rounded px-3 py-1 font-semibold"
            onClick={handleCardClick}
          >
            View All <span className="text-lg">{'>'}</span>
          </button>
        </div>

        {/* Horizontal Scrollable Card Row */}
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
              Failed to load everyday essentials products. Please try again.
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No everyday essentials products available.
            </div>
          ) : (
            products.map(product => (
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
    </section>
  );
};

export default EverydayEssentialsSection;
