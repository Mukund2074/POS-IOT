import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cnMerge } from '../../utils/cnMerge';
import CloseIconSvg from '@/assets/Marketing/Close.svg';
import { useMediaQuery } from '@/hooks/shared';

export interface RadixDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    children?: React.ReactNode;
    /** Optional footer content (e.g. buttons), fixed at bottom. */
    footer?: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
    descriptionClassName?: string;
    titleClassName?: string;
    position?: 'center' | 'bottom';
    contentClassName?: string;
    footerClassName?: string;
    headerClassName?: string;
}

const RadixDialog: React.FC<RadixDialogProps> = ({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    className = '',
    showCloseButton = true,
    descriptionClassName = '',
    titleClassName = '',
    position,
    contentClassName = '',
    footerClassName = '',
    headerClassName = '',
}) => {
    const isDesktop = useMediaQuery('(min-width: 960px)');

    const [modalPosition, setModalPosition] = useState<'center' | 'bottom'>('center');

    useEffect(() => {
        // if (position !== undefined) {
        //     setModalPosition(position);
        // } else {
        //     setModalPosition(isMd ? 'bottom' : 'center');
        // }

        setModalPosition(position || 'center');
    }, [isDesktop, position]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange} modal={true}>
            <Dialog.Portal>
                <Dialog.Overlay className={cnMerge('fixed inset-0 bg-black/50 z-[9998]', 'dark:bg-black/70')} />
                <Dialog.Content
                    className={cnMerge(
                        'fixed bg-background-paper shadow-xl',
                        'border border-border-default',
                        'focus:outline-none z-[9999]',
                        'flex flex-col',
                        modalPosition === 'bottom'
                            ? 'bottom-0 left-0 right-0 top-auto rounded-t-2xl rounded-b-none w-full max-w-full max-h-[85vh]'
                            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md md:rounded-lg w-[90vw] max-w-md max-h-[98vh]',
                        className,
                    )}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    {showCloseButton && modalPosition !== 'center' && (
                        <button
                            type="button"
                            className={cnMerge(
                                'absolute cursor-pointer border-none',
                                'bg-black text-white',
                                'w-[40px] h-[40px] rounded-full',
                                'flex justify-center items-center',
                                'hover:bg-black/80 transition-colors',
                                'focus:outline-none focus:ring-0',
                                '-top-16 left-1/2 -translate-x-1/2',
                            )}
                            onClick={() => onOpenChange(false)}
                        >
                            <img src={CloseIconSvg} alt="Close" className="w-4 h-4 brightness-0 invert" />
                        </button>
                    )}
                    {/* Header: fixed at top */}
                    <div
                        className={cnMerge(
                            'flex-shrink-0 p-3 border-0 border-b-[1px] border-border-default border-solid',
                            headerClassName,
                        )}
                    >
                        {title && (
                            <Dialog.Title
                                className={cnMerge(
                                    showCloseButton && modalPosition === 'center' && 'space-between flex items-center',
                                    'text-lg font-semibold m-0',
                                    'text-text-primary',
                                    'dark:text-text-primary',
                                    'text-2xl',
                                    titleClassName,
                                )}
                            >
                                <div className="flex-1">{title}</div>
                                {showCloseButton && modalPosition === 'center' && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenChange(false)}
                                        className={cnMerge(
                                            'cursor-pointer border-none bg-transparent p-0 flex items-center justify-center',
                                        )}
                                    >
                                        <img src={CloseIconSvg} alt="Close" className="w-4 h-4 " />
                                    </button>
                                )}
                            </Dialog.Title>
                        )}
                    </div>

                    {description && (
                        <Dialog.Description
                            className={cnMerge(
                                'text-sm m-0',
                                'text-text-secondary',
                                'dark:text-text-secondary',
                                'p-3',
                                descriptionClassName,
                            )}
                        >
                            {description}
                        </Dialog.Description>
                    )}
                    {/* Content: scrollable only */}
                    {children && (
                        <div
                            className={cnMerge(
                                'flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hidden w-full p-4',
                                contentClassName,
                            )}
                        >
                            {children}
                        </div>
                    )}
                    {/* Footer: fixed at bottom (e.g. buttons) */}
                    {footer != null && (
                        <div
                            className={cnMerge(
                                'flex items-center justify-end',
                                'p-2',
                                'border-0 border-t-[1px] border-border-default border-solid',
                                footerClassName,
                            )}
                        >
                            {footer}
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default RadixDialog;
