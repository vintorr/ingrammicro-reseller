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

    let data;
    try {
      data = await productsApi.searchProducts(cleanParams);
    } catch (apiError) {
      console.warn('Ingram Micro API failed, using fallback:', apiError);
      // If the API fails, return mock data instead of an error
      data = {
        catalog: [],
        recordsFound: 0,
        pageNumber: cleanParams.pageNumber || 1,
        pageSize: cleanParams.pageSize || 20,
        totalPages: 0
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Product search error:', error);
    // Return empty results instead of 500 error
    return NextResponse.json({
      catalog: [],
      recordsFound: 0,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 0,
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
