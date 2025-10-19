import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addItem, removeItem, updateQuantity, clearCart, toggleCart, createOrder, setCartOpen } from '../store/cartSlice';
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

  const toggleCartDrawer = () => {
    dispatch(toggleCart());
  };

  const openCartDrawer = () => {
    dispatch(setCartOpen(true));
  };

  const closeCartDrawer = () => {
    dispatch(setCartOpen(false));
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
    toggleCartDrawer,
    openCartDrawer,
    closeCartDrawer,
    createOrderFromCart,
  };
}
