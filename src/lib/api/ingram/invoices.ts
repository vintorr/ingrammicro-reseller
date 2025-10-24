import { apiClient } from '../client';
import type {
  InvoiceSearchRequest,
  InvoiceSearchResponse,
  InvoiceDetails,
} from '../../types';

export class InvoicesApi {
  async searchInvoices(params: InvoiceSearchRequest): Promise<InvoiceSearchResponse> {
    const endpoint = '/resellers/v6/invoices';
    return apiClient.get<InvoiceSearchResponse>(endpoint, params as Record<string, any>);
  }

  async getInvoiceDetails(invoiceNumber: string): Promise<InvoiceDetails> {
    const endpoint = `/resellers/v6.1/invoices/${invoiceNumber}`;
    return apiClient.get<InvoiceDetails>(endpoint);
  }
}

export const invoicesApi = new InvoicesApi();
