'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Trash2, ShoppingBag, Loader, Plus, Minus } from 'lucide-react';
import { useCart } from '@/app/hooks/useCart';

type CartItem = {
  id: string;
  quantity: number;
  product?: {
    name?: string;
    price?: number;
    imageUrl?: string;
  };
  medicine?: {
    name?: string;
    price?: number;
    imageUrl?: string;
  };
};

type CartItemProps = {
  cartItems: CartItem[];
  processingAction: { [key: string]: string };
  setProcessingAction: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
};

// Memoized individual cart item component to prevent unnecessary re-renders
const CartItemRow = memo(
  ({
    item,
    processingAction,
    onUpdateQuantity,
    onRemoveItem,
  }: {
    item: CartItem;
    processingAction: { [key: string]: string };
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
  }) => {
    const price = Number(item.product?.price || item.medicine?.price || 0);
    const name = item.product?.name || item.medicine?.name || 'Unknown Item';
    const imageUrl = item.product?.imageUrl;

    return (
      <div key={item.id} className="flex h-24 items-center gap-3 border-b border-gray-100 p-4">
        {/* Product Image */}
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={100}
              height={100}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <ShoppingBag className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 line-clamp-2 text-sm font-normal text-gray-800">{name}</h3>
          <p className="text-sm font-medium text-teal-600">₹{price.toFixed(0)}</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center rounded border border-gray-300">
          <button
            className="px-1 py-2 text-xl text-gray-900 transition-colors hover:bg-teal-50 hover:text-teal-600"
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1 || processingAction[item.id] === 'update'}
          >
            <Minus size={15} />
          </button>
          <span className="min-w-[2rem] border-gray-300 px-3 py-1 text-center text-sm">
            {String(item.quantity).padStart(2, '0')}
          </span>
          <button
            className="px-1 py-2 text-gray-900 transition-colors hover:bg-teal-50 hover:text-teal-600"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={processingAction[item.id] === 'update'}
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemoveItem(item.id)}
          className="rounded-full p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
          disabled={processingAction[item.id] === 'remove'}
        >
          {processingAction[item.id] === 'remove' ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }
);

CartItemRow.displayName = 'CartItemRow';

const CartItemList = ({ cartItems, processingAction, setProcessingAction }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setProcessingAction(prev => ({ ...prev, [id]: 'update' }));
    await updateQuantity(id, newQuantity);
    setProcessingAction(prev => ({ ...prev, [id]: '' }));
  };

  const handleRemoveItem = async (id: string) => {
    setProcessingAction(prev => ({ ...prev, [id]: 'remove' }));
    await removeItem(id);
    setProcessingAction(prev => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="bg-white">
      {cartItems.map(item => (
        <CartItemRow
          key={item.id}
          item={item}
          processingAction={processingAction}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
      ))}
    </div>
  );
};

export default memo(CartItemList);
