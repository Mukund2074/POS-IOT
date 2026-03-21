import React, { useEffect, useRef, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { KeyboardArrowDown, Check } from '@mui/icons-material';
import { cnMerge } from '../../utils/cnMerge';
import { CountryList, CountryListSchema } from '../../data/CountrylistTyped';
import { formatMobileNumber } from '../../utils/POS/Functions';
import { t } from 'i18next';

function getCountryByIso(iso: string | undefined): CountryListSchema | undefined {
    if (!iso) return undefined;
    const key = iso.toUpperCase() as keyof typeof CountryList;
    return CountryList[key];
}

export interface PhoneValue {
    country_code: string;
    phone: string;
    countryISOCode: string;
}

export interface RadixPhoneFieldProps {
    value?: PhoneValue;
    onChange?: (value: PhoneValue) => void;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    id?: string;
    name?: string;
    label?: string;
    error?: string;
    helperText?: string;
    placeholder?: string;
    disabled?: boolean;
    disabledSelect?: boolean;
    className?: string;
    onCountryChange?: (code: string, countryISOCode: string) => void;
}

const RadixPhoneField: React.FC<RadixPhoneFieldProps> = ({
    value = { country_code: '+91', phone: '', countryISOCode: 'IN' },
    onChange,
    onBlur,
    id,
    name,
    label,
    error,
    helperText,
    placeholder,
    disabled = false,
    disabledSelect = false,
    className,
    onCountryChange = () => {},
}) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryListSchema>(CountryList['IN']);
    const searchStringRef = useRef('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
            e.stopPropagation();

            searchStringRef.current += e.key.toLowerCase();

            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            searchTimeoutRef.current = setTimeout(() => {
                searchStringRef.current = '';
            }, 500);

            const matchingCountry = Object.values(CountryList).find((country) =>
                country.name.toLowerCase().startsWith(searchStringRef.current),
            );

            if (matchingCountry) {
                const menuElement = e.currentTarget;
                const menuItem = menuElement.querySelector(`[data-value="${matchingCountry.id}"]`);

                if (menuItem) {
                    (menuItem as HTMLElement).focus();
                    (menuItem as HTMLElement).scrollIntoView({ block: 'nearest' });
                }
            }
        }
    };

    useEffect(() => {
        setSelectedCountry(getCountryByIso(value?.countryISOCode) ?? CountryList['IN']);
    }, [value?.countryISOCode]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const onlyNumbers = e.target.value.replace(/\D/g, '');
        if (onChange) {
            onChange({
                ...value,
                phone: onlyNumbers,
            });
        }
    };

    const handleCountryChange = (countryISOCode: string) => {
        if (!countryISOCode) return;
        const newCountry = getCountryByIso(countryISOCode);
        if (!newCountry) return;
        setSelectedCountry(newCountry);
        if (onChange) {
            onChange({
                ...value,
                country_code: newCountry.code,
                countryISOCode: newCountry.id,
            });
        }
        onCountryChange(newCountry.code, newCountry.id);
    };

    const inputClasses = cnMerge(
        'w-full rounded-md h-10',
        'bg-background-paper py-2 text-sm',
        'text-text-primary placeholder-text-secondary',
        'outline-none focus:outline-none',
        'focus:ring-0 focus:ring-offset-0',
        'appearance-none',
        'pl-24 pr-4',
        error
            ? 'border-[1px] border-solid border-red-500 dark:border-red-500'
            : 'border-[1px] border-solid border-border-default dark:border-grey-600',
        'disabled:opacity-50 disabled:bg-grey-50',
        'transition-all duration-base',
        'dark:bg-background-paper dark:text-text-primary',
        className,
    );

    const labelClasses = cnMerge('block text-sm font-medium mb-1', 'text-text-primary', 'dark:text-text-primary');

    return (
        <div className="w-full">
            {label && <label className={labelClasses}>{label}</label>}
            <div className="relative">
                {/* Country Code Selector */}
                <div className="absolute left-0 top-0 h-10 flex items-center z-10">
                    <Select.Root
                        value={selectedCountry?.id ?? 'IN'}
                        onValueChange={handleCountryChange}
                        disabled={disabledSelect || disabled}
                    >
                        <Select.Trigger
                            className={cnMerge(
                                'h-10 px-3 rounded-l-md rounded-r-none',
                                'border-r-0 border-[1px] border-solid border-border-default',
                                'bg-background-paper text-text-primary',
                                'hover:bg-grey-50 focus:outline-none',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                'dark:bg-background-paper dark:text-text-primary',
                                'dark:hover:bg-grey-800',
                                'flex items-center justify-center',
                                error && 'border-red-500 dark:border-red-500',
                            )}
                        >
                            <Select.Value>{selectedCountry?.code ?? CountryList.IN.code}</Select.Value>
                            <Select.Icon className="ml-1">
                                <KeyboardArrowDown
                                    className={cnMerge(
                                        'w-4 h-4 text-text-secondary transition-transform duration-200',
                                        'dark:text-text-secondary',
                                    )}
                                />
                            </Select.Icon>
                        </Select.Trigger>

                        <Select.Portal>
                            <Select.Content
                                className={cnMerge(
                                    'overflow-hidden rounded-md shadow-lg',
                                    'bg-background-paper',
                                    'z-[10000]',
                                    'dark:bg-background-paper',
                                )}
                                position="popper"
                                sideOffset={4}
                                onKeyDown={handleKeyDown}
                            >
                                <Select.Viewport className="p-1 max-h-[300px] overflow-y-auto">
                                    {Object.entries(CountryList)
                                        .sort((a, b) => a[1].name.localeCompare(b[1].name))
                                        .map(([key, country]) => (
                                            <Select.Item
                                                key={key}
                                                value={country.id}
                                                data-value={country.id}
                                                className={cnMerge(
                                                    'relative flex items-center px-4 py-2 rounded-md',
                                                    'text-text-primary cursor-pointer select-none',
                                                    'hover:bg-grey-50 focus:bg-grey-50',
                                                    'focus:outline-none',
                                                    'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
                                                    'dark:text-text-primary dark:hover:bg-grey-800 dark:focus:bg-grey-800',
                                                    selectedCountry?.id === country.id &&
                                                        'bg-primary-50 dark:bg-primary-900/20',
                                                )}
                                            >
                                                <span className="text-sm min-w-[50px]">{country.code}</span>
                                                <span className="text-sm">{country.name}</span>
                                                <Select.ItemIndicator className="ml-auto">
                                                    <Check className="w-4 h-4 text-primary-500" />
                                                </Select.ItemIndicator>
                                            </Select.Item>
                                        ))}
                                </Select.Viewport>
                            </Select.Content>
                        </Select.Portal>
                    </Select.Root>
                </div>

                {/* Phone Input */}
                <input
                    id={id}
                    name={name}
                    type="tel"
                    value={formatMobileNumber(value?.phone || '')}
                    onChange={handlePhoneChange}
                    onBlur={onBlur}
                    placeholder={placeholder || t('Common.MobileNumber')}
                    disabled={disabled}
                    maxLength={selectedCountry?.formatLength}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={inputClasses}
                />
            </div>
            {error && <p className={cnMerge('mt-1 text-sm text-red-500', 'dark:text-red-400')}>{error}</p>}
            {helperText && !error && (
                <p className={cnMerge('mt-1 text-sm text-text-secondary', 'dark:text-text-secondary')}>{helperText}</p>
            )}
        </div>
    );
};

RadixPhoneField.displayName = 'RadixPhoneField';

export default RadixPhoneField;
