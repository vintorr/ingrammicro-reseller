import { NextResponse } from 'next/server';
import { ingramAuth } from '../../../../lib/ingram-auth';

export async function GET() {
  try {
    // Test authentication
    const token = await ingramAuth.getAccessToken();
    const headers = await ingramAuth.getAuthHeaders();
    
    // Get OAuth endpoint info (we'll need to access it via reflection or add a getter)
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? process.env.INGRAM_API_BASE_URL! 
      : process.env.INGRAM_SANDBOX_URL!;
    const oauthEndpoint = `${baseUrl}/oauth/oauth20/token`;
    
    return NextResponse.json({
      status: 'success',
      auth: {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        hasHeaders: !!headers,
        headerKeys: Object.keys(headers),
        // Don't expose actual token or sensitive headers
        customerNumber: headers['IM-CustomerNumber'],
        countryCode: headers['IM-CountryCode'],
        senderId: headers['IM-SenderID'],
        // Show OAuth endpoint being used
        oauthEndpoint: oauthEndpoint,
        baseUrl: baseUrl,
        isProduction: isProduction,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth test error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
