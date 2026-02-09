'use client';

import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { useWishlist } from '../hooks/useWishlist';
import useAddToCart from '../hooks/handleAddToCart';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types/ProductTypes';

interface SimilarProductsSectionProps {
  products: Product[];
}

const SimilarProductsSection: React.FC<SimilarProductsSectionProps> = ({ products }) => {
  const { favorites, toggleFavorite } = useWishlist();
  const { handleAddToCart, addingProductId } = useAddToCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -690 : 690,
        behavior: 'smooth',
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <>
      <section className="min-h-xl">
        <div className="container mx-auto hidden w-[90%] max-w-7xl px-4 py-6 sm:block">
          <div className="flex items-center justify-between">
            <h2 className="text-primaryColor mb-4 text-xl font-semibold sm:text-xl">
              Similar <span className="text-secondaryColor">Products</span>
              <hr className="bg-background1 mt-1 h-1 w-40 rounded border-0" />
            </h2>
          </div>

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              className="bg-background1 absolute top-1/2 left-[-15px] z-10 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full text-white shadow-md"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Products */}
            <div
              ref={scrollRef}
              className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth py-2"
            >
              {products.map(product => (
                <div key={product.id} className="max-w-[210px] min-w-[210px]">
                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      discount: product.discount || 20,
                      stock: product.stock,
                      packaging: product.packaging,
                      rating: product.rating || 4.5,
                      reviews: product.reviews || 100,
                      imageUrl: product.imageUrl || '/product-placeholder.jpg',
                      category: product.category || 'Product',
                      subtitle: product.description,
                    }}
                    isFavorite={favorites.has(product.id)}
                    onToggleFavorite={() =>
                      toggleFavorite({
                        id: product.id,
                        name: product.name,
                        image: product.imageUrl || '/product-placeholder.jpg',
                        category: product.category || 'Product',
                      })
                    }
                    onAddToCart={() => handleAddToCart(product.id)}
                    isAdding={addingProductId === product.id}
                  />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              className="bg-background1 absolute top-1/2 right-[-10px] z-10 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full text-white shadow-md"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="mx-auto w-full py-6 sm:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-primaryColor mb-4 text-xl font-semibold sm:text-xl">
              Similar <span className="text-secondaryColor">Products</span>
              <hr className="bg-background1 mt-1 h-1 w-40 rounded border-0" />
            </h2>
          </div>

          <div className="relative">
            {/* Products */}
            <div
              ref={scrollRef}
              className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth py-2"
            >
              {products.map(product => (
                <div key={product.id} className="max-w-[160px] min-w-[160px] flex-shrink-0">
                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      discount: product.discount || 20,
                      stock: product.stock,
                      packaging: product.packaging,
                      rating: product.rating || 4.5,
                      reviews: product.reviews || 100,
                      imageUrl: product.imageUrl || '/product-placeholder.jpg',
                      category: product.category || 'Product',
                      subtitle: product.description,
                    }}
                    isFavorite={favorites.has(product.id)}
                    onToggleFavorite={() =>
                      toggleFavorite({
                        id: product.id,
                        name: product.name,
                        image: product.imageUrl || '/product-placeholder.jpg',
                        category: product.category || 'Product',
                      })
                    }
                    onAddToCart={() => handleAddToCart(product.id)}
                    isAdding={addingProductId === product.id}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SimilarProductsSection;
