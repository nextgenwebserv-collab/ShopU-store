import React, { useState } from 'react';
import { SearchItem } from '../types/SearchItem';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface CardProps {
  item: SearchItem;
}

const SearchCard: React.FC<CardProps> = ({ item }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const price = Number(item.price || 0);
  const addToCart = async () => {
    try {
      setIsAddingToCart(true);

      const body =
        item.type === 'medicine'
          ? { medicineId: item.id, quantity: 1 }
          : { productId: item.id, quantity: 1 };

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setIsAdded(true);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        toast.error(data.error || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast('Failed to add item');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <span className="mb-3 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500 capitalize">
        {item.type}
      </span>

      <div className="mb-2 flex cursor-pointer items-center justify-start gap-5">
        <Image
          src={item.imageUrl || '/Paracetamol.jpg'}
          alt={item.name.length > 5 ? item.name.slice(0, 5) + '…' : item.name}
          width={200}
          height={200}
          className="h-12 w-12 object-contain"
          loading="lazy"
        />
        <div>
          <h3 className="sm:text-md text-sm font-semibold text-gray-800">
            {item.name.length > 15 ? item.name.slice(0, 15) + '…' : item.name}
          </h3>
          <p className="mb-1 text-xs text-gray-500">{item.packaging || 'Standard Packaging'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#D9D9D9] pt-2">
        {item.price && (
          <span className="text-primaryColor text-xl font-bold">₹{price.toFixed(0)}</span>
        )}

        <button
          onClick={addToCart}
          disabled={isAddingToCart}
          className={`cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-white transition-colors ${
            isAdded
              ? 'bg-green-600 hover:bg-green-700'
              : isAddingToCart
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-background1 hover:bg-teal-700'
          }`}
        >
          {isAddingToCart ? 'Adding...' : isAdded ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export const searchEventEmitter = {
  listeners: new Set<(results: SearchItem[]) => void>(),
  emit(results: SearchItem[]) {
    this.listeners.forEach(listener => listener(results));
  },
  subscribe(listener: (results: SearchItem[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
};

export default SearchCard;
