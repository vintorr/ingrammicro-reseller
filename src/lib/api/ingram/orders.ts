import { apiClient } from '../client';
import type {
  Order,
  OrderCreateRequest,
  OrderCreateResponse,
  OrderSearchRequest,
  OrderSearchResponse,
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

  async searchOrders(params: OrderSearchRequest): Promise<OrderSearchResponse> {
    const endpoint = '/resellers/v6/orders/search';
    return apiClient.get<OrderSearchResponse>(endpoint, params as Record<string, any>);
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
