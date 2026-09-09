import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const toastStoreSet = new Set();
const listeners = new Set();

const subscribe = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notify = (message, type = 'info', duration = 3000) => {
  const id = Date.now();
  const toast = { id, message, type };
  
  toastStoreSet.add(toast);
  listeners.forEach((listener) => listener(Array.from(toastStoreSet)));

  if (duration > 0) {
    setTimeout(() => {
      toastStoreSet.delete(toast);
      listeners.forEach((listener) => listener(Array.from(toastStoreSet)));
    }, duration);
  }

  return id;
};

export const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  };

  const backgrounds = {
    success: 'bg-green-50 dark:bg-green-900',
    error: 'bg-red-50 dark:bg-red-900',
    info: 'bg-blue-50 dark:bg-blue-900',
    warning: 'bg-yellow-50 dark:bg-yellow-900',
  };

  const borders = {
    success: 'border-green-200 dark:border-green-700',
    error: 'border-red-200 dark:border-red-700',
    info: 'border-blue-200 dark:border-blue-700',
    warning: 'border-yellow-200 dark:border-yellow-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`${backgrounds[type]} ${borders[type]} border rounded-lg p-4 flex items-start gap-3 shadow-lg max-w-sm`}
    >
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const handleRemove = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  subscribe(setToasts);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => handleRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const toast = {
  success: (message, duration = 3000) => notify(message, 'success', duration),
  error: (message, duration = 5000) => notify(message, 'error', duration),
  info: (message, duration = 3000) => notify(message, 'info', duration),
  warning: (message, duration = 4000) => notify(message, 'warning', duration),
};

export const useToast = () => {
  return toast;
};
