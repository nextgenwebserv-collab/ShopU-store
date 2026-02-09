//card for testing

import React, { useState } from 'react';

interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface MedicineCardProps {
  medicine: Medicine;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const addToCart = async () => {
    try {
      setIsAddingToCart(true);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicineId: medicine.id, // Use medicineId instead of productId
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAdded(true);
        // Emit cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Reset the "Added" state after 2 seconds
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        if (response.status === 401) {
          alert('Please login to add items to cart');
        } else {
          alert(data.error || 'Failed to add item to cart');
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white p-4 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <h3 className="mb-2 text-lg font-semibold text-gray-800">{medicine.name}</h3>
      <p className="mb-3 line-clamp-2 text-sm text-gray-600">{medicine.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-primaryColor text-xl font-bold">₹{medicine.price}</span>
        <button
          onClick={addToCart}
          disabled={isAddingToCart}
          className={`rounded-md px-4 py-2 text-white transition-colors ${
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

const searchEventEmitter = {
  listeners: new Set<(results: Medicine[]) => void>(),
  emit(results: Medicine[]) {
    this.listeners.forEach(listener => listener(results));
  },
  subscribe(listener: (results: Medicine[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
};

export { searchEventEmitter };
export default MedicineCard;
