import { apiClient } from '../client';
import type {
  Quote,
  QuoteCreateRequest,
  QuoteSearchParams,
  QuoteSearchResponse,
} from '../../types';

export class QuotesApi {
  async searchQuotes(params: QuoteSearchParams = {}): Promise<QuoteSearchResponse> {
    const endpoint = '/resellers/v6/quotes/search';
    return apiClient.get<QuoteSearchResponse>(endpoint, params as Record<string, any>);
  }

  async getQuoteDetails(quoteNumber: string): Promise<Quote> {
    const endpoint = `/resellers/v6/quotes/${quoteNumber}`;
    return apiClient.get<Quote>(endpoint);
  }

  async createQuote(request: QuoteCreateRequest): Promise<Quote> {
    const endpoint = '/resellers/v6/quotes';
    const payload = {
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      products: request.items.map(item => ({
        ingramPartNumber: item.partNumber,
        quantity: item.quantity,
        description: item.description,
      })),
    };
    return apiClient.post<Quote>(endpoint, payload);
  }
}

export const quotesApi = new QuotesApi();
