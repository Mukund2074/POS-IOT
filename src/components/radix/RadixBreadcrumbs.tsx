import React from 'react';
import { cnMerge } from '../../utils/cnMerge';
import ChevronRightIcon from '../../assets/Marketing/ChevronRight.svg';

export interface RadixBreadcrumbItem {
    label: string;
    href?: string;
    onClick?: () => void;
    isCurrentPage?: boolean;
}

export interface RadixBreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
    items: RadixBreadcrumbItem[];
    separator?: React.ReactNode;
    startSeparator?: React.ReactNode;
    className?: string;
    listClassName?: string;
    itemClassName?: string;
    linkClassName?: string;
    separatorClassName?: string;
    startSeparatorClassName?: string;
}

/**
 * RadixBreadcrumbs - A reusable and modifiable breadcrumbs component
 *
 * @example
 * ```tsx
 * <RadixBreadcrumbs
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Category', href: '/category' },
 *     { label: 'Current Page', isCurrentPage: true }
 *   ]}
 * />
 * ```
 */
const RadixBreadcrumbs = React.forwardRef<HTMLElement, RadixBreadcrumbsProps>(
    (
        {
            items,
            separator,
            startSeparator,
            className,
            listClassName,
            itemClassName,
            linkClassName,
            separatorClassName,
            startSeparatorClassName,
            ...props
        },
        ref,
    ) => {
        const defaultSeparator = (
            <img
                src={ChevronRightIcon}
                alt="chevron right"
                className="h-4 w-4 text-text-secondary dark:text-text-secondary"
            />
        );

        const separatorElement = separator !== undefined ? separator : defaultSeparator;

        const baseClasses = cnMerge('flex items-center justify-start', className);
        const listClasses = cnMerge('flex items-center m-0 gap-2', listClassName);
        const itemClasses = cnMerge('flex items-center m-0', itemClassName);

        // Inactive breadcrumb classes (matching inactive tab styling)
        const inactiveLinkClasses = cnMerge(
            'cursor-pointer bg-transparent hover:bg-transparent',
            ' transition-colors duration-200',
            'border-none border-transparent',
            'no-underline m-0 p-0',
            'text-text-secondary dark:text-text-secondary',
            'hover:text-text-primary dark:hover:text-text-primary',
            linkClassName,
        );

        // Active breadcrumb classes (matching active tab styling)
        const activeLinkClasses = cnMerge('', 'border-b-[2px]', 'cursor-default', 'm-0 p-0', linkClassName);

        const separatorClasses = cnMerge(
            'mx-1 flex items-center',
            'text-text-secondary dark:text-text-secondary',
            '',
            separatorClassName,
        );

        const startSeparatorClasses = cnMerge(
            'mr-1 flex items-center',
            'text-text-secondary dark:text-text-secondary',
            '',
            startSeparatorClassName,
        );

        return (
            <nav ref={ref as React.RefObject<HTMLElement>} aria-label="breadcrumb" className={baseClasses} {...props}>
                <span className={listClasses}>
                    {startSeparator && (
                        <li className={startSeparatorClasses} role="presentation" aria-hidden="true">
                            {typeof startSeparator === 'boolean' ? (
                                <img
                                    src={ChevronRightIcon}
                                    alt="chevron right"
                                    className="h-4 w-4 text-text-secondary dark:text-text-secondary"
                                />
                            ) : (
                                startSeparator
                            )}
                        </li>
                    )}
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        const isCurrent = item.isCurrentPage || isLast;

                        return (
                            <React.Fragment key={index}>
                                <li className={itemClasses}>
                                    {item.href && !isCurrent ? (
                                        <a
                                            href={item.href}
                                            className={inactiveLinkClasses}
                                            onClick={(e) => {
                                                if (item.onClick) {
                                                    e.preventDefault();
                                                    item.onClick();
                                                }
                                            }}
                                        >
                                            {item.label}
                                        </a>
                                    ) : item.onClick && !isCurrent ? (
                                        <span
                                            className={cnMerge(inactiveLinkClasses, 'cursor-pointer m-0 p-0')}
                                            onClick={item.onClick}
                                        >
                                            {item.label}
                                        </span>
                                    ) : (
                                        <span
                                            className={cnMerge(activeLinkClasses, 'm-0 p-0')}
                                            aria-current={isCurrent ? 'page' : undefined}
                                        >
                                            {item.label}
                                        </span>
                                    )}
                                </li>
                                {!isLast && (
                                    <li className={separatorClasses} role="presentation" aria-hidden="true">
                                        {separatorElement}
                                    </li>
                                )}
                            </React.Fragment>
                        );
                    })}
                </span>
            </nav>
        );
    },
);

RadixBreadcrumbs.displayName = 'RadixBreadcrumbs';

export default RadixBreadcrumbs;
