import React from 'react';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    titleClassName?: string;
    descriptionClassName?: string;
}

const RadixCard: React.FC<RadixCardProps> = ({
    children,
    className,
    title,
    description,
    icon,
    onClick,
    titleClassName,
    descriptionClassName,
}) => {
    const cardClasses = cnMerge(
        'bg-background-paper rounded-lg',
        'border border-border-default',
        'transition-all duration-base',
        'dark:bg-background-paper dark:border-border-default',
        onClick ? 'cursor-pointer hover:shadow-md' : '',
        !className?.includes('!p-') && 'p-2',
        className,
    );

    return (
        <div className={cardClasses} onClick={onClick}>
            {icon && <div className="mb-1">{icon}</div>}
            {title && (
                <h3
                    className={cnMerge(
                        'font-semibold mb-0.5',
                        'text-text-primary',
                        'dark:text-text-primary',
                        titleClassName,
                    )}
                >
                    {title}
                </h3>
            )}
            {description && (
                <p className={cnMerge('mb-1', 'text-text-secondary', 'dark:text-text-secondary', descriptionClassName)}>
                    {description}
                </p>
            )}
            {children}
        </div>
    );
};

export default RadixCard;
