"use client";

import { useState } from "react";
import {
  DollarSign,
  Package,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { formatCurrency } from "@/lib/utils/formatters";
import type { PriceAvailabilityResponse } from "@/lib/types";

interface PriceAvailabilityProps {}

const PriceAvailability: React.FC<PriceAvailabilityProps> = () => {
  const [partNumbers, setPartNumbers] = useState("");
  const [priceResults, setPriceResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePriceCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partNumbers.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Parse part numbers (comma-separated or newline-separated)
      const partNumberList = partNumbers
        .split(/[,\n]/)
        .map((pn) => pn.trim())
        .filter((pn) => pn.length > 0);

      const products = partNumberList.map((partNumber) => ({
        ingramPartNumber: partNumber,
        quantity: 1,
      }));

      const response = await fetch("/api/ingram/price-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products,
          includeAvailability: true,
          includePricing: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.products) {
        setPriceResults(data.products);
      } else {
        setError(data.error || "Failed to fetch price and availability");
        setPriceResults([]);
      }
    } catch (err) {
      setError("Failed to check price and availability");
      console.error("Price check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setPriceResults([]);
    setPartNumbers("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Price & Availability Check
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter part numbers (one per line or comma-separated) to check current
          pricing and availability.
        </p>

        <form onSubmit={handlePriceCheck} className="space-y-4">
          <div>
            <label
              htmlFor="partNumbers"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Part Numbers
            </label>
            <textarea
              id="partNumbers"
              value={partNumbers}
              onChange={(e) => setPartNumbers(e.target.value)}
              placeholder="Enter part numbers, one per line or comma-separated..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              loading={loading}
              disabled={!partNumbers.trim()}
            >
              Check Price & Availability
            </Button>
            {priceResults.length > 0 && (
              <Button type="button" variant="secondary" onClick={clearResults}>
                Clear Results
              </Button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {priceResults.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Price & Availability Results ({priceResults.length})
            </h3>
            {process.env.NODE_ENV !== "production" && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>Sandbox Mode:</strong> Products with missing pricing
                  or availability data in the sandbox are automatically enhanced
                  with mock data for testing purposes. Real data will be used in
                  production.
                </p>
              </div>
            )}
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
                    Customer Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
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
                      {product.description ||
                        product.productStatusMessage ||
                        "No description available"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.productStatusCode === "E" ? (
                        <span className="text-red-500">Product Not Found</span>
                      ) : product.pricing &&
                        Object.keys(product.pricing).length > 0 ? (
                        <div>
                          <div className="font-medium">
                            {formatCurrency(
                              product.pricing.customerPrice,
                              product.pricing.currencyCode,
                            )}
                          </div>
                          {product.pricing.retailPrice >
                            product.pricing.customerPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              Retail:{" "}
                              {formatCurrency(
                                product.pricing.retailPrice,
                                product.pricing.currencyCode,
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          Price not available
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.productStatusCode === "E" ? (
                        <Badge variant="error">Not Found</Badge>
                      ) : product.availability ? (
                        <div className="flex items-center">
                          {product.availability.available ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                              <Badge variant="success">
                                In Stock (
                                {product.availability.totalAvailability})
                              </Badge>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500 mr-1" />
                              <Badge variant="error">Out of Stock</Badge>
                            </>
                          )}
                        </div>
                      ) : (
                        <Badge variant="default">Unknown</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.productStatusCode === "E" ? (
                        <span className="text-gray-400">N/A</span>
                      ) : product.availability?.availabilityByWarehouse
                          ?.length > 0 ? (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <div>
                            {product.availability.availabilityByWarehouse.map(
                              (wh: any, idx: number) => (
                                <div key={idx} className="text-xs">
                                  {wh.location} ({wh.quantityAvailable})
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
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
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-gray-600">
              Checking price and availability...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAvailability;
