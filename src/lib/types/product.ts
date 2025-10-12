// Updated Product interface to match actual API response
export interface Product {
  ingramPartNumber: string;
  vendorPartNumber: string;
  description: string;
  productCategory: string;
  productSubcategory: string;
  productClass: string | null;
  upc: string;
  vendorName: string;
  vendorNumber: string;
  productAuthorized: string;
  productStatusCode: string | null;
  lastUpdated?: string;
  // Legacy fields for backward compatibility
  category?: string;
  subCategory?: string;
  productType?: string;
  upcCode?: string;
  endUserRequired?: string;
  hasDiscounts?: string;
  type?: string;
  discontinued?: string;
  newProduct?: string;
  directShip?: string;
  hasWarranty?: string;
  replacementSku?: string;
  authorizedToPurchase?: string;
  extraDescription?: string;
  links?: Array<{
    topic: string;
    href: string;
    type: string;
  }>;
}

export interface Price {
  msrp: number;
  customerPrice: number;
  currency: string;
  discountPercentage?: number;
}

export interface Availability {
  available: boolean;
  quantity: number;
  warehouse: WarehouseInfo[];
  availabilityByWarehouse: WarehouseAvailability[];
}

export interface WarehouseInfo {
  warehouseId: string;
  location: string;
  quantity: number;
}

export interface WarehouseAvailability {
  warehouseId: string;
  quantityAvailable: number;
  location: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  primary: boolean;
}

export interface Specification {
  name: string;
  value: string;
  category: string;
}

export interface ProductSearchRequest {
  keyword?: string;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'price' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchResponse {
  catalog: Product[];
  subscriptionCatalog?: any[];
  recordsFound: number;
  pageSize: number;
  pageNumber: number;
  nextPage?: string;
}

export interface PriceAvailabilityRequest {
  products: Array<{
    ingramPartNumber: string;
    quantity?: number;
  }>;
}

export interface PriceAvailabilityResponse extends Array<{
  index: number;
  productStatusCode: string;
  productStatusMessage: string;
  ingramPartNumber: string;
  vendorPartNumber: string;
  upc: string;
  errorCode: string;
  availability: {
    available: boolean;
    totalAvailability: number;
    availabilityByWarehouse: Array<{
      quantityAvailable: number;
      warehouseId: string;
      location: string;
      quantityBackordered: number;
      quantityBackorderedEta: string;
      quantityOnOrder: number;
    }>;
  };
  pricing: {
    mapPrice: number;
    currencyCode: string;
    retailPrice: number;
    customerPrice: number;
  };
  discounts: any[];
  subscriptionPrice: any[];
}> {}
