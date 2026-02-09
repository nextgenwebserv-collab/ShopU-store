'use client';

import { Suspense, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Loader, SlidersVertical } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Navroute from '../components/Navroute';
import Sidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../hooks/useWishlist';
import { useProducts } from '../hooks/useProduct';
import useAddToCart from '../hooks/handleAddToCart';

// Move all logic and hooks into a child component
function ProductPageContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { handleAddToCart, addingProductId } = useAddToCart();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const { favorites, toggleFavorite } = useWishlist();
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { products, loading } = useProducts({
    category: category === 'All' ? undefined : category,
    limit: 100,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedFilters.length > 0 ? selectedFilters.includes(product.category || '') : true;

    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;

    return matchesCategory && matchesPrice;
  });

  const productsPerPage = 20;
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = filteredProducts.slice(start, end);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <>
      <Navroute />
      {loading ? (
        <div className="flex min-h-[70vh] flex-1 items-center justify-center">
          <div className="text-center">
            <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="min-h-[70vh] pt-4 text-center text-gray-500">No products found.</div>
      ) : (
        <div className="min-h-xl bg-background p-4 md:px-2 lg:px-8">
          {/* Desktop view */}
          <div className="mx-auto flex hidden max-w-7xl justify-between gap-6 px-6 py-4 sm:flex md:px-6 lg:px-10">
            <>
              {/* Sidebar */}
              <Sidebar
                onCategorySelect={handleAddFilter}
                onPriceFilter={(min: number, max: number) => setPriceRange({ min, max })}
              />

              {/* Main Content */}
              <main className="flex-1 space-y-6">
                <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="text-md font-semibold">
                    You searched for:{' '}
                    <span className="text-primaryColor text-lg capitalize">{category}</span>
                  </div>
                  <select className="rounded bg-white py-2 pr-8 pl-4 text-sm shadow outline-none">
                    <option>Default Sorting</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>

                {selectedFilters.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedFilters.map(filter => (
                      <div
                        key={filter}
                        className="flex items-center gap-2 rounded-full bg-white px-3 text-xs text-gray-800"
                      >
                        <span>{filter}</span>
                        <button
                          onClick={() => setSelectedFilters(prev => prev.filter(f => f !== filter))}
                          className="hover:text-secondaryColor text-2xl text-gray-600"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedProducts.map(product => (
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

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-around">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        currentPage === 1
                          ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                          : 'bg-background1 text-white'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        currentPage === totalPages
                          ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                          : 'bg-background1 text-white'
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-700">
                    Showing {start + 1}-{Math.min(end, filteredProducts.length)} of{' '}
                    {filteredProducts.length} results
                  </div>
                </div>
              </main>
            </>
          </div>

          {/* Mobile view */}
          <div className="flex justify-between sm:hidden">
            <>
              <main className="flex-1 space-y-2">
                <div className="text-md mb-4 items-end justify-between">
                  <div className="mb-2 px-2 font-semibold">
                    You searched for:{' '}
                    <span className="text-primaryColor text-lg capitalize">{category}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setIsFilterOpen(true)} // Open sidebar
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2"
                      >
                        <SlidersVertical size={20} className="text-primaryColor" />
                        Filter
                      </button>
                      <Sidebar
                        onCategorySelect={handleAddFilter}
                        onPriceFilter={(min: number, max: number) => setPriceRange({ min, max })}
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                      />

                      <button className="flex items-center gap-1 rounded-full border border-gray-300 bg-white p-2">
                        Sort By <ChevronDown size={22} className="text-primaryColor" />
                      </button>
                    </div>
                    <div className="text-xs">
                      Showing {start + 1}-{Math.min(end, filteredProducts.length)} of{' '}
                      {filteredProducts.length} results
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:hidden">
                  {paginatedProducts.map(product => (
                    <div key={product.id} className="w-full">
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

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-around">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        currentPage === 1
                          ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                          : 'bg-background1 text-white'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        currentPage === totalPages
                          ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                          : 'bg-background1 text-white'
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </main>
            </>
          </div>
        </div>
      )}
    </>
  );
}

// Top-level page only renders Suspense and the content component
const ProductPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    }
  >
    <ProductPageContent />
  </Suspense>
);

export default ProductPage;
