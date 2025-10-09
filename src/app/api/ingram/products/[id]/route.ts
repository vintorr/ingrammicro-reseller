import { productsApi } from '../../../../../lib/api/ingram/products';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const productDetails = await productsApi.getProductDetails(productId);

    return NextResponse.json(productDetails);
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
