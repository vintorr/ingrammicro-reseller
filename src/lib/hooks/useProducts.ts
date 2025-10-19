import { useState, useCallback } from 'react';
import { productsApi } from '../api/ingram/products';
import type { Product, ProductSearchRequest, ProductSearchResponse } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const searchProducts = useCallback(async (params: ProductSearchRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/ingram/products?${queryParams.toString()}`);
      if (!response.ok) {
        // If the API returns an error, try to get the error details
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage);
      }
      
      const data: ProductSearchResponse = await response.json();
      setProducts(data.catalog || []);
      setTotalRecords(typeof data.recordsFound === 'number' ? data.recordsFound : data.catalog?.length || 0);
      if (typeof data.totalPages === 'number') {
        setTotalPages(data.totalPages);
      } else {
        setTotalPages(Math.ceil((data.recordsFound || 0) / (data.pageSize || params.pageSize || 20)));
      }
      setCurrentPage(data.pageNumber || params.pageNumber || 1);
    } catch (err) {
      console.error('useProducts: API error:', err);
      setError(err as Error);
      // Don't clear products on error - keep existing products if any
      // setProducts([]);
    } finally {
      setLoading(false);
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
    totalRecords,
    searchProducts,
    getProductDetails,
  };
}
