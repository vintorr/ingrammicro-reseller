export interface InvoiceSearchRequest {
  paymentTermsNetDate?: string;
  invoiceDate?: string;
  invoiceDueDate?: string;
  orderDate?: string;
  orderFromDate?: string;
  orderToDate?: string;
  orderNumber?: string;
  deliveryNumber?: string;
  invoiceNumber?: string;
  invoiceStatus?: string;
  invoiceType?: string;
  customerOrderNumber?: string;
  endCustomerOrderNumber?: string;
  specialBidNumber?: string;
  invoiceFromDueDate?: string;
  invoiceToDueDate?: string;
  invoiceFromDate?: string | string[];
  invoiceToDate?: string | string[];
  pageSize?: number;
  pageNumber?: number;
  orderby?: string;
  direction?: string;
  serialNumber?: string;
}

export interface InvoiceSearchResponse {
  recordsFound?: number;
  pageSize?: number;
  pageNumber?: number;
  invoices?: InvoiceSummary[];
  nextPage?: string;
}

export interface InvoiceSummary {
  paymentTermsDueDate?: string;
  specialBidNumbers?: string[];
  erpOrderNumber?: string;
  invoiceNumber?: string;
  invoiceStatus?: string;
  invoiceDate?: string;
  invoiceDueDate?: string;
  invoicedAmountDue?: number;
  customerOrderNumber?: string;
  endCustomerOrderNumber?: string;
  orderCreateDate?: string;
  invoiceAmountInclTax?: number;
  forgntotalamount?: number;
  gstInvoiceNumber?: string;
  isfseccenabled?: boolean;
}

export interface InvoiceDetails {
  invoiceNumber?: string;
  invoiceStatus?: string;
  invoiceDate?: string;
  customerOrderNumber?: string;
  endCustomerOrderNumber?: string;
  orderNumber?: string;
  orderDate?: string;
  billToID?: string;
  invoiceType?: string;
  invoiceDueDate?: string;
  customerCountryCode?: string;
  customerNumber?: string;
  ingramOrderNumber?: string;
  notes?: string;
  paymentTermsInfo?: InvoicePaymentTermsInfo;
  billToInfo?: InvoiceAddressInfo;
  shipToInfo?: InvoiceAddressInfo;
  lines?: InvoiceLine[];
  fxRateInfo?: InvoiceFxRateInfo;
  summary?: InvoiceSummaryInfo;
}

export interface InvoicePaymentTermsInfo {
  paymentTermsCode?: string;
  paymentTermsDescription?: string;
  paymentTermsDueDate?: string;
}

export interface InvoiceAddressInfo {
  contact?: string;
  companyName?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
}

export interface InvoiceLine {
  ingramLineNumber?: string;
  customerLineNumber?: string;
  ingramPartNumber?: string;
  upc?: string;
  vendorPartNumber?: string;
  customerPartNumber?: string;
  vendorName?: string;
  productDescription?: string;
  unitWeight?: number;
  quantity?: number;
  unitPrice?: number;
  unitOfMeasure?: string;
  currencyCode?: string;
  extendedPrice?: number;
  taxPercentage?: number;
  taxRate?: number;
  taxAmount?: number;
  serialNumbers?: InvoiceLineSerialNumber[];
  quantityOrdered?: number;
  quantityShipped?: number;
}

export interface InvoiceLineSerialNumber {
  serialNumber?: string;
}

export interface InvoiceFxRateInfo {
  currencyCode?: string;
  companyCurrency?: string;
  invoiceCurrency?: string;
  currencyFxRate?: number;
}

export interface InvoiceSummaryInfo {
  lines?: InvoiceSummaryLines;
  miscCharges?: InvoiceSummaryMiscCharge[];
  totals?: InvoiceSummaryTotals;
  foreignFxTotals?: InvoiceSummaryForeignFxTotals;
}

export interface InvoiceSummaryLines {
  productLineCount?: number;
  productLineTotalQuantity?: number;
}

export interface InvoiceSummaryMiscCharge {
  chargeDescription?: string;
  miscChargeLineCount?: number;
  miscChargeLineTotal?: number;
  chargeLineReference?: string;
  isNonMisc?: string;
}

export interface InvoiceSummaryTotals {
  netInvoiceAmount?: number;
  discountAmount?: number;
  discountType?: string;
  totalTaxAmount?: number;
  invoicedAmountDue?: number;
  freightAmount?: number;
}

export interface InvoiceSummaryForeignFxTotals {
  foreignCurrencyCode?: string;
  foreignCurrencyFxRate?: number;
  foreignTotalTaxableAmount?: string;
  foreignTotalTaxAmount?: number;
  foreignInvoiceAmountDue?: string;
}
