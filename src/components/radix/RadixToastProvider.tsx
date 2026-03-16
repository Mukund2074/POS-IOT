import * as React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { cnMerge } from '../../utils/cnMerge';
import { CheckCircle2, XCircle, Info, AlertCircle } from 'lucide-react';
import { initToast } from '../../utils/toast';

interface ToastItemProps {
    toast: ToastData;
    onClose: () => void;
    variantStyles: Record<string, string>;
    icons: Record<string, React.ComponentType<{ className?: string }>>;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose, variantStyles, icons }) => {
    const duration = toast.duration || 2000;
    const Icon = icons[toast.variant];
    const progressBarRef = React.useRef<HTMLDivElement>(null);
    const onCloseRef = React.useRef(onClose);

    // Update ref when onClose changes
    React.useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    React.useEffect(() => {
        const startTime = Date.now();
        let animationFrameId: number;
        let isMounted = true;

        const updateProgress = () => {
            if (!isMounted) return;

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            const progressPercent = (remaining / duration) * 100;

            if (progressBarRef.current) {
                progressBarRef.current.style.transform = `scaleX(${progressPercent / 100})`;
            }

            if (remaining > 0) {
                animationFrameId = requestAnimationFrame(updateProgress);
            } else {
                onCloseRef.current();
            }
        };

        animationFrameId = requestAnimationFrame(updateProgress);
        const closeTimer = setTimeout(() => {
            if (isMounted) {
                onCloseRef.current();
            }
        }, duration);

        return () => {
            isMounted = false;
            cancelAnimationFrame(animationFrameId);
            clearTimeout(closeTimer);
        };
    }, [duration, toast.id]); // Only depend on duration and toast.id, not onClose

    return (
        <Toast.Root
            open={true}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            duration={duration}
            className={cnMerge(
                'rounded-md shadow-lg p-4 relative overflow-hidden',
                'border border-solid',
                'flex items-start gap-3',
                'data-[state=open]:animate-slideIn',
                'data-[state=closed]:animate-hide',
                'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
                'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out]',
                'data-[swipe=end]:animate-swipeOut',
                variantStyles[toast.variant],
            )}
        >
            {/* Progress bar */}
            <div
                className={cnMerge(
                    'absolute bottom-0 left-0 right-0 h-1',
                    toast.variant === 'success'
                        ? 'bg-secondary-200 dark:bg-secondary-800'
                        : toast.variant === 'error'
                          ? 'bg-red-200 dark:bg-red-800'
                          : toast.variant === 'info'
                            ? 'bg-primary-200 dark:bg-primary-800'
                            : 'bg-yellow-200 dark:bg-yellow-800',
                )}
            >
                <div
                    ref={progressBarRef}
                    className={cnMerge(
                        'h-full',
                        toast.variant === 'success'
                            ? 'bg-secondary-500 dark:bg-secondary-400'
                            : toast.variant === 'error'
                              ? 'bg-red-500 dark:bg-red-400'
                              : toast.variant === 'info'
                                ? 'bg-primary-500 dark:bg-primary-400'
                                : 'bg-yellow-500 dark:bg-yellow-400',
                    )}
                    style={{ transform: 'scaleX(1)', transformOrigin: 'left' }}
                />
            </div>
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <Toast.Title className="text-sm font-semibold mb-1 leading-tight">{toast.title}</Toast.Title>
                )}
                <Toast.Description className="text-sm opacity-90 leading-tight">{toast.description}</Toast.Description>
            </div>
        </Toast.Root>
    );
};

export interface ToastData {
    id: string;
    title?: string;
    description: string;
    variant: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface RadixToastProviderProps {
    children: React.ReactNode;
}

const RadixToastProvider: React.FC<RadixToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = React.useState<ToastData[]>([]);

    const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Initialize toast utility
    React.useEffect(() => {
        initToast({
            success: (message: string, options?: { title?: string; duration?: number }) => {
                addToast({
                    description: message,
                    title: options?.title,
                    variant: 'success',
                    duration: options?.duration || 2000,
                });
            },
            error: (message: string, options?: { title?: string; duration?: number }) => {
                addToast({
                    description: message,
                    title: options?.title,
                    variant: 'error',
                    duration: options?.duration || 2000,
                });
            },
            info: (message: string, options?: { title?: string; duration?: number }) => {
                addToast({
                    description: message,
                    title: options?.title,
                    variant: 'info',
                    duration: options?.duration || 2000,
                });
            },
            warning: (message: string, options?: { title?: string; duration?: number }) => {
                addToast({
                    description: message,
                    title: options?.title,
                    variant: 'warning',
                    duration: options?.duration || 2000,
                });
            },
        });
    }, [addToast]);

    const variantStyles = {
        success:
            'bg-secondary-50 text-secondary-700 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-300 dark:border-secondary-700',
        error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700',
        info: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-700',
        warning:
            'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700',
    };

    const icons = {
        success: CheckCircle2,
        error: XCircle,
        info: Info,
        warning: AlertCircle,
    };

    return (
        <Toast.Provider swipeDirection="right" duration={2000}>
            {children}
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                    variantStyles={variantStyles}
                    icons={icons}
                />
            ))}
            <Toast.Viewport
                className={cnMerge(
                    'fixed top-0 right-0 z-[9999]',
                    'flex flex-col gap-2 p-4',
                    'w-full max-w-[420px]',
                    'max-h-[100vh]',
                    'm-0 list-none',
                    'outline-none',
                )}
            />
        </Toast.Provider>
    );
};

RadixToastProvider.displayName = 'RadixToastProvider';

export default RadixToastProvider;
