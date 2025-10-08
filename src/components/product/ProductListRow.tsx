'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { Product, PriceAvailabilityResponse } from '@/lib/types';

interface ProductListRowProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  priceAvailabilityData?: any;
  priceLoading?: boolean;
}

export function ProductListRow({ 
  product, 
  onAddToCart, 
  onViewDetails,
  priceAvailabilityData,
  priceLoading = false
}: ProductListRowProps) {
  // Get price/availability data for this specific product
  const productPriceAvailability = priceAvailabilityData?.find(
    (item: any) => item.ingramPartNumber === product.ingramPartNumber
  );

  return (
    <tr key={product.ingramPartNumber} className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => onViewDetails?.(product)}>
            {product.description}
          </div>
          <div className="text-sm text-gray-500">
            SKU: {product.ingramPartNumber} | Brand: {product.vendorName}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {priceLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        ) : productPriceAvailability?.pricing ? (
          <div className="space-y-1">
            <div className="text-sm font-medium text-green-600">
              ${productPriceAvailability.pricing.customerPrice} {productPriceAvailability.pricing.currencyCode}
            </div>
            {productPriceAvailability.pricing.retailPrice > productPriceAvailability.pricing.customerPrice && (
              <div className="text-sm text-gray-500 line-through">
                MSRP: ${productPriceAvailability.pricing.retailPrice} {productPriceAvailability.pricing.currencyCode}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-900">
            Price available on request
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {priceLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-500">Checking...</span>
          </div>
        ) : productPriceAvailability?.availability ? (
          <div className="flex items-center gap-2">
            {productPriceAvailability.availability.available ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Badge variant="success">
                  In Stock ({productPriceAvailability.availability.totalAvailability})
                </Badge>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <Badge variant="error">
                  Out of Stock
                </Badge>
              </>
            )}
          </div>
        ) : (
          <Badge 
            variant={product.discontinued === 'True' ? 'warning' : 'info'}
          >
            {product.discontinued === 'True' 
              ? 'Discontinued' 
              : 'Check availability'
            }
          </Badge>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Button
          size="sm"
          onClick={() => onAddToCart?.(product)}
          disabled={
            product.discontinued === 'True' || 
            product.authorizedToPurchase === 'False' ||
            (productPriceAvailability?.availability && !productPriceAvailability.availability.available)
          }
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
      </td>
    </tr>
  );
}
