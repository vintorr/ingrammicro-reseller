import { ingramAuth } from '../ingram-auth';
import { ApiError } from '../ingram-auth';

export class ApiClient {
  private baseURL: string;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.baseURL = this.isProduction 
      ? process.env.INGRAM_API_BASE_URL! 
      : process.env.INGRAM_SANDBOX_URL!;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await ingramAuth.getAuthHeaders();
    
    const url = `${this.baseURL}${endpoint}`;
    console.log('API Client - Making request to:', url);
    console.log('API Client - Headers:', headers);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const responseText = await response.text();
    console.log('API Client - Response status:', response.status);
    console.log('API Client - Response text:', responseText.substring(0, 200) + '...');

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        // Handle Ingram Micro API error format
        if (Array.isArray(errorData) && errorData.length > 0) {
          const firstError = errorData[0];
          throw new ApiError(
            response.status,
            firstError.message || 'API request failed',
            errorData
          );
        }
      } catch (e) {
        if (e instanceof ApiError) {
          throw e;
        }
        errorData = { raw: responseText };
      }
      throw new ApiError(
        response.status,
        errorData.message || 'API request failed',
        errorData
      );
    }

    return JSON.parse(responseText);
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      // Filter out undefined values and convert to proper format
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
      );
      url = `${endpoint}?${new URLSearchParams(cleanParams).toString()}`;
    }
    
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
