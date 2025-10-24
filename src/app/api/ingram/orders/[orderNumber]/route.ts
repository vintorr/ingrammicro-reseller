import { ordersApi } from '../../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';
import type { OrderSearchResponse } from '../../../../../lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const orderDetails = await ordersApi.getOrderDetails(orderNumber);
    return NextResponse.json(orderDetails);
  } catch (error) {
    console.error('Order details primary error:', error);

    // Fallback: attempt to pull order data from search endpoint
    try {
      const { orderNumber } = await params;
      const searchResult: OrderSearchResponse = await ordersApi.searchOrders({
        orderNumber,
        pageNumber: 1,
        pageSize: 1,
      });

      const fallbackOrder = searchResult.orders?.[0];
      if (fallbackOrder) {
        return NextResponse.json(fallbackOrder);
      }
    } catch (fallbackError) {
      console.error('Order details fallback error:', fallbackError);
    }

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
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
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
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const result = await ordersApi.cancelOrder(orderNumber);

    // For DELETE operations, null/undefined result typically means success
    // (many APIs return empty response for successful DELETE operations)
    return NextResponse.json({ 
      message: 'Order cancelled successfully',
      success: true
    });
  } catch (error) {

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
