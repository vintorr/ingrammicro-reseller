import { NextRequest, NextResponse } from 'next/server';
import { returnsApi } from '../../../../../lib/api/ingram/returns';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ caseRequestNumber: string }> },
) {
  try {
    const { caseRequestNumber } = await params;
    const data = await returnsApi.getReturnDetails(caseRequestNumber);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Return details error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch return details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
