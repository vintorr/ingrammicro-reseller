import { apiClient } from '../client';
import type {
  ReturnSearchRequest,
  ReturnSearchResponse,
  ReturnDetails,
} from '../../types';

export class ReturnsApi {
  async searchReturns(params: ReturnSearchRequest): Promise<ReturnSearchResponse> {
    const endpoint = '/resellers/v6/returns/search';
    return apiClient.get<ReturnSearchResponse>(endpoint, params as Record<string, any>);
  }

  async getReturnDetails(caseRequestNumber: string): Promise<ReturnDetails> {
    const endpoint = `/resellers/v6/returns/${caseRequestNumber}`;
    return apiClient.get<ReturnDetails>(endpoint);
  }
}

export const returnsApi = new ReturnsApi();
