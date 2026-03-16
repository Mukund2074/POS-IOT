import React from 'react';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

const CustomTimePicker = ({
    value,
    onChange,
    onAccept,
    onBlur,
    sx = {},
    disabled = false,
    hideBorder = false,
    borderRadius = { topLeft: '13px', topRight: '13px', bottomLeft: '13px', bottomRight: '13px' },
    ...props
}) => {
    const handleChange = (newValue) => {
        // Ensure the value is a valid moment object
        if (newValue && moment.isMoment(newValue) && newValue.isValid()) {
            if (onChange) {
                onChange(newValue);
            }
        } else if (newValue === null) {
            // Handle clearing the value
            if (onChange) {
                onChange(newValue);
            }
        }
    };

    const handleAccept = (newValue) => {
        if (onChange) {
            onChange(newValue);
        }
        if (onAccept) {
            onAccept(newValue);
        }
    };

    const handleBlur = (event) => {
        if (onBlur) {
            onBlur(event);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
                value={value}
                onChange={handleChange}
                onAccept={handleAccept}
                ampm={false}
                disabled={disabled}
                disableRipple // Disable ripple effect
                sx={{
                    '& .MuiInputBase-root': {
                        border: hideBorder ? 'none' : '1px solid #D9D9D9',
                        // borderRadius: '13px',
                        borderRadius: `${borderRadius.topLeft} ${borderRadius.topRight} ${borderRadius.bottomLeft} ${borderRadius.bottomRight}`,
                        height: 40,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                    },
                    // Remove hover effect
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent', // Ensure no color on hover
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent', // Ensure no color when focused
                    },
                    '.MuiButtonBase-root': {
                        '&:hover': {
                            backgroundColor: 'transparent', // Remove hover background
                        },
                        '&.MuiTouchRipple-root': {
                            display: 'none', // Disable ripple on click
                        },
                    },
                    ".css-1ysp02-MuiButtonBase-root-MuiIconButton-root ": {
                        padding: 1, bgcolor: "transparent", pl: 0,
                    },
                    ".css-1umw9bq-MuiSvgIcon-root ": {
                        height: 18, width: 18
                    },
                    ".css-r3djoj-MuiTouchRipple-root": {
                        display: 'none', // Disable ripple on hover
                    },
                    ...sx,
                }}
                slotProps={{
                    popper: {
                        sx: {
                            '.MuiPaper-root': { borderRadius: '10px' },
                        },
                    },
                    textField: {
                        onBlur: handleBlur
                    }
                }}
                {...props}
            />
        </LocalizationProvider>
    );
};

export default CustomTimePicker;
