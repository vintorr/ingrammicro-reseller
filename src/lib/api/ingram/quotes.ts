import { apiClient } from '../client';

export interface Quote {
  quoteNumber: string;
  quoteId: string;
  status: string;
  customerName: string;
  customerEmail: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdDate: string;
  expiryDate: string;
}

export interface QuoteItem {
  ingramPartNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

export interface QuoteCreateRequest {
  customerName: string;
  customerEmail: string;
  items: Array<{
    partNumber: string;
    quantity: number;
    description: string;
  }>;
}

export interface QuoteSearchParams {
  page?: number;
  size?: number;
  quoteNumber?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export class QuotesApi {
  async searchQuotes(params: QuoteSearchParams): Promise<{ quotes: Quote[]; totalCount: number }> {
    const endpoint = '/resellers/v6/quotes';
    return apiClient.get(endpoint, params);
  }

  async getQuoteDetails(quoteNumber: string): Promise<Quote> {
    const endpoint = `/resellers/v6/quotes/${quoteNumber}`;
    return apiClient.get<Quote>(endpoint);
  }

  async createQuote(request: QuoteCreateRequest): Promise<Quote> {
    const endpoint = '/resellers/v6/quotes';
    const quoteData = {
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      products: request.items.map(item => ({
        ingramPartNumber: item.partNumber,
        quantity: item.quantity,
        description: item.description
      }))
    };
    return apiClient.post<Quote>(endpoint, quoteData);
  }
}

export const quotesApi = new QuotesApi();
