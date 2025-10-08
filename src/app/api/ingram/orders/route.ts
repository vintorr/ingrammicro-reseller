import { ordersApi } from '../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    let data;

    if (orderNumber) {
      // Get specific order details
      data = await ordersApi.getOrderDetails(orderNumber);
    } else {
      // Get orders list
      const searchParams_obj = {
        page,
        size: pageSize,
        fromDate: searchParams.get('fromDate') || '2024-01-01',
        toDate: searchParams.get('toDate') || '2024-12-31',
        orderStatus: searchParams.get('orderStatus') || undefined,
        customerOrderNumber: searchParams.get('customerOrderNumber') || undefined,
      };

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams_obj).filter(([_, value]) => value !== undefined)
      );

      data = await ordersApi.searchOrders(cleanParams);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await ordersApi.createOrder(body);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
