// lib/ingram-auth.js
let accessToken = null;
let tokenExpiry = null;

export async function getIngramAccessToken() {
  // Check if token is still valid (with 5-minute buffer)
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return accessToken;
  }

  try {
    const response = await fetch(process.env.INGRAM_MICRO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.INGRAM_MICRO_CLIENT_ID,
        client_secret: process.env.INGRAM_MICRO_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();

    // Store token and calculate expiry time
    accessToken = data.access_token;
    // Token expires in 24 hours according to docs, but let's use the actual value
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    return accessToken;
  } catch (error) {
    console.error('Error getting Ingram Micro access token:', error);
    throw error;
  }
}

export async function makeIngramAPICall(endpoint, options = {}) {
  const token = await getIngramAccessToken();

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    // Required headers based on the API documentation
    'IM-CustomerNumber': options.customerNumber || process.env.INGRAM_MICRO_CUSTOMER_NUMBER,
    'IM-CountryCode': options.countryCode || 'US',
    'IM-CorrelationID': options.correlationId || generateCorrelationId(),
  };

  // Add optional headers if provided
  if (options.senderID) {
    defaultHeaders['IM-SenderID'] = options.senderID;
  }

  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${process.env.INGRAM_MICRO_API_BASE_URL}${endpoint}`, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API call failed: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

// Helper function to generate correlation ID
function generateCorrelationId() {
  return 'nextjs-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
