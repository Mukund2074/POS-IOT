import React from 'react';
import { Autocomplete, AutocompleteChangeReason, Stack, SxProps, TextField } from '@mui/material';
import { ChevronRight, Close } from '@mui/icons-material';

export interface POSAutocompleteOption {
    id: string | number;
    name: string;
    group?: string;
    price?: number;
}
export interface POSAutocompleteProps {
    disabled?: boolean;
    options: POSAutocompleteOption[];
    width?: number | string;
    onChange: (event: any, value: POSAutocompleteOption | null, reason: AutocompleteChangeReason) => void;
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    border?: string;
    borderRadius?: number | string;
    clearIcon?: boolean;
    disablePortal?: boolean;
    sx?: SxProps;
    getOptionLabel?: (option: POSAutocompleteOption) => string;
    placeholder?: string;
    value?: any;
    getOptionKey?: (option: POSAutocompleteOption) => string | number;
    popupIcon?: React.ReactNode;
    renderOption?: (props: any, option: any) => React.ReactNode;
    renderGroup?: (params: any) => React.ReactNode;
    groupBy?: (option: POSAutocompleteOption) => string;
    filterOptions?: (options: POSAutocompleteOption[], state: any) => POSAutocompleteOption[];
}
export default function POSAutocomplete({
    disabled = false,
    options,
    width = 300,
    onChange,
    onInputChange = () => {},
    border = '1px solid #D9D9D9',
    borderRadius = 13,
    clearIcon = true,
    disablePortal = true,
    sx = {},
    getOptionLabel,
    placeholder,
    value,
    getOptionKey = (option: POSAutocompleteOption) => option.id,
    renderOption,
    renderGroup,
    groupBy,
    filterOptions,
}: POSAutocompleteProps) {
    return (
        <Autocomplete
            disabled={disabled}
            clearIcon={<Close sx={{ cursor: 'pointer' }} />}
            popupIcon={<ChevronRight sx={{ transform: 'rotate(90deg)' }} />}
            disablePortal={disablePortal}
            getOptionLabel={getOptionLabel}
            getOptionKey={(option: POSAutocompleteOption) => getOptionKey(option)}
            filterOptions={filterOptions}
            options={options || []}
            onChange={onChange}
            value={value}
            groupBy={groupBy}
            sx={{
                width: width,
                border: border,
                borderRadius: borderRadius,
                '& .MuiInputBase-root': { padding: '5px' },
                '& .MuiInputBase-input': {
                    color: '#545454',
                    fontSize: '14px',
                    fontWeight: 400,
                },
                '& .MuiInputBase-input::placeholder': { fontSize: '14px' },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D9D9D9',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D9D9D9',
                },
                '& .MuiAutocomplete-popupIndicator': { color: '#000' },
                '.css-13zzpa-MuiFormLabel-root-MuiInputLabel-root': {
                    top: -9,
                },
                '.css-1uhhrmm-MuiAutocomplete-endAdornment': {
                    // display: 'none',
                },
                '.css-up1pgm-MuiInputBase-root-MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                    borderRadius: 50,
                    px: 1,
                    py: 0,
                    '&:hover': {
                        borderColor: 'transparent', // Remove border on hover
                    },
                    '&.Mui-focused': {
                        borderColor: 'transparent', // Remove border on focus
                    },
                    '& fieldset': {
                        border: 'none', // Remove outline by default
                    },
                },

                ...sx, // Allow custom styles to be passed
            }}
            renderInput={(params) => (
                <TextField
                    sx={{ p: 0, m: 0, borderRadius: 4 }}
                    placeholder={placeholder}
                    {...params}
                    onChange={onInputChange}
                    InputProps={{
                        ...params.InputProps,
                        disableUnderline: true, // Disable the underline
                    }}
                />
            )}
            renderOption={renderOption}
            renderGroup={renderGroup}
        />
    );
}
