import { quotesApi } from '../../../../lib/api/ingram/quotes';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteNumber = searchParams.get('quoteNumber');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const page = parseInt(searchParams.get('pageNumber') || '1');

    let data;

    if (quoteNumber) {
      // Get specific quote details
      data = await quotesApi.getQuoteDetails(quoteNumber);
    } else {
      // Get quotes list
      const searchParams_obj = {
        page,
        size: pageSize,
        fromDate: searchParams.get('fromDate') || undefined,
        toDate: searchParams.get('toDate') || undefined,
        status: searchParams.get('status') || undefined,
      };

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams_obj).filter(([_, value]) => value !== undefined)
      );

      data = await quotesApi.searchQuotes(cleanParams);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Quotes API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch quotes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, items } = body;

    const quoteData = {
      customerName,
      customerEmail,
      items: items.map((item: any) => ({
        partNumber: item.partNumber,
        quantity: item.quantity,
        description: item.description
      }))
    };

    const data = await quotesApi.createQuote(quoteData);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create quote error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create quote',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
