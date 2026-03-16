import * as React from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { cnMerge } from '../../utils/cnMerge';

if (typeof document !== 'undefined') {
    const styleId = 'radix-radio-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            [data-radix-radio-item][data-state="checked"] {
                border-color: rgb(250, 135, 60) !important;
            }
            [data-radix-radio-item]:not([data-state="checked"]) {
                border-color: rgb(224, 224, 224) !important;
            }
            [data-radix-radio-item] {
                outline: none !important;
                box-shadow: none !important;
            }
            [data-radix-radio-item]:focus {
                outline: none !important;
                box-shadow: none !important;
            }
            [data-radix-radio-item]:focus-visible {
                outline: none !important;
                box-shadow: none !important;
            }
            [data-radix-radio-item]:active {
                outline: none !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
    }
}

const radioItemClassName =
    'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 bg-transparent border-solid border-[1.5px] border-border-default data-[state=checked]:border-primary-500 focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none active:ring-0 !shadow-none !ring-0 !ring-offset-0 !outline-none';

export interface RadixRadioProps {
    value: string;
    label?: string | React.ReactNode;
    className?: string;
    labelClass?: string;
    itemClassName?: string;
    disabled?: boolean;
    id?: string;
    onChange?: (value: string) => void;
    standalone?: boolean;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const RadixRadio: React.FC<RadixRadioProps> = ({
    value,
    label,
    className,
    itemClassName,
    labelClass,
    disabled = false,
    id,
    onChange,
    standalone = false,
    checked = false,
    onCheckedChange,
}) => {
    const generatedId = React.useId();
    const radioId = id || `radix-radio-${value}-${generatedId}`;

    const itemClasses = cnMerge(
        radioItemClassName,
        itemClassName,
        disabled && !itemClassName?.includes('opacity') && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
    );

    if (standalone) {
        return (
            <span
                role="button"
                tabIndex={0}
                onClick={() => !disabled && onCheckedChange?.(!checked)}
                className={cnMerge('flex items-center gap-2 cursor-pointer', className)}
            >
                <span
                    className={cnMerge(itemClasses, checked && '!border-primary-500')}
                    style={{ outline: 'none', boxShadow: 'none' }}
                    data-state={checked ? 'checked' : 'unchecked'}
                >
                    {checked && (
                        <span className="flex items-center justify-center">
                            <span className="w-3 h-3 rounded-full bg-primary-500" />
                        </span>
                    )}
                </span>
                {label && (
                    <label htmlFor={radioId} className={cnMerge('cursor-pointer', labelClass)}>
                        {label}
                    </label>
                )}
            </span>
        );
    }

    return (
        <div className={cnMerge('flex items-center gap-2', className)}>
            <RadioGroup.Item
                value={value}
                id={radioId}
                disabled={disabled}
                className={itemClasses}
                style={{
                    outline: 'none',
                    boxShadow: 'none',
                }}
            >
                <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                </RadioGroup.Indicator>
            </RadioGroup.Item>
            {label && (
                <label
                    htmlFor={radioId}
                    className={cnMerge(
                        'text-sm text-text-primary dark:text-text-primary select-none',
                        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                        labelClass,
                    )}
                >
                    {label}
                </label>
            )}
        </div>
    );
};

RadixRadio.displayName = 'RadixRadio';

export interface RadixRadioGroupProps {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

const RadixRadioGroup: React.FC<RadixRadioGroupProps> = ({
    value,
    onValueChange,
    defaultValue,
    children,
    className,
    disabled = false,
}) => {
    return (
        <RadioGroup.Root
            value={value}
            onValueChange={onValueChange}
            defaultValue={defaultValue}
            disabled={disabled}
            className={cnMerge('flex flex-col', 'gap-3', className)}
        >
            {children}
        </RadioGroup.Root>
    );
};

RadixRadioGroup.displayName = 'RadixRadioGroup';

export { RadixRadioGroup };
export default RadixRadio;
