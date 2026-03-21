import React, { useEffect, useRef, useState } from 'react';
import { InputAdornment, MenuItem, Select, TextField, TextFieldProps } from '@mui/material';
import { t } from 'i18next';
import { CountryList, CountryListSchema } from '../../../data/CountrylistTyped';
import { formatMobileNumber } from '../../../utils/POS/Functions';

interface PhoneValue {
    country_code: string;
    phone: string;
    countryISOCode: string;
}

interface POSPhoneFieldProps extends Omit<TextFieldProps, 'onChange'> {
    value?: PhoneValue;
    onChange: (value: string) => void;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    id?: string;
    showCopyButton?: boolean;
    handleCopy?: () => void;
    name?: string;
    fontColor?: string;
    placeholder?: string;
    disabled?: boolean;
    disabledSelect?: boolean;
    borderColor?: string;
    placeholderFontSize?: string;
    inputFontSize?: string;
    size?: 'small' | 'medium';
    borderThickness?: string;
    sx?: any;
    onCountryChange?: (code: string, countryISOCode: string) => void;
}

export default function POSPhoneField({
    value = { country_code: '+91', phone: '', countryISOCode: 'IN' },
    onChange,
    onBlur,
    id,
    showCopyButton,
    handleCopy,
    name,
    fontColor = 'black',
    placeholder,
    disabled = false,
    disabledSelect = false,
    borderColor = '#D9D9D9',
    placeholderFontSize = '1rem',
    inputFontSize = '1rem',
    size = 'small',
    borderThickness = '1px',
    sx,
    onCountryChange = () => {},
    ...props
}: POSPhoneFieldProps) {
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
        if (value?.country_code && CountryList[value?.countryISOCode as keyof typeof CountryList]) {
            setSelectedCountry(CountryList[value?.countryISOCode as keyof typeof CountryList]);
        } else {
            setSelectedCountry(CountryList['IN']);
        }
    }, [value?.country_code, value?.countryISOCode]);

    return (
        <TextField
            {...props}
            value={formatMobileNumber(value?.phone)}
            type="tel"
            size={size}
            sx={{
                border: `${borderThickness} solid ${borderColor}`,
                borderRadius: 4,
                '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${borderThickness} solid ${borderColor}`,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${borderThickness} solid ${borderColor}`,
                },
                '& input': {
                    color: fontColor,
                    fontSize: inputFontSize,
                },
                '& input::placeholder': {
                    color: '#747474',
                    fontSize: placeholderFontSize,
                    opacity: 1,
                },
                '.css-2u11ia-MuiInputBase-input-MuiOutlinedInput-input': {
                    padding: 0,
                },
                '.css-w76bbz-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input': {
                    p: 0,
                },
                width: { xs: '100%', md: '100%' },
                backgroundColor: 'white',
                ...sx,
            }}
            disabled={disabled}
            id={id}
            inputProps={{
                maxLength: selectedCountry?.formatLength,
                inputMode: 'numeric',
                pattern: '[0-9]*',
            }}
            onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, '');
                onChange(onlyNumbers);
            }}
            placeholder={t('Common.MobileNumber')}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Select
                                value={selectedCountry.id}
                                disabled={disabledSelect}
                                onChange={(e) => {
                                    const newCountry = CountryList[e.target.value as keyof typeof CountryList];
                                    setSelectedCountry(newCountry);
                                    onCountryChange(newCountry?.code, newCountry?.id);
                                }}
                                sx={{ p: 0, m: 0, cursor: disabledSelect ? 'not-allowed' : 'pointer' }}
                                renderValue={() => selectedCountry.code}
                                MenuProps={{
                                    onKeyDown: handleKeyDown,
                                }}
                            >
                                {Object.entries(CountryList)
                                    .sort((a, b) => a[1].name.localeCompare(b[1].name))
                                    .map(([key, value]) => (
                                        <MenuItem
                                            key={key}
                                            value={value.id}
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                        >
                                            {/* <img src={value.url} alt="" style={{ width: '25px', marginRight: 5 }} /> */}
                                            <span style={{ fontSize: '14px', minWidth: '35px' }}> {value.code} </span>
                                            <span style={{ fontSize: '14px' }}> {value.name} </span>
                                        </MenuItem>
                                    ))}
                            </Select>
                        </InputAdornment>
                    ),
                },
            }}
            onBlur={onBlur}
        />
    );
}
