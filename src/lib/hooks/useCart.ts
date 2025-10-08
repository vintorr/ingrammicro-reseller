import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addItem, removeItem, updateQuantity, clearCart, toggleCart, createOrder } from '../store/cartSlice';
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
    }) as any);
  };

  return {
    ...cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCartItems,
    toggleCartDrawer,
    createOrderFromCart,
  };
}
