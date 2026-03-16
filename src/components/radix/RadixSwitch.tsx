import * as React from 'react';
import * as Switch from '@radix-ui/react-switch';
import { cnMerge } from '../../utils/cnMerge';

export interface RadixSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    className?: string;
    label?: string;
}

const RadixSwitch: React.FC<RadixSwitchProps> = ({
    checked,
    onChange,
    disabled = false,
    id,
    name,
    className,
    label,
}) => {
    return (
        <div className="flex items-center gap-2">
            <Switch.Root
                id={id}
                name={name}
                checked={checked}
                disabled={disabled}
                onCheckedChange={onChange}
                className={cnMerge(
                    'w-[44px] h-[24px] rounded-full relative transition-all duration-300',
                    'border-none outline-none',
                    checked ? 'bg-primary-500' : 'bg-grey-200',
                    disabled && 'opacity-50 cursor-not-allowed',
                    !disabled && 'cursor-pointer',
                    'focus:outline-none focus:ring-0 focus:ring-offset-0',
                    'dark:bg-grey-700',
                    checked && 'dark:bg-primary-500',
                    className,
                    'flex items-center gap-2',
                )}
            >
                <Switch.Thumb
                    className={cnMerge(
                        'block w-[20px] h-[20px] bg-white rounded-full',
                        'shadow-sm',
                        'transition-transform duration-300 ease-in-out',
                        checked ? 'translate-x-[16px]' : 'translate-x-[-4px]',
                    )}
                    style={{
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    }}
                />
            </Switch.Root>
            {label && <span className="text-sm text-text-primary dark:text-text-primary">{label}</span>}
        </div>
    );
};

RadixSwitch.displayName = 'RadixSwitch';

export default RadixSwitch;
