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
  const [priceRange, setPriceRange] = useState<{ min: number, max: number }>({ min: 0, max: 10000 });
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

  // Auto-load products on component mount
  useEffect(() => {
    // Load initial products when component mounts
    searchProducts({ pageNumber: 1, pageSize: 20 });
  }, [searchProducts]);

  // Search products when filters change (only if there's a search query or filters)
  useEffect(() => {
    if (searchQuery.trim() || filters.category || filters.brand) {
      searchProducts({ ...filters, keyword: searchQuery });
    }
  }, [searchQuery, filters, searchProducts]);

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
    setPriceRange({ min: 0, max: 10000 });
    setFilters(prev => ({ ...prev, category: undefined, brand: undefined, pageNumber: 1 }));
  };

  const getUniqueCategories = () => {
    const categories = products.map(p => p.productCategory || p.category).filter(Boolean);
    return [...new Set(categories)].sort();
  };

  const getUniqueBrands = () => {
    const brands = products.map(p => p.vendorName).filter(Boolean);
    return [...new Set(brands)].sort();
  };

  // Filter products (client-side filtering)
  const getFilteredProducts = () => {
    let filtered = products;
    return filtered;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Header with Glass Effect */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 mt-10 mb-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Top Section: Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Product Catalog</h1>
              <p className="text-lg text-gray-600">
                Explore our comprehensive range of enterprise-grade technology solutions.
              </p>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl">
                <p className="text-red-800">{error.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-xl px-4 md:px-6 lg:px-8 overflow-x-hidden pb-20 lg:pb-0">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar Filters - Desktop Only */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#062fa3] hover:text-[#062fa3]/80 text-sm bg-white/50 hover:bg-white/80 px-4 py-2 rounded-xl"
                >
                  Clear All
                </Button>
              </div>

              {/* Search Bar as First Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Search Products</label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-[#062fa3] z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30 focus:border-[#062fa3]/50 transition-all duration-200 hover:bg-white/90 min-h-[3rem] resize-none"
                    style={{ height: 'auto', minHeight: '3rem' }}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.height = 'auto';
                      target.style.height = Math.max(3 * 16, target.scrollHeight) + 'px';
                    }}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Category
                  {selectedCategory && (
                    <span className="ml-2 text-xs text-[#062fa3] bg-[#062fa3]/10 px-3 py-1 rounded-full border border-[#062fa3]/20">
                      {selectedCategory}
                    </span>
                  )}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setFilters(prev => ({ ...prev, category: e.target.value || undefined, pageNumber: 1 }));
                  }}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30 focus:border-[#062fa3]/50 transition-all duration-200 hover:bg-white/90"
                >
                  <option value="">All Categories</option>
                  {products.length > 0 ? (
                    getUniqueCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))
                  ) : (
                    <option value="" disabled>Loading categories...</option>
                  )}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Brand
                  {selectedBrand && (
                    <span className="ml-2 text-xs text-[#062fa3] bg-[#062fa3]/10 px-3 py-1 rounded-full border border-[#062fa3]/20">
                      {selectedBrand}
                    </span>
                  )}
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setFilters(prev => ({ ...prev, brand: e.target.value || undefined, pageNumber: 1 }));
                  }}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30 focus:border-[#062fa3]/50 transition-all duration-200 hover:bg-white/90"
                >
                  <option value="">All Brands</option>
                  {products.length > 0 ? (
                    getUniqueBrands().map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))
                  ) : (
                    <option value="" disabled>Loading brands...</option>
                  )}
                </select>
              </div>


              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Sort By
                  <span className="ml-2 text-xs text-[#062fa3] bg-[#062fa3]/10 px-3 py-1 rounded-full border border-[#062fa3]/20">
                    {sortBy} ({sortOrder})
                  </span>
                </label>
                <div className="space-y-4">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as 'name' | 'price' | 'popularity');
                      setFilters(prev => ({ ...prev, sortBy: e.target.value as 'name' | 'price' | 'popularity', pageNumber: 1 }));
                    }}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30 focus:border-[#062fa3]/50 transition-all duration-200 hover:bg-white/90"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="popularity">Popularity</option>
                  </select>
                  <div className="flex gap-2">
                    <Button
                      variant={sortOrder === 'asc' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setSortOrder('asc');
                        setFilters(prev => ({ ...prev, sortOrder: 'asc', pageNumber: 1 }));
                      }}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        sortOrder === 'asc' 
                          ? 'bg-[#062fa3] text-white shadow-lg' 
                          : 'bg-white/80 text-gray-700 border border-white/30 hover:bg-white/90'
                      }`}
                    >
                      <SortAsc className="w-4 h-4 mr-2" />
                      Ascending
                    </Button>
                    <Button
                      variant={sortOrder === 'desc' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setSortOrder('desc');
                        setFilters(prev => ({ ...prev, sortOrder: 'desc', pageNumber: 1 }));
                      }}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        sortOrder === 'desc' 
                          ? 'bg-[#062fa3] text-white shadow-lg' 
                          : 'bg-white/80 text-gray-700 border border-white/30 hover:bg-white/90'
                      }`}
                    >
                      <SortDesc className="w-4 h-4 mr-2" />
                      Descending
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {products.length > 0 && (
                <div className="border-t border-white/20 pt-6">
                  <div className="text-sm text-gray-600 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Products found:</span>
                      <span className="font-bold text-gray-900">
                        {getFilteredProducts().length}
                        {getFilteredProducts().length !== products.length && (
                          <span className="text-[#062fa3]"> / {products.length}</span>
                        )}
                      </span>
                    </div>
                    {compareList.size > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">For comparison:</span>
                        <span className="font-bold text-[#062fa3]">
                          {compareList.size}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* View Toggle Buttons - Right Aligned */}
            <div className="flex items-center justify-end gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 rounded-2xl transition-all duration-200 px-6 py-3 border cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#062fa3] text-white border-[#062fa3] shadow-lg hover:bg-[#062fa3]/90'
                    : 'bg-white/80 text-gray-700 border-white/30 hover:bg-white/90 hover:border-[#062fa3]/50'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 rounded-2xl transition-all duration-200 px-6 py-3 border cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#062fa3] text-white border-[#062fa3] shadow-lg hover:bg-[#062fa3]/90'
                    : 'bg-white/80 text-gray-700 border-white/30 hover:bg-white/90 hover:border-[#062fa3]/50'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </Button>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/90 px-6 py-3 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-[#062fa3] hover:text-[#062fa3]/80 text-sm bg-white/50 hover:bg-white/80 px-4 py-2 rounded-xl"
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Mobile Search Bar */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Search Products</label>
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-[#062fa3] z-10" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30 focus:border-[#062fa3]/50 transition-all duration-200 hover:bg-white/90 min-h-[3rem] resize-none"
                        style={{ height: 'auto', minHeight: '3rem' }}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.height = 'auto';
                          target.style.height = Math.max(3 * 16, target.scrollHeight) + 'px';
                        }}
                      />
                    </div>
                  </div>

                  {/* Mobile Category Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setFilters(prev => ({ ...prev, category: e.target.value || undefined, pageNumber: 1 }));
                      }}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30 focus:border-[#062fa3]/50 transition-all duration-200 hover:bg-white/90"
                    >
                      <option value="">All Categories</option>
                      {products.length > 0 && getUniqueCategories().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mobile Brand Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Brand</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        setSelectedBrand(e.target.value);
                        setFilters(prev => ({ ...prev, brand: e.target.value || undefined, pageNumber: 1 }));
                      }}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30 focus:border-[#062fa3]/50 transition-all duration-200 hover:bg-white/90"
                    >
                      <option value="">All Brands</option>
                      {products.length > 0 && getUniqueBrands().map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>
            )}

            {/* Results Content */}
            {products.length > 0 && (
              <div className="mb-8">

                {/* Product Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredProducts().map((product) => (
                        <ProductCard
                          key={product.ingramPartNumber}
                          product={product}
                          onAddToCart={handleAddToCart}
                          onViewDetails={handleViewDetails}
                          priceAvailabilityData={priceAvailabilityData}
                          priceLoading={priceLoading}
                          isInCompare={compareList.has(product.ingramPartNumber)}
                          onToggleCompare={() => toggleCompare(product.ingramPartNumber)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredProducts().map((product) => (
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
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        Showing page {currentPage} of {totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page:</span>
                        <select
                          value={filters.pageSize || 20}
                          onChange={(e) => {
                            const newPageSize = parseInt(e.target.value);
                            setFilters(prev => ({ ...prev, pageSize: newPageSize, pageNumber: 1 }));
                            searchProducts({ ...filters, pageSize: newPageSize, pageNumber: 1 });
                          }}
                          className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 bg-white/80 hover:bg-white/90 border border-white/30"
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
                            className={currentPage === page 
                              ? 'bg-[#062fa3] text-white' 
                              : 'bg-white/80 hover:bg-white/90 border border-white/30'
                            }
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
                        className="flex items-center gap-2 bg-white/80 hover:bg-white/90 border border-white/30"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-gray-600 text-lg">Searching products...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="text-center">
                  <div className="text-red-600 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Products</h3>
                  <p className="text-gray-600 mb-6">{error?.message}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600/90 hover:bg-blue-700/90 text-white px-6 py-3 rounded-xl"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && getFilteredProducts().length === 0 && (searchQuery || priceRange.min > 0 || priceRange.max < 10000) && (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                <p className="text-gray-600 text-lg mb-4">No products found matching your search criteria.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="bg-white/80 hover:bg-white/90 border border-white/30 px-6 py-3 rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Initial State */}
            {!loading && !error && products.length === 0 && !searchQuery && (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                <p className="text-gray-600 text-lg mb-4">Loading products...</p>
                <LoadingSpinner size="lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Filter Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/20 p-4 z-40">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/90 px-4 py-3 rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 rounded-xl transition-all duration-200 px-4 py-3 border cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#062fa3] text-white border-[#062fa3] shadow-lg hover:bg-[#062fa3]/90'
                  : 'bg-white/80 text-gray-700 border-white/30 hover:bg-white/90 hover:border-[#062fa3]/50'
              }`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 rounded-xl transition-all duration-200 px-4 py-3 border cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#062fa3] text-white border-[#062fa3] shadow-lg hover:bg-[#062fa3]/90'
                  : 'bg-white/80 text-gray-700 border-white/30 hover:bg-white/90 hover:border-[#062fa3]/50'
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {isDetailsModalOpen && selectedProductId && (
        <ProductDetailsModal
          productId={selectedProductId}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default ProductSearch;