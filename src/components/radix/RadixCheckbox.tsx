'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cnMerge } from '@/utils/cnMerge';
import { FiCheck } from 'react-icons/fi';

export interface RadixCheckboxProps {
    checked?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string | React.ReactNode;
    labelClass?: string;
    className?: string;
}

const RadixCheckbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, RadixCheckboxProps>(
    ({ className, checked, disabled, onChange, label, labelClass, ...props }, ref) => (
        <div
            className={cnMerge('flex items-center gap-2 cursor-pointer', className)}
            onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                onChange?.(!checked as boolean);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    if (disabled) return;
                    onChange?.(!checked as boolean);
                }
            }}
        >
            <CheckboxPrimitive.Root
                ref={ref}
                className={cnMerge(
                    'w-5 h-5 min-w-5 min-h-5',
                    'data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500',
                    'dark:bg-grey-700 dark:border-grey-700',
                    !checked && 'bg-transparent',
                    checked && 'dark:bg-primary-500 dark:border-primary-500 bg-primary-500',
                    disabled && 'opacity-50 cursor-not-allowed',
                    !disabled && 'cursor-pointer',
                    'focus:outline-none focus:ring-0 !focus:ring-offset-0 !shadow-none !ring-0 !ring-offset-0 ',
                    'border-[1px] border-solid border-border-default rounded-sm ',
                    'p-0 m-0',
                )}
                checked={checked}
                disabled={disabled}
                {...props}
            >
                <CheckboxPrimitive.Indicator className={cnMerge('flex items-center justify-center')}>
                    <FiCheck className=" text-white font-bold w-4 h-4" />
                </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
            {label && (
                <label
                    className={cnMerge('text-sm text-text-primary dark:text-text-primary cursor-pointer', labelClass)}
                >
                    {label}
                </label>
            )}
        </div>
    ),
);
RadixCheckbox.displayName = 'RadixCheckbox';
export default RadixCheckbox;
