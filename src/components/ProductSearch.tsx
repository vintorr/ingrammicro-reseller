"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Star,
  Heart,
  Eye,
  ShoppingCart,
  ChevronDown,
  X,
} from "lucide-react";
import { useProducts } from "@/lib/hooks/useProducts";
import { useCart } from "@/lib/hooks/useCart";
import { ProductCard } from "./product/ProductCard";
import { ProductListRow } from "./product/ProductListRow";
import { ProductDetailsModal } from "./product/ProductDetailsModal";
import { Button } from "./ui/Button";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { formatCurrency } from "@/lib/utils/formatters";
import type {
  Product,
  ProductSearchRequest,
  PriceAvailabilityResponse,
} from "@/lib/types";

const DEFAULT_PRICE_RANGE = { min: 0, max: 10000 };
const DEFAULT_PAGE_SIZE = 10;

type ActiveFilter = {
  key: "search" | "category" | "brand" | "price";
  label: string;
  value: string;
};

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<ProductSearchRequest>({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy: "name",
    sortOrder: "asc",
    productStatuses: "ACTIVE",
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [priceAvailabilityData, setPriceAvailabilityData] =
    useState<PriceAvailabilityResponse | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // New UI state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(
    () => ({
      ...DEFAULT_PRICE_RANGE,
    }),
  );
  const [compareList, setCompareList] = useState<Set<string>>(new Set());

  const {
    products,
    loading,
    error,
    totalPages,
    currentPage,
    totalRecords,
    searchProducts,
  } = useProducts();
  const { addToCart } = useCart();
  const currentSortBy = filters.sortBy ?? "name";
  const currentSortOrder = filters.sortOrder ?? "asc";

  // Batch fetch price and availability for all products
  const fetchBatchPriceAndAvailability = async (products: Product[]) => {
    if (products.length === 0) return;

    setPriceLoading(true);
    try {
      const response = await fetch("/api/ingram/price-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: products.map((product) => ({
            ingramPartNumber: product.ingramPartNumber,
          })),
        }),
      });

      if (!response.ok) {
        console.error(
          "Batch price availability API error:",
          response.status,
          response.statusText,
        );
        setPriceAvailabilityData([] as PriceAvailabilityResponse);
        return;
      }

      const data = await response.json();
      const productsData = (
        Array.isArray(data) ? data : data.products || []
      ) as PriceAvailabilityResponse;

      const validProducts = productsData.filter((product) => {
        if (product.productStatusCode === "E" || product.errorCode) {
          console.warn(
            `Product ${product.ingramPartNumber} has error:`,
            product.productStatusMessage || "Unknown error",
          );
          return false;
        }
        return true;
      }) as PriceAvailabilityResponse;

      setPriceAvailabilityData(validProducts);
    } catch (err) {
      console.error("Error fetching batch price and availability:", err);
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
    setFilters((prev) => {
      const currentPage = prev.pageNumber ?? 1;
      if (currentPage === 1) {
        return prev;
      }
      return { ...prev, pageNumber: 1 };
    });
    setDebouncedSearchQuery(searchQuery);
  };

  const handleAddToCart = (product: Product) => {
    const productPriceAvailability = getProductPriceAvailability(
      product.ingramPartNumber,
    );

    if (
      productPriceAvailability?.pricing &&
      productPriceAvailability?.availability?.available
    ) {
      const cartItem = {
        product,
        quantity: 1,
        unitPrice: productPriceAvailability.pricing.customerPrice,
        totalPrice: productPriceAvailability.pricing.customerPrice,
      };
      addToCart(cartItem);
    } else {
      alert("Product not available or price not loaded. Please try again.");
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
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  // Helper functions
  const getProductPriceAvailability = (ingramPartNumber: string) => {
    if (!priceAvailabilityData) return null;
    return priceAvailabilityData.find(
      (item: any) => item.ingramPartNumber === ingramPartNumber,
    );
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
    setCompareList((prev) => {
      const newCompare = new Set(prev);
      if (newCompare.has(productId)) {
        newCompare.delete(productId);
      } else if (newCompare.size < 4) {
        newCompare.add(productId);
      }
      return newCompare;
    });
  };

  const handleRemoveFilter = (
    filterKey: "search" | "category" | "brand" | "price",
  ) => {
    switch (filterKey) {
      case "search": {
        setSearchQuery("");
        setDebouncedSearchQuery("");
        setFilters((prev) => ({
          ...prev,
          keyword: undefined,
          pageNumber: 1,
        }));
        break;
      }
      case "category": {
        setSelectedCategory("");
        setFilters((prev) => ({
          ...prev,
          category: undefined,
          pageNumber: 1,
        }));
        break;
      }
      case "brand": {
        setSelectedBrand("");
        setFilters((prev) => ({
          ...prev,
          brand: undefined,
          pageNumber: 1,
        }));
        break;
      }
      case "price": {
        setPriceRange({ ...DEFAULT_PRICE_RANGE });
        break;
      }
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange({ ...DEFAULT_PRICE_RANGE });
    setFilters((prev) => ({
      ...prev,
      category: undefined,
      brand: undefined,
      sortBy: "name",
      sortOrder: "asc",
      pageNumber: 1,
      keyword: undefined,
    }));
  };

  const uniqueCategories = useMemo(() => {
    const categories = products
      .map((p) => p.productCategory || p.category)
      .filter(Boolean);
    return [...new Set(categories)].sort();
  }, [products]);

  const uniqueBrands = useMemo(() => {
    const brands = products.map((p) => p.vendorName).filter(Boolean);
    return [...new Set(brands)].sort();
  }, [products]);

  // Filter products (client-side filtering)
  const getFilteredProducts = () => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          (product.productCategory || product.category) === selectedCategory,
      );
    }

    if (selectedBrand) {
      filtered = filtered.filter(
        (product) => product.vendorName === selectedBrand,
      );
    }

    const isPriceFilterActive =
      priceRange.min > DEFAULT_PRICE_RANGE.min ||
      priceRange.max < DEFAULT_PRICE_RANGE.max;

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

    if (currentSortBy === "price") {
      sorted.sort((a, b) => {
        const priceA = resolveProductPrice(a);
        const priceB = resolveProductPrice(b);
        const normalizedA =
          priceA ??
          (currentSortOrder === "asc"
            ? Number.POSITIVE_INFINITY
            : Number.NEGATIVE_INFINITY);
        const normalizedB =
          priceB ??
          (currentSortOrder === "asc"
            ? Number.POSITIVE_INFINITY
            : Number.NEGATIVE_INFINITY);
        return currentSortOrder === "asc"
          ? normalizedA - normalizedB
          : normalizedB - normalizedA;
      });
    } else if (currentSortBy === "name") {
      sorted.sort((a, b) => {
        const nameA = (
          a.description ||
          a.vendorPartNumber ||
          a.ingramPartNumber ||
          ""
        ).toLowerCase();
        const nameB = (
          b.description ||
          b.vendorPartNumber ||
          b.ingramPartNumber ||
          ""
        ).toLowerCase();
        return currentSortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    }

    return sorted;
  };

  const filteredProducts = getFilteredProducts();
  const hasCustomPriceRange =
    priceRange.min > DEFAULT_PRICE_RANGE.min ||
    priceRange.max < DEFAULT_PRICE_RANGE.max;
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const entries: ActiveFilter[] = [];
    if (searchQuery.trim()) {
      entries.push({
        key: "search",
        label: "Search",
        value: searchQuery.trim(),
      });
    }
    if (selectedCategory) {
      entries.push({
        key: "category",
        label: "Category",
        value: selectedCategory,
      });
    }
    if (selectedBrand) {
      entries.push({
        key: "brand",
        label: "Brand",
        value: selectedBrand,
      });
    }
    if (hasCustomPriceRange) {
      entries.push({
        key: "price",
        label: "Price",
        value: `$${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}`,
      });
    }
    return entries;
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    hasCustomPriceRange,
    priceRange.min,
    priceRange.max,
  ]);
  const totalProductCount =
    totalRecords || filteredProducts.length || products.length;
  const formattedTotalProductCount = totalProductCount
    ? totalProductCount.toLocaleString()
    : "—";
  const pageSize = filters.pageSize || DEFAULT_PAGE_SIZE;
  const displayedCount = filteredProducts.length;
  const pageStart = displayedCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const pageEnd = displayedCount > 0 ? pageStart + displayedCount - 1 : 0;
  const resultsHeadline =
    displayedCount > 0
      ? `Showing ${pageStart}-${pageEnd} of ${formattedTotalProductCount} products`
      : "No products match your filters yet";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mt-8 relative z-10 mx-auto w-full max-w-screen-xl px-4 pb-24 md:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Search Products
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, SKU, or vendor part number"
                    className="min-h-[3rem] w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-gray-900 shadow-sm transition duration-200 focus:border-[#062fa3] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30"
                    style={{ height: "auto", minHeight: "3rem" }}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.height = "auto";
                      target.style.height =
                        Math.max(3 * 16, target.scrollHeight) + "px";
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCategory(value);
                    setFilters((prev) => {
                      const nextCategory = value || undefined;
                      if (
                        prev.category === nextCategory &&
                        (prev.pageNumber ?? 1) === 1
                      ) {
                        return prev;
                      }
                      return { ...prev, category: nextCategory, pageNumber: 1 };
                    });
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition duration-200 focus:border-[#062fa3] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30"
                >
                  <option value="">All Categories</option>
                  {products.length > 0 ? (
                    uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedBrand(value);
                    setFilters((prev) => {
                      const nextBrand = value || undefined;
                      if (
                        prev.brand === nextBrand &&
                        (prev.pageNumber ?? 1) === 1
                      ) {
                        return prev;
                      }
                      return { ...prev, brand: nextBrand, pageNumber: 1 };
                    });
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition duration-200 focus:border-[#062fa3] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30"
                >
                  <option value="">All Brands</option>
                  {products.length > 0 ? (
                    uniqueBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading brands...
                    </option>
                  )}
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-12 rounded-xl border border-transparent bg-[#062fa3]/10 px-4 py-2 text-sm font-medium text-[#062fa3] transition hover:bg-[#062fa3]/15 hover:text-[#062fa3]"
                >
                  Clear All
                </Button>
              </div>
            </div>
            {activeFilters.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {activeFilters.map((filter) => (
                  <button
                    key={`${filter.key}-${filter.value}`}
                    type="button"
                    onClick={() => handleRemoveFilter(filter.key)}
                    className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 transition hover:border-[#062fa3] hover:bg-[#062fa3]/10 hover:text-[#062fa3]"
                  >
                    <span className="font-medium text-gray-900 group-hover:text-[#062fa3]">
                      {filter.label}
                    </span>
                    <span>{filter.value}</span>
                    <X className="h-4 w-4 text-gray-400 transition group-hover:text-[#062fa3]" />
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-[#062fa3]/50 hover:bg-[#062fa3]/10 hover:text-[#062fa3]"
                >
                  Clear all
                </Button>
              </div>
            )}
          </section>

          <div className="space-y-8">
            {products.length > 0 && (
              <div className="space-y-8">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.ingramPartNumber}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                        priceAvailabilityData={priceAvailabilityData}
                        priceLoading={priceLoading}
                        isInCompare={compareList.has(product.ingramPartNumber)}
                        onToggleCompare={() =>
                          toggleCompare(product.ingramPartNumber)
                        }
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

                {totalRecords > 0 && (
                  <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {displayedCount > 0
                          ? `Showing ${pageStart}-${pageEnd} of ${totalRecords || pageEnd}`
                          : "No products to display"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Items per page:{" "}
                          <span className="font-semibold text-gray-900">
                            {pageSize}
                          </span>
                        </span>
                        <select
                          value={filters.pageSize || DEFAULT_PAGE_SIZE}
                          onChange={(e) => {
                            const newPageSize = parseInt(e.target.value, 10);
                            setFilters((prev) => {
                              if (
                                prev.pageSize === newPageSize &&
                                (prev.pageNumber ?? 1) === 1
                              ) {
                                return prev;
                              }
                              return {
                                ...prev,
                                pageSize: newPageSize,
                                pageNumber: 1,
                              };
                            });
                          }}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-900 focus:border-[#062fa3] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062fa3]/30"
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
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:border-[#062fa3]/60 hover:bg-[#062fa3]/10 hover:text-[#062fa3] disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        Previous
                      </Button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "primary" : "ghost"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={
                                currentPage === page
                                  ? "rounded-xl bg-[#062fa3] px-4 py-2 text-sm font-semibold text-white shadow-lg"
                                  : "rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:border-[#062fa3]/60 hover:bg-[#062fa3]/10 hover:text-[#062fa3]"
                              }
                            >
                              {page}
                            </Button>
                          );
                        },
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:border-[#062fa3]/60 hover:bg-[#062fa3]/10 hover:text-[#062fa3] disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <LoadingSpinner size="lg" />
                  <span className="text-lg text-gray-600">
                    Searching products...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-200/70 text-rose-700">
                  !
                </div>
                <h3 className="text-xl font-semibold text-rose-700">
                  Error Loading Products
                </h3>
                <p className="mt-2 text-sm text-rose-600">{error?.message}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700"
                >
                  Try Again
                </Button>
              </div>
            )}

            {!loading &&
              !error &&
              filteredProducts.length === 0 &&
              (searchQuery || priceRange.min > 0 || priceRange.max < 10000) && (
                <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                  <p className="text-lg text-gray-600">
                    No products found matching your search criteria.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-4 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-[#062fa3]/60 hover:bg-[#062fa3]/10 hover:text-[#062fa3]"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

            {!loading && !error && products.length === 0 && !searchQuery && (
              <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                <p className="mb-4 text-lg text-gray-600">
                  Loading products...
                </p>
                <LoadingSpinner size="lg" />
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
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default ProductSearch;
