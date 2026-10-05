import { createContext } from 'react';
import type { CartItem, MenuItem, OrderType } from '../types';

export interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  roomNumber: string;
  setRoomNumber: (room: string) => void;
  specialInstructions: string;
  setSpecialInstructions: (instructions: string) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
