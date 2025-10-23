import { ordersApi } from '../../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '../../../../../lib/ingram-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerOrderNumber, notes, lines, additionalAttributes } = body;

    const orderData = {
      customerOrderNumber,
      notes,
      lines,
      additionalAttributes
    };

    const order = await ordersApi.createOrder(orderData);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Ingram create order error', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof ApiError ? error.data : error instanceof Error ? error.stack : undefined
      },
      {
        status: error instanceof ApiError ? error.status : 500,
      }
    );
  }
}
