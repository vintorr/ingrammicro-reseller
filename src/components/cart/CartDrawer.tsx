'use client';

import { useState } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/formatters';
import { X, ShoppingCart, Trash2, CheckCircle, Plus, Minus, Package, CreditCard, Truck, Shield } from 'lucide-react';
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
    clearCartItems,
    createOrderFromCart,
    isCreatingOrder,
    lastOrderId,
    orderError
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerOrderNumber, setCustomerOrderNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleCheckout = async () => {
    if (!customerOrderNumber.trim()) {
      alert('Please enter a customer order number');
      return;
    }

    try {
      await createOrderFromCart(customerOrderNumber, notes);
      setShowCheckout(false);
      setCustomerOrderNumber('');
      setNotes('');
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Shopping Cart
                </h2>
                {totalItems > 0 && (
                  <p className="text-sm text-gray-600">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
              {totalItems > 0 && (
                <Badge variant="info" className="ml-2">
                  {totalItems}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-white/50 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6">
                  Start adding products to see them here
                </p>
                <Button
                  onClick={onClose}
                  variant="primary"
                  className="px-6"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemComponent
                    key={item.product.ingramPartNumber}
                    item={item}
                    onUpdateQuantity={updateCartQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50">
              {/* Trust Indicators */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span>Fast Shipping</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    <span>Easy Checkout</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Enhanced Summary */}
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
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
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">{formatCurrency(total, 'USD')}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Actions */}
                <div className="space-y-3">
                  {!showCheckout ? (
                    <>
                      <Button 
                        className="w-full py-3 text-lg font-semibold"
                        onClick={() => setShowCheckout(true)}
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Proceed to Checkout
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCartItems}
                        className="w-full text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Cart
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Order Number *
                        </label>
                        <input
                          type="text"
                          value={customerOrderNumber}
                          onChange={(e) => setCustomerOrderNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter order number"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add any notes for this order"
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          onClick={() => setShowCheckout(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCheckout}
                          disabled={isCreatingOrder || !customerOrderNumber.trim()}
                          className="flex-1"
                        >
                          {isCreatingOrder ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Creating Order...
                            </>
                          ) : (
                            'Create Order'
                          )}
                        </Button>
                      </div>
                      {orderError && (
                        <div className="text-red-600 text-sm">
                          Error: {orderError}
                        </div>
                      )}
                      {lastOrderId && (
                        <div className="text-green-600 text-sm flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Order created successfully! Order ID: {lastOrderId}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity, totalPrice } = item;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        {/* Enhanced Product Image */}
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-300 rounded-md flex items-center justify-center mx-auto mb-1">
              <span className="text-gray-500 text-xs">📦</span>
            </div>
            <span className="text-gray-400 text-xs">Image</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
            {product.description}
          </h4>
          <p className="text-xs text-gray-500 mb-2">
            SKU: {product.ingramPartNumber}
          </p>
          <p className="text-sm font-medium text-blue-600">
            {formatCurrency(item.unitPrice, 'USD')} each
          </p>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(product.ingramPartNumber)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quantity Controls and Total */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        {/* Enhanced Quantity Controls */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateQuantity(product.ingramPartNumber, quantity - 1)}
              disabled={quantity <= 1}
              className="rounded-r-none border-r border-gray-300 hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold w-12 text-center py-2">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateQuantity(product.ingramPartNumber, quantity + 1)}
              className="rounded-l-none border-l border-gray-300 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Total Price */}
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(totalPrice, 'USD')}
          </p>
          <p className="text-xs text-gray-500">
            {quantity} × {formatCurrency(item.unitPrice, 'USD')}
          </p>
        </div>
      </div>
    </div>
  );
}