import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixTooltipProps {
    title: React.ReactNode;
    children?: React.ReactElement;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    className?: string;
}

const RadixTooltip: React.FC<RadixTooltipProps> = ({
    title,
    children,
    side = 'top',
    align = 'center',
    delayDuration = 200,
    className,
}) => {
    if (!title) return <>{children}</>;

    return (
        <Tooltip.Provider delayDuration={delayDuration}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        side={side}
                        align={align}
                        sideOffset={6}
                        className={cnMerge(
                            'z-50 max-w-xs rounded-md bg-background-paper backdrop-blur-sm px-2.5 py-1.5 text-xs text-text-primary shadow-lg border border-border-default',
                            'animate-in fade-in-0 zoom-in-95',
                            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                            className,
                        )}
                    >
                        {title}
                        <Tooltip.Arrow className="fill-background-paper" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default RadixTooltip;
