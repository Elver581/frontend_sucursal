import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  const showToast = useCallback((message, duration) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    showToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const { message, type } = toast;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white border-l-4 border-green-500 shadow-lg',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          title: 'Éxito'
        };
      case 'error':
        return {
          bg: 'bg-white border-l-4 border-red-500 shadow-lg',
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          title: 'Error'
        };
      case 'warning':
        return {
          bg: 'bg-white border-l-4 border-yellow-500 shadow-lg',
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          title: 'Advertencia'
        };
      case 'info':
      default:
        return {
          bg: 'bg-white border-l-4 border-blue-500 shadow-lg',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          title: 'Información'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`${styles.bg} rounded-r-lg p-4 transform transition-all duration-500 ease-in-out animate-slide-in-right hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">
              {styles.title}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {message}
            </p>
          </div>
        </div>
        
        <button
          onClick={onRemove}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
