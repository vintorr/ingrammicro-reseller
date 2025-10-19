'use client';

import { CartDrawer } from './CartDrawer';
import { useCart } from '@/lib/hooks/useCart';

export function CartPortal() {
  const { isOpen, closeCartDrawer } = useCart();

  return (
    <CartDrawer
      isOpen={isOpen}
      onClose={closeCartDrawer}
    />
  );
}
