import { unstable_cache } from 'next/cache';
import { productsApi } from '../api/ingram/products';
import type { ProductSearchRequest, ProductSearchResponse, Product } from '../types';

// Cache product search results for 5 minutes
export const getCachedProducts = unstable_cache(
  async (searchParams: string) => {
    const params = JSON.parse(searchParams);
    return productsApi.searchProducts(params);
  },
  ['products-search'],
  {
    revalidate: 300, // 5 minutes
    tags: ['products'],
  }
);

// Cache product details for 10 minutes
export const getCachedProductDetails = unstable_cache(
  async (ingramPartNumber: string) => {
    return productsApi.getProductDetails(ingramPartNumber);
  },
  ['product-details'],
  {
    revalidate: 600, // 10 minutes
    tags: ['product-details'],
  }
);

// Cache price and availability for 2 minutes (more frequent updates needed)
export const getCachedPriceAvailability = unstable_cache(
  async (skus: string[]) => {
    return productsApi.getPriceAndAvailability({
      products: skus.map(sku => ({ ingramPartNumber: sku }))
    });
  },
  ['price-availability'],
  {
    revalidate: 120, // 2 minutes
    tags: ['pricing'],
  }
);
