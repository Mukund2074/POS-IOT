import React from 'react';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixBadgeProps {
    children?: React.ReactNode;
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
    size?: 'sm' | 'md';
    rounded?: boolean;
    className?: string;
}

const variantStyles = {
    default:
        'bg-background-paper text-text-primary border border-border-default',

    success:
        'bg-green-500/10 text-green-600 border border-green-500/20',

    danger:
        'bg-red-500/10 text-red-600 border border-red-500/20',

    warning:
        'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',

    info:
        'bg-blue-500/10 text-blue-600 border border-blue-500/20',
};

const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
};

const RadixBadge: React.FC<RadixBadgeProps> = ({
    children,
    variant = 'default',
    size = 'sm',
    rounded = true,
    className,
}) => {
    return (
        <span
            className={cnMerge(
                'inline-flex items-center font-medium transition-colors',
                rounded ? 'rounded-full' : 'rounded-md',
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
        >
            {children}
        </span>
    );
};

export default RadixBadge;
