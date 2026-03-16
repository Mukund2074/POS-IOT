import { createSlice } from '@reduxjs/toolkit';

const SettingsSlice = createSlice({
    name: 'settings',
    initialState: {
        data: {
            profile: {
                id: null,
                name: '',
                city: '',
                address: '',
                zip_code: '',
                about: '',
                contact_country_code: null,
                contact_number: '',
                contact_country_code2: null,
                contact_number2: '',
                web_store_name: '',
                cvr_number: '',
                geo_location: null,
                email: '',
                hide_email: false,
                website: '',
                instagram: 'I',
                facebook: 'f',
                tiktok: 't',
            },
            OnlineBooking: null,
            calendar: {
                setCalendarOpeningHour: 240,
                setCalendarClosingHour: 240,
                grayOutClosedHours: false,
                showOnlyAvailableEmployee: false,
                calendarInterval: 5,
            },
            employees: [],
            schedule: [],
            outlet_holidays: [],
            is_individual_opening_hour: false,
            employees_opening_hour: [],
            from_dashboard: false,
            from_app: false,
            isDoctor: false
        },
    },
    reducers: {
        settings: (state, action) => {
            state.data = { ...state.data, ...action.payload };
        },
    },
});

export const { settings } = SettingsSlice.actions;
export default SettingsSlice.reducer;

// reducers: {
//     addPermission: (state, action) => {
//         state.permissions.push(action.payload);
//     },
//     removePermission: (state, action) => {
//         state.permissions = state.permissions.filter(
//             (permission) => permission !== action.payload
//         );
//     },
// },
