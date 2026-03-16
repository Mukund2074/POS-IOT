import React from 'react';
import { Select, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const CustomSelect = ({ id, value, defaultValue, onChange, options, disabled, sx, size = 'small', borderColor = '#D9D9D9', borderThickness = '1px', placeholder = '', ...props }) => {


    return (
        <Select
            disabled={disabled}
            defaultValue={defaultValue}
            id={id ?? null}
            name={id ?? null}
            value={value}
            IconComponent={(props) => (
                <KeyboardArrowDownIcon style={{ color: '#d9d9d9' }} {...props} />
            )}
            onChange={onChange}
            MenuProps={{
                PaperProps: {
                    sx: {
                        backgroundColor: '#fff',
                        color: '#A0A0A0',
                        maxHeight: '300px',
                        overflowY: 'auto',
                    },
                },
            }}
            displayEmpty
            {...props}
            sx={{
                // mt: 1,
                height: 40,
                fontSize: '0.85rem',
                borderRadius: '13px',
                border: `${borderThickness} solid ${borderColor}`,
                '& .MuiSelect-select': {
                    color: '#545454',
                    // fontSize: '15px',
                    fontSize: value === '' ? '14px' : '15px',
                    fontWeight: 400
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: borderColor,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: borderColor,
                },
                '& .MuiSelect-icon': {
                    color: '#000',
                },
                ...sx,
            }}
        >
            {placeholder && (
                <MenuItem value="" disabled sx={{
                    color: '#A0A0A0',
                    fontSize: '14px',
                    fontWeight: 400,
                }}>
                    {placeholder}
                </MenuItem>
            )}
            {options.map((option, index) => (
                <MenuItem
                    key={index}
                    value={option.value || option.name}
                    sx={{
                        color: '#545454',
                        fontSize: '15px',
                        fontWeight: 400,
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                        },
                    }}
                >
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    );
};

export default CustomSelect;