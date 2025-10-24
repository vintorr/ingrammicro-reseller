'use client';

import { useState, type ChangeEvent } from 'react';
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
import type { CartOrderPayload } from '@/lib/store/cartSlice';

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
    lastCustomerOrderNumber,
    lastOrderResponse,
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerOrderNumber, setCustomerOrderNumber] = useState('');
  const [endCustomerOrderNumber, setEndCustomerOrderNumber] = useState('');
  const [specialBidNumber, setSpecialBidNumber] = useState('');
  const [billToAddressId, setBillToAddressId] = useState('');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [acceptBackOrder, setAcceptBackOrder] = useState(true);
  const [includeEndUser, setIncludeEndUser] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const initialAddress = {
    companyName: '',
    contact: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    countryCode: 'US',
    phoneNumber: '',
    email: '',
  };
  const [shipTo, setShipTo] = useState({ ...initialAddress });
  const [endUser, setEndUser] = useState({ ...initialAddress });
  const recentOrder = lastOrderResponse?.orders?.[0];
  const recentOrderTotal = recentOrder?.orderTotal ?? lastOrderResponse?.purchaseOrderTotal;
  const recentOrderCurrency = recentOrder?.currencyCode ?? 'USD';

  const handleShipToChange = (field: keyof typeof shipTo) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setShipTo((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleEndUserChange = (field: keyof typeof endUser) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEndUser((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toOrderAddress = (input: typeof shipTo) => {
    const payload: Partial<typeof shipTo> = {};
    (Object.entries(input) as Array<[keyof typeof shipTo, string]>).forEach(([key, rawValue]) => {
      const value = rawValue.trim();
      if (value) {
        payload[key] = key === 'countryCode' ? value.toUpperCase() : value;
      }
    });
    return Object.keys(payload).length > 0 ? payload : undefined;
  };

  const handleQuantityChange = (productId: string, next: number) => {
    if (next <= 0) {
      removeFromCart(productId);
      return;
    }
    updateCartQuantity(productId, next);
  };

  const handleCheckout = async () => {
    const trimmedCustomerOrderNumber = customerOrderNumber.trim();
    if (!trimmedCustomerOrderNumber) {
      setLocalError('Please enter a customer order number.');
      return;
    }

    const requiredShippingFields: Array<keyof typeof shipTo> = [
      'companyName',
      'addressLine1',
      'city',
      'state',
      'postalCode',
      'countryCode',
    ];

    const incompleteShippingField = requiredShippingFields.find((field) => !shipTo[field].trim());
    if (incompleteShippingField) {
      setLocalError('Please complete the required shipping information before placing the order.');
      return;
    }

    const trimmedShipToEmail = shipTo.email.trim();
    if (trimmedShipToEmail && !emailPattern.test(trimmedShipToEmail)) {
      setLocalError('Please enter a valid shipping email address.');
      return;
    }

    const trimmedCountry = shipTo.countryCode.trim();
    if (!/^[A-Za-z]{2}$/.test(trimmedCountry)) {
      setLocalError('Country code must be a two-letter ISO code (e.g., US).');
      return;
    }

    const trimmedState = shipTo.state.trim();
    if (trimmedCountry.toUpperCase() === 'US' && !/^[A-Za-z]{2}$/.test(trimmedState)) {
      setLocalError('State must be a two-letter code when shipping to the United States.');
      return;
    }

    const shipToPayload = toOrderAddress(shipTo);
    if (!shipToPayload) {
      setLocalError('Unable to build shipping information. Please verify the shipping form.');
      return;
    }

    let endUserPayload: ReturnType<typeof toOrderAddress> | undefined;
    let shouldSendEndUser = false;

    if (includeEndUser) {
      const requiredEndUserFields: Array<keyof typeof endUser> = [
        'companyName',
        'addressLine1',
        'city',
        'state',
        'postalCode',
        'countryCode',
      ];

      const missingEndUserField = requiredEndUserFields.find((field) => !endUser[field].trim());
      if (missingEndUserField) {
        setLocalError('Please fill in all required end user information.');
        return;
      }

      const trimmedEndUserEmail = endUser.email.trim();
      if (trimmedEndUserEmail && !emailPattern.test(trimmedEndUserEmail)) {
        setLocalError('Please enter a valid end user email address.');
        return;
      }

      const trimmedEndUserCountry = endUser.countryCode.trim();
      if (!/^[A-Za-z]{2}$/.test(trimmedEndUserCountry)) {
        setLocalError('End user country code must be a two-letter ISO code.');
        return;
      }

      const trimmedEndUserState = endUser.state.trim();
      if (trimmedEndUserCountry.toUpperCase() === 'US' && !/^[A-Za-z]{2}$/.test(trimmedEndUserState)) {
        setLocalError('End user state must be a two-letter code when located in the United States.');
        return;
      }

      endUserPayload = toOrderAddress(endUser);
      shouldSendEndUser = Boolean(endUserPayload);
    }
    setLocalError(null);
    try {
      const orderPayload = {
        customerOrderNumber: trimmedCustomerOrderNumber,
        notes: notes.trim() || undefined,
        acceptBackOrder,
        shipToInfo: shipToPayload,
        endCustomerOrderNumber: endCustomerOrderNumber.trim() || undefined,
        specialBidNumber: specialBidNumber.trim() || undefined,
        billToAddressId: billToAddressId.trim() || undefined,
        endUserInfo: shouldSendEndUser ? endUserPayload : undefined,
      } satisfies Omit<CartOrderPayload, 'lines'>;

      await createOrderFromCart(orderPayload);
      setShowCheckout(false);
      setCustomerOrderNumber('');
      setEndCustomerOrderNumber('');
      setSpecialBidNumber('');
      setBillToAddressId('');
      setNotes('');
      setShipTo({ ...initialAddress });
      setEndUser({ ...initialAddress });
      setIncludeEndUser(false);
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
            <div className="max-w-lg space-y-2 text-base text-[var(--color-muted)]">
              <p>
                Order <span className="font-semibold text-[var(--color-primary)]">#{lastOrderId}</span> has been placed
                successfully. Browse the catalog to add more products.
              </p>
              {lastCustomerOrderNumber && (
                <p className="text-sm">
                  Customer PO:{' '}
                  <span className="font-semibold text-[var(--color-foreground)]">
                    {lastCustomerOrderNumber}
                  </span>
                </p>
              )}
              {typeof recentOrderTotal === 'number' && (
                <p className="text-sm">
                  Order total:{' '}
                  <span className="font-semibold text-[var(--color-foreground)]">
                    {formatCurrency(recentOrderTotal, recentOrderCurrency)}
                  </span>
                </p>
              )}
            </div>
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
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="space-y-1">
                  <p>
                    Order <span className="font-semibold">{lastOrderId}</span> submitted successfully.
                  </p>
                  {lastCustomerOrderNumber && (
                    <p className="text-xs">
                      Customer PO:{' '}
                      <span className="font-semibold text-green-800">
                        {lastCustomerOrderNumber}
                      </span>
                    </p>
                  )}
                  {typeof recentOrderTotal === 'number' && (
                    <p className="text-xs">
                      Order total:{' '}
                      <span className="font-semibold text-green-800">
                        {formatCurrency(recentOrderTotal, recentOrderCurrency)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
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
              <div className="space-y-6">
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                    Order details
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Customer order number*
                      </label>
                      <input
                        value={customerOrderNumber}
                        onChange={(event) => setCustomerOrderNumber(event.target.value)}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Your PO reference"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        End customer PO
                      </label>
                      <input
                        value={endCustomerOrderNumber}
                        onChange={(event) => setEndCustomerOrderNumber(event.target.value)}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Special bid number
                      </label>
                      <input
                        value={specialBidNumber}
                        onChange={(event) => setSpecialBidNumber(event.target.value)}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Bill-to address ID
                      </label>
                      <input
                        value={billToAddressId}
                        onChange={(event) => setBillToAddressId(event.target.value)}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <input
                      type="checkbox"
                      checked={acceptBackOrder}
                      onChange={(event) => setAcceptBackOrder(event.target.checked)}
                      className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    Allow backorders if items are unavailable immediately
                  </label>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                    Ship-to information
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Company name*
                      </label>
                      <input
                        value={shipTo.companyName}
                        onChange={handleShipToChange('companyName')}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Ship-to company"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Attention / contact
                      </label>
                      <input
                        value={shipTo.contact}
                        onChange={handleShipToChange('contact')}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Address line 1*
                      </label>
                      <input
                        value={shipTo.addressLine1}
                        onChange={handleShipToChange('addressLine1')}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Street address"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Address line 2
                      </label>
                      <input
                        value={shipTo.addressLine2}
                        onChange={handleShipToChange('addressLine2')}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Suite, building, etc."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        City*
                      </label>
                      <input
                        value={shipTo.city}
                        onChange={handleShipToChange('city')}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        State / Province*
                      </label>
                      <input
                        value={shipTo.state}
                        onChange={handleShipToChange('state')}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Postal code*
                      </label>
                      <input
                        value={shipTo.postalCode}
                        onChange={handleShipToChange('postalCode')}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="ZIP or postal code"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Country code*
                      </label>
                      <input
                        value={shipTo.countryCode}
                        onChange={handleShipToChange('countryCode')}
                        className="w-full uppercase rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="US"
                        maxLength={3}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Phone
                      </label>
                      <input
                        value={shipTo.phoneNumber}
                        onChange={handleShipToChange('phoneNumber')}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Contact phone"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        Email
                      </label>
                      <input
                        value={shipTo.email}
                        onChange={handleShipToChange('email')}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        placeholder="Contact email"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIncludeEndUser((previous) => {
                        if (previous) {
                          setEndUser({ ...initialAddress });
                        }
                        return !previous;
                      });
                    }}
                    className="text-sm font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
                  >
                    {includeEndUser ? 'Remove end-user details' : 'Add end-user shipment details'}
                  </button>

                  {includeEndUser && (
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-primary-light)]/20 p-4 space-y-3">
                      <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                        End-user information
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Company name
                          </label>
                          <input
                            value={endUser.companyName}
                            onChange={handleEndUserChange('companyName')}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="End-user company"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Contact
                          </label>
                          <input
                            value={endUser.contact}
                            onChange={handleEndUserChange('contact')}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="Point of contact"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Address line 1
                          </label>
                          <input
                            value={endUser.addressLine1}
                            onChange={handleEndUserChange('addressLine1')}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="Street address"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Address line 2
                          </label>
                          <input
                            value={endUser.addressLine2}
                            onChange={handleEndUserChange('addressLine2')}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="Suite, building, etc."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            City
                          </label>
                          <input
                            value={endUser.city}
                            onChange={handleEndUserChange('city')}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            State / Province
                          </label>
                          <input
                            value={endUser.state}
                            onChange={handleEndUserChange('state')}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="State"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Postal code
                          </label>
                          <input
                            value={endUser.postalCode}
                            onChange={handleEndUserChange('postalCode')}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="ZIP or postal code"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Country code
                          </label>
                          <input
                            value={endUser.countryCode}
                            onChange={handleEndUserChange('countryCode')}
                            className="w-full uppercase rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="US"
                            maxLength={3}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Phone
                          </label>
                          <input
                            value={endUser.phoneNumber}
                            onChange={handleEndUserChange('phoneNumber')}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="Contact phone"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Email
                          </label>
                          <input
                            value={endUser.email}
                            onChange={handleEndUserChange('email')}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            placeholder="Contact email"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="space-y-2">
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
                </section>

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
