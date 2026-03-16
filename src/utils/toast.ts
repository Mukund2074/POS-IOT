/**
 * Toast utility that mimics react-toastify API
 * Uses Radix Toast under the hood
 */

interface ToastOptions {
    title?: string;
    duration?: number;
}

let toastMethods: {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
} | null = null;

// Initialize toast methods (called by RadixToastProvider)
export const initToast = (methods: typeof toastMethods) => {
    toastMethods = methods;
};

export const toast = {
    success: (message: string, options?: ToastOptions) => {
        if (toastMethods) {
            toastMethods.success(message, options);
        } else {
            console.warn('Toast not initialized. Make sure RadixToastProvider is mounted.');
        }
    },
    error: (message: string, options?: ToastOptions) => {
        if (toastMethods) {
            toastMethods.error(message, options);
        } else {
            console.warn('Toast not initialized. Make sure RadixToastProvider is mounted.');
        }
    },
    info: (message: string, options?: ToastOptions) => {
        if (toastMethods) {
            toastMethods.info(message, options);
        } else {
            console.warn('Toast not initialized. Make sure RadixToastProvider is mounted.');
        }
    },
    warning: (message: string, options?: ToastOptions) => {
        if (toastMethods) {
            toastMethods.warning(message, options);
        } else {
            console.warn('Toast not initialized. Make sure RadixToastProvider is mounted.');
        }
    },
};

