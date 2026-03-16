import { InputAdornment, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { CountryList } from '../../data/CountryList';
import { t } from 'i18next';
import { formatPhoneNumber } from '../calanderComponents/booking/utils/functions';

export default function FPhonePicker({
    value = { country_code: '+45', phone: '', country_iso_code: 'DK' },
    onBlur,
    onChange,
    id,
    showCopyButton,
    // borderRadius = "10px",
    handleCopy,
    name,
    fontColor = 'black',
    placeholder,
    disabled = false,
    borderColor = '#D9D9D9',
    placeholderFontSize = '1rem',
    inputFontSize = '1rem',
    size = 'small',
    borderThickness = '1px',
    sx,
    onCountryChange = () => {},
    ...props
}) {
    const [selectedCountry, setSelectedCountry] = useState(CountryList['DK']);
    const searchStringRef = useRef('');
    const searchTimeoutRef = useRef(null);

    // const countryList = CountryListFunction();
    // console.log('countryList', countryList);.

    // const CountryListFunction = async () => {
    //     const response = await fetch('https://countriesnow.space/api/v0.1/countries/codes');
    //     const data = await response.json();
    //     const countryList = data?.data?.reduce((acc, country) => {
    //         const formattedCode = country.dial_code.replace('+', '').replace(' ', '');
    //         acc[`${country.code}`] = {
    //             id: country.code,
    //             name: country.name,
    //             code: `+${formattedCode}`,
    //             url: `https://flagcdn.com/w320/${country.code.toLowerCase()}.png`,
    //             phoneLength: CountryList[Number(formattedCode)]?.phoneLength || 14,
    //             formatLength: CountryList[Number(formattedCode)]?.formatLength || 14,
    //         };
    //         return acc;
    //     }, {});
    //     console.log('countryList', JSON.stringify(countryList));
    //     return countryList;
    // };
    // useEffect(() => {
    //     CountryListFunction();
    // }, []);

    const handleKeyDown = (e) => {
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
                    menuItem.focus();
                    menuItem.scrollIntoView({ block: 'nearest' });
                }
            }
        }
    };
    useEffect(() => {
        if (value?.country_iso_code && CountryList[value?.country_iso_code]) {
            setSelectedCountry(CountryList[value?.country_iso_code]);
        } else {
            setSelectedCountry(CountryList['DK']);
        }
    }, [value?.country_iso_code]);

    return (
        <React.Fragment>
            <TextField
                {...props}
                value={formatPhoneNumber(value?.phone)}
                type="tel"
                size={size}
                width={{ xs: '100%', md: '100%' }}
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
                inputProps={{ maxLength: selectedCountry?.formatLength, inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // This ensures only numbers are allowed
                    onChange(value);
                }}
                placeholder={t('Common.MobileNumber')}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <Select
                                    value={selectedCountry?.id || 'DK'}
                                    onChange={(e) => {
                                        setSelectedCountry(CountryList[e.target.value]);
                                        onCountryChange({
                                            country_code: CountryList[e.target.value]?.code,
                                            country_iso_code: e.target.value,
                                        });
                                    }}
                                    MenuProps={{
                                        onKeyDown: handleKeyDown,
                                    }}
                                    renderValue={(selected) => {
                                        const country = CountryList[selected];
                                        return (
                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                {/* <img
                                                    src={country.url}
                                                    alt=""
                                                    style={{ width: '25px', marginRight: 5 }}
                                                /> */}
                                                {country.code}
                                            </span>
                                        );
                                    }}
                                    sx={{ p: 0, m: 0 }}
                                >
                                    {Object.entries(CountryList)
                                        .sort((a, b) => a[1].name.localeCompare(b[1].name))
                                        .map(([key, value]) => (
                                            <MenuItem
                                                key={key}
                                                value={value?.id || 'DK'}
                                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                            >
                                                {/* <img src={value.url} alt="" style={{ width: '25px', marginRight: 5 }} /> */}
                                                <span style={{ fontSize: '14px', minWidth: '35px' }}>
                                                    {' '}
                                                    {value.code}{' '}
                                                </span>
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
        </React.Fragment>
    );
}
