import { apiClient } from '../client';
import type {
  Product,
  ProductSearchRequest,
  ProductSearchResponse,
  PriceAvailabilityRequest,
  PriceAvailabilityResponse,
} from '../../types';

export class ProductsApi {
  async searchProducts(params: ProductSearchRequest): Promise<ProductSearchResponse> {
    const endpoint = '/resellers/v6/catalog';
    return apiClient.get<ProductSearchResponse>(endpoint, params);
  }

  async getProductDetails(ingramPartNumber: string): Promise<Product> {
    const endpoint = `/resellers/v6/catalog/details/${ingramPartNumber}`;
    return apiClient.get<Product>(endpoint);
  }

  async getPriceAndAvailability(
    request: PriceAvailabilityRequest
  ): Promise<PriceAvailabilityResponse> {
    const endpoint = '/resellers/v6/catalog/priceandavailability';
    return apiClient.post<PriceAvailabilityResponse>(endpoint, request);
  }

  async getProductsByCategory(category: string, pageNumber = 1, pageSize = 20): Promise<ProductSearchResponse> {
    return this.searchProducts({
      category,
      pageNumber,
      pageSize,
    });
  }

  async getProductsByBrand(brand: string, pageNumber = 1, pageSize = 20): Promise<ProductSearchResponse> {
    return this.searchProducts({
      brand,
      pageNumber,
      pageSize,
    });
  }

  async searchProductsByKeyword(
    keyword: string,
    pageNumber = 1,
    pageSize = 20
  ): Promise<ProductSearchResponse> {
    return this.searchProducts({
      keyword,
      pageNumber,
      pageSize,
    });
  }
}

export const productsApi = new ProductsApi();
