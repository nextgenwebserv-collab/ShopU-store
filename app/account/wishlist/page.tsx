'use client';

import Image from 'next/image';
import { Loader, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navroute from '../../components/Navroute';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import useAddToCart from '@/app/hooks/handleAddToCart';
import { Suspense } from 'react';

interface WishlistItem {
  productId: string;
  id: string;
  name: string;
  image_url: string;
  price?: number;
  createdAt: string;
  stock?: number;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);
  const { handleAddToCart, addingProductId } = useAddToCart();
  const router = useRouter();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/account/wishlist');

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/');
            toast.error('Please login first.');
          } else {
            const errorData = await res.json();
            toast.error(errorData.message || 'Failed to fetch wishlist');
          }
          return;
        }

        const data = await res.json();
        setWishlist(data.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
        toast.error('Network or server error');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const handleRemove = async (productId: string) => {
    try {
      setRemovingProductId(productId);
      const res = await fetch(`/api/account/wishlist?productId=${productId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setWishlist(prev => prev.filter(item => item.productId !== productId));
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong while deleting');
    } finally {
      setRemovingProductId(null);
    }
  };

  const handleclick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Navroute />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <Loader className="mx-auto h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-4 text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="min-h-[70vh] text-center text-gray-500">Your wishlist is empty.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto px-10 sm:block">
              <h2 className="text-primaryColor mb-4 text-xl font-semibold">
                Wish<span className="text-secondaryColor">list</span>
                <hr className="bg-background1 mt-1 h-1 w-22 rounded border-0" />
              </h2>
              <table className="min-w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-md bg-[#D5F3F6] text-center text-gray-800">
                    <th className="w-94 px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Date Added</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="w-40 px-6 py-4">Add to Cart</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {wishlist.map(item => (
                    <tr
                      key={item.id}
                      className="text-md rounded-md text-center shadow-sm shadow-gray-300"
                    >
                      <td className="flex items-center gap-10 px-6 py-4">
                        <Image
                          src={item.image_url}
                          alt={item.name.length > 5 ? item.name.slice(0, 5) + '…' : item.name}
                          width={50}
                          height={50}
                          className="rounded"
                          onClick={() => handleclick(item.productId)}
                        />
                        <span className="text-left text-gray-800">
                          {item.name.length > 20 ? item.name.slice(0, 20) + '…' : item.name}
                        </span>
                      </td>
                      <td className="text-primaryColor text-md p-4 font-medium">
                        ₹{String(item.price).slice(0, 5)}
                      </td>
                      <td className="p-4 text-gray-700">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            Number(item.stock) === 0
                              ? 'text-secondaryColor'
                              : Number(item.stock) > 5
                                ? 'text-green-600'
                                : 'text-secondaryColor'
                          }
                        >
                          {Number(item.stock) === 0
                            ? 'Out of Stock'
                            : Number(item.stock) > 5
                              ? 'In Stock'
                              : 'Only few left'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if (Number(item.stock) === 0) {
                              toast.error('Product is out of stock');
                              return;
                            }
                            handleAddToCart(item.productId);
                          }}
                          disabled={addingProductId === item.productId}
                          className="hover:bg-opacity-90 bg-background1 cursor-pointer rounded px-4 py-1 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {addingProductId === item.productId ? 'Adding..' : 'ADD'}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="cursor-pointer text-gray-500 hover:text-red-500 disabled:opacity-60"
                          disabled={removingProductId === item.productId}
                        >
                          {removingProductId === item.productId ? (
                            <Loader className="h-5 w-5 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 sm:hidden">
              <h2 className="text-primaryColor mb-6 text-lg font-medium">
                Wish<span className="text-secondaryColor">list</span>
                <hr className="bg-background1 mt-1 w-20 rounded border-2" />
              </h2>
              {wishlist.map(item => (
                <div key={item.id} className="mb-6 rounded-lg bg-white px-6 py-4 shadow-sm">
                  <div className="text-md mb-2 flex justify-between text-gray-600">
                    <span className="text-lg font-medium text-black">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span
                      className={
                        Number(item.stock) === 0
                          ? 'text-secondaryColor'
                          : Number(item.stock) > 5
                            ? 'text-green-600'
                            : 'text-secondaryColor'
                      }
                    >
                      {Number(item.stock) === 0
                        ? 'Out of Stock'
                        : Number(item.stock) > 5
                          ? 'In Stock'
                          : 'Only few left'}
                    </span>
                  </div>
                  <div
                    onClick={() => handleclick(item.productId)}
                    className="flex items-center gap-4 py-4 font-medium"
                  >
                    <Image
                      src={item.image_url}
                      alt={item.name.length > 10 ? item.name.slice(0, 10) + '…' : item.name}
                      width={60}
                      height={60}
                    />
                    <div className="text-md flex-1 pr-4">
                      {item.name.length > 45 ? item.name.slice(0, 45) + '…' : item.name}
                    </div>
                    <div className="text-primaryColor text-lg">
                      ₹{String(item.price).slice(0, 5)}
                    </div>
                  </div>
                  <hr className="text-gray-300" />
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (Number(item.stock) === 0) {
                          toast.error('Product is out of stock');
                          return;
                        }
                        handleAddToCart(item.productId);
                      }}
                      disabled={addingProductId === item.productId}
                      className="hover:bg-opacity-90 bg-background1 rounded px-4 py-1 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {addingProductId === item.productId ? 'Adding...' : 'ADD'}
                    </button>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="text-gray-500 hover:text-red-500 disabled:opacity-60"
                      disabled={removingProductId === item.productId}
                    >
                      {removingProductId === item.productId ? (
                        <Loader className="text-secondaryColor h-6 w-6 animate-spin" />
                      ) : (
                        <Trash2 className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Suspense>
  );
}
