import { makeIngramAPICall } from '../../../../lib/ingram-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const pageSize = searchParams.get('pageSize') || '25';
    const pageNumber = searchParams.get('pageNumber') || '1';

    const queryParams = new URLSearchParams({
      keyword,
      pageSize,
      pageNumber,
    });

    const data = await makeIngramAPICall(
      `/resellers/v6/catalog?${queryParams}`,
      {
        method: 'GET',
        customerNumber: request.headers.get('im-customer-number'),
        countryCode: request.headers.get('im-country-code') || 'US',
        correlationId: request.headers.get('im-correlation-id'),
        senderID: request.headers.get('im-sender-id'),
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
