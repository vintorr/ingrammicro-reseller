import { productsApi } from '../../../../lib/api/ingram/products';
import { NextRequest, NextResponse } from 'next/server';
import type { PriceAvailabilityRequest } from '../../../../lib/types';
import { getDemoPricing, isDemoMode } from '../../../../lib/demo-pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, includeAvailability = true, includePricing = true } = body;

    const requestData: PriceAvailabilityRequest = {
      products: products.map((product: any) => {
        const item: any = {
          ingramPartNumber: product.ingramPartNumber,
        };
        // Only include quantity if it's provided
        if (product.quantity !== undefined) {
          item.quantity = product.quantity;
        }
        return item;
      }),
    };

    const data = await productsApi.getPriceAndAvailability(requestData);

    // Enhance sandbox data with realistic availability and pricing if missing
    // Note: Ingram Micro sandbox often returns products with zero availability or no pricing
    // This enhancement adds mock data for testing purposes in non-production environments
    const enhancedData = data.map((product: any) => {
      // Check if product has no availability or is out of stock in sandbox
      const hasNoAvailability = !product.availability || 
                                 !product.availability.availabilityByWarehouse || 
                                 product.availability.availabilityByWarehouse.length === 0 ||
                                 product.availability.totalAvailability === 0;
      
      // Check if product has no pricing data
      const hasNoPricing = !product.pricing || 
                           Object.keys(product.pricing).length === 0 ||
                           !product.pricing.customerPrice ||
                           product.pricing.customerPrice === 0;
      
      // If in demo mode or sandbox has missing data, add realistic data
      if (isDemoMode() || ((hasNoAvailability || hasNoPricing) && process.env.NODE_ENV !== 'production')) {
        const demoData = getDemoPricing(product.ingramPartNumber);
        
        // Use demo data if available, otherwise create generic data
        if (demoData) {
          return {
            ...product,
            pricing: hasNoPricing ? demoData.pricing : product.pricing,
            availability: hasNoAvailability ? demoData.availability : product.availability
          };
        } else if (product.productStatusCode !== 'E') {
          // Add generic data for products that exist but have no info
          const result: any = { ...product };
          
          // Add generic pricing if missing
          if (hasNoPricing) {
            const basePrice = Math.floor(Math.random() * 500) + 100; // Random between $100-$599
            result.pricing = {
              customerPrice: basePrice,
              retailPrice: basePrice * 1.3, // 30% markup
              mapPrice: basePrice * 1.15, // 15% markup
              currencyCode: 'USD'
            };
          }
          
          // Add generic availability if missing
          if (hasNoAvailability) {
            result.availability = {
              available: true,
              totalAvailability: Math.floor(Math.random() * 50) + 10, // Random between 10-59
              availabilityByWarehouse: [
                {
                  quantityAvailable: Math.floor(Math.random() * 30) + 10,
                  warehouseId: 'WH001',
                  location: 'California',
                  quantityBackordered: 0,
                  quantityBackorderedEta: '',
                  quantityOnOrder: 0
                }
              ]
            };
          }
          
          return result;
        }
      }
      
      return product;
    });

    return NextResponse.json({ products: enhancedData });
  } catch (error) {
    console.error('Price and availability error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch price and availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
