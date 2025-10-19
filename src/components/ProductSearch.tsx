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

const DEFAULT_PRICE_RANGE = { min: 0, max: 10000 };
const DEFAULT_PAGE_SIZE = 10;

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ProductSearchRequest>({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy: 'name',
    sortOrder: 'asc',
    productStatuses: 'ACTIVE',
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [priceAvailabilityData, setPriceAvailabilityData] = useState<PriceAvailabilityResponse | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // New UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(() => ({
    ...DEFAULT_PRICE_RANGE,
  }));
  const [compareList, setCompareList] = useState<Set<string>>(new Set());

  const { products, loading, error, totalPages, currentPage, totalRecords, searchProducts } = useProducts();
  const { addToCart } = useCart();
  const currentSortBy = filters.sortBy ?? 'name';
  const currentSortOrder = filters.sortOrder ?? 'asc';

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
        setPriceAvailabilityData([] as PriceAvailabilityResponse);
        return;
      }

      const data = await response.json();
      const productsData = (Array.isArray(data) ? data : data.products || []) as PriceAvailabilityResponse;

      const validProducts = productsData.filter((product) => {
        if (product.productStatusCode === 'E' || product.errorCode) {
          console.warn(`Product ${product.ingramPartNumber} has error:`, product.productStatusMessage || 'Unknown error');
          return false;
        }
        return true;
      }) as PriceAvailabilityResponse;

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
    } else {
      setPriceAvailabilityData(null);
    }
  }, [products]);

  // Fetch products whenever search parameters change.
  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 700);

    return () => {
      window.clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const keyword = debouncedSearchQuery.trim();
    searchProducts({
      ...filters,
      keyword: keyword || undefined,
    });
  }, [filters, searchProducts, debouncedSearchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => {
      const currentPage = prev.pageNumber ?? 1;
      if (currentPage === 1) {
        return prev;
      }
      return { ...prev, pageNumber: 1 };
    });
    setDebouncedSearchQuery(searchQuery);
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
    const currentPage = filters.pageNumber ?? 1;
    if (page < 1 || page === currentPage) {
      return;
    }
    if (totalPages && page > totalPages) {
      return;
    }
    setFilters(prev => ({ ...prev, pageNumber: page }));
  };

  // Helper functions
  const getProductPriceAvailability = (ingramPartNumber: string) => {
    if (!priceAvailabilityData) return null;
    return priceAvailabilityData.find((item: any) => item.ingramPartNumber === ingramPartNumber);
  };

  const resolveProductPrice = (product: Product) => {
    const availability = getProductPriceAvailability(product.ingramPartNumber);
    if (!availability?.pricing) {
      return null;
    }
    const { customerPrice, retailPrice, mapPrice } = availability.pricing;
    return customerPrice ?? retailPrice ?? mapPrice ?? null;
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
    setPriceRange({ ...DEFAULT_PRICE_RANGE });
    setFilters(prev => ({
      ...prev,
      category: undefined,
      brand: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      pageNumber: 1,
      keyword: undefined,
    }));
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

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => (product.productCategory || product.category) === selectedCategory
      );
    }

    if (selectedBrand) {
      filtered = filtered.filter((product) => product.vendorName === selectedBrand);
    }

    const isPriceFilterActive =
      priceRange.min > DEFAULT_PRICE_RANGE.min || priceRange.max < DEFAULT_PRICE_RANGE.max;

    if (isPriceFilterActive) {
      filtered = filtered.filter((product) => {
        const price = resolveProductPrice(product);
        if (price === null) {
          return false;
        }
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    const sorted = [...filtered];

    if (currentSortBy === 'price') {
      sorted.sort((a, b) => {
        const priceA = resolveProductPrice(a);
        const priceB = resolveProductPrice(b);
        const normalizedA =
          priceA ?? (currentSortOrder === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
        const normalizedB =
          priceB ?? (currentSortOrder === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
        return currentSortOrder === 'asc' ? normalizedA - normalizedB : normalizedB - normalizedA;
      });
    } else if (currentSortBy === 'name') {
      sorted.sort((a, b) => {
        const nameA = (a.description || a.vendorPartNumber || a.ingramPartNumber || '').toLowerCase();
        const nameB = (b.description || b.vendorPartNumber || b.ingramPartNumber || '').toLowerCase();
        return currentSortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    }

    return sorted;
  };

  const filteredProducts = getFilteredProducts();
  const pageSize = filters.pageSize || DEFAULT_PAGE_SIZE;
  const displayedCount = filteredProducts.length;
  const pageStart = displayedCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const pageEnd = displayedCount > 0 ? pageStart + displayedCount - 1 : 0;


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
                    const value = e.target.value;
                    setSelectedCategory(value);
                    setFilters(prev => {
                      const nextCategory = value || undefined;
                      if (prev.category === nextCategory && (prev.pageNumber ?? 1) === 1) {
                        return prev;
                      }
                      return { ...prev, category: nextCategory, pageNumber: 1 };
                    });
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
                    const value = e.target.value;
                    setSelectedBrand(value);
                    setFilters(prev => {
                      const nextBrand = value || undefined;
                      if (prev.brand === nextBrand && (prev.pageNumber ?? 1) === 1) {
                        return prev;
                      }
                      return { ...prev, brand: nextBrand, pageNumber: 1 };
                    });
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
                    {currentSortBy} ({currentSortOrder})
                  </span>
                </label>
                <div className="space-y-4">
                    <select
                    value={currentSortBy}
                    onChange={(e) => {
                      const newSort = e.target.value as 'name' | 'price' | 'popularity';
                      setFilters(prev => {
                        if (prev.sortBy === newSort && (prev.pageNumber ?? 1) === 1) {
                          return prev;
                        }
                        return { ...prev, sortBy: newSort, pageNumber: 1 };
                      });
                    }}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30 focus:border-[#062fa3]/50 transition-all duration-200 hover:bg-white/90"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="popularity">Popularity</option>
                  </select>
                  <div className="flex gap-2">
                    <Button
                      variant={currentSortOrder === 'asc' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setFilters(prev => {
                          if (prev.sortOrder === 'asc') {
                            return prev;
                          }
                          return { ...prev, sortOrder: 'asc', pageNumber: 1 };
                        });
                      }}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        currentSortOrder === 'asc' 
                          ? 'bg-[#062fa3] text-white shadow-lg' 
                          : 'bg-white/80 text-gray-700 border border-white/30 hover:bg-white/90'
                      }`}
                    >
                      <SortAsc className="w-4 h-4 mr-2" />
                      Ascending
                    </Button>
                    <Button
                      variant={currentSortOrder === 'desc' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setFilters(prev => {
                          if (prev.sortOrder === 'desc') {
                            return prev;
                          }
                          return { ...prev, sortOrder: 'desc', pageNumber: 1 };
                        });
                      }}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        currentSortOrder === 'desc' 
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
              {(products.length > 0 || totalRecords > 0) && (
                <div className="border-t border-white/20 pt-6">
                  <div className="text-sm text-gray-600 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Products found:</span>
                      <span className="font-bold text-gray-900">
                        {filteredProducts.length}
                        {totalRecords > 0 && (
                          <span className="text-[#062fa3]"> / {totalRecords}</span>
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
                        const value = e.target.value;
                        setSelectedCategory(value);
                        setFilters(prev => {
                          const nextCategory = value || undefined;
                          if (prev.category === nextCategory && (prev.pageNumber ?? 1) === 1) {
                            return prev;
                          }
                          return { ...prev, category: nextCategory, pageNumber: 1 };
                        });
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
                        const value = e.target.value;
                        setSelectedBrand(value);
                        setFilters(prev => {
                          const nextBrand = value || undefined;
                          if (prev.brand === nextBrand && (prev.pageNumber ?? 1) === 1) {
                            return prev;
                          }
                          return { ...prev, brand: nextBrand, pageNumber: 1 };
                        });
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
                      {filteredProducts.map((product) => (
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
                    {filteredProducts.map((product) => (
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
                {totalRecords > 0 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {displayedCount > 0
                          ? `Showing ${pageStart}-${pageEnd} of ${totalRecords || pageEnd}`
                          : 'No products to display'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Items per page:{' '}
                          <span className="font-semibold text-gray-900">{pageSize}</span>
                        </span>
                        <select
                          value={filters.pageSize || DEFAULT_PAGE_SIZE}
                          onChange={(e) => {
                            const newPageSize = parseInt(e.target.value, 10);
                            setFilters(prev => {
                              if (prev.pageSize === newPageSize && (prev.pageNumber ?? 1) === 1) {
                                return prev;
                              }
                              return { ...prev, pageSize: newPageSize, pageNumber: 1 };
                            });
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
                        disabled={currentPage >= totalPages}
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
            {!loading && !error && filteredProducts.length === 0 && (searchQuery || priceRange.min > 0 || priceRange.max < 10000) && (
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
