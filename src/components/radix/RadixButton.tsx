import React from 'react';
import * as Slot from '@radix-ui/react-slot';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
    buttonType?: 'website' | 'mobile';
    iconOnly?: boolean;
    asChild?: boolean;
    className?: string;
    children: React.ReactNode;
    disabled?: boolean;
}

/**
 * =====================================================================
 * New Architecture
 * =====================================================================
 *
 * 1. All sizing values are converted into CSS variables.
 * 2. Tailwind classes reference only the variables.
 * 3. This ensures className overrides always work.
 * 4. Inline styles are removed except for CSS variables.
 *
 * =====================================================================
 */

const RadixButton = React.forwardRef<HTMLButtonElement, RadixButtonProps>(
    (
        {
            variant = 'primary',
            size = 'base',
            buttonType = 'website',
            iconOnly = false,
            asChild = false,
            className,
            children,
            disabled,
            style,
            ...props
        },
        ref,
    ) => {
        /**
         * ================================================================
         * 1. Lookup tables for sizing
         * ================================================================
         */

        // sizes use pure numbers → CSS variables later
        const textSizeTable = {
            website: {
                xs: { h: 34, px: 12, py: 8, fs: 12, is: 12 },
                sm: { h: 37, px: 12, py: 8.5, fs: 14, is: 12 },
                base: { h: 41, px: 12, py: 10.5, fs: 14, is: 14 },
                lg: { h: 48, px: 12, py: 12, fs: 16, is: 16 },
                xl: { h: 52, px: 12, py: 14, fs: 16, is: 16 },
            },
            mobile: {
                xs: { h: 30, px: 12, py: 6, fs: 12, is: 12 },
                sm: { h: 32, px: 12, py: 6, fs: 14, is: 12 },
                base: { h: 36, px: 12, py: 8, fs: 14, is: 14 },
                lg: { h: 40, px: 12, py: 8, fs: 16, is: 16 },
                xl: { h: 44, px: 12, py: 10, fs: 16, is: 16 },
            },
        };

        const iconSizeTable = {
            website: {
                xs: { h: 20, p: 4, fs: 12 },
                sm: { h: 28, p: 8, fs: 12 },
                base: { h: 34, p: 10, fs: 14 },
                lg: { h: 40, p: 12, fs: 16 },
                xl: { h: 44, p: 14, fs: 16 },
            },
            mobile: {
                xs: { h: 20, p: 4, fs: 12 },
                sm: { h: 24, p: 6, fs: 12 },
                base: { h: 30, p: 8, fs: 14 },
                lg: { h: 36, p: 10, fs: 16 },
                xl: { h: 44, p: 14, fs: 16 },
            },
        };

        const selectedSize = iconOnly ? iconSizeTable[buttonType][size] : textSizeTable[buttonType][size];

        /**
         * ================================================================
         * 2. Variant classes (pure Tailwind, no inline styles)
         * ================================================================
         */
        const variantClasses = {
            primary:
                'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 dark:active:bg-primary-700',
            secondary:
                'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 dark:bg-secondary-500 dark:hover:bg-secondary-600 dark:active:bg-secondary-700',
            outline:
                'text-text-primary bg-transparent hover:bg-grey-50 active:bg-grey-100 dark:hover:bg-grey-800 dark:active:bg-grey-700',
            ghost: 'bg-transparent text-text-primary hover:bg-grey-100 active:bg-grey-200 dark:hover:bg-grey-800 dark:active:bg-grey-700',
            danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700',
        };

        /**
         * ================================================================
         * 3. Base structural classes
         * ================================================================
         */
        const baseClasses = cnMerge(
            '!font-[urbanist] font-semibold',
            'inline-flex items-center justify-center select-none cursor-pointer',
            'rounded-md',
            'transition-all duration-base',
            '!focus:outline-none !focus:ring-0 !shadow-none',
            'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
            'border-[1px] border-solid border-border-default',
            !iconOnly && 'min-w-[120px]',
        );

        /**
         * ================================================================
         * 4. Tailwind classes for sizing (using CSS vars)
         * ================================================================
         */
        const sizeClasses = iconOnly
            ? 'h-[var(--h)] w-[var(--h)] p-[var(--p)] btn-fs'
            : 'h-[var(--h)] px-[var(--px)] py-[var(--py)] btn-fs';

        /**
         * ================================================================
         * 5. CSS Variables — exposed so users can override easily
         * ================================================================
         */
        const cssVars: React.CSSProperties = {
            '--h': `${selectedSize.h}px`,
            '--fs': `${selectedSize.fs}px`,
        } as React.CSSProperties;

        if (iconOnly) {
            (cssVars as Record<string, string>)['--p'] = `${(selectedSize as { p: number }).p}px`;
        } else {
            (cssVars as Record<string, string>)['--px'] = `${(selectedSize as { px: number }).px}px`;
            (cssVars as Record<string, string>)['--py'] = `${(selectedSize as { py: number }).py}px`;
        }

        let finalVariantClasses = variantClasses[variant];
        const hasTextColorOverride =
            className && /(^|\s)(!?text-\[[^\]]+\]|!?text-[\w-]+(-\d+)?|\[&.*text-)/.test(className);
        const hasBackgroundColorOverride =
            className && /(^|\s)(!?bg-\[[^\]]+\]|!?bg-[\w-]+(-\d+)?|\[&.*bg-)/.test(className);

        if (hasTextColorOverride) {
            finalVariantClasses = finalVariantClasses
                .split(' ')
                .filter((cls) => !cls.match(/^(dark:)?(hover:|active:)?text-/))
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        if (hasBackgroundColorOverride) {
            finalVariantClasses = finalVariantClasses
                .split(' ')
                .filter((cls) => !cls.match(/^(dark:)?(hover:|active:)?bg-/))
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        const combinedClassName = cnMerge(baseClasses, finalVariantClasses, sizeClasses, className);

        const combinedStyle: React.CSSProperties = {
            ...cssVars,
            ...style,
        };

        /**
         * ================================================================
         * 6. Render — Slot or button
         * ================================================================
         */
        if (asChild) {
            return (
                <Slot.Root ref={ref} className={combinedClassName} style={combinedStyle} {...props}>
                    {children}
                </Slot.Root>
            );
        }

        return (
            <button
                ref={ref}
                className={combinedClassName}
                style={combinedStyle}
                disabled={disabled}
                type={props.type || 'button'}
                {...props}
            >
                {children}
            </button>
        );
    },
);

RadixButton.displayName = 'RadixButton';
export default RadixButton;
