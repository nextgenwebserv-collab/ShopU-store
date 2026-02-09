'use client';

import { useCartModal } from '../context/CartModalContext';
import CartModal from './CartModal';

export default function CartModalWrapper() {
  const { isCartModalOpen, closeCartModal } = useCartModal();

  return <CartModal isOpen={isCartModalOpen} onCloseAction={closeCartModal} />;
}
