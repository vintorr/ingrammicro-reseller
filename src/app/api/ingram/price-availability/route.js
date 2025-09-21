import { makeIngramAPICall } from '../../../../lib/ingram-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { products, includeAvailability = true, includePricing = true } = body;

    const queryParams = new URLSearchParams({
      includeAvailability: includeAvailability.toString(),
      includePricing: includePricing.toString(),
    });

    const data = await makeIngramAPICall(
      `/resellers/v6/catalog/priceandavailability?${queryParams}`,
      {
        method: 'POST',
        body: JSON.stringify({ products }),
        customerNumber: request.headers.get('im-customer-number'),
        countryCode: request.headers.get('im-country-code') || 'US',
        correlationId: request.headers.get('im-correlation-id'),
        senderID: request.headers.get('im-sender-id'),
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('Price and availability error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price and availability' },
      { status: 500 }
    );
  }
}
