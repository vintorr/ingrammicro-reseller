'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCart } from '@/lib/hooks/useCart';
import { ProductCard } from './product/ProductCard';
import { ProductListRow } from './product/ProductListRow';
import { ProductDetailsModal } from './product/ProductDetailsModal';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Badge } from './ui/Badge';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Product, ProductSearchRequest, PriceAvailabilityResponse } from '@/lib/types';

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ProductSearchRequest>({
    pageNumber: 1,
    pageSize: 20,
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [priceAvailabilityData, setPriceAvailabilityData] = useState<PriceAvailabilityResponse | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  
  const { products, loading, error, totalPages, currentPage, searchProducts } = useProducts();
  const { addToCart } = useCart();


  // Batch fetch price and availability for all products
  const fetchBatchPriceAndAvailability = async (products: Product[]) => {
    if (products.length === 0) return;
    
    setPriceLoading(true);
    try {
      const response = await fetch('/api/ingram/price-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products.map(product => ({
            ingramPartNumber: product.ingramPartNumber
          }))
        })
      });
      
      if (!response.ok) {
        console.error('Batch price availability API error');
        return;
      }
      
      const data = await response.json();
      setPriceAvailabilityData(data);
    } catch (err) {
      console.error('Error fetching batch price and availability:', err);
    } finally {
      setPriceLoading(false);
    }
  };

  // Load initial products on component mount
  useEffect(() => {
    searchProducts({ pageNumber: 1, pageSize: 20 });
  }, [searchProducts]);

  // Fetch price and availability when products change
  useEffect(() => {
    if (products.length > 0) {
      fetchBatchPriceAndAvailability(products);
    }
  }, [products]);

  // Helper function to get price/availability data for a specific product
  const getProductPriceAvailability = (ingramPartNumber: string) => {
    if (!priceAvailabilityData) return null;
    return priceAvailabilityData.find(item => item.ingramPartNumber === ingramPartNumber) || null;
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      searchProducts({ ...filters, keyword: searchQuery });
    }
  }, [searchQuery, filters.pageNumber, filters.pageSize, searchProducts]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setFilters(prev => ({ ...prev, keyword: searchQuery, pageNumber: 1 }));
  };

  const handleAddToCart = (product: Product) => {
    // Get price/availability data for this product
    const productPriceAvailability = getProductPriceAvailability(product.ingramPartNumber);
    
    if (productPriceAvailability?.pricing && productPriceAvailability?.availability?.available) {
      const cartItem = {
        product,
        quantity: 1,
        unitPrice: productPriceAvailability.pricing.customerPrice,
        totalPrice: productPriceAvailability.pricing.customerPrice,
      };
      addToCart(cartItem);
    } else {
      alert('Product not available or price not loaded. Please try again.');
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProductId(product.ingramPartNumber);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedProductId(null);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, pageNumber: page }));
    searchProducts({ ...filters, pageNumber: page });
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Product Search</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products by keyword, part number, or description..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            type="submit"
            loading={loading}
            disabled={!searchQuery.trim()}
          >
            Search
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error.message}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {products.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Search Results ({products.length})
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="info">
                  Page {currentPage} of {totalPages}
                </Badge>
              </div>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.ingramPartNumber}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                        priceAvailabilityData={priceAvailabilityData}
                        priceLoading={priceLoading}
                      />
                    ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <ProductListRow
                      key={product.ingramPartNumber}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewDetails}
                      priceAvailabilityData={priceAvailabilityData}
                      priceLoading={priceLoading}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Previous button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  {(() => {
                    const pages = [];
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, currentPage + 2);
                    
                    // Show first page if not in range
                    if (startPage > 1) {
                      pages.push(
                        <Button
                          key={1}
                          variant={currentPage === 1 ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                      );
                      if (startPage > 2) {
                        pages.push(<span key="ellipsis1" className="px-2">...</span>);
                      }
                    }
                    
                    // Show pages in range
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => handlePageChange(i)}
                        >
                          {i}
                        </Button>
                      );
                    }
                    
                    // Show last page if not in range
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(<span key="ellipsis2" className="px-2">...</span>);
                      }
                      pages.push(
                        <Button
                          key={totalPages}
                          variant={currentPage === totalPages ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  {/* Next button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Showing page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

          {loading && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-gray-600">Searching products...</span>
          </div>
        </div>
      )}

          {error && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
                <p className="text-gray-500 mb-4">{error?.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="primary"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && products.length === 0 && searchQuery && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No products found matching your search criteria.</p>
        </div>
      )}

          {!loading && !error && products.length === 0 && !searchQuery && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-4">Enter a search term to find products.</p>
              <Button 
                onClick={() => searchProducts({ pageNumber: 1, pageSize: 20 })}
                variant="primary"
              >
                Load Initial Products
              </Button>
            </div>
          )}

      {/* Product Details Modal */}
      {selectedProductId && (
        <ProductDetailsModal
          productId={selectedProductId}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default ProductSearch;
