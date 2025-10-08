import { apiClient } from '../client';
import type {
  Order,
  OrderCreateRequest,
  OrderCreateResponse,
} from '../../types';

export class OrdersApi {
  async createOrder(request: OrderCreateRequest): Promise<OrderCreateResponse> {
    const endpoint = '/resellers/v6/orders';
    console.log('OrdersApi - Creating order with data:', JSON.stringify(request, null, 2));
    return apiClient.post<OrderCreateResponse>(endpoint, request);
  }

  async getOrderDetails(orderNumber: string): Promise<Order> {
    const endpoint = `/resellers/v6.1/orders/${orderNumber}`;
    return apiClient.get<Order>(endpoint);
  }

  async searchOrders(params: {
    customerOrderNumber?: string;
    endCustomerOrderNumber?: string;
    orderNumber?: string;
    orderStatus?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<{ orders: Order[]; totalCount: number }> {
    const endpoint = '/resellers/v6/orders/search';
    return apiClient.get(endpoint, params);
  }

  async cancelOrder(orderNumber: string): Promise<void> {
    const endpoint = `/resellers/v6/orders/${orderNumber}`;
    console.log('OrdersApi - Cancelling order:', {
      orderNumber,
      endpoint
    });
    
    try {
      const result = await apiClient.delete(endpoint);
      console.log('OrdersApi - Order cancellation successful:', result);
      return result;
    } catch (error) {
      console.error('OrdersApi - Order cancellation failed:', error);
      throw error;
    }
  }

  async modifyOrder(orderNumber: string, modifications: any): Promise<Order> {
    const endpoint = `/resellers/v6/orders/${orderNumber}`;
    console.log('OrdersApi - Modifying order:', {
      orderNumber,
      endpoint,
      modifications: JSON.stringify(modifications, null, 2)
    });
    
    try {
      const result = await apiClient.put<Order>(endpoint, modifications);
      console.log('OrdersApi - Order modification successful:', result);
      return result;
    } catch (error) {
      console.error('OrdersApi - Order modification failed:', error);
      throw error;
    }
  }
}

export const ordersApi = new OrdersApi();
