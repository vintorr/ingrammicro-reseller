import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addItem, removeItem, updateQuantity, clearCart, toggleCart } from '../store/cartSlice';
import type { CartItem } from '../types';

export function useCart() {
  const dispatch = useDispatch();
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

  const toggleCartDrawer = () => {
    dispatch(toggleCart());
  };

  return {
    ...cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCartItems,
    toggleCartDrawer,
  };
}
