import { NextRequest, NextResponse } from 'next/server';
import { invoicesApi } from '../../../../../lib/api/ingram/invoices';
import type { InvoiceSearchRequest } from '../../../../../lib/types';

const toNumber = (value: string | null) => (value ? Number(value) : undefined);

const toStringOrArray = (searchParams: URLSearchParams, key: string) => {
  const values = searchParams.getAll(key).filter(Boolean);
  if (values.length === 0) {
    return undefined;
  }
  if (values.length === 1) {
    return values[0];
  }
  return values;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: InvoiceSearchRequest = {
      paymentTermsNetDate: searchParams.get('paymentTermsNetDate') || undefined,
      invoiceDate: searchParams.get('invoiceDate') || undefined,
      invoiceDueDate: searchParams.get('invoiceDueDate') || undefined,
      orderDate: searchParams.get('orderDate') || undefined,
      orderFromDate: searchParams.get('orderFromDate') || undefined,
      orderToDate: searchParams.get('orderToDate') || undefined,
      orderNumber: searchParams.get('orderNumber') || undefined,
      deliveryNumber: searchParams.get('deliveryNumber') || undefined,
      invoiceNumber: searchParams.get('invoiceNumber') || undefined,
      invoiceStatus: searchParams.get('invoiceStatus') || undefined,
      invoiceType: searchParams.get('invoiceType') || undefined,
      customerOrderNumber: searchParams.get('customerOrderNumber') || undefined,
      endCustomerOrderNumber: searchParams.get('endCustomerOrderNumber') || undefined,
      specialBidNumber: searchParams.get('specialBidNumber') || undefined,
      invoiceFromDueDate: searchParams.get('invoiceFromDueDate') || undefined,
      invoiceToDueDate: searchParams.get('invoiceToDueDate') || undefined,
      invoiceFromDate: toStringOrArray(searchParams, 'invoiceFromDate'),
      invoiceToDate: toStringOrArray(searchParams, 'invoiceToDate'),
      pageSize: toNumber(searchParams.get('pageSize')),
      pageNumber: toNumber(searchParams.get('pageNumber')),
      orderby: searchParams.get('orderby') || undefined,
      direction: searchParams.get('direction') || undefined,
      serialNumber: searchParams.get('serialNumber') || undefined,
    };

    const data = await invoicesApi.searchInvoices(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Invoice search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search invoices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
