import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumbers?: TrackingInfo[];
}

export interface OrderItem {
  ingramPartNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderItemStatus;
}

export type OrderStatus = 
  | 'pending'
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export type OrderItemStatus = 
  | 'pending'
  | 'backordered'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  url?: string;
}

export interface OrderCreateRequest {
  customerOrderNumber?: string;
  endCustomerOrderNumber?: string;
  items: Array<{
    ingramPartNumber: string;
    quantity: number;
    unitPrice?: number;
  }>;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethod?: string;
  notes?: string;
}

export interface OrderCreateResponse {
  orderNumber: string;
  orderId: string;
  status: string;
  orderTotal: number;
  items: OrderItem[];
  estimatedDelivery?: string;
}

// Quote types
export interface Quote {
  quoteNumber: string;
  quoteId: string;
  status: string;
  customerName: string;
  customerEmail: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdDate: string;
  expiryDate: string;
}

export interface QuoteItem {
  ingramPartNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

export interface QuoteCreateRequest {
  customerName: string;
  customerEmail: string;
  items: Array<{
    partNumber: string;
    quantity: number;
    description: string;
  }>;
}
