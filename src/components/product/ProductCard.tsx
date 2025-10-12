'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CheckCircle, AlertCircle, Heart, Eye, ShoppingCart, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Product, PriceAvailabilityResponse } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  showQuickView?: boolean;
  priceAvailabilityData?: any;
  priceLoading?: boolean;
  isFavorite?: boolean;
  isInCompare?: boolean;
  onToggleFavorite?: () => void;
  onToggleCompare?: () => void;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails,
  showQuickView = true,
  priceAvailabilityData,
  priceLoading = false,
  isFavorite = false,
  isInCompare = false,
  onToggleFavorite,
  onToggleCompare
}: ProductCardProps) {
  const router = useRouter();
  
  // Get price/availability data for this specific product
  const productPriceAvailability = Array.isArray(priceAvailabilityData) 
    ? priceAvailabilityData.find((item: any) => item.ingramPartNumber === product.ingramPartNumber)
    : null;

  const handleViewDetails = () => {
    router.push(`/products/${product.ingramPartNumber}`);
  };
  
  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Product Image */}
      <div 
        className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer relative"
        onClick={handleViewDetails}
      >
        <div className="h-full w-full flex items-center justify-center hover:scale-105 transition-transform duration-300">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">📦</span>
            </div>
            <span className="text-gray-400 text-xs">Product Image</span>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.newProduct === 'True' && (
            <Badge variant="success" className="text-xs">New</Badge>
          )}
          {product.directShip === 'True' && (
            <Badge variant="info" className="text-xs">Direct Ship</Badge>
          )}
          {product.discontinued === 'True' && (
            <Badge variant="warning" className="text-xs">Discontinued</Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className={`w-8 h-8 p-0 rounded-full ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare?.();
            }}
            className={`w-8 h-8 p-0 rounded-full ${isInCompare ? 'bg-blue-100 text-blue-600' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick View Overlay */}
        {showQuickView && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              Quick View
            </Button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="space-y-3">
          <div>
            <h3 
              className="text-sm font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleViewDetails}
            >
              {product.description}
            </h3>
            
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {product.ingramPartNumber}
              </span>
              <span className="text-xs text-gray-500">
                {product.vendorName}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div>
            {priceLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-500">Loading price...</span>
              </div>
            ) : productPriceAvailability?.pricing && Object.keys(productPriceAvailability.pricing).length > 0 ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">
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
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  Price on request
                </span>
              </div>
            )}
          </div>

          {/* Availability */}
          <div>
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
            className="w-full flex items-center justify-center gap-2 py-2.5"
          >
            <ShoppingCart className="w-4 h-4" />
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
