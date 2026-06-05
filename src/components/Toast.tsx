/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />
  };

  const bgColors = {
    success: 'bg-white/95 border-emerald-200 text-slate-800 shadow-2xl',
    error: 'bg-white/95 border-rose-200 text-slate-800 shadow-2xl',
    warning: 'bg-white/95 border-amber-200 text-slate-800 shadow-2xl',
    info: 'bg-white/95 border-sky-200 text-slate-800 shadow-2xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex gap-3 p-4 rounded-lg border ${bgColors[toast.type]} backdrop-blur-sm relative`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-xs">
        {toast.title && <p className="font-extrabold text-slate-900 mb-0.5">{toast.title}</p>}
        <p className="text-slate-600 leading-snug font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-slate-800 p-1 hover:bg-slate-100 rounded-full transition absolute top-2 right-2 cursor-pointer"
        title="Đóng"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
