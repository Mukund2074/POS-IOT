import React from 'react';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    startComponent?: React.ReactNode;
    endComponent?: React.ReactNode;
    rows?: number;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
    ref?: React.Ref<HTMLTextAreaElement>;
}

const RadixTextarea: React.FC<RadixTextareaProps> = ({
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    startComponent,
    endComponent,
    className = '',
    rows = 4,
    resize = 'vertical',
    ref,
    ...props
}) => {
    const hasStartIcon = startIcon || startComponent;
    const hasEndIcon = endIcon || endComponent;

    const textareaClasses = cnMerge(
        'w-full rounded-md',
        'bg-background-paper py-2 text-sm',
        'text-text-primary placeholder-text-secondary',
        'outline-none focus:outline-none',
        'focus:ring-0 focus:ring-offset-0',
        'appearance-none',
        hasStartIcon ? 'pl-10' : 'pl-4',
        hasEndIcon ? 'pr-10' : 'pr-4',
        resize === 'none' && 'resize-none',
        resize === 'both' && 'resize',
        resize === 'horizontal' && 'resize-x',
        resize === 'vertical' && 'resize-y',
        error
            ? 'border-[1px] border-solid border-red-500 dark:border-red-500'
            : 'border-[1px] border-solid border-border-default dark:border-grey-600',
        'disabled:opacity-50 disabled:bg-grey-50',
        'transition-all duration-base',
        'dark:bg-background-paper dark:text-text-primary',
        className,
    );

    const labelClasses = cnMerge('block text-sm font-medium mb-1', 'text-text-primary', 'dark:text-text-primary');

    return (
        <div className="w-full">
            {label && <label className={labelClasses}>{label}</label>}
            <div className="relative">
                {hasStartIcon && (
                    <div className="absolute left-3 top-3 flex items-center pointer-events-none">
                        {startIcon || startComponent}
                    </div>
                )}
                <textarea ref={ref} rows={rows} className={textareaClasses} {...props} />
                {hasEndIcon && (
                    <div className="absolute right-3 top-3 flex items-center pointer-events-none">
                        {endIcon || endComponent}
                    </div>
                )}
            </div>
            {error && <p className={cnMerge('mt-1 text-sm text-red-500', 'dark:text-red-400')}>{error}</p>}
            {helperText && !error && (
                <p className={cnMerge('mt-1 text-sm text-text-secondary', 'dark:text-text-secondary')}>{helperText}</p>
            )}
        </div>
    );
};

RadixTextarea.displayName = 'RadixTextarea';

export default RadixTextarea;
