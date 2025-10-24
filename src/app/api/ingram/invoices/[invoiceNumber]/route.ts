import { NextRequest, NextResponse } from 'next/server';
import { invoicesApi } from '../../../../../lib/api/ingram/invoices';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> },
) {
  try {
    const { invoiceNumber } = await params;
    const data = await invoicesApi.getInvoiceDetails(invoiceNumber);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Invoice details error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch invoice details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
