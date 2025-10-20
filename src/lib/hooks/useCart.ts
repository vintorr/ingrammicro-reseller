import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addItem, removeItem, updateQuantity, clearCart, createOrder } from '../store/cartSlice';
import type { CartItem } from '../types';

export function useCart() {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);

  const addToCart = (item: CartItem) => {
    dispatch(addItem(item));
  };

  const removeFromCart = (productId: string) => {
    dispatch(removeItem(productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeItem(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity }));
    }
  };

  const clearCartItems = () => {
    dispatch(clearCart());
  };

  const createOrderFromCart = async (customerOrderNumber: string, notes?: string) => {
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const lines = cart.items.map((item, index) => ({
      customerLineNumber: (index + 1).toString(),
      ingramPartNumber: item.product.ingramPartNumber,
      quantity: item.quantity,
    }));

    return dispatch(createOrder({
      customerOrderNumber,
      notes,
      lines,
    })).unwrap();
  };

  return {
    ...cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCartItems,
    createOrderFromCart,
  };
}
