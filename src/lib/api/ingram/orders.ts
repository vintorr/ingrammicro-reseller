import { apiClient } from '../client';
import type {
  Order,
  OrderCreateRequest,
  OrderCreateResponse,
} from '../../types';

export class OrdersApi {
  async createOrder(request: OrderCreateRequest): Promise<OrderCreateResponse> {
    const endpoint = '/resellers/v6/orders';
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
    return apiClient.delete(endpoint);
  }

  async modifyOrder(orderNumber: string, modifications: any): Promise<Order> {
    const endpoint = `/resellers/v6/orders/${orderNumber}`;
    return apiClient.put<Order>(endpoint, modifications);
  }
}

export const ordersApi = new OrdersApi();
