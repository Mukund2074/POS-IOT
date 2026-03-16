import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

const F_AutoComplete = ({
    options,
    label,
    width = 300,
    onChange,
    border = '1px solid #D9D9D9',
    borderRadius = 13,
    clearIcon = true,
    sx = {},
}) => {
    return (
        <Autocomplete
            clearIcon={clearIcon}
            disablePortal
            options={options || []}
            onChange={onChange}
            sx={{
                ml: 'auto',
                width: width,
                border: border,
                borderRadius: borderRadius,
                '.css-13zzpa-MuiFormLabel-root-MuiInputLabel-root': {
                    top: -9,
                },
                '.css-1uhhrmm-MuiAutocomplete-endAdornment': {
                    display: 'none',
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
                    sx={{ p: 0, m: 0 }}
                    {...params}
                    label={label}
                    InputProps={{
                        ...params.InputProps,
                        disableUnderline: true, // Disable the underline
                    }}
                />
            )}
        />
    );
};

export default F_AutoComplete;
