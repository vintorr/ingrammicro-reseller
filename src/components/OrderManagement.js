'use client';

import { useState } from 'react';
import { useIngramAPI } from '../hooks/useIngramAPI';

const OrderManagement = () => {
  const [activeView, setActiveView] = useState('search');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const { callAPI, loading, error } = useIngramAPI();

  const handleOrderSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    try {
      const data = await callAPI(`/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`);

      // Transform the response to match our UI
      if (data) {
        const transformedOrder = {
          orderNumber: data.orderNumber || orderNumber,
          orderDate: data.orderDate || 'N/A',
          status: data.status || 'Unknown',
          totalAmount: data.totalAmount || 0,
          customerName: data.customerName || 'N/A',
          shippingAddress: data.shippingAddress || 'N/A',
          items: data.lines?.map((line, index) => ({
            lineNumber: index + 1,
            partNumber: line.ingramPartNumber || 'N/A',
            description: line.description || 'No description',
            quantity: line.quantity || 0,
            unitPrice: line.unitPrice || 0,
            totalPrice: line.totalPrice || 0
          })) || [],
          trackingInfo: data.trackingInfo || null
        };
        setOrderDetails(transformedOrder);
      } else {
        setOrderDetails(null);
      }

    } catch (err) {
      console.error('Order search failed:', err);
    }
  };

  const handleOrderList = async () => {
    try {
      const data = await callAPI('/orders?pageSize=20&pageNumber=1');

      // Transform the response to match our UI
      if (data && data.orders) {
        const transformedOrders = data.orders.map(order => ({
          orderNumber: order.orderNumber || 'N/A',
          orderDate: order.orderDate || 'N/A',
          status: order.status || 'Unknown',
          totalAmount: order.totalAmount || 0,
          customerName: order.customerName || 'N/A'
        }));
        setOrders(transformedOrders);
      } else {
        setOrders([]);
      }

    } catch (err) {
      console.error('Order list failed:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView('search')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeView === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Search Order
          </button>
          <button
            onClick={() => {
              setActiveView('list');
              handleOrderList();
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              activeView === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Order List
          </button>
        </div>
      </div>

      {/* Search Order */}
      {activeView === 'search' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Order by Number</h2>
          
          <form onSubmit={handleOrderSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter order number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderNumber.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error.message}</p>
            </div>
          )}

          {orderDetails && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
                  <dl className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Order Number:</dt>
                      <dd className="text-sm font-medium">{orderDetails.orderNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Order Date:</dt>
                      <dd className="text-sm font-medium">{orderDetails.orderDate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Status:</dt>
                      <dd className="text-sm font-medium">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(orderDetails.status)}`}>
                          {orderDetails.status}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Total Amount:</dt>
                      <dd className="text-sm font-medium">${orderDetails.totalAmount}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                  <dl className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Customer:</dt>
                      <dd className="text-sm font-medium">{orderDetails.customerName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Shipping Address:</dt>
                      <dd className="text-sm font-medium">{orderDetails.shippingAddress}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orderDetails.items.map((item) => (
                        <tr key={item.lineNumber}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lineNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.partNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.unitPrice}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {orderDetails.trackingInfo && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tracking Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <dt className="text-sm text-gray-500">Carrier:</dt>
                        <dd className="text-sm font-medium">{orderDetails.trackingInfo.carrier}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Tracking Number:</dt>
                        <dd className="text-sm font-medium">{orderDetails.trackingInfo.trackingNumber}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Estimated Delivery:</dt>
                        <dd className="text-sm font-medium">{orderDetails.trackingInfo.estimatedDelivery}</dd>
                      </div>
                    </dl>
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
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.orderDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => {
                            setOrderNumber(order.orderNumber);
                            setActiveView('search');
                            handleOrderSearch({ preventDefault: () => {} });
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {loading ? 'Loading orders...' : 'No orders found'}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
