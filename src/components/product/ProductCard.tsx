'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Product, PriceAvailabilityResponse } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  showQuickView?: boolean;
  priceAvailabilityData?: any;
  priceLoading?: boolean;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails,
  showQuickView = true,
  priceAvailabilityData,
  priceLoading = false
}: ProductCardProps) {
  // Get price/availability data for this specific product
  const productPriceAvailability = priceAvailabilityData?.find(
    (item: any) => item.ingramPartNumber === product.ingramPartNumber
  );
  
  return (
    <div className="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Product Image */}
      <div 
        className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-50 cursor-pointer"
        onClick={() => onViewDetails?.(product)}
      >
        <div className="h-full w-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.newProduct === 'True' && (
            <Badge variant="success">New</Badge>
          )}
          {product.directShip === 'True' && (
            <Badge variant="info">Direct Ship</Badge>
          )}
          {product.discontinued === 'True' && (
            <Badge variant="warning">Discontinued</Badge>
          )}
        </div>

        {/* Quick Actions */}
        {showQuickView && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Open quick view modal */}}
            >
              Quick View
            </Button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
                <h3 
                  className="text-sm font-medium text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
                  onClick={() => onViewDetails?.(product)}
                >
                  {product.description}
                </h3>
            
            <p className="mt-1 text-xs text-gray-500">
              SKU: {product.ingramPartNumber}
            </p>
            
            <p className="text-xs text-gray-500">
              Brand: {product.vendorName}
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-3">
          {priceLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-500">Loading price...</span>
            </div>
                        ) : productPriceAvailability?.pricing ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-green-600">
                                ${productPriceAvailability.pricing.customerPrice} {productPriceAvailability.pricing.currencyCode}
                              </span>
                            </div>
                            {productPriceAvailability.pricing.retailPrice > productPriceAvailability.pricing.customerPrice && (
                              <div className="text-sm text-gray-500 line-through">
                                MSRP: ${productPriceAvailability.pricing.retailPrice} {productPriceAvailability.pricing.currencyCode}
                              </div>
                            )}
                          </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Price available on request
              </span>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="mt-2">
          {priceLoading ? (
            <p className="text-sm text-gray-500">Checking availability...</p>
                        ) : productPriceAvailability?.availability ? (
                          <div className="flex items-center gap-2">
                            {productPriceAvailability.availability.available ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">
                                  In Stock ({productPriceAvailability.availability.totalAvailability})
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                              </>
                            )}
                          </div>
          ) : (
            <p className="text-sm text-gray-600">
              Check availability for pricing
            </p>
          )}
        </div>

        {/* Add to Cart */}
        <div className="mt-4">
          <Button
            onClick={() => onAddToCart?.(product)}
            disabled={
              product.discontinued === 'True' || 
              product.authorizedToPurchase === 'False' ||
              (productPriceAvailability?.availability && !productPriceAvailability.availability.available)
            }
            className="w-full"
          >
            {priceLoading ? 'Loading...' : 
             product.discontinued === 'True'
              ? 'Discontinued' 
              : product.authorizedToPurchase === 'False'
                ? 'Not Authorized'
                : (productPriceAvailability?.availability && !productPriceAvailability.availability.available)
                  ? 'Out of Stock'
                  : 'Add to Cart'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
