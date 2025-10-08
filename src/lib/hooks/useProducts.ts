import { useState, useCallback } from 'react';
import { productsApi } from '../api/ingram/products';
import type { Product, ProductSearchRequest, ProductSearchResponse } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const searchProducts = useCallback(async (params: ProductSearchRequest) => {
    console.log('useProducts: searchProducts called with params:', params);
    setLoading(true);
    setError(null);
    
    try {
      console.log('useProducts: Making API call...');
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/ingram/products?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ProductSearchResponse = await response.json();
      console.log('useProducts: API response received:', data);
      setProducts(data.catalog);
      setTotalPages(Math.ceil(data.recordsFound / data.pageSize));
      setCurrentPage(data.pageNumber);
      console.log('useProducts: State updated successfully');
    } catch (err) {
      console.error('useProducts: API error:', err);
      setError(err as Error);
      setProducts([]);
    } finally {
      setLoading(false);
      console.log('useProducts: Loading set to false');
    }
  }, []);

  const getProductDetails = useCallback(async (ingramPartNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      const product = await productsApi.getProductDetails(ingramPartNumber);
      return product;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    totalPages,
    currentPage,
    searchProducts,
    getProductDetails,
  };
}
