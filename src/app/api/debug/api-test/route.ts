import { NextResponse } from 'next/server';
import { productsApi } from '../../../../lib/api/ingram/products';

export async function GET() {
  try {
    // Test a simple API call
    const result = await productsApi.searchProducts({
      pageNumber: 1,
      pageSize: 5
    });
    
    return NextResponse.json({
      status: 'success',
      result: {
        hasData: !!result,
        dataType: typeof result,
        keys: result ? Object.keys(result) : [],
        // Don't return full data, just metadata
        itemCount: result?.catalog ? result.catalog.length : 0
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Test Error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown',
        // Include more error details if available
        errorDetails: error && typeof error === 'object' && 'status' in error ? {
          status: (error as any).status,
          data: (error as any).data
        } : null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
