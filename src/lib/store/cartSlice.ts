import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { CartItem } from '../types';

// Async thunk for creating order
export const createOrder = createAsyncThunk(
  'cart/createOrder',
  async (orderData: {
    customerOrderNumber: string;
    notes?: string;
    lines: Array<{
      customerLineNumber: string;
      ingramPartNumber: string;
      quantity: number;
    }>;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/ingram/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          additionalAttributes: [
            {
              attributeName: 'allowDuplicateCustomerOrderNumber',
              attributeValue: 'true'
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const result = await response.json();
      return result.orderNumber || result.customerOrderNumber;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
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

    createOrderSuccess: (state, action: PayloadAction<string>) => {
      state.isCreatingOrder = false;
      state.lastOrderId = action.payload;
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
        state.lastOrderId = action.payload;
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
