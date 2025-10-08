'use client';

import { useState, useEffect } from 'react';
import { Search, List, Package, Calendar, DollarSign, User, MapPin, Truck, Eye, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { Order, OrderSearchRequest, OrderSearchResponse } from '@/lib/types';

interface OrderManagementProps {}

const OrderManagement: React.FC<OrderManagementProps> = () => {
  const [activeView, setActiveView] = useState<'search' | 'list'>('search');
  const [searchParams, setSearchParams] = useState<OrderSearchRequest>({
    pageNumber: 1,
    pageSize: 25,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Load initial orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (params: OrderSearchRequest = searchParams) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/ingram/orders/search?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

          const data: OrderSearchResponse = await response.json();
          // Filter out invalid orders and ensure unique keys
          const validOrders = (data.orders || []).filter((order, index) => {
            if (!order || !order.ingramOrderNumber) {
              console.warn(`Invalid order at index ${index}:`, order);
              return false;
            }
            return true;
          });
          setOrders(validOrders);
          setTotalPages(Math.ceil(parseInt(data.recordsFound) / parseInt(data.pageSize)));
          setCurrentPage(parseInt(data.pageNumber));
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, pageNumber: 1 }));
    loadOrders({ ...searchParams, pageNumber: 1 });
  };

  const handleViewOrder = async (orderNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ingram/orders/${orderNumber}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const order: Order = await response.json();
      setSelectedOrder(order);
      setShowOrderDetails(true);
    } catch (err) {
      console.error('Error loading order details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderNumber: string) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Attempting to cancel order:', orderNumber);
      
      const response = await fetch(`/api/ingram/orders/${orderNumber}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Order cancellation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order cancellation error response:', errorData);
        
        // Handle specific error cases
        if (response.status === 501) {
          throw new Error(errorData.message || 'Order cancellation is not supported by the Ingram Micro API. Please contact Ingram Micro support to cancel this order.');
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Order cancellation successful:', result);

      // Refresh the orders list
      await loadOrders();
      setShowOrderDetails(false);
      setSelectedOrder(null);
      
      // Show success message
      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      
      // Show user-friendly error message
      alert(`❌ Order Cancellation Failed\n\n${errorMessage}`);
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'info';
      case 'shipped':
        return 'success';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Order Management</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={activeView === 'search' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('search')}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Orders
            </Button>
            <Button
              variant={activeView === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('list')}
            >
              <List className="w-4 h-4 mr-2" />
              All Orders
            </Button>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Order Number
            </label>
            <input
              type="text"
              value={searchParams.customerOrderNumber || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, customerOrderNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter customer order number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              value={searchParams.orderStatus || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, orderStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={searchParams.fromDate || ''}
              onChange={(e) => setSearchParams(prev => ({ ...prev, fromDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-3">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Orders
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {!loading && orders.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Orders ({orders.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders
                  .filter((order) => order && order.ingramOrderNumber) // Filter out invalid orders
                  .map((order, index) => {
                    // Create a unique key combining order number and index to prevent duplicates
                    const uniqueKey = `${order.ingramOrderNumber}-${index}`;
                    return (
                  <tr key={uniqueKey} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.ingramOrderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customerOrderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.orderTotal, order.currencyCode)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.ingramOrderDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewOrder(order.ingramOrderNumber)}
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Shipped' && order.orderStatus !== 'Delivered' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelOrder(order.ingramOrderNumber)}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel this order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setSearchParams(prev => ({ ...prev, pageNumber: newPage }));
                      loadOrders({ ...searchParams, pageNumber: newPage });
                    }}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setSearchParams(prev => ({ ...prev, pageNumber: newPage }));
                      loadOrders({ ...searchParams, pageNumber: newPage });
                    }}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Orders */}
      {!loading && orders.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No orders found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search criteria
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowOrderDetails(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details - {selectedOrder.ingramOrderNumber}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOrderDetails(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Number:</span>
                        <span className="font-medium">{selectedOrder.ingramOrderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer Order:</span>
                        <span className="font-medium">{selectedOrder.customerOrderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <Badge variant={getStatusBadgeVariant(selectedOrder.orderStatus)}>
                          {selectedOrder.orderStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Date:</span>
                        <span className="font-medium">{formatDate(selectedOrder.ingramOrderDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium">{formatCurrency(selectedOrder.orderTotal, selectedOrder.currencyCode)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Billing Information</h4>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{selectedOrder.billToInfo.companyName}</div>
                      <div>{selectedOrder.billToInfo.contact}</div>
                      <div>{selectedOrder.billToInfo.addressLine1}</div>
                      {selectedOrder.billToInfo.addressLine2 && <div>{selectedOrder.billToInfo.addressLine2}</div>}
                      <div>{selectedOrder.billToInfo.city}, {selectedOrder.billToInfo.state} {selectedOrder.billToInfo.postalCode}</div>
                      <div>{selectedOrder.billToInfo.countryCode}</div>
                    </div>
                  </div>
                </div>

                {/* Order Lines */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Order Lines</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Part Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.lines && selectedOrder.lines.length > 0 ? (
                          selectedOrder.lines.map((line, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {line.ingramPartNumber}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {line.partDescription || line.description || 'No description'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {line.quantityOrdered || line.quantity || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(line.unitPrice || 0, selectedOrder.currencyCode)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(line.extendedPrice || line.totalPrice || 0, selectedOrder.currencyCode)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No products in this order
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cancel Order Button */}
                {selectedOrder.orderStatus !== 'Cancelled' && selectedOrder.orderStatus !== 'Shipped' && selectedOrder.orderStatus !== 'Delivered' && (
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      onClick={() => handleCancelOrder(selectedOrder.ingramOrderNumber)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
