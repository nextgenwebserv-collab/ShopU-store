'use client';

import React, { createContext, useContext, useState } from 'react';

interface CartModalContextType {
  isCartModalOpen: boolean;
  openCartModal: () => void;
  closeCartModal: () => void;
}

const CartModalContext = createContext<CartModalContextType>({
  isCartModalOpen: false,
  openCartModal: () => {},
  closeCartModal: () => {},
});

export function CartModalProvider({ children }: { children: React.ReactNode }) {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);

  return (
    <CartModalContext.Provider value={{ isCartModalOpen, openCartModal, closeCartModal }}>
      {children}
    </CartModalContext.Provider>
  );
}

export const useCartModal = () => useContext(CartModalContext);
