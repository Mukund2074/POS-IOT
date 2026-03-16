import * as React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { cnMerge } from '../../utils/cnMerge';
import { CheckCircle2, XCircle, Info, AlertCircle } from 'lucide-react';

export interface RadixToastProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    variant?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    className?: string;
}

const RadixToast: React.FC<RadixToastProps> = ({
    open,
    onOpenChange,
    title,
    description,
    variant = 'info',
    duration = 2000,
    className,
}) => {
    const variantStyles = {
        success: 'bg-secondary-500 text-white border-secondary-600',
        error: 'bg-red-500 text-white border-red-600',
        info: 'bg-primary-500 text-white border-primary-600',
        warning: 'bg-yellow-500 text-white border-yellow-600',
    };

    const icons = {
        success: CheckCircle2,
        error: XCircle,
        info: Info,
        warning: AlertCircle,
    };

    const Icon = icons[variant];

    return (
        <Toast.Provider swipeDirection="right" duration={duration}>
            <Toast.Root
                open={open}
                onOpenChange={onOpenChange}
                className={cnMerge(
                    'rounded-md shadow-lg p-4',
                    'border border-solid',
                    'flex items-start gap-3',
                    'data-[state=open]:animate-slideIn',
                    'data-[state=closed]:animate-hide',
                    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
                    'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out]',
                    'data-[swipe=end]:animate-swipeOut',
                    variantStyles[variant],
                    className,
                )}
            >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    {title && <Toast.Title className="text-sm font-semibold mb-1 leading-tight">{title}</Toast.Title>}
                    {description && (
                        <Toast.Description className="text-sm opacity-90 leading-tight">
                            {description}
                        </Toast.Description>
                    )}
                </div>
            </Toast.Root>
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

RadixToast.displayName = 'RadixToast';

export default RadixToast;
