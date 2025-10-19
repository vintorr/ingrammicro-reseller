'use client';

import { useState } from 'react';
import { ShoppingCart, Search, Menu, X, User, Heart, Package } from 'lucide-react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, isOpen, toggleCartDrawer } = useCart();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isOpen} 
        onClose={() => toggleCartDrawer()} 
      />
    </div>
  );
}