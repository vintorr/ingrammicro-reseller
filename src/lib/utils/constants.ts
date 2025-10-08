// Test SKUs for different scenarios
export const SANDBOX_SKUS = {
  USA: {
    available: 'TSXML3',
    noStock: 'TSXML1',
    directShip: 'TSXML2',
  },
  UK: {
    inStock: ['S26381-K521-L154', 'MLA02Z/A', 'DELL-P961T'],
    outOfStock: '103202284',
    unauthorized: 'D9L20A#A80',
  },
};

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_ITEM_STATUSES = {
  PENDING: 'pending',
  BACKORDERED: 'backordered',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
} as const;
