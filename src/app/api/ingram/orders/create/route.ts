import { ordersApi } from '../../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Order creation request body:', JSON.stringify(body, null, 2));
    
    const { customerOrderNumber, notes, lines, additionalAttributes } = body;

    const orderData = {
      customerOrderNumber,
      notes,
      lines,
      additionalAttributes
    };

    console.log('Order data being sent to Ingram API:', JSON.stringify(orderData, null, 2));

    const order = await ordersApi.createOrder(orderData);

    console.log('Order creation response:', JSON.stringify(order, null, 2));

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order creation error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    // If it's an ApiError, include more details
    if (error instanceof Error && 'status' in error) {
      console.error('API Error details:', {
        status: (error as any).status,
        data: (error as any).data,
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
