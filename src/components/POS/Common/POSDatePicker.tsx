import { DatePicker, DateValidationError, LocalizationProvider, PickerChangeHandlerContext } from '@mui/x-date-pickers';
import { SxProps } from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Moment } from 'moment';
import { t } from 'i18next';

interface POSDatePickerProps {
    disabled?: boolean;
    value: Moment;
    onChange: (value: Moment | null, context: PickerChangeHandlerContext<DateValidationError>) => void;
    sx?: SxProps;
    size?: 'small' | 'medium';
    borderColor?: string;
    padding?: number;
    borderThickness?: string;
    inputColor?: string;
    iconVisibility?: boolean;
    borderRadius?: number;
    format?: string;
    disablePast?: boolean
    maxDate?: Moment
    minDate?: Moment
}
export default function POSDatePicker({
    disabled = false,
    value,
    onChange,
    sx = {},
    size = 'small',
    borderColor = '#D9D9D9',
    padding = 1,
    borderThickness = '2px',
    inputColor = '#A0A0A0',
    iconVisibility = false,
    borderRadius = 2,
    format = 'DD/MM-YYYY',
    disablePast = false,
    maxDate,
    minDate,
    ...props
}: POSDatePickerProps) {
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
                disabled={disabled}
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
                format={format}
                value={value}
                maxDate={maxDate}
                minDate={minDate}
                onChange={onChange}
                disablePast={disablePast}
                {...props}
                displayWeekNumber={true}
            />
        </LocalizationProvider>
    );
}
