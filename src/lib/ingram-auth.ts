// lib/ingram-auth.ts
import { v4 as uuidv4 } from 'uuid';

interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class IngramAuthService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  async getAccessToken(): Promise<string> {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    // Use configurable OAuth endpoint
    const oauthEndpoint = this.getOAuthEndpoint();
    const response = await fetch(oauthEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.INGRAM_CLIENT_ID!,
        client_secret: process.env.INGRAM_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to obtain access token');
    }

    const data: TokenResponse = await response.json();
    
    this.token = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
    
    return this.token;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'IM-CustomerNumber': process.env.INGRAM_CUSTOMER_NUMBER!,
      'IM-CountryCode': process.env.INGRAM_COUNTRY_CODE!,
      'IM-SenderID': process.env.INGRAM_SENDER_ID!,
      'IM-CorrelationID': uuidv4().replace(/-/g, '').substring(0, 32),
    };
  }

  async makeAPICall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.getBaseURL()}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || 'API request failed',
        errorData
      );
    }

    return response.json();
  }

  private getBaseURL(): string {
    const isProduction = process.env.NODE_ENV === 'production';
    return isProduction 
      ? process.env.INGRAM_API_BASE_URL! 
      : process.env.INGRAM_SANDBOX_URL!;
  }

  private getOAuthEndpoint(): string {
    // OAuth endpoint should always use the production URL, even in development
    // The sandbox is only for API calls, not for authentication
    // But make it configurable via environment variable
    return process.env.INGRAM_OAUTH_URL || 'https://api.ingrammicro.com:443/oauth/oauth20/token';
  }
}

export const ingramAuth = new IngramAuthService();

// Legacy functions for backward compatibility
export async function getIngramAccessToken(): Promise<string> {
  return ingramAuth.getAccessToken();
}

export async function makeIngramAPICall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return ingramAuth.makeAPICall<T>(endpoint, options);
}

