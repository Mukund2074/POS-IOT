import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { cnMerge } from '../../utils/cnMerge';
import RadixButton from './RadixButton';

export interface RadixTabsProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    items: Array<{
        value: string;
        label: string;
        disabled?: boolean;
    }>;
    children?: React.ReactNode;
    className?: string;
    listClassName?: string;
    triggerClassName?: string;
}

const RadixTabs: React.FC<RadixTabsProps> = ({
    defaultValue,
    value,
    onValueChange,
    items,
    children,
    className,
    listClassName,
    triggerClassName,
}) => {
 

    return (
        <div  className="radix-tabs-container">
            <Tabs.Root
                className={cnMerge('w-full', className)}
                defaultValue={defaultValue}
                value={value}
            >
                <Tabs.List className={cnMerge('flex flex-row gap-1 ps-12 md:ps-6 border-none', listClassName)}>
                    {items.map((item) => (
                        <RadixButton
                            key={item.value}
                            value={item.value}
                            disabled={item.disabled}
                            onClick={() => onValueChange?.(item.value)}
                            className={cnMerge(
                                'appearance-none bg-transparent border-0 outline-none cursor-pointer rounded-none',
                                item.value === value ? 'border-t-0 border-x-0 border-b-[3px] border-primary-500 text-primary-500 border-b-solid' : 'border-none text-text-secondary' ,
                                // text
                                'px-4 pb-4 mt-2',

                                'text-md', // font size
                                'font-medium', // font weight

                                // disabled + transition
                                'transition-colors duration-200',
                                'disabled:opacity-50 disabled:pointer-events-none',

                                'min-w-fit',

                                triggerClassName,
                            )}
                        >
                            {item.label}
                        </RadixButton>
                    ))}
                </Tabs.List>

                {children}
            </Tabs.Root>
        </div>
    );
};

export default RadixTabs;
