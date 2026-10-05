import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastContextType {
  toast: (options: { title: string; description?: string; type?: ToastType }) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
