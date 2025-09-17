import toast from 'react-hot-toast';

// Success toast
export const showSuccess = (message) => {
  toast.success(message);
};

// Error toast
export const showError = (message) => {
  toast.error(message);
};

// Info toast
export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
    },
  });
};

// Warning toast
export const showWarning = (message) => {
  toast(message, {
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
    },
  });
};

// Loading toast
export const showLoading = (message) => {
  return toast.loading(message);
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Promise toast - automatically handles loading, success, and error states
export const showPromiseToast = (promise, messages) => {
  return toast.promise(promise, {
    loading: messages.loading || 'Loading...',
    success: messages.success || 'Success!',
    error: messages.error || 'Something went wrong!',
  });
};