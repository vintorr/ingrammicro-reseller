import { productsApi } from '../../../../lib/api/ingram/products';
import { NextRequest, NextResponse } from 'next/server';
import type { PriceAvailabilityRequest } from '../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, includeAvailability = true, includePricing = true } = body;

    const requestData: PriceAvailabilityRequest = {
      products: products.map((product: any) => ({
        ingramPartNumber: product.ingramPartNumber,
        quantity: product.quantity || 1,
      })),
    };

    const data = await productsApi.getPriceAndAvailability(requestData);

    return NextResponse.json(data);
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
