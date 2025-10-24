export interface ReturnSearchRequest {
  caseRequestNumber?: string;
  invoiceNumber?: string;
  returnClaimId?: string;
  referenceNumber?: string;
  ingramPartNumber?: string;
  vendorPartNumber?: string;
  returnStatusIn?: string;
  claimStatusIn?: string;
  createdOnBt?: string;
  modifiedOnBt?: string;
  returnReasonIn?: string;
  page?: number;
  size?: number;
  sort?: string;
  sortingColumnName?: string;
}

export interface ReturnSearchResponse {
  recordsFound?: number;
  pageSize?: number;
  pageNumber?: number;
  returnsClaims?: ReturnSummary[];
  nextPage?: string;
  previousPage?: string;
}

export interface ReturnSummary {
  returnClaimId?: string;
  caseRequestNumber?: string;
  createdOn?: string;
  modifiedOn?: string;
  type?: string;
  returnReason?: string;
  referenceNumber?: string;
  estimatedTotalValue?: number;
  credit?: number;
  status?: string;
  links?: ReturnSummaryLink[];
}

export interface ReturnSummaryLink {
  topic?: string;
  href?: string;
  type?: string;
}

export interface ReturnDetails {
  typeOfDetails?: string;
  rmaClaimId?: string;
  caseRequestNumber?: string;
  createdOn?: string;
  returnReason?: string;
  referenceNumber?: string;
  status?: string;
  returnWarehouseAddress?: string;
  subTotal?: number;
  tax?: number;
  additionalFees?: number;
  estimatedTotal?: number;
  products?: ReturnProduct[];
}

export interface ReturnProduct {
  ingramLineNumber?: number;
  description?: string;
  ingramPartNumber?: string;
  vendorPartNumber?: string;
  upc?: string;
  invoiceDate?: string;
  invoiceNumber?: string;
  customerOrderNumber?: string;
  quantity?: number;
  unitPrice?: number;
  extendedPrice?: number;
  status?: string;
  returnBranch?: string;
  shipFromBranch?: string;
  requestDetails?: string;
  additionalDetails?: string;
}
