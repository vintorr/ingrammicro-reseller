import { productsApi } from '../../../../../lib/api/ingram/products';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    console.log('Product details API called for product ID:', productId);
    
    if (!productId) {
      console.log('Product ID is missing');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching product details from Ingram API...');
    const productDetails = await productsApi.getProductDetails(productId);
    console.log('Product details received from Ingram API:', productDetails);

    // Enhance product details with additional information if available
    const enhancedProduct = {
      ...productDetails,
      // Add any additional processing here if needed
      lastUpdated: new Date().toISOString(),
    };

    console.log('Returning enhanced product details');
    return NextResponse.json(enhancedProduct);
  } catch (error) {
    console.error('Product details error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch product details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
