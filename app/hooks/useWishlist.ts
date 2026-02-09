'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface WishlistItem {
  productId: number | string;
}

interface Product {
  id: number | string;
  name: string;
  image: string;
  category: string;
}

// Shared global store (singleton)
const shared = {
  favorites: new Set<number | string>(),
  lastData: null as null | Set<number | string>,
  isFetching: false,
  listeners: new Set<() => void>(),
};

function notify() {
  shared.listeners.forEach(fn => fn());
}

// Fetch only when data changed
async function fetchWishlistShared() {
  if (shared.isFetching) return;
  shared.isFetching = true;

  try {
    const res = await fetch('/api/account/wishlist');
    const data = await res.json();

    if (!res.ok || !Array.isArray(data)) return;

    const newSet = new Set(data.map((item: WishlistItem) => item.productId));

    // Compare old vs new
    const isSame =
      shared.lastData &&
      shared.lastData.size === newSet.size &&
      [...newSet].every(v => shared.favorites.has(v));

    if (isSame) {
      return;
    }

    shared.lastData = newSet;
    shared.favorites = newSet;
    notify();
  } catch (e) {
    console.error('Wishlist fetch error:', e);
  } finally {
    shared.isFetching = false;
  }
}

async function toggleFavoriteShared(product: Product) {
  const id = product.id;

  if (shared.favorites.has(id)) {
    const backup = new Set(shared.favorites);
    shared.favorites.delete(id);
    notify();

    // DELETE
    try {
      const res = await fetch(`/api/account/wishlist?productId=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        shared.favorites = backup;
        notify();
      }
    } catch {
      shared.favorites = backup;
      notify();
    }

    return fetchWishlistShared(); // refetch only if changed data
  }

  // ADD
  try {
    const res = await fetch('/api/account/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: product.name,
        image_url: product.image,
        productId: product.id,
      }),
    });

    if (res.ok) {
      shared.favorites.add(id);
      notify();
      return fetchWishlistShared();
    } else {
      const data = await res.json();
      toast.error(data.message || 'Failed to add to wishlist');
    }
  } catch {
    toast.error('Error');
  }
}

// useWishlist Hook
export function useWishlist() {
  const [favorites, setFavorites] = useState(shared.favorites);

  useEffect(() => {
    const listener = () => setFavorites(new Set(shared.favorites));
    shared.listeners.add(listener);

    // First component loads wishlist
    if (shared.listeners.size === 1) {
      fetchWishlistShared();
    }

    return () => {
      shared.listeners.delete(listener);
    };
  }, []);

  return {
    favorites,
    toggleFavorite: toggleFavoriteShared,
    refresh: fetchWishlistShared,
  };
}
