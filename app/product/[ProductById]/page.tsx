'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Navroute from '@/app/components/Navroute';
import { Heart, Loader, Share2 } from 'lucide-react';
import SimilarProductsSection from '@/app/components/SimilarProduct';
import useAddToCart from '@/app/hooks/handleAddToCart';
import { useWishlist } from '@/app/hooks/useWishlist';
import { Product } from '@/app/types/ProductTypes';

interface PackOption {
  quantity: number;
  stock: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.ProductById as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleAddToCart, addingProductId } = useAddToCart();
  const { favorites, toggleFavorite } = useWishlist();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const MAX_DESC_LENGTH = 400;

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!res.ok) toast.error(data.error || 'Failed to fetch product');
        setProduct({
          ...data.product,
          originalPrice:
            data.product.originalPrice ?? parseFloat(data.product.price?.toString() || '0') * 1.15,
          discount: data.product.discount ?? 15,
        });
        if (data.product?.subCategory?.id) {
          const simRes = await fetch(
            `/api/products?subCategoryId=${data.product.subCategory.id}&limit=10`
          );
          const simData = await simRes.json();
          if (simRes.ok) {
            setSimilarProducts(simData.products.filter((p: Product) => p.id !== productId));
          }
        }
      } catch (err) {
        console.error('Product fetch error:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const [selectedSize, setSelectedSize] = useState<string>('Large');
  const sizes: string[] = ['Large', 'Small', 'Medium', 'New Born', 'XL', 'XXL'];
  const [selectedPackIndex, setSelectedPackIndex] = useState<number>(0);
  const packOptions: PackOption[] = [
    { quantity: 1, stock: 'In Stock' },
    { quantity: 4, stock: 'In Stock' },
    { quantity: 8, stock: 'In Stock' },
    { quantity: 16, stock: 'In Stock' },
  ];

  const [quantity, setQuantity] = useState(1);
  const handleDecrement = () => quantity > 1 && setQuantity(quantity - 1);
  const handleIncrement = () => setQuantity(quantity + 1);

  return (
    <>
      <Navroute />
      <div className="min-h-xl px-4 py-4 md:py-8">
        {loading ? (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-4 text-gray-600">Loading product...</p>
            </div>
          </div>
        ) : error ? (
          <p className="p-4 text-red-500">{error}</p>
        ) : !product ? (
          <p className="p-4 text-center">Product not found</p>
        ) : (
          <>
            {/* Desktop View*/}
            <div className="hidden sm:block">
              <div className="mx-auto grid w-[90%] max-w-7xl gap-6 rounded px-10 py-6 md:grid-cols-2">
                {/* Left: Image Gallery */}
                <div className="flex gap-6">
                  <div className="flex flex-1 items-center justify-center rounded-lg bg-white p-12 shadow-sm">
                    <Image
                      src={product.imageUrl || '/placeholder.png'}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-84 object-contain p-8 transition-transform duration-300 ease-in-out hover:scale-105"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-20">
                    <h2 className="text-xl font-semibold">{product.name}</h2>
                    <div className="mt-2 mr-4 flex items-center justify-between gap-8">
                      <button
                        onClick={() =>
                          toggleFavorite({
                            id: product.id,
                            name: product.name,
                            image: product.imageUrl || '/product-placeholder.jpg',
                            category: product.category || 'Product',
                          })
                        }
                      >
                        <Heart
                          className={`h-7 w-7 ${favorites.has(product.id) ? 'text-primaryColor fill-current' : 'text-primaryColor'}`}
                        />
                      </button>

                      <button>
                        <Share2 className="text-primaryColor h-7 w-7" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="my-2 text-sm font-medium">Select Sizes</p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`cursor-pointer rounded px-5 py-2 text-sm transition ${
                            selectedSize === size
                              ? 'bg-[#317C80] text-white'
                              : 'bg-[#D9D9D9] text-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-[90%] pb-2">
                    <p className="mt-4 mb-2 text-sm font-medium">Select Pack Sizes :</p>
                    <div className="flex grid-cols-2 gap-3 space-x-4 overflow-x-auto sm:grid sm:grid-cols-4 sm:space-x-0">
                      {packOptions.map((pack, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedPackIndex(index)}
                          className={`cursor-pointer rounded transition ${
                            selectedPackIndex === index
                              ? 'bg-[#317C80] text-white'
                              : 'bg-[#D9D9D9] text-black'
                          }`}
                        >
                          <p className="p-2 text-sm">{pack.quantity}</p>
                          <hr />
                          <div className="p-2">
                            <p className="text-md mb-2 font-semibold">
                              ₹{(Number(pack.quantity) * Number(product.price)).toFixed(0)}
                            </p>
                            <p className="mb-2 text-xs">₹({product.price}) Per Unit</p>
                            <p className="text-xs">{pack.stock}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="items-center gap-4">
                    <div className="my-4 flex w-28 items-center rounded border px-2">
                      <button
                        onClick={handleDecrement}
                        className="hover:text-primaryColor px-2 text-2xl"
                      >
                        −
                      </button>
                      <span className="w-12 px-3 text-center">
                        {quantity.toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={handleIncrement}
                        className="hover:text-primaryColor px-2 text-2xl"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex">
                      <p className="text-primaryColor mr-2 text-xl font-semibold">
                        ₹{product.price}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="line-through">
                          MRP: <s>₹{String(product.originalPrice).slice(0, 5)}</s>{' '}
                        </span>{' '}
                        <span className="text-green-600">{product.discount}% OFF</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (Number(product.stock) === 0) {
                        toast.error('Product is out of stock');
                        return;
                      }
                      handleAddToCart(productId, quantity);
                    }}
                    disabled={addingProductId === productId}
                    className="bg-primaryColor flex w-52 items-center justify-center gap-2 rounded py-3 font-medium text-white transition-transform duration-300 hover:scale-102"
                  >
                    {addingProductId === productId ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Image
                          src="/Vector.png"
                          alt="Cart"
                          width={100}
                          height={100}
                          className="h-5 w-5"
                        />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-md mx-auto w-[90%] max-w-7xl p-8 leading-relaxed text-gray-800">
                {product.description && (
                  <section className="mb-6">
                    <h2 className="mb-2 text-xl font-semibold">Description</h2>
                    <p className="pl-4 text-gray-700">
                      {showFullDesc
                        ? product.description
                        : product.description.slice(0, MAX_DESC_LENGTH) + '...'}

                      {product.description.length > MAX_DESC_LENGTH && (
                        <button
                          onClick={() => setShowFullDesc(!showFullDesc)}
                          className="text-primaryColor ml-2 cursor-pointer font-medium hover:underline"
                        >
                          {showFullDesc ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </p>
                  </section>
                )}

                {product.directionsForUse && (
                  <section className="mb-6">
                    <h2 className="mb-2 text-xl font-semibold">Directions for Use</h2>
                    <p className="pl-4 whitespace-pre-line">{product.directionsForUse}</p>
                  </section>
                )}
                {product.safetyInformation && (
                  <section>
                    <h2 className="mb-2 text-xl font-semibold">Safety Information</h2>
                    <p className="pl-4 whitespace-pre-line">{product.safetyInformation}</p>
                  </section>
                )}
              </div>

              {/* ===== Similar Products Section ===== */}
              {similarProducts.length > 0 && <SimilarProductsSection products={similarProducts} />}
            </div>

            {/* Mobile View*/}
            <div className="sm:hidden">
              <div className="mx-auto grid w-full gap-6 rounded">
                {/* Left: Image Gallery */}
                <div className="flex gap-6">
                  <button
                    onClick={() =>
                      toggleFavorite({
                        id: product.id,
                        name: product.name,
                        image: product.imageUrl || '/product-placeholder.jpg',
                        category: product.category || 'Product',
                      })
                    }
                    className="absolute right-8 mt-4"
                  >
                    <Heart
                      className={`h-7 w-7 ${favorites.has(product.id) ? 'text-primaryColor fill-current' : 'text-primaryColor'}`}
                    />
                  </button>

                  <div className="flex flex-1 items-center justify-center rounded-lg bg-white p-12">
                    <Image
                      src={product.imageUrl || '/placeholder.png'}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-84 object-contain p-8 transition-transform duration-300 ease-in-out hover:scale-105"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{product.name}</h2>

                  <div>
                    <p className="my-2 text-sm font-medium">Select Sizes</p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`cursor-pointer rounded px-5 py-2 text-sm transition ${
                            selectedSize === size
                              ? 'bg-[#317C80] text-white'
                              : 'bg-[#D9D9D9] text-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full pb-2">
                    <p className="mt-4 mb-2 text-sm font-medium">Select Pack Sizes :</p>
                    <div className="overflow-x-0 flex grid-cols-4 gap-2">
                      {packOptions.map((pack, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedPackIndex(index)}
                          className={`cursor-pointer rounded transition ${
                            selectedPackIndex === index
                              ? 'bg-[#317C80] text-white'
                              : 'bg-[#D9D9D9] text-black'
                          }`}
                        >
                          <p className="p-2 text-sm">{pack.quantity}</p>
                          <hr />
                          <div className="p-2">
                            <p className="text-md font-semibold">
                              ₹{(Number(pack.quantity) * Number(product.price)).toFixed(0)}
                            </p>
                            <p className="my-2 text-xs">₹({product.price}) Per unit</p>
                            <p className="text-xs">{pack.stock}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="items-center gap-4">
                    <div className="my-4 flex w-28 items-center rounded border px-2">
                      <button onClick={handleDecrement} className="px-2 text-2xl">
                        −
                      </button>
                      <span className="w-12 px-3 text-center">
                        {quantity.toString().padStart(2, '0')}
                      </span>
                      <button onClick={handleIncrement} className="px-2 text-2xl">
                        +
                      </button>
                    </div>
                    <div className="flex">
                      <p className="mr-2 text-xl font-semibold text-[#317C80]">₹{product.price}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="line-through">
                          MRP: <s>₹{String(product.originalPrice).slice(0, 5)}</s>{' '}
                        </span>{' '}
                        <span className="text-green-600">{product.discount}% OFF</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (Number(product.stock) === 0) {
                        toast.error('Product is out of stock');
                        return;
                      }
                      handleAddToCart(productId, quantity);
                    }}
                    disabled={addingProductId === productId}
                    className="flex w-52 items-center justify-center gap-2 rounded bg-[#317C80] py-3 font-medium text-white transition-transform duration-300 hover:scale-102"
                  >
                    {addingProductId === productId ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Image
                          src="/Vector.png"
                          alt="Cart"
                          width={100}
                          height={100}
                          className="h-5 w-5"
                        />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-md mx-auto w-full px-2 py-6 leading-relaxed text-gray-800">
                {product.description && (
                  <section className="mb-6">
                    <h2 className="mb-2 text-xl font-semibold">Description</h2>
                    <p className="text-gray-700">
                      {showFullDesc
                        ? product.description
                        : product.description.slice(0, MAX_DESC_LENGTH) + '...'}

                      {product.description.length > MAX_DESC_LENGTH && (
                        <button
                          onClick={() => setShowFullDesc(!showFullDesc)}
                          className="text-primaryColor ml-2 cursor-pointer font-medium hover:underline"
                        >
                          {showFullDesc ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </p>
                  </section>
                )}
                {product.directionsForUse && (
                  <section className="mb-6">
                    <h2 className="mb-2 text-xl font-semibold">Directions for Use</h2>
                    <p className="whitespace-pre-line">{product.directionsForUse}</p>
                  </section>
                )}
                {product.safetyInformation && (
                  <section>
                    <h2 className="mb-2 text-xl font-semibold">Safety Information</h2>
                    <p className="whitespace-pre-line">{product.safetyInformation}</p>
                  </section>
                )}
              </div>

              {/* ===== Similar Products Section ===== */}
              {similarProducts.length > 0 && <SimilarProductsSection products={similarProducts} />}
            </div>
          </>
        )}
      </div>
    </>
  );
}
