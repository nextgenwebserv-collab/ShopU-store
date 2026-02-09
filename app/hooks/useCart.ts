'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

type Product = {
  id: string;
  name: string;
  price: number | string;
  imageUrl?: string;
};

type Medicine = {
  id: string;
  name: string;
  price: number | string;
  manufacturerName?: string;
  packSizeLabel?: string;
};

type CartItem = {
  id: string;
  quantity: number;
  product?: Product;
  medicine?: Medicine;
  productId?: string;
  medicineId?: string;
  combinationId?: string;
  addedAt: string;
};

// Cache key for local storage
const CART_CACHE_KEY = 'shop_u_cart_cache';
const CART_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper for local storage operations
  const cartCache = useMemo(
    () => ({
      get: (): { items: CartItem[]; timestamp: number } | null => {
        try {
          const cached = localStorage.getItem(CART_CACHE_KEY);
          return cached ? JSON.parse(cached) : null;
        } catch (e) {
          console.warn('Failed to retrieve cart cache', e);
          return null;
        }
      },
      set: (items: CartItem[]) => {
        try {
          localStorage.setItem(CART_CACHE_KEY, JSON.stringify({ items, timestamp: Date.now() }));
        } catch (e) {
          console.warn('Failed to save cart cache', e);
        }
      },
      isValid: (timestamp: number) => {
        return Date.now() - timestamp < CART_CACHE_TTL;
      },
    }),
    []
  );

  // Fetch cart items from API with debounce logic
  const fetchCartItems = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cache = cartCache.get();
          if (cache && cartCache.isValid(cache.timestamp)) {
            setCartItems(cache.items);
            setIsLoading(false);
            return;
          }
        }
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/cart', {
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (response.status === 401) {
          setCartItems([]);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          console.error('Failed to fetch cart');
          return;
        }

        const data = await response.json();

        if (data.success && data.cartItems) {
          setCartItems(data.cartItems);
          cartCache.set(data.cartItems);
        } else {
          toast.error(data.error || 'Failed to fetch cart items');
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        const fallbackError = err instanceof Error ? err.message : 'Failed to fetch cart items';
        setError(fallbackError);
        toast.error(fallbackError);

        // fallback to cache
        const cache = cartCache.get();
        if (cache) {
          setCartItems(cache.items);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cartCache]
  );

  // Initialize cart on component mount
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartItems(true);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [fetchCartItems]);

  // Add item to cart
  const addItem = useCallback(
    async (productId: string | null, medicineId: string | null, quantity: number) => {
      try {
        setError(null);

        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            medicineId,
            quantity,
          }),
        });

        const data = await response.json();

        if (response.status === 401) {
          toast.error('Please login to add items to cart');
          return null;
        }

        if (!response.ok) {
          toast.error(data.error || 'Failed to add item to cart');
          return null;
        }

        if (data.success && data.cartItem) {
          setCartItems(prev => {
            const existingIndex = prev.findIndex(
              item =>
                (productId && item.productId === productId) ||
                (medicineId && item.medicineId === medicineId)
            );

            let updatedItems;
            if (existingIndex >= 0) {
              updatedItems = [...prev];
              updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: updatedItems[existingIndex].quantity + quantity,
              };
            } else {
              updatedItems = [...prev, data.cartItem];
            }

            cartCache.set(updatedItems);
            return updatedItems;
          });

          window.dispatchEvent(new CustomEvent('cartCountUpdated'));
          return data.cartItem;
        } else {
          toast.error(data.error || 'Failed to add item to cart');
          return null;
        }
      } catch (err) {
        console.error('Error adding item to cart:', err);
        setError('Something went wrong while adding to cart');
        toast.error('Something went wrong while adding to cart');
        return null;
      }
    },
    [cartCache]
  );

  // Update item quantity with optimistic updates
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        setError(null);

        // Optimistic update
        const originalItems = [...cartItems];
        const updatedItems = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );

        setCartItems(updatedItems);

        const response = await fetch(`/api/cart/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setCartItems(originalItems); // Revert on error
          toast.error(data.error || 'Failed to update item quantity');
          return;
        }
        // Update cache on success
        cartCache.set(updatedItems);
        window.dispatchEvent(new CustomEvent('cartCountUpdated'));
        toast.success('Cart updated!');
      } catch (err) {
        console.error('Error updating item quantity:', err);
        setError(err instanceof Error ? err.message : 'Failed to update item quantity');
        toast.error('Something went wrong while updating the cart');
      }
    },
    [cartItems, cartCache]
  );

  // Remove item from cart with optimistic updates
  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        setError(null);

        // Optimistic update
        const originalItems = [...cartItems];
        const updatedItems = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedItems);

        const response = await fetch(`/api/cart/${itemId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          // Revert on error
          setCartItems(originalItems);
          toast.error(data.error || 'Failed to remove item from cart');
          return null;
        }
        // Update cache on success
        cartCache.set(updatedItems);
        window.dispatchEvent(new CustomEvent('cartCountUpdated'));
        return true;
      } catch (err) {
        console.error('Error removing item from cart:', err);
        setError('Failed to remove item from cart');
        toast.error('Something went wrong while removing from cart');
        return null;
      }
    },
    [cartItems, cartCache]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);

      // Optimistic update
      setCartItems([]);
      cartCache.set([]);

      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Error clearing cart:', data.error);
      }
      window.dispatchEvent(new CustomEvent('cartCountUpdated'));
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  }, [cartCache]);

  // Legacy support for components using addToCart instead of addItem
  const addToCart = useCallback(
    ({
      productId,
      medicineId,
      quantity = 1,
    }: {
      productId?: string;
      medicineId?: string;
      quantity?: number;
    }) => {
      return addItem(productId || null, medicineId || null, quantity);
    },
    [addItem]
  );

  // Calculate cart totals once per cartItems change
  const totals = useMemo(() => {
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.product?.price || item.medicine?.price || 0);
      return sum + price * item.quantity;
    }, 0);

    return {
      itemCount,
      subtotal,
    };
  }, [cartItems]);

  return {
    cartItems,
    isLoading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    addToCart,
    refreshCart: (force = false) => fetchCartItems(force),
    totals,
  };
}
