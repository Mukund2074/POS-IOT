import * as React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixAccordionGroupProps {
    /** Children - should be RadixAccordion components with asItem={true} */
    children: React.ReactNode;
    /** Controlled value - the value(s) of the currently open accordion(s) */
    value?: string | string[] | undefined;
    /** Callback when the open accordion changes */
    onValueChange?: (value: string | string[] | undefined) => void;
    /** Additional className for the root */
    className?: string;
    /** Whether accordion is collapsible (can close all) */
    collapsible?: boolean;
    /** Accordion type - 'single' allows only one open, 'multiple' allows multiple open */
    type?: 'single' | 'multiple';
    /** Default value(s) for uncontrolled mode */
    defaultValue?: string | string[];
}

const RadixAccordionGroup: React.FC<RadixAccordionGroupProps> = ({
    children,
    value,
    onValueChange,
    className,
    collapsible = true,
    type = 'single',
    defaultValue,
}) => {
    if (type === 'multiple') {
        return (
            <Accordion.Root
                type="multiple"
                value={value as string[] | undefined}
                defaultValue={defaultValue as string[] | undefined}
                onValueChange={(val) => {
                    onValueChange?.(val);
                }}
                className={cnMerge('w-full', className)}
            >
                {children}
            </Accordion.Root>
        );
    }

    return (
        <Accordion.Root
            type="single"
            collapsible={collapsible}
            value={value as string | undefined}
            defaultValue={defaultValue as string | undefined}
            onValueChange={(val) => {
                onValueChange?.(val || undefined);
            }}
            className={cnMerge('w-full', className)}
        >
            {children}
        </Accordion.Root>
    );
};

RadixAccordionGroup.displayName = 'RadixAccordionGroup';

export default RadixAccordionGroup;
