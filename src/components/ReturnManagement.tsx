'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RotateCcw, Eye, Package, ClipboardList, Truck, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { ReturnDetails, ReturnSearchRequest, ReturnSearchResponse, ReturnSummary } from '@/lib/types';

const DEFAULT_PAGE_SIZE = 25;

const buildQueryString = (params: ReturnSearchRequest) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, String(entry)));
    } else {
      query.append(key, String(value));
    }
  });

  return query.toString();
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return fallback;
};

const statusVariant = (status?: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  const normalized = status?.toLowerCase() ?? '';
  if (['open', 'pending'].includes(normalized)) return 'info';
  if (['approved', 'credit issued', 'completed'].includes(normalized)) return 'success';
  if (['partially approved'].includes(normalized)) return 'warning';
  if (['denied', 'voided', 'cancelled'].includes(normalized)) return 'error';
  return 'default';
};

const currencyValue = (value?: number | string, currency = 'CAD') => {
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return '—';
  }
  return formatCurrency(numeric, currency);
};

const ReturnManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useState<ReturnSearchRequest>({
    page: 1,
    size: DEFAULT_PAGE_SIZE,
  });
  const [returnsList, setReturnsList] = useState<ReturnSummary[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<ReturnDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const pageSize = searchParams.size ?? DEFAULT_PAGE_SIZE;
  const currentPage = searchParams.page ?? 1;
  const totalPages = useMemo(() => {
    if (!pageSize) return 1;
    return Math.max(1, Math.ceil(totalRecords / pageSize));
  }, [pageSize, totalRecords]);

  const loadReturns = useCallback(
    async (params: ReturnSearchRequest) => {
      setLoading(true);
      setError(null);

      try {
        const query = buildQueryString(params);
        const response = await fetch(`/api/ingram/returns/search?${query}`);

        if (!response.ok) {
          throw new Error(`Returns search failed with status ${response.status}`);
        }

        const data: ReturnSearchResponse = await response.json();
        setReturnsList(data.returnsClaims ?? []);
        setTotalRecords(toNumber(data.recordsFound, 0));
      } catch (err) {
        console.error('Error loading returns:', err);
        setReturnsList([]);
        setTotalRecords(0);
        setError(err instanceof Error ? err.message : 'Failed to fetch returns');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadReturns({ page: 1, size: DEFAULT_PAGE_SIZE });
  }, [loadReturns]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = { ...searchParams, page: 1 };
    setSearchParams(next);
    await loadReturns(next);
  };

  const handleReset = async () => {
    const resetParams: ReturnSearchRequest = { page: 1, size: DEFAULT_PAGE_SIZE };
    setSearchParams(resetParams);
    setSelectedReturn(null);
    await loadReturns(resetParams);
  };

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages) return;
    const next = { ...searchParams, page };
    setSearchParams(next);
    await loadReturns(next);
  };

  const handlePageSizeChange = async (size: number) => {
    const sanitized = size > 0 ? size : DEFAULT_PAGE_SIZE;
    const next: ReturnSearchRequest = {
      ...searchParams,
      size: sanitized,
      page: 1,
    };
    setSearchParams(next);
    await loadReturns(next);
  };

  const handleSelectReturn = useCallback(
    async (caseRequestNumber: string) => {
      setDetailLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/ingram/returns/${encodeURIComponent(caseRequestNumber)}`);
        if (!response.ok) {
          throw new Error(`Return details failed with status ${response.status}`);
        }

        const data: ReturnDetails = await response.json();
        setSelectedReturn(data);
      } catch (err) {
        console.error('Error loading return details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load return details');
      } finally {
        setDetailLoading(false);
      }
    },
    [],
  );

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Return Management
            </h2>
            <p className="text-sm text-gray-500">
              Search and review return merchandise authorizations using the Ingram Micro Canada APIs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case Request Number</label>
            <input
              type="text"
              value={searchParams.caseRequestNumber ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  caseRequestNumber: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              value={searchParams.invoiceNumber ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  invoiceNumber: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 40-NFERG-11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Claim ID</label>
            <input
              type="text"
              value={searchParams.returnClaimId ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  returnClaimId: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Return claim identifier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Status</label>
            <input
              type="text"
              value={searchParams.returnStatusIn ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  returnStatusIn: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Comma separated (Open, Approved)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Reason</label>
            <input
              type="text"
              value={searchParams.returnReasonIn ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  returnReasonIn: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Comma separated reason codes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
            <input
              type="text"
              value={searchParams.referenceNumber ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  referenceNumber: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Customer reference"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
            <select
              value={pageSize}
              onChange={(event) => handlePageSizeChange(Number(event.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
            <Button type="submit" loading={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search Returns
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Returns ({totalRecords} records)
            </h3>
            <p className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={loading || currentPage <= 1}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={loading || currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Claim ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Loading returns…
                    </div>
                  </td>
                </tr>
              ) : returnsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No returns found for the selected criteria.
                  </td>
                </tr>
              ) : (
                returnsList.map((returnItem) => (
                  <tr key={`${returnItem.caseRequestNumber}-${returnItem.returnClaimId}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {returnItem.caseRequestNumber ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {returnItem.returnClaimId ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {returnItem.createdOn ? formatDate(returnItem.createdOn) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusVariant(returnItem.status)}>{returnItem.status ?? 'Unknown'}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {currencyValue(returnItem.estimatedTotalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSelectReturn(returnItem.caseRequestNumber ?? '')}
                        disabled={!returnItem.caseRequestNumber}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReturn && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Return Case {selectedReturn.caseRequestNumber}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                <span>Claim ID: {selectedReturn.rmaClaimId ?? '—'}</span>
                <span>|</span>
                <span>Created: {selectedReturn.createdOn ? formatDate(selectedReturn.createdOn) : '—'}</span>
                <span>|</span>
                <span>Status: <Badge variant={statusVariant(selectedReturn.status)}>{selectedReturn.status ?? 'Unknown'}</Badge></span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedReturn(null)}>
              Close
            </Button>
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-xs text-blue-600 uppercase font-semibold">Return Reason</p>
                  <p className="text-sm text-blue-900 mt-1">{selectedReturn.returnReason ?? '—'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Reference Number</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedReturn.referenceNumber ?? '—'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Estimated Total</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {currencyValue(selectedReturn.estimatedTotal)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Return Warehouse
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {selectedReturn.returnWarehouseAddress ?? 'Address information not provided.'}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Line #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedReturn.products?.length ? (
                      selectedReturn.products.map((product) => (
                        <tr key={`${product.ingramLineNumber}-${product.ingramPartNumber}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {product.ingramLineNumber ?? '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span>{product.ingramPartNumber ?? '—'}</span>
                              <span className="text-xs text-gray-500">{product.vendorPartNumber ?? ''}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                            {product.description ?? '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {product.quantity ?? '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {currencyValue(product.unitPrice)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Badge variant={statusVariant(product.status)}>{product.status ?? 'Unknown'}</Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                          No product line information available for this return.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReturnManagement;
