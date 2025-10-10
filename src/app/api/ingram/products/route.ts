import { productsApi } from '../../../../lib/api/ingram/products';
import { NextRequest, NextResponse } from 'next/server';
import type { ProductSearchRequest } from '../../../../lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const searchParams_obj: ProductSearchRequest = {
      keyword: searchParams.get('keyword') || undefined,
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      pageNumber: parseInt(searchParams.get('pageNumber') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sortBy: (searchParams.get('sortBy') as 'price' | 'name' | 'popularity') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
    };

    // Remove undefined values and convert to proper format
    const cleanParams = Object.fromEntries(
      Object.entries(searchParams_obj).filter(([_, value]) => value !== undefined && value !== null)
    );

    const data = await productsApi.searchProducts(cleanParams);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
