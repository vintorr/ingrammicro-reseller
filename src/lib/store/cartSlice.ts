import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type {
  CartItem,
  OrderCreateAdditionalAttribute,
  OrderCreateEndUserInfo,
  OrderCreateResponse,
  OrderCreateShipToInfo,
  OrderCreateVendorManagedFulfillment,
  OrderCreateResellerInfo,
  OrderCreateShipmentDetails,
} from '../types';

export interface CartOrderPayload {
  customerOrderNumber: string;
  endCustomerOrderNumber?: string;
  billToAddressId?: string;
  specialBidNumber?: string;
  notes?: string;
  acceptBackOrder?: boolean | 'true' | 'false';
  resellerInfo?: OrderCreateResellerInfo;
  vmf?: OrderCreateVendorManagedFulfillment;
  shipToInfo?: OrderCreateShipToInfo;
  endUserInfo?: OrderCreateEndUserInfo;
  shipmentDetails?: OrderCreateShipmentDetails;
  lines: Array<{
    customerLineNumber: string;
    ingramPartNumber: string;
    quantity: number;
  }>;
  additionalAttributes?: OrderCreateAdditionalAttribute[];
}

export interface CreateOrderResult {
  orderId: string;
  customerOrderNumber: string;
  response: OrderCreateResponse;
}

// Async thunk for creating order
export const createOrder = createAsyncThunk<CreateOrderResult, CartOrderPayload, { rejectValue: string }>(
  'cart/createOrder',
  async (orderData: CartOrderPayload, { rejectWithValue }) => {
    try {
      const mergedAttributes: OrderCreateAdditionalAttribute[] = [
        ...(orderData.additionalAttributes ?? []),
      ];

      if (!mergedAttributes.some((attribute) => attribute.attributeName === 'allowDuplicateCustomerOrderNumber')) {
        mergedAttributes.push({
          attributeName: 'allowDuplicateCustomerOrderNumber',
          attributeValue: 'true',
        });
      }

      const cleanedAttributes = mergedAttributes.filter(
        (attribute) => Boolean(attribute.attributeName && attribute.attributeValue),
      );

      const requestPayload: CartOrderPayload = {
        ...orderData,
        additionalAttributes: cleanedAttributes,
        acceptBackOrder:
          typeof orderData.acceptBackOrder === 'boolean'
            ? String(orderData.acceptBackOrder) as 'true' | 'false'
            : orderData.acceptBackOrder,
      };

      if (requestPayload.acceptBackOrder === undefined) {
        delete requestPayload.acceptBackOrder;
      }

      const response = await fetch('/api/ingram/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to checkout order. Try again later.');
      }

      const result: OrderCreateResponse = await response.json();
      const ingramOrderNumber =
        result.orders?.find((order) => order.ingramOrderNumber)?.ingramOrderNumber ??
        result.orders?.[0]?.ingramOrderNumber;

      const resultPayload: CreateOrderResult = {
        orderId: ingramOrderNumber || result.customerOrderNumber || orderData.customerOrderNumber,
        customerOrderNumber: result.customerOrderNumber || orderData.customerOrderNumber,
        response: result,
      };

      return resultPayload;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to checkout order. Try again later.');
    }
  }
);

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  isCreatingOrder: boolean;
  lastOrderId: string | null;
  lastCustomerOrderNumber: string | null;
  lastOrderResponse: OrderCreateResponse | null;
  orderError: string | null;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
  isCreatingOrder: false,
  lastOrderId: null,
  lastCustomerOrderNumber: null,
  lastOrderResponse: null,
  orderError: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item => item.product.ingramPartNumber === action.payload.product.ingramPartNumber
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      } else {
        state.items.push(action.payload);
      }

      // Recalculate totals
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
      state.tax = state.subtotal * 0.08; // 8% tax rate
      state.total = state.subtotal + state.tax;
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        item => item.product.ingramPartNumber !== action.payload
      );
      
      // Recalculate totals
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
      state.tax = state.subtotal * 0.08;
      state.total = state.subtotal + state.tax;
    },

    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(
        item => item.product.ingramPartNumber === action.payload.productId
      );
      
      if (item) {
        item.quantity = action.payload.quantity;
        item.totalPrice = item.quantity * item.unitPrice;
        
        // Recalculate totals
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
        state.tax = state.subtotal * 0.08;
        state.total = state.subtotal + state.tax;
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.tax = 0;
      state.total = 0;
    },

    createOrderStart: (state) => {
      state.isCreatingOrder = true;
      state.orderError = null;
    },

    createOrderSuccess: (state, action: PayloadAction<CreateOrderResult>) => {
      state.isCreatingOrder = false;
      state.lastOrderId = action.payload.orderId;
      state.lastCustomerOrderNumber = action.payload.customerOrderNumber;
      state.lastOrderResponse = action.payload.response;
      state.orderError = null;
      // Clear cart after successful order
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.tax = 0;
      state.total = 0;
    },

    createOrderFailure: (state, action: PayloadAction<string>) => {
      state.isCreatingOrder = false;
      state.orderError = action.payload;
    },

    clearOrderError: (state) => {
      state.orderError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreatingOrder = true;
        state.orderError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreatingOrder = false;
        state.lastOrderId = action.payload.orderId;
        state.lastCustomerOrderNumber = action.payload.customerOrderNumber;
        state.lastOrderResponse = action.payload.response;
        state.orderError = null;
        // Clear cart after successful order
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
        state.tax = 0;
        state.total = 0;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.orderError = action.payload as string;
      });
  },
});

export const { 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart, 
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  clearOrderError
} = cartSlice.actions;
