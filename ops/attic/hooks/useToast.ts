'use client';

export type ToastType = 'success' | 'error' | 'info';

export function useToast() {
  const showToast = (message: string, type: ToastType = 'success', duration = 3000) => {
    if (typeof window === 'undefined') return;
    const toastDiv = document.createElement('div');
    toastDiv.className = `fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white px-6 py-3 rounded-lg shadow-lg`;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    window.setTimeout(() => {
      if (document.body.contains(toastDiv)) document.body.removeChild(toastDiv);
    }, duration);
  };

  return { showToast };
}



