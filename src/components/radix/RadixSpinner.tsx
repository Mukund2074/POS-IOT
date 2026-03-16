import React from 'react';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixSpinnerProps {
    /**
     * Size of the spinner
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Color variant
     * @default 'primary'
     */
    variant?: 'primary' | 'secondary' | 'white' | 'inherit';

    /**
     * Additional className
     */
    className?: string;
}

const RadixSpinner: React.FC<RadixSpinnerProps> = ({ size = 'md', variant = 'primary', className }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const strokeWidth = {
        sm: '2',
        md: '3',
        lg: '4',
    };

    const getVariantColor = () => {
        switch (variant) {
            case 'primary':
                return '#FA873C'; // primary-500
            case 'secondary':
                return '#666666'; // secondary-500
            case 'white':
                return '#FFFFFF';
            case 'inherit':
                return 'currentColor';
            default:
                return '#FA873C';
        }
    };

    // MUI CircularProgress style - creates a ~75% arc with rounded edges
    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference * 0.75; // 75% of circle visible
    const strokeDashoffset = circumference * 0.25; // Start at 25% offset

    return (
        <svg
            className={cnMerge(sizeClasses[size], className)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="status"
            aria-label="Loading"
            style={{
                animation: 'spin 1.4s linear infinite',
            }}
        >
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <circle
                cx="12"
                cy="12"
                r={radius}
                stroke={getVariantColor()}
                strokeWidth={strokeWidth[size]}
                strokeLinecap="round"
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
            />
        </svg>
    );
};

RadixSpinner.displayName = 'RadixSpinner';

export default RadixSpinner;
