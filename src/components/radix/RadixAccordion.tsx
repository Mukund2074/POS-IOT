import * as React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { cnMerge } from '../../utils/cnMerge';
import ChevronRightIcon from '@/assets/Marketing/ChevronRight.svg';

export interface RadixAccordionProps {
    title: React.ReactNode;
    children: React.ReactNode;
    value: string;
    defaultOpen?: boolean;
    open?: boolean;
    onChange?: (open: boolean) => void;
    disabled?: boolean;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
    bgColor?: string;
    asItem?: boolean;
    titleClassName?: string;
    hideIcon?: boolean;
}

const RadixAccordion: React.FC<RadixAccordionProps> = ({
    title,
    children,
    value,
    defaultOpen,
    open,
    onChange,
    disabled = false,
    className,
    triggerClassName,
    contentClassName,
    asItem = false,
    titleClassName,
    hideIcon = false,
}) => {
    const itemContent = (
        <Accordion.Item
            value={value}
            className={cnMerge(
                'rounded-[10px] overflow-hidden bg-background-paper w-full',
                'outline-none ring-0 ring-offset-0 ',
                className,
            )}
            style={{ border: '1px solid var(--color-border-default)' }}
        >
            {/* Trigger */}
            <Accordion.Trigger
                disabled={disabled}
                className={cnMerge(
                    'group w-full flex items-center justify-between border-none',
                    'text-left font-medium select-none',
                    'transition-all duration-200',
                    'rounded-[10px] data-[state=open]:rounded-t-[10px] data-[state=open]:rounded-b-none',
                    'bg-background-paper',
                    'text-text-primary',
                    'dark:text-text-primary',
                    'p-3',
                    'outline-none ring-0 ring-offset-0',
                    // Check if triggerClassName has opacity override before applying disabled opacity
                    disabled && (!triggerClassName || !triggerClassName.includes('opacity')) ? 'opacity-50' : '',
                    !disabled && 'cursor-pointer',
                    triggerClassName,
                )}
            >
                <span className={cnMerge('text-text-primary font-medium dark:text-text-primary', titleClassName)}>
                    {title}
                </span>

                {/* Arrow Icon */}
                {!hideIcon && (
                    <img
                        src={ChevronRightIcon}
                        alt="Chevron Down"
                        className={cnMerge(
                            'w-5 h-5 text-text-secondary',
                            'transition-transform duration-300 ease-in-out rotate-[90deg]',
                            'group-data-[state=open]:rotate-[270deg]',
                            'dark:text-text-secondary',
                        )}
                    />
                )}
                {/* <KeyboardArrowDown
                    className={cnMerge(
                        'w-5 h-5 text-text-secondary',
                        'transition-transform duration-300 ease-in-out',
                        'group-data-[state=open]:rotate-180',
                        'dark:text-text-secondary',
                    )}
                /> */}
            </Accordion.Trigger>

            {/* Content */}
            <Accordion.Content
                className={cnMerge(
                    'overflow-hidden transition-all duration-300',
                    'data-[state=open]:animate-slideDown',
                    'data-[state=closed]:animate-slideUp',
                    'bg-background-paper rounded-b-[10px]',
                    contentClassName,
                )}
            >
                <div className="px-3 py-2">{children}</div>
            </Accordion.Content>
        </Accordion.Item>
    );

    if (asItem) {
        return itemContent;
    }

    return (
        <Accordion.Root
            type="single"
            collapsible
            defaultValue={defaultOpen ? value : undefined}
            value={open ? value : undefined}
            onValueChange={(val) => {
                if (!disabled) {
                    onChange?.(val === value);
                }
            }}
            className={cnMerge('w-full', className)}
        >
            {itemContent}
        </Accordion.Root>
    );
};

RadixAccordion.displayName = 'RadixAccordion';

export default RadixAccordion;
