'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RotateCcw, Eye, Receipt, CalendarDays, Building2, PackageSearch } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type {
  InvoiceDetails,
  InvoiceLine,
  InvoiceSearchRequest,
  InvoiceSearchResponse,
  InvoiceSummary,
} from '@/lib/types';

const DEFAULT_PAGE_SIZE = 25;

const buildQueryString = (params: InvoiceSearchRequest) => {
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

const parseNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return fallback;
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

const statusVariant = (status?: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  const normalized = status?.toLowerCase() ?? '';
  if (['open', 'pending'].includes(normalized)) return 'warning';
  if (['paid', 'completed', 'closed'].includes(normalized)) return 'success';
  if (['overdue', 'past due'].includes(normalized)) return 'error';
  return 'default';
};

const InvoiceManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useState<InvoiceSearchRequest>({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const pageSize = searchParams.pageSize ?? DEFAULT_PAGE_SIZE;
  const currentPage = searchParams.pageNumber ?? 1;
  const totalPages = useMemo(() => {
    if (!pageSize) return 1;
    return Math.max(1, Math.ceil(totalRecords / pageSize));
  }, [pageSize, totalRecords]);

  const loadInvoices = useCallback(
    async (params: InvoiceSearchRequest) => {
      setLoading(true);
      setError(null);

      try {
        const query = buildQueryString(params);
        const response = await fetch(`/api/ingram/invoices/search?${query}`);

        if (!response.ok) {
          throw new Error(`Invoice search failed with status ${response.status}`);
        }

        const data: InvoiceSearchResponse = await response.json();
        setInvoices(data.invoices ?? []);
        setTotalRecords(parseNumber(data.recordsFound, 0));
      } catch (err) {
        console.error('Error loading invoices:', err);
        setInvoices([]);
        setTotalRecords(0);
        setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadInvoices({ pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE });
  }, [loadInvoices]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = { ...searchParams, pageNumber: 1 };
    setSearchParams(next);
    await loadInvoices(next);
  };

  const handleReset = async () => {
    const resetParams: InvoiceSearchRequest = { pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE };
    setSearchParams(resetParams);
    setSelectedInvoice(null);
    await loadInvoices(resetParams);
  };

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages) return;
    const next = { ...searchParams, pageNumber: page };
    setSearchParams(next);
    await loadInvoices(next);
  };

  const handlePageSizeChange = async (size: number) => {
    const sanitized = size > 0 ? size : DEFAULT_PAGE_SIZE;
    const next: InvoiceSearchRequest = {
      ...searchParams,
      pageSize: sanitized,
      pageNumber: 1,
    };
    setSearchParams(next);
    await loadInvoices(next);
  };

  const handleSelectInvoice = useCallback(async (invoiceNumber: string) => {
    setDetailLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ingram/invoices/${encodeURIComponent(invoiceNumber)}`);
      if (!response.ok) {
        throw new Error(`Invoice details failed with status ${response.status}`);
      }

      const data: InvoiceDetails = await response.json();
      setSelectedInvoice(data);
    } catch (err) {
      console.error('Error loading invoice details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoice details');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const invoiceCurrency = selectedInvoice?.fxRateInfo?.invoiceCurrency ?? 'CAD';

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Invoice Management
            </h2>
            <p className="text-sm text-gray-500">
              Review customer invoices, balances, and payment information sourced from Ingram Micro Canada.
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              value={searchParams.invoiceNumber ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({ ...prev, invoiceNumber: event.target.value || undefined }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Invoice number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Order #</label>
            <input
              type="text"
              value={searchParams.customerOrderNumber ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  customerOrderNumber: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Customer reference"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Customer Order #</label>
            <input
              type="text"
              value={searchParams.endCustomerOrderNumber ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  endCustomerOrderNumber: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="End customer reference"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
            <input
              type="text"
              value={searchParams.orderNumber ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  orderNumber: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ERP order number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Status</label>
            <input
              type="text"
              value={searchParams.invoiceStatus ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  invoiceStatus: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Open, Paid, Overdue…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Bid #</label>
            <input
              type="text"
              value={searchParams.specialBidNumber ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  specialBidNumber: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Bid number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input
              type="date"
              value={searchParams.invoiceDate ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  invoiceDate: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Due Date</label>
            <input
              type="date"
              value={searchParams.invoiceDueDate ?? ''}
              onChange={(event) =>
                setSearchParams((prev) => ({
                  ...prev,
                  invoiceDueDate: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              Search Invoices
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
              <CalendarDays className="w-4 h-4 text-blue-600" />
              Invoices ({totalRecords} records)
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
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Due
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
                      Loading invoices…
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No invoices found for the selected criteria.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, index) => (
                  <tr
                    key={invoice.invoiceNumber ?? `${invoice.erpOrderNumber ?? 'invoice'}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={statusVariant(invoice.invoiceStatus)}>
                        {invoice.invoiceStatus ?? 'Unknown'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.invoiceDate ? formatDate(invoice.invoiceDate) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.invoiceDueDate ? formatDate(invoice.invoiceDueDate) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {currencyValue(invoice.invoicedAmountDue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSelectInvoice(invoice.invoiceNumber ?? '')}
                        disabled={!invoice.invoiceNumber}
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

      {selectedInvoice && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-blue-600" />
                Invoice {selectedInvoice.invoiceNumber}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                <span>Status:</span>
                <Badge variant={statusVariant(selectedInvoice.invoiceStatus)}>{selectedInvoice.invoiceStatus ?? 'Unknown'}</Badge>
                <span>|</span>
                <span>Order #: {selectedInvoice.orderNumber ?? '—'}</span>
                <span>|</span>
                <span>Invoice Date: {selectedInvoice.invoiceDate ? formatDate(selectedInvoice.invoiceDate) : '—'}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(null)}>
              Close
            </Button>
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Bill To
                  </h4>
                  <AddressBlock lines={selectedInvoice.billToInfo} />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Ship To
                  </h4>
                  <AddressBlock lines={selectedInvoice.shipToInfo} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-xs text-blue-600 uppercase font-semibold">Amount Due</p>
                  <p className="text-lg font-semibold text-blue-900 mt-1">
                    {currencyValue(selectedInvoice.summary?.totals?.invoicedAmountDue, invoiceCurrency)}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Subtotal</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {currencyValue(selectedInvoice.summary?.totals?.netInvoiceAmount, invoiceCurrency)}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Tax</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {currencyValue(selectedInvoice.summary?.totals?.totalTaxAmount, invoiceCurrency)}
                  </p>
                </div>
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
                        Extended Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedInvoice.lines?.length ? (
                      selectedInvoice.lines.map((line: InvoiceLine) => (
                        <tr key={`${line.ingramLineNumber}-${line.ingramPartNumber}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {line.ingramLineNumber ?? '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span>{line.ingramPartNumber ?? '—'}</span>
                              <span className="text-xs text-gray-500">{line.vendorPartNumber ?? ''}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                            {line.productDescription ?? '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {line.quantity ?? '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {currencyValue(line.unitPrice, line.currencyCode ?? invoiceCurrency)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {currencyValue(line.extendedPrice, line.currencyCode ?? invoiceCurrency)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                          No invoice line information available.
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

interface AddressBlockProps {
  lines?: {
    contact?: string;
    companyName?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
    phoneNumber?: string;
    email?: string;
  };
}

const AddressBlock: React.FC<AddressBlockProps> = ({ lines }) => {
  if (!lines) {
    return <p className="text-sm text-gray-500">Address information not provided.</p>;
  }

  const addressSegments = [
    lines.addressLine1,
    lines.addressLine2,
    lines.addressLine3,
    [lines.city, lines.state, lines.postalCode].filter(Boolean).join(', '),
    lines.countryCode,
  ].filter(Boolean);

  return (
    <div className="space-y-1 text-sm text-gray-600">
      {lines.companyName && <p className="font-medium text-gray-800">{lines.companyName}</p>}
      {lines.contact && <p>{lines.contact}</p>}
      {addressSegments.map((segment) => (
        <p key={segment}>{segment}</p>
      ))}
      {lines.phoneNumber && <p>Phone: {lines.phoneNumber}</p>}
      {lines.email && <p>Email: {lines.email}</p>}
    </div>
  );
};

export default InvoiceManagement;
