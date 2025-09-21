'use client';

import { useState } from 'react';
import ProductSearch from './ProductSearch';
import PriceAvailability from './PriceAvailability';
import OrderManagement from './OrderManagement';
import QuoteManagement from './QuoteManagement';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Product Search', icon: '🔍' },
    { id: 'pricing', label: 'Price & Availability', icon: '💰' },
    { id: 'orders', label: 'Order Management', icon: '📦' },
    { id: 'quotes', label: 'Quote Management', icon: '📋' },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'products':
        return <ProductSearch />;
      case 'pricing':
        return <PriceAvailability />;
      case 'orders':
        return <OrderManagement />;
      case 'quotes':
        return <QuoteManagement />;
      default:
        return <ProductSearch />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Ingram Micro Reseller Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Powered by Xvantage Integration
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
