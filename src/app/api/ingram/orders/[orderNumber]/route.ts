import { ordersApi } from '../../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    const orderDetails = await ordersApi.getOrderDetails(orderNumber);

    return NextResponse.json(orderDetails);
  } catch (error) {
    console.error('Order details error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch order details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    const modifications = await request.json();
    
    const updatedOrder = await ordersApi.modifyOrder(orderNumber, modifications);

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order modification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to modify order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    await ordersApi.cancelOrder(orderNumber);

    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Order cancellation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
