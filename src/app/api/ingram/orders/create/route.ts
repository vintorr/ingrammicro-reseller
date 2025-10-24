import { ordersApi } from '../../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '../../../../../lib/ingram-auth';
import type { OrderCreateRequest, OrderCreateShipToInfo, OrderCreateEndUserInfo } from '../../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderCreateRequest;

    const normalizeAddress = <T extends OrderCreateShipToInfo | OrderCreateEndUserInfo>(
      info?: T,
    ): T | undefined => {
      if (!info) return undefined;
      const normalized = { ...info };
      if (normalized.countryCode) {
        normalized.countryCode = normalized.countryCode.toUpperCase();
      }
      if (!normalized.countryCode && process.env.INGRAM_COUNTRY_CODE) {
        normalized.countryCode = process.env.INGRAM_COUNTRY_CODE.toUpperCase();
      }
      if ('state' in normalized && normalized.state) {
        normalized.state = normalized.state.toUpperCase();
      }
      if (!normalized.contact && normalized.companyName) {
        normalized.contact = normalized.companyName;
      }
      return normalized;
    };

    const sanitizeCountryCode = (code?: string): string | undefined => {
      if (code) {
        const normalized = code.trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(normalized)) {
          return normalized;
        }
      }
      const fallback = process.env.INGRAM_COUNTRY_CODE ?? '';
      return fallback ? fallback.trim().toUpperCase().slice(0, 2) : undefined;
    };

    const sanitizeState = (state?: string) => {
      if (!state) return state;
      return state.trim().toUpperCase();
    };

    const orderData: OrderCreateRequest = {
      ...body,
      shipToInfo: body.shipToInfo
        ? normalizeAddress({
            ...body.shipToInfo,
            countryCode: sanitizeCountryCode(body.shipToInfo?.countryCode),
            state: sanitizeState(body.shipToInfo?.state),
            email: body.shipToInfo?.email?.trim(),
          })
        : undefined,
      endUserInfo: body.endUserInfo
        ? normalizeAddress({
            ...body.endUserInfo,
            countryCode: sanitizeCountryCode(body.endUserInfo?.countryCode),
            state: sanitizeState(body.endUserInfo?.state),
            email: body.endUserInfo?.email?.trim(),
          })
        : undefined,
    };

    console.log('Submitting Ingram order payload:', JSON.stringify(orderData, null, 2));

    const order = await ordersApi.createOrder(orderData);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Ingram create order error', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof ApiError ? error.data : error instanceof Error ? error.stack : undefined
      },
      {
        status: error instanceof ApiError ? error.status : 500,
      }
    );
  }
}
