import { ordersApi } from '../../../../../lib/api/ingram/orders';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '../../../../../lib/ingram-auth';
import type {
  OrderCreateAdditionalAttribute,
  OrderCreateEndUserInfo,
  OrderCreateRequest,
  OrderCreateRequestLine,
  OrderCreateShipToInfo,
} from '../../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderCreateRequest;

    const trimString = (input?: string | null): string | undefined => {
      if (typeof input !== 'string') return undefined;
      const trimmed = input.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    };

    const sanitizeCountryCode = (code?: string): string | undefined => {
      const trimmed = trimString(code);
      if (trimmed && /^[A-Za-z]{2}$/.test(trimmed)) {
        return trimmed.toUpperCase();
      }
      const fallback = trimString(process.env.INGRAM_COUNTRY_CODE);
      return fallback ? fallback.toUpperCase().slice(0, 2) : undefined;
    };

    const sanitizeState = (state?: string) => {
      const trimmed = trimString(state);
      return trimmed ? trimmed.toUpperCase() : undefined;
    };

    const sanitizePhone = (value?: string) => {
      if (!value) return undefined;
      const digits = value.replace(/\D/g, '');
      return digits.length ? digits : undefined;
    };

    const sanitizeEmail = (value?: string) => {
      const trimmed = trimString(value);
      return trimmed ? trimmed.toLowerCase() : undefined;
    };

    const normalizeAddress = <T extends OrderCreateShipToInfo | OrderCreateEndUserInfo>(
      info?: T,
    ): T | undefined => {
      if (!info) return undefined;
      const normalized = { ...info } as Record<string, any>;

      Object.keys(normalized).forEach((key) => {
        if (typeof normalized[key] === 'string') {
          const trimmedValue = normalized[key].trim();
          if (trimmedValue.length > 0) {
            normalized[key] = trimmedValue;
          } else {
            delete normalized[key];
          }
        }
      });

      const countryCode = sanitizeCountryCode(normalized.countryCode);
      if (countryCode) {
        normalized.countryCode = countryCode;
      } else if (process.env.INGRAM_COUNTRY_CODE) {
        normalized.countryCode = process.env.INGRAM_COUNTRY_CODE.trim().toUpperCase().slice(0, 2);
      } else {
        delete normalized.countryCode;
      }

      const state = sanitizeState(normalized.state);
      if (state) {
        normalized.state = state;
      } else {
        delete normalized.state;
      }

      const phone = sanitizePhone(normalized.phoneNumber);
      if (phone) {
        normalized.phoneNumber = phone;
      } else {
        delete normalized.phoneNumber;
      }

      const email = sanitizeEmail(normalized.email);
      if (email) {
        normalized.email = email;
      } else {
        delete normalized.email;
      }

      if (!normalized.contact && normalized.companyName) {
        normalized.contact = normalized.companyName;
      }

      return normalized as T;
    };

    const sanitizeAdditionalAttributes = (
      attributes?: OrderCreateAdditionalAttribute[],
    ): OrderCreateAdditionalAttribute[] | undefined => {
      if (!attributes) return undefined;

      const cleaned = attributes
        .map((attribute) => {
          const attributeName = trimString(attribute.attributeName);
          const attributeValue = trimString(attribute.attributeValue);

          if (!attributeName || !attributeValue) {
            return undefined;
          }

          return {
            attributeName,
            attributeValue,
          };
        })
        .filter((attribute): attribute is OrderCreateAdditionalAttribute => Boolean(attribute));

      return cleaned.length ? cleaned : undefined;
    };

    const sanitizeLines = (lines: OrderCreateRequestLine[]): OrderCreateRequestLine[] => {
      return lines
        .map((line, index) => {
          const customerLineNumber = trimString(line.customerLineNumber?.toString()) ?? String(index + 1);
          const ingramPartNumber = trimString(line.ingramPartNumber);
          const quantity =
            typeof line.quantity === 'number' ? line.quantity : Number(line.quantity);

          if (!customerLineNumber || !ingramPartNumber || Number.isNaN(quantity) || quantity <= 0) {
            return undefined;
          }

          const sanitizedLine: OrderCreateRequestLine = {
            ...line,
            customerLineNumber,
            ingramPartNumber,
            quantity,
            specialBidNumber: trimString(line.specialBidNumber),
            notes: trimString(line.notes),
          };

          if (line.additionalAttributes) {
            const cleanedAttributes = line.additionalAttributes
              .map((attribute) => {
                const attributeName = trimString(attribute.attributeName);
                const attributeValue = trimString(attribute.attributeValue);

                if (!attributeName || !attributeValue) {
                  return undefined;
                }

                return {
                  ...attribute,
                  attributeName,
                  attributeValue,
                };
              })
              .filter(
                (
                  attribute,
                ): attribute is NonNullable<OrderCreateRequestLine['additionalAttributes']>[number] =>
                  Boolean(attribute),
              );

            sanitizedLine.additionalAttributes = cleanedAttributes.length ? cleanedAttributes : undefined;
          }

          return sanitizedLine;
        })
        .filter((line): line is OrderCreateRequestLine => Boolean(line));
    };

    const customerOrderNumber = trimString(body.customerOrderNumber);
    if (!customerOrderNumber) {
      return NextResponse.json(
        {
          error: 'Invalid order payload',
          message: 'Customer order number is required.',
        },
        { status: 400 },
      );
    }

    const sanitizedLines = sanitizeLines(body.lines ?? []);
    if (!sanitizedLines.length) {
      return NextResponse.json(
        {
          error: 'Invalid order payload',
          message: 'At least one valid line item is required.',
        },
        { status: 400 },
      );
    }

    const orderData: OrderCreateRequest = {
      ...body,
      customerOrderNumber,
      endCustomerOrderNumber: trimString(body.endCustomerOrderNumber),
      billToAddressId: trimString(body.billToAddressId),
      specialBidNumber: trimString(body.specialBidNumber),
      notes: trimString(body.notes),
      shipToInfo: normalizeAddress(body.shipToInfo),
      endUserInfo: normalizeAddress(body.endUserInfo),
      additionalAttributes: sanitizeAdditionalAttributes(body.additionalAttributes),
      lines: sanitizedLines,
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
