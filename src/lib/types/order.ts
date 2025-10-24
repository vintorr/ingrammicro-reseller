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
  description?: string; // Legacy field
  partDescription?: string; // Actual API field
  quantity?: number; // Legacy field
  quantityOrdered?: number; // Actual API field
  unitPrice: number;
  totalPrice?: number; // Legacy field
  extendedPrice?: number; // Actual API field
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
  customerOrderNumber: string;
  endCustomerOrderNumber?: string;
  billToAddressId?: string;
  specialBidNumber?: string;
  notes?: string;
  acceptBackOrder?: boolean;
  resellerInfo?: OrderCreateResellerInfo;
  vmf?: OrderCreateVendorManagedFulfillment;
  shipToInfo?: OrderCreateShipToInfo;
  endUserInfo?: OrderCreateEndUserInfo;
  lines: OrderCreateRequestLine[];
  shipmentDetails?: OrderCreateShipmentDetails;
  additionalAttributes?: OrderCreateAdditionalAttribute[];
}

export interface OrderCreateResellerInfo {
  resellerId?: string;
  companyName?: string;
  contact?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phoneNumber?: string | number;
  email?: string;
}

export interface OrderCreateVendorManagedFulfillment {
  vendAuthNumber?: string;
}

export interface OrderCreateShipToInfo {
  addressId?: string;
  contact?: string;
  companyName?: string;
  name1?: string;
  name2?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
}

export interface OrderCreateEndUserInfo {
  endUserId?: string;
  contact?: string;
  companyName?: string;
  name1?: string;
  name2?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
}

export interface OrderCreateRequestLine {
  customerLineNumber: string;
  ingramPartNumber: string;
  quantity: number;
  specialBidNumber?: string;
  notes?: string;
  unitPrice?: number;
  endUserPrice?: number;
  additionalAttributes?: OrderCreateLineAdditionalAttribute[];
  warrantyInfo?: OrderCreateLineWarrantyInfo[];
}

export interface OrderCreateLineAdditionalAttribute {
  attributeName?: string;
  attributeValue?: string;
}

export interface OrderCreateLineWarrantyInfo {
  directLineLink?: string;
  warrantyLineLink?: string;
  hardwareLineLink?: string;
  serialInfo?: OrderCreateLineWarrantySerialInfo[];
}

export interface OrderCreateLineWarrantySerialInfo {
  serialNumber?: string;
  shipDate?: string;
}

export interface OrderCreateShipmentDetails {
  carrierCode?: string;
  freightAccountNumber?: string;
  shipComplete?: 'true' | 'C' | 'P' | 'E';
  requestedDeliveryDate?: string;
  signatureRequired?: boolean;
  shippingInstructions?: string;
}

export interface OrderCreateAdditionalAttribute {
  attributeName?: string;
  attributeValue?: string;
}

export interface OrderCreateResponse {
  customerOrderNumber?: string;
  endCustomerOrderNumber?: string;
  billToAddressId?: string;
  specialBidNumber?: string;
  orderSplit?: boolean;
  processedPartially?: boolean;
  purchaseOrderTotal?: number;
  shipToInfo?: OrderCreateResponseShipToInfo;
  endUserInfo?: OrderCreateResponseEndUserInfo;
  orders?: OrderCreateResponseOrder[];
}

export interface OrderCreateResponseShipToInfo {
  addressId?: string;
  contact?: string;
  companyName?: string;
  name1?: string;
  name2?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
}

export interface OrderCreateResponseEndUserInfo {
  endUserId?: string;
  contact?: string;
  companyName?: string;
  name1?: string;
  name2?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
}

export interface OrderCreateResponseOrder {
  numberOfLinesWithSuccess?: number;
  numberOfLinesWithError?: number;
  numberOfLinesWithWarning?: number;
  ingramOrderNumber?: string;
  ingramOrderDate?: string;
  notes?: string;
  orderType?: string;
  orderTotal?: number;
  freightCharges?: number;
  totalTax?: number;
  currencyCode?: string;
  lines?: OrderCreateResponseOrderLine[];
  miscellaneousCharges?: OrderCreateResponseMiscCharge[];
  links?: OrderCreateResponseLink[];
  rejectedLineItems?: OrderCreateResponseRejectedLineItem[];
  additionalAttributes?: OrderCreateResponseAdditionalAttribute[];
}

export interface OrderCreateResponseOrderLine {
  subOrderNumber?: string;
  ingramLineNumber?: string;
  customerLineNumber?: string;
  lineStatus?: string;
  ingramPartNumber?: string;
  vendorPartNumber?: string;
  unitPrice?: number;
  extendedUnitPrice?: number;
  quantityOrdered?: number;
  quantityConfirmed?: number;
  quantityBackOrdered?: number;
  specialBidNumber?: string;
  notes?: string;
  shipmentDetails?: OrderCreateResponseOrderLineShipmentDetail[];
  additionalAttributes?: OrderCreateResponseAdditionalAttribute[];
}

export interface OrderCreateResponseOrderLineShipmentDetail {
  carrierCode?: string;
  carrierName?: string;
  shipFromWarehouseId?: string;
  shipFromLocation?: string;
  freightAccountNumber?: string;
  signatureRequired?: string;
  shippingInstructions?: string;
}

export interface OrderCreateResponseMiscCharge {
  subOrderNumber?: string;
  chargeLineReference?: string;
  chargeDescription?: string;
  chargeAmount?: number;
}

export interface OrderCreateResponseLink {
  topic?: string;
  href?: string;
  type?: string;
}

export interface OrderCreateResponseRejectedLineItem {
  customerLinenumber?: string;
  ingramPartNumber?: string;
  vendorPartNumber?: string;
  quantityOrdered?: number;
  rejectCode?: string;
  rejectReason?: string;
}

export interface OrderCreateResponseAdditionalAttribute {
  attributeName?: string;
  attributeValue?: string;
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

export interface QuoteSearchParams {
  pageNumber?: number;
  pageSize?: number;
  quoteNumber?: string;
  quoteName?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortingOrder?: 'asc' | 'desc';
  specialBidNumber?: string;
  endUserContact?: string;
  vendorName?: string;
}

export interface QuoteSearchResponse {
  recordsFound?: number;
  pageSize?: number;
  pageNumber?: number;
  quotes?: QuoteSummary[];
  nextPage?: string;
  prevPage?: string;
}

export interface QuoteSummary {
  quoteGuid?: string;
  quoteName?: string;
  quoteNumber?: string;
  revision?: string;
  currencyCode?: string;
  endUserContact?: string;
  endUserName?: string;
  specialBidNumber?: string;
  quoteTotal?: number;
  quoteStatus?: string;
  ingramQuoteDate?: string;
  lastModifiedDate?: string;
  ingramQuoteExpiryDate?: string;
  vendor?: string;
  createdBy?: string;
  quoteType?: string;
  links?: QuoteSummaryLink[];
}

export interface QuoteSummaryLink {
  topic?: string;
  href?: string;
  type?: string;
}
