import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types/product';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  searchQuery: string;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  searchQuery: '',
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTotalPages: (state, action: PayloadAction<number>) => {
      state.totalPages = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.totalPages = 0;
      state.currentPage = 1;
      state.searchQuery = '';
    },
  },
});

export const {
  setProducts,
  setLoading,
  setError,
  setTotalPages,
  setCurrentPage,
  setSearchQuery,
  clearProducts,
} = productsSlice.actions;

export default productsSlice.reducer;
export { productsSlice };
