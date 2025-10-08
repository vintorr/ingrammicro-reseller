'use client';

import { useCart } from '@/lib/hooks/useCart';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/formatters';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import type { CartItem } from '@/lib/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { 
    items, 
    totalItems, 
    subtotal, 
    tax, 
    total, 
    removeFromCart, 
    updateCartQuantity, 
    clearCartItems 
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-900">
                Shopping Cart
              </h2>
              {totalItems > 0 && (
                <Badge variant="info">{totalItems}</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add some products to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.product.ingramPartNumber}
                    item={item}
                    onUpdateQuantity={updateCartQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    {formatCurrency(tax, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total, 'USD')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full">
                  Proceed to Checkout
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCartItems}
                  className="w-full text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity, totalPrice } = item;
  const primaryImage = product.images.find(img => img.primary) || product.images[0];

  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
      {/* Product Image */}
      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
        <img
          src={primaryImage?.url || '/images/placeholder.jpg'}
          alt={product.description}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product.description}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          SKU: {product.ingramPartNumber}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {formatCurrency(item.unitPrice, product.price.currency)} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateQuantity(product.ingramPartNumber, quantity - 1)}
          disabled={quantity <= 1}
        >
          -
        </Button>
        <span className="text-sm font-medium w-8 text-center">
          {quantity}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateQuantity(product.ingramPartNumber, quantity + 1)}
          disabled={quantity >= product.availability.quantity}
        >
          +
        </Button>
      </div>

      {/* Total Price */}
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {formatCurrency(totalPrice, product.price.currency)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(product.ingramPartNumber)}
        className="text-red-600 hover:text-red-800"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
