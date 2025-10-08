import { configureStore } from '@reduxjs/toolkit';
import { cartSlice } from './cartSlice';
import authReducer from './authSlice';
import productsReducer from './productsSlice';

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    auth: authReducer,
    products: productsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
