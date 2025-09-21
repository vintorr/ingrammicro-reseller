import { useState, useCallback } from 'react';

export function useIngramAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAPI = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ingram${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          // Add required Ingram Micro headers
          'IM-Customer-Number': process.env.NEXT_PUBLIC_INGRAM_CUSTOMER_NUMBER,
          'IM-Country-Code': 'US',
          'IM-Correlation-ID': `web-${Date.now()}`,
          'IM-Sender-ID': process.env.NEXT_PUBLIC_INGRAM_SENDER_ID || 'NextJS-App',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callAPI, loading, error };
}
