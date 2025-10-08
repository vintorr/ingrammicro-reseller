'use client';

import { useState } from 'react';
import { FileText, Plus, Search, List, Trash2, Calendar, User, Mail, DollarSign } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { Quote, QuoteCreateRequest } from '@/lib/types';

interface QuoteManagementProps {}

interface QuoteFormItem {
  partNumber: string;
  quantity: number;
  description: string;
}

interface QuoteForm {
  customerName: string;
  customerEmail: string;
  items: QuoteFormItem[];
}

const QuoteManagement: React.FC<QuoteManagementProps> = () => {
  const [activeView, setActiveView] = useState<'create' | 'search' | 'list'>('create');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteDetails, setQuoteDetails] = useState<Quote | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quote creation form state
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({
    customerName: '',
    customerEmail: '',
    items: [{ partNumber: '', quantity: 1, description: '' }]
  });

  const handleQuoteSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteNumber.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ingram/quotes?quoteNumber=${encodeURIComponent(quoteNumber.trim())}`);
      const data = await response.json();

      if (response.ok && data) {
        setQuoteDetails(data);
      } else {
        setError(data.error || 'Quote not found');
        setQuoteDetails(null);
      }
    } catch (err) {
      setError('Failed to fetch quote details');
      console.error('Quote search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteList = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ingram/quotes?pageSize=20&pageNumber=1');
      const data = await response.json();

      if (response.ok && data.quotes) {
        setQuotes(data.quotes);
      } else {
        setError(data.error || 'Failed to fetch quotes');
        setQuotes([]);
      }
    } catch (err) {
      setError('Failed to fetch quotes');
      console.error('Quote list failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quoteForm.customerName.trim() || !quoteForm.customerEmail.trim()) {
      setError('Please fill in customer name and email');
      return;
    }

    const validItems = quoteForm.items.filter(item => 
      item.partNumber.trim() && item.quantity > 0
    );

    if (validItems.length === 0) {
      setError('Please add at least one valid item');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ingram/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: quoteForm.customerName,
          customerEmail: quoteForm.customerEmail,
          items: validItems
        })
      });

      const data = await response.json();

      if (response.ok && data) {
        setQuoteDetails(data);
        setActiveView('search');
        setQuoteNumber(data.quoteNumber);
        // Reset form
        setQuoteForm({
          customerName: '',
          customerEmail: '',
          items: [{ partNumber: '', quantity: 1, description: '' }]
        });
      } else {
        setError(data.error || 'Failed to create quote');
      }
    } catch (err) {
      setError('Failed to create quote');
      console.error('Quote creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const addQuoteItem = () => {
    setQuoteForm(prev => ({
      ...prev,
      items: [...prev.items, { partNumber: '', quantity: 1, description: '' }]
    }));
  };

  const removeQuoteItem = (index: number) => {
    setQuoteForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateQuoteItem = (index: number, field: keyof QuoteFormItem, value: string | number) => {
    setQuoteForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'pending':
        return 'warning';
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
            variant={activeView === 'create' ? 'primary' : 'secondary'}
            onClick={() => setActiveView('create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Quote
          </Button>
          <Button
            variant={activeView === 'search' ? 'primary' : 'secondary'}
            onClick={() => setActiveView('search')}
          >
            <Search className="w-4 h-4 mr-2" />
            Search Quote
          </Button>
          <Button
            variant={activeView === 'list' ? 'primary' : 'secondary'}
            onClick={() => {
              setActiveView('list');
              handleQuoteList();
            }}
          >
            <List className="w-4 h-4 mr-2" />
            Quote List
          </Button>
        </div>
      </div>

      {/* Create Quote */}
      {activeView === 'create' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Create New Quote
          </h2>
          
          <form onSubmit={handleCreateQuote} className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={quoteForm.customerName}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Email *
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  value={quoteForm.customerEmail}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Quote Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-900">Quote Items</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addQuoteItem}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {quoteForm.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Part Number *
                      </label>
                      <input
                        type="text"
                        value={item.partNumber}
                        onChange={(e) => updateQuoteItem(index, 'partNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuoteItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuoteItem(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={quoteForm.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                loading={loading}
                disabled={!quoteForm.customerName.trim() || !quoteForm.customerEmail.trim()}
              >
                Create Quote
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Search Quote */}
      {activeView === 'search' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Quote by Number</h2>
          
          <form onSubmit={handleQuoteSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                placeholder="Enter quote number..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              loading={loading}
              disabled={!quoteNumber.trim()}
            >
              Search
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {quoteDetails && (
            <div className="mt-6 space-y-6">
              {/* Quote Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Quote Number</p>
                      <p className="font-medium">{quoteDetails.quoteNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Created Date</p>
                      <p className="font-medium">{formatDate(quoteDetails.createdDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">{formatCurrency(quoteDetails.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={getStatusVariant(quoteDetails.status)}>
                      {quoteDetails.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{quoteDetails.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{quoteDetails.customerEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Items */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Quote Items</h3>
                </div>
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
                      {quoteDetails.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.ingramPartNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.description}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quote List */}
      {activeView === 'list' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Quotes</h2>
          </div>
          
          {loading && (
            <div className="p-6 flex items-center justify-center">
              <LoadingSpinner size="lg" />
              <span className="ml-2 text-gray-600">Loading quotes...</span>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && quotes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
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
                  {quotes.map((quote) => (
                    <tr key={quote.quoteNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quote.quoteNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{quote.customerName}</div>
                          <div className="text-gray-500">{quote.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(quote.createdDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(quote.status)}>
                          {quote.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(quote.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setQuoteNumber(quote.quoteNumber);
                            setActiveView('search');
                            handleQuoteSearch(new Event('submit') as any);
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

          {!loading && !error && quotes.length === 0 && (
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No quotes found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuoteManagement;
