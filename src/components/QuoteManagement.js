'use client';

import { useState } from 'react';
import { useIngramAPI } from '../hooks/useIngramAPI';

const QuoteManagement = () => {
  const [activeView, setActiveView] = useState('create');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const { callAPI, loading, error } = useIngramAPI();

  // Quote creation form state
  const [quoteForm, setQuoteForm] = useState({
    customerName: '',
    customerEmail: '',
    items: [{ partNumber: '', quantity: 1, description: '' }]
  });

  const handleQuoteSearch = async (e) => {
    e.preventDefault();
    if (!quoteNumber.trim()) return;

    try {
      const data = await callAPI(`/quotes?quoteNumber=${encodeURIComponent(quoteNumber.trim())}`);

      // Transform the response to match our UI
      if (data) {
        const transformedQuote = {
          quoteNumber: data.quoteNumber || quoteNumber,
          quoteDate: data.quoteDate || 'N/A',
          status: data.status || 'Unknown',
          validUntil: data.validUntil || 'N/A',
          customerName: data.customerName || 'N/A',
          customerEmail: data.customerEmail || 'N/A',
          totalAmount: data.totalAmount || 0,
          items: data.products?.map((product, index) => ({
            lineNumber: index + 1,
            partNumber: product.ingramPartNumber || 'N/A',
            description: product.description || 'No description',
            quantity: product.quantity || 0,
            unitPrice: product.unitPrice || 0,
            totalPrice: product.totalPrice || 0
          })) || []
        };
        setQuoteDetails(transformedQuote);
      } else {
        setQuoteDetails(null);
      }

    } catch (err) {
      console.error('Quote search failed:', err);
    }
  };

  const handleQuoteList = async () => {
    try {
      const data = await callAPI('/quotes?pageSize=20&pageNumber=1');

      // Transform the response to match our UI
      if (data && data.quotes) {
        const transformedQuotes = data.quotes.map(quote => ({
          quoteNumber: quote.quoteNumber || 'N/A',
          quoteDate: quote.quoteDate || 'N/A',
          status: quote.status || 'Unknown',
          validUntil: quote.validUntil || 'N/A',
          customerName: quote.customerName || 'N/A',
          totalAmount: quote.totalAmount || 0
        }));
        setQuotes(transformedQuotes);
      } else {
        setQuotes([]);
      }

    } catch (err) {
      console.error('Quote list failed:', err);
    }
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();

    try {
      const data = await callAPI('/quotes', {
        method: 'POST',
        body: JSON.stringify({
          customerName: quoteForm.customerName,
          customerEmail: quoteForm.customerEmail,
          items: quoteForm.items.filter(item => item.partNumber.trim() !== '')
        })
      });

      if (data) {
        setQuoteDetails({
          quoteNumber: data.quoteNumber || `QUO-${Date.now()}`,
          quoteDate: data.quoteDate || new Date().toISOString().split('T')[0],
          status: data.status || 'Active',
          validUntil: data.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerName: quoteForm.customerName,
          customerEmail: quoteForm.customerEmail,
          totalAmount: data.totalAmount || 0,
          items: quoteForm.items.filter(item => item.partNumber.trim() !== '')
        });
        setActiveView('search');
        setQuoteNumber(data.quoteNumber || `QUO-${Date.now()}`);
      }

    } catch (err) {
      console.error('Create quote failed:', err);
    }
  };

  const addQuoteItem = () => {
    setQuoteForm({
      ...quoteForm,
      items: [...quoteForm.items, { partNumber: '', quantity: 1, description: '' }]
    });
  };

  const removeQuoteItem = (index) => {
    setQuoteForm({
      ...quoteForm,
      items: quoteForm.items.filter((_, i) => i !== index)
    });
  };

  const updateQuoteItem = (index, field, value) => {
    const updatedItems = [...quoteForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setQuoteForm({ ...quoteForm, items: updatedItems });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
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
            onClick={() => setActiveView('create')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeView === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create Quote
          </button>
          <button
            onClick={() => setActiveView('search')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeView === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Search Quote
          </button>
          <button
            onClick={() => {
              setActiveView('list');
              handleQuoteList();
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              activeView === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Quote List
          </button>
        </div>
      </div>

      {/* Create Quote */}
      {activeView === 'create' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Quote</h2>
          
          <form onSubmit={handleCreateQuote} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={quoteForm.customerName}
                  onChange={(e) => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Email
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  value={quoteForm.customerEmail}
                  onChange={(e) => setQuoteForm({ ...quoteForm, customerEmail: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Quote Items</h3>
                <button
                  type="button"
                  onClick={addQuoteItem}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {quoteForm.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                      <input
                        type="text"
                        value={item.partNumber}
                        onChange={(e) => updateQuoteItem(index, 'partNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuoteItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeQuoteItem(index)}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Quote...' : 'Create Quote'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Search Quote */}
      {activeView === 'search' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Quote by Number</h2>
          
          <form onSubmit={handleQuoteSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                placeholder="Enter quote number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !quoteNumber.trim()}
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

          {quoteDetails && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Quote Information</h3>
                  <dl className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Quote Number:</dt>
                      <dd className="text-sm font-medium">{quoteDetails.quoteNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Quote Date:</dt>
                      <dd className="text-sm font-medium">{quoteDetails.quoteDate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Status:</dt>
                      <dd className="text-sm font-medium">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quoteDetails.status)}`}>
                          {quoteDetails.status}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Valid Until:</dt>
                      <dd className="text-sm font-medium">{quoteDetails.validUntil}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Total Amount:</dt>
                      <dd className="text-sm font-medium">${quoteDetails.totalAmount}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                  <dl className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Customer:</dt>
                      <dd className="text-sm font-medium">{quoteDetails.customerName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Email:</dt>
                      <dd className="text-sm font-medium">{quoteDetails.customerEmail}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Quote Items</h3>
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
                      {quoteDetails.items.map((item) => (
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
          
          {quotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.map((quote) => (
                    <tr key={quote.quoteNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quote.quoteNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote.quoteDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote.validUntil}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${quote.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => {
                            setQuoteNumber(quote.quoteNumber);
                            setActiveView('search');
                            handleQuoteSearch({ preventDefault: () => {} });
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
              {loading ? 'Loading quotes...' : 'No quotes found'}
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

export default QuoteManagement;
