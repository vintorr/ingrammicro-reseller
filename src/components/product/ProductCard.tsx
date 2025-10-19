'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CheckCircle, AlertCircle, ShoppingCart, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Product, PriceAvailabilityResponse } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  showQuickView?: boolean;
  priceAvailabilityData?: any;
  priceLoading?: boolean;
  isInCompare?: boolean;
  onToggleCompare?: () => void;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails,
  showQuickView = true,
  priceAvailabilityData,
  priceLoading = false,
  isInCompare = false,
  onToggleCompare
}: ProductCardProps) {
  const router = useRouter();
  
  // Get price/availability data for this specific product
  const productPriceAvailability = Array.isArray(priceAvailabilityData) 
    ? priceAvailabilityData.find((item: any) => item.ingramPartNumber === product.ingramPartNumber)
    : null;

  const handleViewDetails = () => {
    onViewDetails?.(product);
  };
  
  return (
    <div className="group relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 overflow-hidden hover:bg-white/80">
      {/* Product Info Header */}
      <div className="p-6">
        {/* Product Title */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight min-h-[3.5rem] flex items-start">
            <span className="line-clamp-2">{product.description}</span>
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[1.5rem]">
            <span className="bg-gray-100/80 px-2 py-1 rounded-lg text-xs font-mono">
              {product.ingramPartNumber}
            </span>
            <span className="text-gray-500">•</span>
            <span className="truncate">{product.vendorName || 'Unknown Vendor'}</span>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2 min-h-[2rem] items-start">
            {product.newProduct === 'True' && (
              <Badge variant="success" className="text-xs bg-green-100/80 text-green-700 border-green-200/50">New</Badge>
            )}
            {product.directShip === 'True' && (
              <Badge variant="info" className="text-xs bg-blue-100/80 text-blue-700 border-blue-200/50">Direct Ship</Badge>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-4 min-h-[4rem] flex flex-col justify-center">
          {priceLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-500">Loading price...</span>
            </div>
          ) : productPriceAvailability?.pricing && Object.keys(productPriceAvailability.pricing).length > 0 ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ${productPriceAvailability.pricing.customerPrice}
                </span>
                <span className="text-sm text-gray-500">
                  {productPriceAvailability.pricing.currencyCode}
                </span>
              </div>
              {productPriceAvailability.pricing.retailPrice > productPriceAvailability.pricing.customerPrice && (
                <div className="text-sm text-gray-500 line-through">
                  MSRP: ${productPriceAvailability.pricing.retailPrice}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 bg-gray-100/80 px-3 py-1 rounded-lg">
                Price on request
              </span>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="mb-6 min-h-[2.5rem] flex flex-col justify-center">
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

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#062fa3] hover:bg-[#062fa3]/90 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
          >
            <ExternalLink className="w-4 h-4" />
            View Product
          </Button>
          
          <Button
            onClick={() => onAddToCart?.(product)}
            disabled={
              product.authorizedToPurchase === 'False' ||
              (productPriceAvailability?.availability && !productPriceAvailability.availability.available)
            }
            className="w-full flex items-center justify-center gap-2 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            {priceLoading ? 'Loading...' : 
             product.authorizedToPurchase === 'False'
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
