import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
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

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart, 
  toggleCart, 
  setCartOpen 
} = cartSlice.actions;
