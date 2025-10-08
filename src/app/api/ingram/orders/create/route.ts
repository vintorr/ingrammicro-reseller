import { ordersApi } from '../../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';

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
    console.error('Order creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
