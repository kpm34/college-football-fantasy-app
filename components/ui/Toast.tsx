'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in`}>
      {message}
    </div>
  );
}

export function useToast() {
  const showToast = (message: string, type: ToastType = 'success') => {
    const toastDiv = document.createElement('div');
    toastDiv.className = `fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    } text-white px-6 py-3 rounded-lg shadow-lg`;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    
    setTimeout(() => {
      if (document.body.contains(toastDiv)) {
        document.body.removeChild(toastDiv);
      }
    }, 3000);
  };

  return { showToast };
}