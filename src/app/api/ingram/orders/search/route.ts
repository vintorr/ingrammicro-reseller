import { ordersApi } from '../../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';
import type { OrderSearchRequest } from '../../../../../lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const searchRequest: OrderSearchRequest = {
      customerOrderNumber: searchParams.get('customerOrderNumber') || undefined,
      endCustomerOrderNumber: searchParams.get('endCustomerOrderNumber') || undefined,
      orderNumber: searchParams.get('orderNumber') || undefined,
      orderStatus: searchParams.get('orderStatus') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      pageNumber: parseInt(searchParams.get('pageNumber') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '25'),
    };

    const result = await ordersApi.searchOrders(searchRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Order search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
