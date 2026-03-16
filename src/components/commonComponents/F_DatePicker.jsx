import React from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { t } from 'i18next';

const FDatePicker = ({
    value,
    onChange,
    options,
    sx = {},
    size = 'small',
    borderColor = '#D9D9D9',
    padding = 1,
    borderThickness = '2px',
    inputColor = '#A0A0A0',
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

                    border: '1px solid #d9d9d9',
                    borderRadius: 3,
                    //   width:150,
                    ...sx, // Allow external sx overrides
                }}
                value={value}
                onChange={onChange}
                displayWeekNumber={true}
                {...props}
            />
        </LocalizationProvider>
    );
};

export default FDatePicker;
