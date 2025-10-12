'use client';

import { useState, useEffect } from 'react';
import { X, Package, DollarSign, Truck, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Product, PriceAvailabilityResponse } from '../../lib/types';

interface ProductDetailsModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({ productId, isOpen, onClose }: ProductDetailsModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [priceAvailability, setPriceAvailability] = useState<PriceAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
      fetchPriceAndAvailability();
    }
  }, [isOpen, productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching product details for:', productId);
      
      const response = await fetch(`/api/ingram/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout and other fetch options
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      console.log('Product details response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Product details API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Product details data received:', data);
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      
      // Handle different types of errors
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else if (err.message.includes('Failed to fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceAndAvailability = async () => {
    setPriceLoading(true);
    
    try {
      console.log('Fetching price and availability for product:', productId);
      
      const response = await fetch('/api/ingram/price-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: [
            {
              ingramPartNumber: productId
            }
          ]
        }),
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      console.log('Price availability response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Price availability API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Don't set main error state for price/availability failures
        // Just log them and continue without price data
        console.warn('Price availability failed, continuing without price data');
        return;
      }
      
      const data = await response.json();
      console.log('Price availability data received:', data);
      setPriceAvailability(data.products || data);
    } catch (err) {
      console.error('Error fetching price and availability:', err);
      
      // Handle different types of errors but don't set main error state
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          console.warn('Price availability request timed out');
        } else if (err.message.includes('Failed to fetch')) {
          console.warn('Price availability network error');
        } else {
          console.warn('Price availability error:', err.message);
        }
      }
      
      // Don't set error state for price/availability failures
      // The product details can still be shown without pricing
    } finally {
      setPriceLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-2 text-gray-600">Loading product details...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="text-red-600 mb-2">
                  <AlertCircle className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Product</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <div className="space-x-4">
                  <Button onClick={fetchProductDetails} variant="primary">
                    Try Again
                  </Button>
                  <Button onClick={onClose} variant="secondary">
                    Close
                  </Button>
                </div>
              </div>
            )}

            {product && (
              <div className="space-y-6">
                {/* Product Header */}
                <div className="flex items-start gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {product.description}
                        </h3>
                        <p className="text-lg text-gray-600 mb-2">
                          SKU: {product.ingramPartNumber}
                        </p>
                        <p className="text-lg text-gray-600 mb-4">
                          Brand: {product.vendorName}
                        </p>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex flex-col gap-2">
                        {product.newProduct === 'True' && (
                          <Badge variant="success">New Product</Badge>
                        )}
                        {product.directShip === 'True' && (
                          <Badge variant="info">Direct Ship</Badge>
                        )}
                        {product.discontinued === 'True' && (
                          <Badge variant="warning">Discontinued</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Category:</span>
                        <p className="text-gray-900">{product.category || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Subcategory:</span>
                        <p className="text-gray-900">{product.subCategory || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Product Type:</span>
                        <p className="text-gray-900">{product.productType || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Type:</span>
                        <p className="text-gray-900">{product.type || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">UPC Code:</span>
                        <p className="text-gray-900 font-mono text-sm">{product.upcCode || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Vendor Part Number:</span>
                        <p className="text-gray-900 font-mono text-sm">{product.vendorPartNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">End User Required:</span>
                        <p className="text-gray-900">{product.endUserRequired === 'True' ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Has Discounts:</span>
                        <p className="text-gray-900">{product.hasDiscounts === 'True' ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Has Warranty:</span>
                        <p className="text-gray-900">{product.hasWarranty === 'True' ? 'Yes' : 'No'}</p>
                      </div>
                      {product.replacementSku && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Replacement SKU:</span>
                          <p className="text-gray-900 font-mono text-sm">{product.replacementSku}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Availability */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pricing & Availability
                        {priceLoading && <LoadingSpinner size="sm" />}
                      </h4>
                      {!priceLoading && (!priceAvailability || priceAvailability.length === 0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={fetchPriceAndAvailability}
                          className="text-xs"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Customer Price:</span>
                        {priceLoading ? (
                          <p className="text-gray-500">Loading price...</p>
                        ) : priceAvailability && priceAvailability.length > 0 && priceAvailability[0]?.pricing ? (
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-green-600">
                              ${priceAvailability[0].pricing.customerPrice} {priceAvailability[0].pricing.currencyCode}
                            </p>
                            {priceAvailability[0].pricing.retailPrice > priceAvailability[0].pricing.customerPrice && (
                              <p className="text-sm text-gray-500 line-through">
                                Retail: ${priceAvailability[0].pricing.retailPrice} {priceAvailability[0].pricing.currencyCode}
                              </p>
                            )}
                            {priceAvailability[0].pricing.mapPrice && (
                              <p className="text-sm text-blue-600">
                                MAP: ${priceAvailability[0].pricing.mapPrice} {priceAvailability[0].pricing.currencyCode}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-gray-900">Price available on request</p>
                            <p className="text-xs text-gray-500">Click "Request Quote" for pricing</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Availability:</span>
                        {priceLoading ? (
                          <p className="text-gray-500">Checking availability...</p>
                        ) : priceAvailability && priceAvailability.length > 0 && priceAvailability[0]?.availability ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {priceAvailability[0].availability.available ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-green-600 font-medium">
                                    In Stock ({priceAvailability[0].availability.totalAvailability} units)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-red-600 font-medium">Out of Stock</span>
                                </>
                              )}
                            </div>
                            {priceAvailability[0].availability.availabilityByWarehouse && 
                             priceAvailability[0].availability.availabilityByWarehouse.length > 0 && (
                              <div className="ml-6 space-y-1">
                                <p className="text-xs font-medium text-gray-500">Warehouse Locations:</p>
                                {priceAvailability[0].availability.availabilityByWarehouse.map((warehouse: any, index: number) => (
                                  <div key={index} className="text-xs text-gray-600">
                                    {warehouse.location}: {warehouse.quantityAvailable} units
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-gray-900">Check availability for pricing</p>
                            <p className="text-xs text-gray-500">Contact sales for current stock levels</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Authorized to Purchase:</span>
                        <p className="text-gray-900">
                          {product.authorizedToPurchase === 'True' ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Product Status:</span>
                        <p className="text-gray-900">
                          {product.discontinued === 'True' ? 'Discontinued' : 'Active'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Direct Ship:</span>
                        <p className="text-gray-900">
                          {product.directShip === 'True' ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(product.extraDescription || (product.links && product.links.length > 0)) && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Additional Information
                    </h4>
                    {product.extraDescription && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">{product.extraDescription}</p>
                      </div>
                    )}
                    {product.links && product.links.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Related Links:</h5>
                        <div className="space-y-1">
                          {product.links.map((link, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {link.topic}
                              </span>
                              <a 
                                href={link.href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                {link.type}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="primary"
                      disabled={
                        product.discontinued === 'True' || 
                        product.authorizedToPurchase === 'False' ||
                        (priceAvailability?.[0]?.availability && !priceAvailability[0].availability.available)
                      }
                    >
                      {priceLoading ? 'Loading...' : 'Add to Cart'}
                    </Button>
                    <Button variant="secondary">
                      Request Quote
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Last updated: {product.lastUpdated ? new Date(product.lastUpdated).toLocaleString() : new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
