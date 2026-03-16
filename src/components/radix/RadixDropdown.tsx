import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixDropdownItem {
    label?: string | React.ReactNode;
    value?: string;
    disabled?: boolean;
    onClick?: (e?: Event) => void;
    separator?: boolean;
}

export interface RadixDropdownProps {
    trigger: React.ReactNode;
    items: RadixDropdownItem[];
    className?: string;
    contentClassName?: string;
    itemClassName?: string;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
}

const RadixDropdown: React.FC<RadixDropdownProps> = ({
    trigger,
    items,
    className,
    contentClassName,
    itemClassName,
    align = 'start',
    side = 'bottom',
}) => {
    const contentClasses = cnMerge(
        'min-w-[220px] bg-white rounded-md shadow-lg',
        'border border-border-default p-1 z-[9999]',
        'dark:bg-background-paper dark:border-border-default',
        contentClassName,
    );

    const itemClasses = cnMerge(
        'relative flex items-center px-3 py-2 text-sm',
        'text-text-primary rounded-sm bg-white',
        'cursor-pointer select-none',
        'focus:outline-none hover:bg-grey-100',
        'disabled:opacity-50 disabled:pointer-events-none',
        'transition-colors duration-base',
        'dark:text-text-primary dark:bg-background-paper',
        'dark:hover:bg-grey-800',
        itemClassName,
    );

    const separatorClasses = cnMerge('h-px bg-border-default my-1', 'dark:bg-border-default');

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild className={className}>
                {trigger}
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className={contentClasses} align={align} side={side} sideOffset={5}>
                    {items.map((item, index) => {
                        if (item.separator) {
                            return <DropdownMenu.Separator key={`separator-${index}`} className={separatorClasses} />;
                        }

                        if (!item.label) {
                            return null;
                        }

                        return (
                            <DropdownMenu.Item
                                key={index}
                                className={itemClasses}
                                disabled={item.disabled}
                                onSelect={(e) => {
                                    // Prevent dropdown from closing when clicking on interactive elements
                                    const target = e.target as HTMLElement;
                                    const isInteractiveElement =
                                        target.closest('button') ||
                                        target.closest('input') ||
                                        target.closest('[role="checkbox"]') ||
                                        target.closest('label') ||
                                        target.closest('[data-radix-checkbox-root]');

                                    if (isInteractiveElement) {
                                        e.preventDefault();
                                    }

                                    if (item.onClick && !item.disabled && !isInteractiveElement) {
                                        item.onClick();
                                    }
                                }}
                            >
                                {item.label}
                            </DropdownMenu.Item>
                        );
                    })}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

RadixDropdown.displayName = 'RadixDropdown';
export default RadixDropdown;
