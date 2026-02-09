'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader, Search, ShoppingCart } from 'lucide-react';
import { useCartModal } from '../context/CartModalContext';

export default function Navroute() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const { openCartModal } = useCartModal();
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  // Extract category from query params
  const categorySlug = searchParams.get('category');
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Fetch cart count
  const fetchCartCount = React.useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {
      return;
    }
    try {
      setIsLoadingCart(true);
      lastFetchRef.current = now;
      const response = await fetch('/api/cart/count');

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCartCount(data.count.items);
        }
      } else if (response.status !== 401) {
        // Don't show error for unauthorized (not logged in)
        console.error('Failed to fetch cart count');
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    } finally {
      setIsLoadingCart(false);
    }
  }, []);

  useEffect(() => {
    const handleCart = () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      fetchTimeoutRef.current = setTimeout(() => {
        fetchCartCount();
      }, 300);
    };

    window.addEventListener('cartUpdated', handleCart);
    window.addEventListener('cartCountUpdated', handleCart);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      window.removeEventListener('cartUpdated', handleCart);
      window.removeEventListener('cartCountUpdated', handleCart);
    };
  }, [fetchCartCount]);

  useEffect(() => {
    const handleUpdate = () => {
      const timeout = setTimeout(() => {
        fetchCartCount();
      }, 200);

      return () => clearTimeout(timeout);
    };

    window.addEventListener('cartCountUpdated', handleUpdate);
    return () => window.removeEventListener('cartCountUpdated', handleUpdate);
  }, [fetchCartCount]);

  // Get path segments excluding UUIDs and empty strings
  const segments = pathname
    .split('/')
    .filter(
      seg =>
        seg &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(seg)
    );

  // Build path crumbs
  const crumbs = segments.map((seg, idx) => {
    const name = decodeURIComponent(seg)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    const href = '/' + segments.slice(0, idx + 1).join('/');
    return { name, href };
  });

  // Add Category Crumb if category param exists
  if (categorySlug) {
    crumbs.push({
      name: decodeURIComponent(categorySlug)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
      href: pathname + '?category=' + encodeURIComponent(categorySlug),
    });
  }

  const handleSearch = () => {
    router.push('/search');
  };
  return (
    <nav className="bg-white text-sm text-gray-500">
      {/* Desktop View */}
      <div className="mx-auto hidden max-w-7xl p-4 md:block">
        <ol className="flex items-center space-x-2 px-12">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>

          {crumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <li>/</li>
              <li>
                {idx === crumbs.length - 1 ? (
                  <span className="font-medium text-black capitalize">{crumb.name}</span>
                ) : (
                  <Link href={crumb.href} className="capitalize hover:underline">
                    {crumb.name}
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="bg-background1 flex items-center justify-between px-4 py-3">
          <div>
            <button onClick={() => router.back()}>
              <ArrowLeft className="h-7 w-10 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-1">
            <Search className="h-6 w-14 text-white" onClick={handleSearch} />
            {/* Shopping Cart */}
            <button onClick={openCartModal} className="relative mr-2 rounded-lg p-2.5">
              <ShoppingCart className="h-6 w-6 text-white" />
              {isLoadingCart ? (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                  <Loader className="h-3 w-3 animate-spin text-white" />
                </span>
              ) : cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-5">
          <ol className="flex items-center space-x-2 px-2">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <li>/</li>
                <li>
                  {idx === crumbs.length - 1 ? (
                    <span className="font-medium text-black capitalize">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.href} className="capitalize hover:underline">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}
