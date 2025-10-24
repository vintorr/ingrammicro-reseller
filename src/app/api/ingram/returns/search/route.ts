import { NextRequest, NextResponse } from 'next/server';
import { returnsApi } from '../../../../../lib/api/ingram/returns';
import type { ReturnSearchRequest } from '../../../../../lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: ReturnSearchRequest = {
      caseRequestNumber: searchParams.get('caseRequestNumber') || undefined,
      invoiceNumber: searchParams.get('invoiceNumber') || undefined,
      returnClaimId: searchParams.get('returnClaimId') || undefined,
      referenceNumber: searchParams.get('referenceNumber') || undefined,
      ingramPartNumber: searchParams.get('ingramPartNumber') || undefined,
      vendorPartNumber: searchParams.get('vendorPartNumber') || undefined,
      returnStatusIn: searchParams.get('returnStatusIn') || undefined,
      claimStatusIn: searchParams.get('claimStatusIn') || undefined,
      createdOnBt: searchParams.get('createdOnBt') || undefined,
      modifiedOnBt: searchParams.get('modifiedOnBt') || undefined,
      returnReasonIn: searchParams.get('returnReasonIn') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      size: searchParams.get('size') ? Number(searchParams.get('size')) : undefined,
      sort: searchParams.get('sort') || undefined,
      sortingColumnName: searchParams.get('sortingColumnName') || undefined,
    };

    const data = await returnsApi.searchReturns(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Returns search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search returns',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
