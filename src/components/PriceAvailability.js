'use client';

import { useState } from 'react';
import { useIngramAPI } from '../hooks/useIngramAPI';

const PriceAvailability = () => {
  const [partNumbers, setPartNumbers] = useState('');
  const [priceResults, setPriceResults] = useState([]);
  const { callAPI, loading, error } = useIngramAPI();

  const handlePriceCheck = async (e) => {
    e.preventDefault();
    if (!partNumbers.trim()) return;

    try {
      // Parse part numbers (comma-separated or newline-separated)
      const partNumberList = partNumbers
        .split(/[,\n]/)
        .map(pn => pn.trim())
        .filter(pn => pn.length > 0);

      const products = partNumberList.map(partNumber => ({
        ingramPartNumber: partNumber,
        quantity: 1
      }));

      const data = await callAPI('/price-availability', {
        method: 'POST',
        body: JSON.stringify({
          products,
          includeAvailability: true,
          includePricing: true
        })
      });

      // Transform the response to match our UI
      if (data && data.length > 0) {
        const transformedResults = data.map((product, index) => ({
          ingramPartNumber: product.ingramPartNumber || partNumberList[index],
          description: product.description || 'No description available',
          listPrice: product.pricing?.listPrice || 0,
          customerPrice: product.pricing?.customerPrice || 0,
          availability: product.availability?.availabilityByWarehouse?.[0]?.quantityAvailable > 0 ? 'In Stock' : 'Out of Stock',
          quantityAvailable: product.availability?.availabilityByWarehouse?.[0]?.quantityAvailable || 0,
          warehouse: product.availability?.availabilityByWarehouse?.[0]?.warehouseId || 'Unknown'
        }));
        setPriceResults(transformedResults);
      } else {
        setPriceResults([]);
      }

    } catch (err) {
      console.error('Price check failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Price & Availability Check</h2>
        
        <form onSubmit={handlePriceCheck} className="space-y-4">
          <div>
            <label htmlFor="partNumbers" className="block text-sm font-medium text-gray-700 mb-2">
              Part Numbers
            </label>
            <textarea
              id="partNumbers"
              value={partNumbers}
              onChange={(e) => setPartNumbers(e.target.value)}
              placeholder="Enter part numbers (one per line or comma-separated)..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter multiple part numbers separated by commas or new lines
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading || !partNumbers.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Check Price & Availability'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error.message}</p>
          </div>
        )}
      </div>

      {priceResults.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Price & Availability Results ({priceResults.length})
            </h3>
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
                    List Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceResults.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.ingramPartNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.listPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${product.customerPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.availability === 'In Stock' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.availability}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.quantityAvailable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.warehouse}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Checking price and availability...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAvailability;
