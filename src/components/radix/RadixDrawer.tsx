import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cnMerge } from '../../utils/cnMerge';
import CloseIconSvg from '@/assets/Marketing/Close.svg';

export interface RadixDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
    descriptionClassName?: string;
    titleClassName?: string;
    position?: 'left' | 'right' | 'bottom';
}

const RadixDrawer: React.FC<RadixDrawerProps> = ({
    open,
    onOpenChange,
    title,
    description,
    children,
    className = '',
    showCloseButton = true,
    descriptionClassName = '',
    titleClassName = '',
    position = 'right',
}) => {
    const isLeft = position === 'left';
    const isRight = position === 'right';
    const isBottom = position === 'bottom';

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange} modal={true}>
            <Dialog.Portal>
                <Dialog.Overlay className={cnMerge('fixed inset-0 bg-black/50 z-[9998]', 'dark:bg-black/70')} />
                <Dialog.Content
                    className={cnMerge(
                        'fixed bg-background-paper shadow-xl p-1 md:p-6',
                        'border border-border-default',
                        'focus:outline-none z-[9999]',

                        isBottom
                            ? 'bottom-0 left-0 right-0 top-auto max-h-[80vh] rounded-t-2xl rounded-b-none w-full max-w-full'
                            : isLeft
                              ? 'top-0 left-0 bottom-0 right-auto w-full max-w-[70dvw] h-full'
                              : 'top-0 right-0 bottom-0 left-auto w-full max-w-[70dvw] h-full',
                        className,
                    )}
                >
                    {showCloseButton && (
                        <button
                            type="button"
                            className={cnMerge(
                                'absolute cursor-pointer border-none',
                                'bg-black text-white',
                                'w-[40px] h-[40px] rounded-full',
                                'flex justify-center items-center',
                                'hover:bg-black/80 transition-colors',
                                'focus:outline-none focus:ring-0',
                                isLeft
                                    ? '-right-16 top-1/2 -translate-y-1/2'
                                    : isRight
                                      ? '-left-16 top-1/2 -translate-y-1/2'
                                      : '-top-16 right-1/2 -translate-x-1/2',
                            )}
                            onClick={() => onOpenChange(false)}
                        >
                            <img src={CloseIconSvg} alt="Close" className="w-4 h-4 brightness-0 invert" />
                        </button>
                    )}
                    {/* For side drawers (left/right), don't show title/description here - let children handle it */}
                    {isBottom && title && (
                        <Dialog.Title
                            className={cnMerge(
                                'text-lg font-semibold m-0 ',
                                'text-text-primary',
                                'dark:text-text-primary',
                                'text-2xl',
                                titleClassName,
                            )}
                        >
                            {title}
                        </Dialog.Title>
                    )}
                    {isBottom && description && (
                        <Dialog.Description
                            className={cnMerge(
                                'text-sm',
                                'text-text-secondary',
                                'dark:text-text-secondary',
                                descriptionClassName,
                            )}
                        >
                            {description}
                        </Dialog.Description>
                    )}
                    <div className="w-full h-full overflow-y-auto">{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default RadixDrawer;
