import { ordersApi } from '../../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    console.log('Fetching order details for:', orderNumber);
    
    const orderDetails = await ordersApi.getOrderDetails(orderNumber);
    
    console.log('Order details response:', JSON.stringify(orderDetails, null, 2));

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
    
    console.log('Order modification request:', {
      orderNumber,
      modifications: JSON.stringify(modifications, null, 2)
    });
    
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
    console.log('Order cancellation request for:', orderNumber);
    
    const result = await ordersApi.cancelOrder(orderNumber);
    console.log('Order cancellation result:', result);

    // For DELETE operations, null/undefined result typically means success
    // (many APIs return empty response for successful DELETE operations)
    return NextResponse.json({ 
      message: 'Order cancelled successfully',
      success: true
    });
  } catch (error) {
    console.error('Order cancellation error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    // Check if it's a JSON parsing error (this might indicate API issues)
    if (error instanceof Error && error.message.includes('Unexpected end of JSON input')) {
      console.log('JSON parsing error - this might indicate the API returned empty response (which is normal for DELETE)');
      // Don't treat this as an error - empty response is normal for successful DELETE operations
    }

    // If it's an ApiError, include more details
    if (error instanceof Error && 'status' in error) {
      console.error('API Error details:', {
        status: (error as any).status,
        data: (error as any).data,
      });
    }

    // Check if it's an API limitation (common with Ingram Micro)
    if (error instanceof Error && error.message.includes('API request failed')) {
      return NextResponse.json(
        { 
          error: 'Order cancellation not supported',
          message: 'This order cannot be cancelled. The order may already be processed, shipped, or the cancellation is not supported by Ingram Micro for this order type.',
          supported: false
        },
        { status: 400 } // Bad Request
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to cancel order',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
