import React from 'react';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    startComponent?: React.ReactNode;
    endComponent?: React.ReactNode;
}

const RadixInput: React.FC<RadixInputProps> = ({
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    startComponent,
    endComponent,
    className = '',
    disabled = false,
    ...props
}) => {
    const hasStartIcon = startIcon || startComponent;
    const hasEndIcon = endIcon || endComponent;

    const inputClasses = cnMerge(
        'h-10',
        'w-full rounded-md',
        'text-base',
        'bg-background-paper py-2 ',
        'text-text-primary placeholder-text-secondary',
        'outline-none focus:outline-none',
        'focus:ring-0 focus:ring-offset-0',
        'appearance-none',
        hasStartIcon ? 'pl-10' : 'pl-4',
        hasEndIcon ? 'pr-10' : 'pr-4',
        error
            ? 'border-[1px] border-solid border-red-500 dark:border-red-500'
            : 'border-[1px] border-solid border-border-default dark:border-grey-600',
        'transition-all duration-base',
        'dark:bg-background-paper dark:text-text-primary',
        disabled && !className.includes('opacity') ? 'opacity-50 cursor-not-allowed' : '',
        className,
    );

    const labelClasses = cnMerge('block text-base font-medium mb-1', 'text-text-secondary', 'dark:text-text-secondary');

    return (
        <div className="w-full">
            {label && <label className={labelClasses}>{label}</label>}
            <div className="relative">
                {hasStartIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {startIcon || startComponent}
                    </div>
                )}
                <input className={inputClasses} disabled={disabled} {...props} />
                {hasEndIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
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

export default RadixInput;
