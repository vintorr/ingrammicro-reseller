'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShoppingCart, Receipt, Undo2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type {
  Order,
  OrderSearchResponse,
  ReturnSearchResponse,
  ReturnSummary,
  InvoiceSearchResponse,
  InvoiceSummary,
} from '@/lib/types';

interface DashboardState {
  orders: Order[];
  invoices: InvoiceSummary[];
  returns: ReturnSummary[];
  ordersCount: number;
  invoicesCount: number;
  returnsCount: number;
  outstandingBalance: number;
}

const INITIAL_STATE: DashboardState = {
  orders: [],
  invoices: [],
  returns: [],
  ordersCount: 0,
  invoicesCount: 0,
  returnsCount: 0,
  outstandingBalance: 0,
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const orderStatusVariant = (status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
  const normalized = status?.toLowerCase() ?? '';
  if (['processing', 'inprocess', 'submitted'].includes(normalized)) return 'info';
  if (['shipped', 'completed', 'delivered'].includes(normalized)) return 'success';
  if (['backorder', 'onhold', 'partially shipped'].includes(normalized)) return 'warning';
  if (['cancelled', 'void'].includes(normalized)) return 'error';
  return 'default';
};

const invoiceStatusVariant = (status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
  const normalized = status?.toLowerCase() ?? '';
  if (['open', 'pending'].includes(normalized)) return 'warning';
  if (['paid', 'closed', 'complete'].includes(normalized)) return 'success';
  if (['overdue', 'past due'].includes(normalized)) return 'error';
  return 'default';
};

const returnStatusVariant = (status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
  const normalized = status?.toLowerCase() ?? '';
  if (['open', 'pending'].includes(normalized)) return 'info';
  if (['approved', 'completed', 'credit issued'].includes(normalized)) return 'success';
  if (['partially approved'].includes(normalized)) return 'warning';
  if (['denied', 'voided'].includes(normalized)) return 'error';
  return 'default';
};

const StatCard = ({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-start space-x-4">
    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ordersResponse, invoicesResponse, returnsResponse] = await Promise.all([
        fetch('/api/ingram/orders/search?pageNumber=1&pageSize=5'),
        fetch('/api/ingram/invoices/search?pageNumber=1&pageSize=5'),
        fetch('/api/ingram/returns/search?page=1&size=5'),
      ]);

      if (!ordersResponse.ok) {
        throw new Error(`Orders request failed (${ordersResponse.status})`);
      }
      if (!invoicesResponse.ok) {
        throw new Error(`Invoices request failed (${invoicesResponse.status})`);
      }
      if (!returnsResponse.ok) {
        throw new Error(`Returns request failed (${returnsResponse.status})`);
      }

      const ordersData: OrderSearchResponse = await ordersResponse.json();
      const invoicesData: InvoiceSearchResponse = await invoicesResponse.json();
      const returnsData: ReturnSearchResponse = await returnsResponse.json();

      const orders = (ordersData.orders ?? []).slice(0, 5);
      const invoices = (invoicesData.invoices ?? []).slice(0, 5);
      const returns = (returnsData.returnsClaims ?? []).slice(0, 5);

      const outstandingBalance = invoices.reduce((total, invoice) => {
        return total + toNumber(invoice.invoicedAmountDue);
      }, 0);

      setState({
        orders,
        invoices,
        returns,
        ordersCount: toNumber(ordersData.recordsFound, orders.length),
        invoicesCount: toNumber(invoicesData.recordsFound, invoices.length),
        returnsCount: toNumber(returnsData.recordsFound, returns.length),
        outstandingBalance,
      });
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      setState(INITIAL_STATE);
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Operations Overview</h1>
          <p className="text-sm text-gray-500">
            Live metrics sourced directly from Ingram Micro Canada APIs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchDashboardData} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg py-16 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={ShoppingCart}
              title="Orders"
              value={state.ordersCount.toLocaleString()}
              description="Total orders matching your latest query window"
            />
            <StatCard
              icon={Undo2}
              title="Returns"
              value={state.returnsCount.toLocaleString()}
              description="Active return cases associated with your account"
            />
            <StatCard
              icon={Receipt}
              title="Invoices"
              value={state.invoicesCount.toLocaleString()}
              description="Invoices retrieved from the Ingram Micro ledger"
            />
            <StatCard
              icon={DollarSign}
              title="Outstanding Balance"
              value={formatCurrency(state.outstandingBalance, 'CAD')}
              description="Sum of current invoice amounts due"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 xl:col-span-2">
              <header className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Showing the five most recent orders from the order search endpoint.
                </p>
              </header>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {state.orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                          No orders returned from the API.
                        </td>
                      </tr>
                    ) : (
                      state.orders.map((order) => (
                        <tr key={order.ingramOrderNumber} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.ingramOrderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.customerOrderNumber || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.ingramOrderDate ? formatDate(order.ingramOrderDate) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(toNumber(order.orderTotal), order.currencyCode || 'CAD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge variant={orderStatusVariant(order.orderStatus)}>
                              {order.orderStatus || 'Unknown'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <header className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Invoice Snapshot</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Latest invoices including status and balance due.
                </p>
              </header>

              <div className="divide-y divide-gray-100">
                {state.invoices.length === 0 ? (
                  <div className="px-6 py-8 text-sm text-gray-500 text-center">
                    No invoices returned from the API.
                  </div>
                ) : (
                  state.invoices.map((invoice, index) => (
                    <article
                      key={invoice.invoiceNumber ?? invoice.erpOrderNumber ?? `invoice-${index}`}
                      className="px-6 py-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber || '—'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {invoice.invoiceDate ? formatDate(invoice.invoiceDate) : 'No date provided'}
                          </p>
                        </div>
                        <Badge variant={invoiceStatusVariant(invoice.invoiceStatus)}>
                          {invoice.invoiceStatus || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <p>Order #: {invoice.erpOrderNumber || '—'}</p>
                        <p>Customer Ref: {invoice.customerOrderNumber || '—'}</p>
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-900">
                        {formatCurrency(toNumber(invoice.invoicedAmountDue), 'CAD')}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200">
            <header className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Return Activity</h2>
              <p className="text-xs text-gray-500 mt-1">
                High-level view of active RMA cases and estimated credits.
              </p>
            </header>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estimated Credit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {state.returns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        No returns returned from the API.
                      </td>
                    </tr>
                  ) : (
                    state.returns.map((returnClaim, index) => (
                      <tr
                        key={
                          returnClaim.caseRequestNumber ??
                          returnClaim.returnClaimId ??
                          `return-${index}`
                        }
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {returnClaim.caseRequestNumber || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {returnClaim.returnReason || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {returnClaim.createdOn ? formatDate(returnClaim.createdOn) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(toNumber(returnClaim.estimatedTotalValue), 'CAD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge variant={returnStatusVariant(returnClaim.status)}>
                            {returnClaim.status || 'Unknown'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
