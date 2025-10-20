'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, DollarSign, Package, FileText, ShoppingCart } from 'lucide-react';
import ProductSearch from './ProductSearch';
import PriceAvailability from './PriceAvailability';
import OrderManagement from './OrderManagement';
import QuoteManagement from './QuoteManagement';
import { useCart } from '@/lib/hooks/useCart';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const router = useRouter();
  const { totalItems } = useCart();

  const tabs: Tab[] = [
    { id: 'products', label: 'Product Search', icon: <Search className="w-4 h-4" /> },
    { id: 'pricing', label: 'Price & Availability', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'orders', label: 'Order Management', icon: <Package className="w-4 h-4" /> },
    { id: 'quotes', label: 'Quote Management', icon: <FileText className="w-4 h-4" /> },
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
              <Button
                variant="ghost"
                onClick={() => router.push('/cart')}
                className="relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="error" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
              <div className="text-sm text-gray-500">
                Powered by Next.js & TypeScript
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
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-[#062fa3] text-[#062fa3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
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
