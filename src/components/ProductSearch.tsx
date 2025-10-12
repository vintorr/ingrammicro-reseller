'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal, Star, Heart, Eye, ShoppingCart, ChevronDown, X, SortAsc, SortDesc } from 'lucide-react';
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
  const [priceAvailabilityData, setPriceAvailabilityData] = useState<any[] | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  
  // New UI state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'popularity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 10000});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<Set<string>>(new Set());
  
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
        console.error('Batch price availability API error:', response.status, response.statusText);
        setPriceAvailabilityData([]);
        return;
      }
      
      const data = await response.json();
      const productsData = Array.isArray(data) ? data : (data.products || []);
      
      const validProducts = productsData.filter((product: any) => {
        if (product.productStatusCode === 'E' || product.errorCode) {
          console.warn(`Product ${product.ingramPartNumber} has error:`, product.errorMessage || 'Unknown error');
          return false;
        }
        return true;
      });
      
      setPriceAvailabilityData(validProducts);
    } catch (err) {
      console.error('Error fetching batch price and availability:', err);
    } finally {
      setPriceLoading(false);
    }
  };

  // Load initial products on component mount
  useEffect(() => {
    if (products.length > 0) {
      fetchBatchPriceAndAvailability(products);
    }
  }, [products]);

  // Search products when filters change
  useEffect(() => {
    if (searchQuery || filters.category || filters.brand) {
      searchProducts({ ...filters, keyword: searchQuery });
    }
  }, [searchQuery, filters.pageNumber, filters.pageSize, searchProducts]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setFilters(prev => ({ ...prev, keyword: searchQuery, pageNumber: 1 }));
  };

  const handleAddToCart = (product: Product) => {
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

  // Helper functions
  const getProductPriceAvailability = (ingramPartNumber: string) => {
    if (!priceAvailabilityData) return null;
    return priceAvailabilityData.find((item: any) => item.ingramPartNumber === ingramPartNumber);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const toggleCompare = (productId: string) => {
    setCompareList(prev => {
      const newCompare = new Set(prev);
      if (newCompare.has(productId)) {
        newCompare.delete(productId);
      } else if (newCompare.size < 4) {
        newCompare.add(productId);
      }
      return newCompare;
    });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({min: 0, max: 10000});
    setFilters(prev => ({ ...prev, category: undefined, brand: undefined, pageNumber: 1 }));
  };

  const getUniqueCategories = () => {
    const categories = products.map(p => p.productCategory || p.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const getUniqueBrands = () => {
    const brands = products.map(p => p.vendorName).filter(Boolean);
    return [...new Set(brands)];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
                <p className="mt-1 text-gray-600">Discover the latest technology solutions</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex items-center gap-2"
                >
                  <Grid className="w-4 h-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2"
                >
                  <List className="w-4 h-4" />
                  List
                </Button>
              </div>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="relative">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products by keyword, part number, or description..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!searchQuery.trim()}
                  className="px-8 py-3 text-lg"
                >
                  Search
                </Button>
              </form>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Enhanced Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </Button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setFilters(prev => ({ ...prev, category: e.target.value || undefined, pageNumber: 1 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setFilters(prev => ({ ...prev, brand: e.target.value || undefined, pageNumber: 1 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brands</option>
                  {getUniqueBrands().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min || ''}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max || ''}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 10000 }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
                <div className="space-y-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'popularity')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="popularity">Popularity</option>
                  </select>
                  <div className="flex gap-2">
                    <Button
                      variant={sortOrder === 'asc' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSortOrder('asc')}
                      className="flex-1"
                    >
                      <SortAsc className="w-4 h-4 mr-1" />
                      Asc
                    </Button>
                    <Button
                      variant={sortOrder === 'desc' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSortOrder('desc')}
                      className="flex-1"
                    >
                      <SortDesc className="w-4 h-4 mr-1" />
                      Desc
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {products.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600">
                    <p>Showing {products.length} products</p>
                    {compareList.size > 0 && (
                      <p className="mt-1 text-blue-600">
                        {compareList.size} selected for comparison
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Header */}
            {products.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Search Results
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {products.length} products found
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {compareList.size > 0 && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Compare ({compareList.size})
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Product Grid/List */}
                <div className="p-6">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product.ingramPartNumber}
                          product={product}
                          onAddToCart={handleAddToCart}
                          onViewDetails={handleViewDetails}
                          priceAvailabilityData={priceAvailabilityData}
                          priceLoading={priceLoading}
                          isFavorite={favorites.has(product.ingramPartNumber)}
                          isInCompare={compareList.has(product.ingramPartNumber)}
                          onToggleFavorite={() => toggleFavorite(product.ingramPartNumber)}
                          onToggleCompare={() => toggleCompare(product.ingramPartNumber)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
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
                    </div>
                  )}

                  {/* Enhanced Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-2"
                        >
                          Previous
                        </Button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'primary' : 'ghost'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-2"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                  <span className="ml-2 text-gray-600">Searching products...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
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

            {/* No Results */}
            {!loading && !error && products.length === 0 && searchQuery && (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <p className="text-gray-500">No products found matching your search criteria.</p>
              </div>
            )}

            {/* Initial State */}
            {!loading && !error && products.length === 0 && !searchQuery && (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <p className="text-gray-500 mb-4">Enter a search term to find products.</p>
                <Button 
                  onClick={() => searchProducts({ pageNumber: 1, pageSize: 20 })}
                  variant="primary"
                >
                  Load Initial Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {isDetailsModalOpen && selectedProductId && (
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