import { makeIngramAPICall } from '../../../../lib/ingram-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteNumber = searchParams.get('quoteNumber');
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

    if (quoteNumber) {
      // Get specific quote details
      endpoint = `/resellers/v6/quotes/${quoteNumber}`;
    } else {
      // Get quotes list
      const queryParams = new URLSearchParams({
        pageSize,
        pageNumber
      });
      endpoint = `/resellers/v6/quotes?${queryParams}`;
    }

    const data = await makeIngramAPICall(endpoint, options);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Quotes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, items } = body;

    const quoteData = {
      customerName,
      customerEmail,
      products: items.map(item => ({
        ingramPartNumber: item.partNumber,
        quantity: item.quantity,
        description: item.description
      }))
    };

    const data = await makeIngramAPICall(
      '/resellers/v6/quotes',
      {
        method: 'POST',
        body: JSON.stringify(quoteData),
        customerNumber: request.headers.get('im-customer-number'),
        countryCode: request.headers.get('im-country-code') || 'US',
        correlationId: request.headers.get('im-correlation-id'),
        senderID: request.headers.get('im-sender-id'),
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create quote error:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
