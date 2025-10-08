'use client';

import { useState } from 'react';
import { Search, List, Package, Calendar, DollarSign, User, MapPin, Truck } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { Order, OrderStatus } from '@/lib/types';

interface OrderManagementProps {}

const OrderManagement: React.FC<OrderManagementProps> = () => {
  const [activeView, setActiveView] = useState<'search' | 'list'>('search');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrderSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ingram/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = await response.json();

      if (response.ok && data) {
        setOrderDetails(data);
      } else {
        setError(data.error || 'Order not found');
        setOrderDetails(null);
      }
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Order search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderList = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ingram/orders?pageSize=20&pageNumber=1');
      const data = await response.json();

      if (response.ok && data.orders) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Failed to fetch orders');
        setOrders([]);
      }
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Order list failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex space-x-4">
          <Button
            variant={activeView === 'search' ? 'primary' : 'secondary'}
            onClick={() => setActiveView('search')}
          >
            <Search className="w-4 h-4 mr-2" />
            Search Order
          </Button>
          <Button
            variant={activeView === 'list' ? 'primary' : 'secondary'}
            onClick={() => {
              setActiveView('list');
              handleOrderList();
            }}
          >
            <List className="w-4 h-4 mr-2" />
            Order List
          </Button>
        </div>
      </div>

      {/* Search Order */}
      {activeView === 'search' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Order by Number</h2>
          
          <form onSubmit={handleOrderSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter order number..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              loading={loading}
              disabled={!orderNumber.trim()}
            >
              Search
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <LoadingSpinner size="md" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {orderDetails && (
            <div className="mt-6 space-y-6">
              {/* Order Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-medium">{orderDetails.orderNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium">{formatDate(orderDetails.orderDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">{formatCurrency(orderDetails.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={getStatusVariant(orderDetails.status)}>
                      {orderDetails.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Part Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orderDetails.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.ingramPartNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.totalPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusVariant(item.status)}>
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Shipping Information */}
              {orderDetails.shippingAddress && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Shipping Address
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <p>{orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                      {orderDetails.shippingAddress.company && <p>{orderDetails.shippingAddress.company}</p>}
                      <p>{orderDetails.shippingAddress.address1}</p>
                      {orderDetails.shippingAddress.address2 && <p>{orderDetails.shippingAddress.address2}</p>}
                      <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}</p>
                      <p>{orderDetails.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Information */}
              {orderDetails.trackingNumbers && orderDetails.trackingNumbers.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Tracking Information
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-2">
                    {orderDetails.trackingNumbers.map((tracking, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">{tracking.carrier}</p>
                          <p className="text-sm text-gray-600">{tracking.trackingNumber}</p>
                        </div>
                        {tracking.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={tracking.url} target="_blank" rel="noopener noreferrer">
                              Track Package
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order List */}
      {activeView === 'list' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          
          {loading && (
            <div className="p-6 flex items-center justify-center">
              <LoadingSpinner size="lg" />
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOrderNumber(order.orderNumber);
                            setActiveView('search');
                            handleOrderSearch(new Event('submit') as any);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="p-6 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
