'use client';

import { useState, useEffect } from 'react';
import { Search, List, Package, Calendar, DollarSign, User, MapPin, Truck, Eye, Edit, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { Order, OrderSearchRequest, OrderSearchResponse, OrderModifyRequest } from '@/lib/types';

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
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [modifyRequest, setModifyRequest] = useState<{
    notes: string;
    shipToInfo: {
      contact: string;
      companyName: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      countryCode: string;
      phoneNumber: string;
      email: string;
    };
    lines: Array<{
      customerLineNumber: string;
      ingramPartNumber: string;
      addUpdateDeleteLine: 'ADD' | 'UPDATE' | 'DELETE';
      quantity?: number;
    }>;
    additionalAttributes: Array<{
      attributeName: string;
      attributeValue: string;
    }>;
  }>({
    notes: '',
    shipToInfo: {
      contact: '',
      companyName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      countryCode: 'US',
      phoneNumber: '',
      email: '',
    },
    lines: [],
    additionalAttributes: [],
  });

  // Product search for order modification
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);

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
      setOrders(data.orders);
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

  const handleModifyOrder = async () => {
    if (!selectedOrder || modifyRequest.lines.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ingram/orders/${selectedOrder.ingramOrderNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modifyRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedOrder: Order = await response.json();
      setSelectedOrder(updatedOrder);
      setShowModifyForm(false);
      setModifyRequest({
        notes: '',
        shipToInfo: {
          contact: '',
          companyName: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          countryCode: 'US',
          phoneNumber: '',
          email: '',
        },
        lines: [],
        additionalAttributes: [],
      });
      
      // Refresh the orders list
      loadOrders();
    } catch (err) {
      console.error('Error modifying order:', err);
      setError(err instanceof Error ? err.message : 'Failed to modify order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderNumber: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ingram/orders/${orderNumber}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Refresh the orders list
      loadOrders();
      setShowOrderDetails(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const addModifyLine = () => {
    setModifyRequest(prev => ({
      ...prev,
      lines: [...prev.lines, {
        customerLineNumber: '',
        ingramPartNumber: '',
        addUpdateDeleteLine: 'ADD',
        quantity: 1,
      }]
    }));
  };

  const removeModifyLine = (index: number) => {
    setModifyRequest(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const updateModifyLine = (index: number, field: string, value: any) => {
    setModifyRequest(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  };

  const addAdditionalAttribute = () => {
    setModifyRequest(prev => ({
      ...prev,
      additionalAttributes: [...prev.additionalAttributes, {
        attributeName: '',
        attributeValue: '',
      }]
    }));
  };

  const removeAdditionalAttribute = (index: number) => {
    setModifyRequest(prev => ({
      ...prev,
      additionalAttributes: prev.additionalAttributes.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalAttribute = (index: number, field: string, value: string) => {
    setModifyRequest(prev => ({
      ...prev,
      additionalAttributes: prev.additionalAttributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const updateModifyRequest = (field: string, value: any) => {
    setModifyRequest(prev => ({ ...prev, [field]: value }));
  };

  const updateShipToInfo = (field: string, value: string) => {
    setModifyRequest(prev => ({
      ...prev,
      shipToInfo: { ...prev.shipToInfo, [field]: value }
    }));
  };

  // Product search functionality
  const searchProducts = async (query: string) => {
    if (!query.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/ingram/products?keyword=${encodeURIComponent(query)}&pageSize=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.catalog || []);
      }
    } catch (err) {
      console.error('Error searching products:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts(productSearchQuery);
  };

  const selectProduct = (product: any) => {
    const newLine = {
      customerLineNumber: (modifyRequest.lines.length + 1).toString(),
      ingramPartNumber: product.ingramPartNumber,
      addUpdateDeleteLine: 'ADD' as const,
      quantity: 1,
    };
    
    setModifyRequest(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }));
    
    setShowProductSearch(false);
    setProductSearchQuery('');
    setSearchResults([]);
  };

  const removeLine = (index: number) => {
    setModifyRequest(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const updateLineQuantity = (index: number, quantity: number) => {
    setModifyRequest(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, quantity } : line
      )
    }));
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
                {orders.map((order) => (
                  <tr key={order.ingramOrderNumber} className="hover:bg-gray-50">
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
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            setLoading(true);
                            setError(null);
                            
                            try {
                              const response = await fetch(`/api/ingram/orders/${order.ingramOrderNumber}`);
                              if (!response.ok) {
                                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                              }
                              
                              const orderDetails: Order = await response.json();
                              setSelectedOrder(orderDetails);
                              setShowModifyForm(true);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Failed to load order details');
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {order.orderStatus !== 'Cancelled' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelOrder(order.ingramOrderNumber)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
                        {selectedOrder.lines.map((line, index) => (
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
                              {formatCurrency(line.unitPrice, selectedOrder.currencyCode)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(line.extendedPrice || line.totalPrice, selectedOrder.currencyCode)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modify Order Modal */}
      {showModifyForm && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModifyForm(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Modify Order - {selectedOrder.ingramOrderNumber}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModifyForm(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Current Order Products */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Current Order Products</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {(() => {
                        const lines = selectedOrder?.lines || [];
                        return lines.length > 0 ? (
                          <div className="space-y-2">
                            {lines.map((line, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{line.partDescription || line.description || 'No description'}</div>
                                  <div className="text-xs text-gray-500">Part: {line.ingramPartNumber}</div>
                                  <div className="text-xs text-gray-500">
                                    Qty: {line.quantityOrdered || line.quantity || 0} × {formatCurrency(line.unitPrice || 0, selectedOrder.currencyCode || 'USD')}
                                  </div>
                                </div>
                                <div className="text-sm font-medium">
                                  {formatCurrency(line.extendedPrice || line.totalPrice || 0, selectedOrder.currencyCode || 'USD')}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No products in this order</p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={modifyRequest.notes}
                      onChange={(e) => updateModifyRequest('notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any notes for this order modification"
                      rows={3}
                      maxLength={132}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum 132 characters
                    </p>
                  </div>

                  {/* Add Products Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Add Products to Order</h4>
                      <Button 
                        size="sm" 
                        onClick={() => setShowProductSearch(true)}
                        variant="primary"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search Products
                      </Button>
                    </div>

                    {/* Product Search Modal */}
                    {showProductSearch && (
                      <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                          <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium">Search Products</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowProductSearch(false);
                                  setProductSearchQuery('');
                                  setSearchResults([]);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                            <form onSubmit={handleProductSearch} className="mt-4">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={productSearchQuery}
                                  onChange={(e) => setProductSearchQuery(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Search for products..."
                                />
                                <Button type="submit" disabled={searchLoading}>
                                  {searchLoading ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <Search className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </form>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {searchResults.length > 0 ? (
                              <div className="p-4 space-y-2">
                                {searchResults.map((product) => (
                                  <div
                                    key={product.ingramPartNumber}
                                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                                    onClick={() => selectProduct(product)}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{product.description}</div>
                                      <div className="text-xs text-gray-500">Part: {product.ingramPartNumber}</div>
                                      <div className="text-xs text-gray-500">Brand: {product.vendorName}</div>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : productSearchQuery && !searchLoading ? (
                              <div className="p-4 text-center text-gray-500">
                                No products found
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                Enter a search term to find products
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selected Products for Modification */}
                    {modifyRequest.lines.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Products to Add:</h5>
                        {modifyRequest.lines.map((line, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded border">
                            <div className="flex-1">
                              <div className="font-medium text-sm">Part: {line.ingramPartNumber}</div>
                              <div className="text-xs text-gray-500">Line: {line.customerLineNumber}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateLineQuantity(index, Math.max(1, (line.quantity || 1) - 1))}
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center text-sm">{line.quantity || 1}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateLineQuantity(index, (line.quantity || 1) + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeLine(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShowModifyForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleModifyOrder}
                      disabled={modifyRequest.lines.length === 0 || loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Modifying...
                        </>
                      ) : (
                        'Modify Order'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;