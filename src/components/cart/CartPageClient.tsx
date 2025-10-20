'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Trash2,
  CreditCard,
  Minus,
  Plus,
  ShoppingCart,
  Shield,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatters';

export const CartPageClient = () => {
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
    orderError,
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerOrderNumber, setCustomerOrderNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleQuantityChange = (productId: string, next: number) => {
    if (next <= 0) {
      removeFromCart(productId);
      return;
    }
    updateCartQuantity(productId, next);
  };

  const handleCheckout = async () => {
    if (!customerOrderNumber.trim()) {
      setLocalError('Please enter a customer order number.');
      return;
    }
    setLocalError(null);
    try {
      await createOrderFromCart(customerOrderNumber.trim(), notes.trim() || undefined);
      setShowCheckout(false);
      setCustomerOrderNumber('');
      setNotes('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create order. Please try again.';
      setLocalError(message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-[var(--color-background)]">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-[0_10px_24px_rgba(16,35,71,0.12)]">
            <ShoppingCart className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">Your cart is waiting</h1>
          {lastOrderId ? (
            <p className="max-w-lg text-base text-[var(--color-muted)]">
              Order <span className="font-semibold text-[var(--color-primary)]">#{lastOrderId}</span> has been placed
              successfully. Browse the catalog to add more products.
            </p>
          ) : (
            <p className="max-w-lg text-base text-[var(--color-muted)]">
              You haven’t added any products yet. Explore the catalog to start building quotes or purchase orders.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/products">
              <Button size="lg">Browse products</Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="secondary">
                Explore solution areas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-16">
      <div className="border-b border-[rgba(16,35,71,0.08)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-primary)]">Review & checkout</p>
            <h1 className="mt-2 text-[clamp(2rem,3vw,2.8rem)] font-semibold text-[var(--color-foreground)]">
              Cart summary
            </h1>
            <p className="text-sm text-[var(--color-muted)]">{totalItems} {totalItems === 1 ? 'item' : 'items'} ready to process</p>
          </div>
          <Link href="/products">
            <Button variant="secondary" size="sm">
              Continue shopping
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 pt-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {items.map((item) => (
            <article
              key={item.product.ingramPartNumber}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[0_12px_26px_rgba(16,35,71,0.08)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                    {item.product.description}
                  </h2>
                  <p className="text-sm text-[var(--color-muted)]">
                    SKU {item.product.ingramPartNumber}
                    {item.product.vendorName ? ` • ${item.product.vendorName}` : ''}
                  </p>
                  {item.product.productCategory && (
                    <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                      {item.product.productCategory}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <div className="flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-primary-light)]/40">
                    <button
                      type="button"
                      className="px-3 py-2 text-sm text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)]"
                      onClick={() => handleQuantityChange(item.product.ingramPartNumber, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-[var(--color-foreground)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)]"
                      onClick={() => handleQuantityChange(item.product.ingramPartNumber, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-[var(--color-foreground)]">
                      {formatCurrency(item.totalPrice, 'USD')}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {formatCurrency(item.unitPrice, 'USD')} each
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.product.ingramPartNumber)}
                    className="text-[var(--color-muted)] hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-6">
          {lastOrderId && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="mr-2 inline h-4 w-4" />
              Order <span className="font-semibold">{lastOrderId}</span> submitted successfully.
            </div>
          )}

          {(orderError || localError) && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {orderError || localError}
            </div>
          )}

          <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[0_12px_26px_rgba(16,35,71,0.1)]">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Order summary</h2>
            <div className="space-y-3 text-sm text-[var(--color-muted)]">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <span className="font-medium text-[var(--color-foreground)]">
                  {formatCurrency(subtotal, 'USD')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated tax</span>
                <span className="font-medium text-[var(--color-foreground)]">
                  {formatCurrency(tax, 'USD')}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-base font-semibold text-[var(--color-foreground)]">
                <span>Total</span>
                <span>{formatCurrency(total, 'USD')}</span>
              </div>
            </div>

            {!showCheckout ? (
              <div className="space-y-3">
                <Button
                  className="w-full py-3 text-base font-semibold"
                  onClick={() => setShowCheckout(true)}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to checkout
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCartItems}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear cart
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-foreground)]">
                    Customer order number
                  </label>
                  <input
                    value={customerOrderNumber}
                    onChange={(event) => setCustomerOrderNumber(event.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    placeholder="Required"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-foreground)]">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    placeholder="Add any special instructions"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="flex-1 py-3 text-base font-semibold"
                    onClick={handleCheckout}
                    disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? 'Submitting...' : 'Place order'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCheckout(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[0_10px_24px_rgba(16,35,71,0.08)] sm:grid-cols-3">
            <div className="text-center">
              <Truck className="mx-auto h-8 w-8 text-[var(--color-primary)]" />
              <p className="mt-2 text-sm font-medium text-[var(--color-foreground)]">Nationwide logistics</p>
              <p className="text-xs text-[var(--color-muted)]">35 US facilities with late cut-off windows.</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto h-8 w-8 text-green-600" />
              <p className="mt-2 text-sm font-medium text-[var(--color-foreground)]">Secure procurement</p>
              <p className="text-xs text-[var(--color-muted)]">Compliance-ready workflows and audit trails.</p>
            </div>
            <div className="text-center">
              <ShoppingCart className="mx-auto h-8 w-8 text-[var(--color-primary)]" />
              <p className="mt-2 text-sm font-medium text-[var(--color-foreground)]">Lifecycle support</p>
              <p className="text-xs text-[var(--color-muted)]">Attach services, renewals, and asset programs.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
