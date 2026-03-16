import React from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { t } from 'i18next';

const CustomDatePicker = ({
    value,
    onChange,
    options,
    sx = {},
    size = "small",
    borderColor = "#D9D9D9",
    padding = 1,
    borderThickness = "2px",
    inputColor = "#A0A0A0",
    iconVisibility = false,
    borderRadius = 2,
    ...props
}) => {
    let lenguage = localStorage.getItem('language');
    return (
        <LocalizationProvider
            dateAdapter={AdapterMoment}
            localeText={{
                calendarWeekNumberHeaderText: t('Common.Week'),
            }}
            adapterLocale={lenguage === 'da' ? 'da' : 'en-gb'}
        >
            <DatePicker
                sx={{
                    '&.Mui-focused': { outline: 'none', boxShadow: 'none' },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiPaper-root': { backgroundColor: '#FFFFFF' },
                    '& .MuiOutlinedInput-input': { padding: 1 },
                    '.css-1ysp02-MuiButtonBase-root-MuiIconButton-root ': {
                        padding: 1,
                        bgcolor: 'transparent',
                        pl: 0,
                    },
                    '.css-1umw9bq-MuiSvgIcon-root ': {
                        height: 18,
                        width: 18,
                    },
                    '.css-r3djoj-MuiTouchRipple-root': {
                        display: 'none', // Disable ripple on hover
                    },
                    '.MuiButtonBase-root': {
                        '&:hover': {
                            backgroundColor: 'transparent', // Remove hover background
                        },
                        '&.MuiTouchRipple-root': {
                            display: 'none', // Disable ripple on click
                        },
                    },
                    border: '1px solid #d9d9d9',
                    borderRadius: 3,
                    //   width:150,
                    ...sx, // Allow external sx overrides
                }}
                slotProps={{
                    openPickerIcon: {
                        width: '10px',
                        height: '10px',
                        disableRipple: true, // Disable ripple effect
                    },
                }}
                value={value}
                onChange={onChange}
                displayWeekNumber={true}
                {...props}
            />
        </LocalizationProvider>
    );
};

export default CustomDatePicker;
