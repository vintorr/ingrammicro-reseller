import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if we're in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Check required environment variables (without exposing sensitive values)
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      isProduction,
      hasClientId: !!process.env.INGRAM_CLIENT_ID,
      hasClientSecret: !!process.env.INGRAM_CLIENT_SECRET,
      hasCustomerNumber: !!process.env.INGRAM_CUSTOMER_NUMBER,
      hasCountryCode: !!process.env.INGRAM_COUNTRY_CODE,
      hasSenderId: !!process.env.INGRAM_SENDER_ID,
      hasApiBaseUrl: !!process.env.INGRAM_API_BASE_URL,
      hasSandboxUrl: !!process.env.INGRAM_SANDBOX_URL,
      // Show non-sensitive values
      countryCode: process.env.INGRAM_COUNTRY_CODE,
      senderId: process.env.INGRAM_SENDER_ID,
      apiBaseUrl: process.env.INGRAM_API_BASE_URL,
      sandboxUrl: process.env.INGRAM_SANDBOX_URL,
    };

    return NextResponse.json({
      status: 'success',
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
