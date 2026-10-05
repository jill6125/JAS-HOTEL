import React, { useState, useEffect, type ReactNode } from 'react';
import type { CartItem, MenuItem, OrderType } from '../types';
import { CartContext } from './cartContextDef';

const CART_STORAGE_KEY = 'jas_hotel_cart_v1';
const CART_META_KEY = 'jas_hotel_cart_meta';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderType, setOrderType] = useState<OrderType>(() => {
    try {
      const saved = localStorage.getItem(CART_META_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.orderType || 'room_service';
      }
      return 'room_service';
    } catch {
      return 'room_service';
    }
  });

  const [roomNumber, setRoomNumber] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CART_META_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.roomNumber || '';
      }
      return '';
    } catch {
      return '';
    }
  });

  const [specialInstructions, setSpecialInstructions] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CART_META_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.specialInstructions || '';
      }
      return '';
    } catch {
      return '';
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Sync items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist cart items to localStorage', e);
    }
  }, [items]);

  // Sync metadata to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_META_KEY,
        JSON.stringify({ orderType, roomNumber, specialInstructions })
      );
    } catch (e) {
      console.warn('Failed to persist cart metadata to localStorage', e);
    }
  }, [orderType, roomNumber, specialInstructions]);

  const addItem = (item: MenuItem, quantity: number = 1, notes: string = '') => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.menuItem.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          notes: notes || updated[existingIndex].notes,
        };
        return updated;
      }
      return [...prev, { menuItem: item, quantity, notes }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((ci) =>
        ci.menuItem.id === itemId ? { ...ci, quantity } : ci
      )
    );
  };

  const updateNotes = (itemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((ci) =>
        ci.menuItem.id === itemId ? { ...ci, notes } : ci
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setSpecialInstructions('');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const tax = Number((subtotal * 0.1).toFixed(2)); // standard 10% hospitality dining tax
  const total = Number((subtotal + tax).toFixed(2));

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        totalItems,
        subtotal,
        tax,
        total,
        orderType,
        setOrderType,
        roomNumber,
        setRoomNumber,
        specialInstructions,
        setSpecialInstructions,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
