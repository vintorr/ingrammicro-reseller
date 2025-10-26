'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Package,
  Factory,
  Tag,
  Layers,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useProducts } from '@/lib/hooks/useProducts';
import type { Product, ProductSearchRequest } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';

const DEFAULT_PAGE_SIZE = 25;

type StatusFilter = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'ALL';

const STATUS_LABEL: Record<StatusFilter, string> = {
  ACTIVE: 'Active only',
  INACTIVE: 'Inactive only',
  DISCONTINUED: 'Discontinued only',
  ALL: 'All statuses',
};

const getStatusBadgeVariant = (status?: string | null) => {
  if (!status) return 'default';
  const normalized = status.toUpperCase();
  if (normalized === 'A' || normalized === 'ACTIVE') return 'success';
  if (normalized === 'D' || normalized === 'DISCONTINUED') return 'warning';
  if (normalized === 'I' || normalized === 'INACTIVE') return 'error';
  return 'info';
};

const mapStatusLabel = (status?: string | null) => {
  if (!status) return 'Unknown';
  switch (status.toUpperCase()) {
    case 'A':
    case 'ACTIVE':
      return 'Active';
    case 'I':
    case 'INACTIVE':
      return 'Inactive';
    case 'D':
    case 'DISCONTINUED':
      return 'Discontinued';
    default:
      return status;
  }
};

const defaultFormState = {
  keyword: '',
  category: '',
  brand: '',
  status: 'ACTIVE' as StatusFilter,
};

const ProductManagement = () => {
  const {
    products,
    loading,
    error,
    totalPages,
    currentPage,
    totalRecords,
    searchProducts,
  } = useProducts();
  const [searchParams, setSearchParams] = useState<ProductSearchRequest>({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    productStatuses: 'ACTIVE',
  });
  const [formState, setFormState] = useState(defaultFormState);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    searchProducts(searchParams);
  }, [searchProducts, searchParams]);

  useEffect(() => {
    if (products.length === 0) {
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct((previous) => {
      if (!previous) {
        return products[0];
      }
      const updated = products.find(
        (product) => product.ingramPartNumber === previous.ingramPartNumber,
      );
      return updated ?? products[0];
    });
  }, [products]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedKeyword = formState.keyword.trim();
    const trimmedCategory = formState.category.trim();
    const trimmedBrand = formState.brand.trim();

    setSearchParams({
      pageNumber: 1,
      pageSize: searchParams.pageSize ?? DEFAULT_PAGE_SIZE,
      productStatuses:
        formState.status === 'ALL' ? undefined : formState.status,
      keyword: trimmedKeyword ? trimmedKeyword : undefined,
      category: trimmedCategory ? trimmedCategory : undefined,
      brand: trimmedBrand ? trimmedBrand : undefined,
    });
  };

  const handleReset = () => {
    setFormState(defaultFormState);
    setSearchParams({
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      productStatuses: 'ACTIVE',
    });
  };

  const handlePageChange = (direction: 'previous' | 'next') => {
    const safeCurrentPage = currentPage || 1;
    const safeTotalPages = totalPages || 1;
    const nextPage =
      direction === 'previous'
        ? Math.max(1, safeCurrentPage - 1)
        : Math.min(safeTotalPages, safeCurrentPage + 1);

    if (nextPage === safeCurrentPage) {
      return;
    }

    setSearchParams((prev) => ({
      ...prev,
      pageNumber: nextPage,
    }));
  };

  const refreshResults = () => {
    searchProducts(searchParams);
  };

  const pageSize = searchParams.pageSize ?? DEFAULT_PAGE_SIZE;
  const resolvedCurrentPage = currentPage || searchParams.pageNumber || 1;
  const resolvedTotalPages = totalPages || 1;
  const resolvedTotalRecords = totalRecords || products.length;
  const pageStart = resolvedTotalRecords
    ? (resolvedCurrentPage - 1) * pageSize + 1
    : 0;
  const pageEnd = resolvedTotalRecords
    ? Math.min(resolvedCurrentPage * pageSize, resolvedTotalRecords)
    : 0;
  const formattedTotalRecords = resolvedTotalRecords.toLocaleString();
  const appliedStatus =
    searchParams.productStatuses ?? (formState.status === 'ALL' ? undefined : formState.status);

  const activeFilters = useMemo(() => {
    const filters: Array<{ label: string; value: string }> = [];
    if (searchParams.keyword) {
      filters.push({ label: 'Keyword', value: searchParams.keyword });
    }
    if (searchParams.category) {
      filters.push({ label: 'Category', value: searchParams.category });
    }
    if (searchParams.brand) {
      filters.push({ label: 'Brand', value: searchParams.brand });
    }
    if (searchParams.productStatuses) {
      filters.push({
        label: 'Status',
        value: mapStatusLabel(searchParams.productStatuses),
      });
    }
    return filters;
  }, [searchParams]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <Package className="h-4 w-4" />
              Admin Product Catalog
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
              Product Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">
              Search, review, and audit products from the Ingram Micro catalog
              without leaving the admin workspace. Filters update the live data
              set so you can drill into specific brands or categories quickly.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <Badge variant="info">
              {formattedTotalRecords} product
              {resolvedTotalRecords === 1 ? '' : 's'} found
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshResults}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh results
            </Button>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keyword
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formState.keyword}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    keyword: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Name, part number, UPC..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <div className="relative">
              <Factory className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formState.brand}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    brand: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: Dell, Lenovo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="relative">
              <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formState.category}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Category name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product status
            </label>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    status: event.target.value as StatusFilter,
                  }))
                }
                className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {(Object.keys(STATUS_LABEL) as StatusFilter[]).map((option) => (
                  <option key={option} value={option}>
                    {STATUS_LABEL[option]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={loading}
            >
              Clear filters
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              <Filter className="mr-2 h-4 w-4" />
              Apply filters
            </Button>
          </div>
        </form>

        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-600">
            {activeFilters.map((filter) => (
              <Badge key={`${filter.label}-${filter.value}`} variant="default">
                <span className="font-medium text-gray-700 mr-1">
                  {filter.label}:
                </span>
                {filter.value}
              </Badge>
            ))}
            {!searchParams.productStatuses && (
              <Badge variant="default">
                <span className="font-medium text-gray-700 mr-1">Status:</span>
                {STATUS_LABEL.ALL}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Showing {pageStart}-{pageEnd} of {formattedTotalRecords} records
              </p>
              <p className="text-xs text-gray-500">
                Page {resolvedCurrentPage} of {resolvedTotalPages}
              </p>
            </div>
            {appliedStatus && (
              <Badge variant={getStatusBadgeVariant(appliedStatus)}>
                {mapStatusLabel(appliedStatus)} products
              </Badge>
            )}
          </div>

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                <LoadingSpinner />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ingram Part #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.length === 0 && !loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-sm text-gray-500"
                      >
                        No products matched your filters. Adjust the criteria and
                        try again.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const isActiveRow =
                        selectedProduct?.ingramPartNumber ===
                        product.ingramPartNumber;
                      return (
                        <tr
                          key={product.ingramPartNumber}
                          onClick={() => handleSelectProduct(product)}
                          className={`cursor-pointer transition ${
                            isActiveRow ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                            {product.ingramPartNumber}
                          </td>
                          <td className="max-w-md px-4 py-3 text-sm text-gray-700">
                            {product.description || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                            {product.vendorName || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                            {product.productCategory || product.category || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <Badge
                              variant={getStatusBadgeVariant(
                                product.productStatusCode,
                              )}
                            >
                              {mapStatusLabel(product.productStatusCode)}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Rows per page: {pageSize} · {products.length} visible
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange('previous')}
                disabled={resolvedCurrentPage <= 1 || loading}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {resolvedCurrentPage} of {resolvedTotalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange('next')}
                disabled={
                  resolvedCurrentPage >= resolvedTotalPages ||
                  loading ||
                  resolvedTotalRecords === 0
                }
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Product snapshot
              </h3>
              <p className="text-sm text-gray-500">
                Click a row to inspect details and metadata.
              </p>
            </div>
            {selectedProduct?.productStatusCode && (
              <Badge
                variant={getStatusBadgeVariant(
                  selectedProduct.productStatusCode,
                )}
              >
                {mapStatusLabel(selectedProduct.productStatusCode)}
              </Badge>
            )}
          </div>

          {selectedProduct ? (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">
                  {selectedProduct.description || 'No description'}
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Ingram #{selectedProduct.ingramPartNumber} · Vendor #
                  {selectedProduct.vendorPartNumber || '—'}
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-4 text-sm text-gray-700">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Brand
                  </dt>
                  <dd>{selectedProduct.vendorName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Category
                  </dt>
                  <dd>
                    {selectedProduct.productCategory ||
                      selectedProduct.category ||
                      '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Subcategory
                  </dt>
                  <dd>
                    {selectedProduct.productSubcategory ||
                      selectedProduct.subCategory ||
                      '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    UPC
                  </dt>
                  <dd>{selectedProduct.upc || selectedProduct.upcCode || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Vendor number
                  </dt>
                  <dd>{selectedProduct.vendorNumber || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Product class
                  </dt>
                  <dd>{selectedProduct.productClass || selectedProduct.productType || '—'}</dd>
                </div>
                {selectedProduct.lastUpdated && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">
                      Last updated
                    </dt>
                    <dd>{formatDate(selectedProduct.lastUpdated)}</dd>
                  </div>
                )}
              </dl>

              {selectedProduct.links && selectedProduct.links.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-gray-500">
                    Related links
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm text-blue-600">
                    {selectedProduct.links.map((link) => (
                      <li key={`${link.topic}-${link.href}`}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {link.topic || link.type || link.href}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-gray-500">
              Select a product to see its profile.
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load products: {error.message}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
