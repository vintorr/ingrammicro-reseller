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
  ingramOrderNumber: string;
  ingramOrderDate: string;
  orderType: string;
  customerOrderNumber: string;
  endCustomerOrderNumber: string;
  webOrderId: string;
  vendorSalesOrderNumber: string;
  ingramPurchaseOrderNumber: string;
  orderStatus: string;
  orderTotal: number;
  orderSubTotal: number;
  freightCharges: number;
  currencyCode: string;
  totalWeight: number;
  totalTax: number;
  paymentTerms: string;
  notes: string;
  billToInfo: AddressInfo;
  shipToInfo: AddressInfo;
  endUserInfo: AddressInfo;
  lines: OrderLine[];
  miscellaneousCharges: MiscellaneousCharge[];
  additionalAttributes: AdditionalAttribute[];
}

export interface AddressInfo {
  contact: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
}

export interface OrderLine {
  customerLineNumber: string;
  ingramPartNumber: string;
  vendorPartNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  addUpdateDeleteLine?: string;
}

export interface MiscellaneousCharge {
  chargeType: string;
  chargeAmount: number;
  description: string;
}

export interface AdditionalAttribute {
  attributeName: string;
  attributeValue: string;
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

export interface OrderSearchResponse {
  recordsFound: string;
  pageSize: string;
  pageNumber: string;
  orders: Order[];
  nextPage?: string;
  previousPage?: string;
}

export interface OrderSearchRequest {
  customerOrderNumber?: string;
  endCustomerOrderNumber?: string;
  orderNumber?: string;
  orderStatus?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface OrderModifyRequest {
  notes?: string;
  shipToInfo?: {
    contact: string;
    companyName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
    email: string;
  };
  lines: Array<{
    customerLineNumber: string;
    ingramPartNumber: string;
    addUpdateDeleteLine: 'ADD' | 'UPDATE' | 'DELETE';
    quantity?: number;
  }>;
  additionalAttributes?: Array<{
    attributeName: string;
    attributeValue: string;
  }>;
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
