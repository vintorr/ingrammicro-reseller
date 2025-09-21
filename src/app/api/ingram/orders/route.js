import { makeIngramAPICall } from '../../../../lib/ingram-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const pageSize = searchParams.get('pageSize') || '20';
    const pageNumber = searchParams.get('pageNumber') || '1';

    let endpoint;
    let options = {
      method: 'GET',
      customerNumber: request.headers.get('im-customer-number'),
      countryCode: request.headers.get('im-country-code') || 'US',
      correlationId: request.headers.get('im-correlation-id'),
      senderID: request.headers.get('im-sender-id'),
    };

    if (orderNumber) {
      // Get specific order details
      endpoint = `/resellers/v6/orders/${orderNumber}`;
    } else {
      // Get orders list
      const queryParams = new URLSearchParams({
        pageSize,
        pageNumber,
        dateType: 'orderDate',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });
      endpoint = `/resellers/v6/orders?${queryParams}`;
    }

    const data = await makeIngramAPICall(endpoint, options);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
