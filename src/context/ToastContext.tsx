import React, { useState, useCallback, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext, type ToastType } from './toastContextDef';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, type = 'success' }: { title: string; description?: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4200);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <aside aria-label="Notifications" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl shadow-2xl bg-[#1B1B19] text-[#FAF7F0] border border-[#C5A880]/30 backdrop-blur-md"
            >
              <div className="mt-0.5 shrink-0">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#C5A880]" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-[#FAF7F0]/80" />}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium tracking-wide text-[#FAF7F0]">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-[#FAF7F0]/70 leading-relaxed font-sans">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-[#FAF7F0]/40 hover:text-[#FAF7F0] transition-colors rounded-md"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </aside>
    </ToastContext.Provider>
  );
};
