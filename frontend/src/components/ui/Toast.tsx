/**
 * Toast notification component for user feedback
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type = 'info', duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeStyles = {
    info: 'bg-blue-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-orange-600 text-white',
    error: 'bg-red-600 text-white',
  };

  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
        'border border-white/20 backdrop-blur-sm',
        'max-w-sm min-w-[250px]',
        typeStyles[type]
      )}
    >
      <span className="text-lg flex-shrink-0">{typeIcons[type]}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-white/80 hover:text-white text-lg leading-none ml-2"
        aria-label="Close notification"
      >
        ×
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
