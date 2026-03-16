import { HttpStatusCode } from "axios";
import { GetBookingNotificationApi } from "../../../utils/Api/Calendar";
import { GetProfileInfoApi } from "../../../utils/Api/Settings";
import { GetFormNotificationApi } from "../../../utils/Api/Booking";
import { GetEmpOpeningHourApi } from "../../../utils/Api/Employee";

export class CalendarApis {

    async fetchSettingsNew({ setEmployees, dispatch, settings, setLoading }) {
        try {
            const res = await GetProfileInfoApi();

            let settingsObj = {
                OnlineBooking: null,
                calendar: {
                    setCalendarOpeningHour: 240,
                    setCalendarClosingHour: 240,
                    grayOutClosedHours: false,
                    showOnlyAvailableEmployee: false,
                    calendarInterval: 15,
                },
                outlet_holidays: [],
                schedule: [],
                is_individual_opening_hour: false,
                employees_opening_hour: [],
            };

            const {
                settings: settingList,
                schedules,
                holidays,
                employees_opening_hour,
                is_individual_opening_hour,
            } = res.data.data;

            settingList.map((settingObj) => {
                if (settingObj.settingName == 'OnlineBooking') {
                    settingsObj['OnlineBooking'] = settingObj?.value ? JSON.parse(settingObj?.value) : null;
                }
                if (settingObj.settingName == 'calendar') {
                    settingsObj['calendar'] = settingObj?.value ? JSON.parse(settingObj?.value) : null;
                }
            });

            settingsObj.outlet_holidays = holidays;
            settingsObj.schedule = schedules;
            settingsObj.is_individual_opening_hour = is_individual_opening_hour;
            settingsObj.employees_opening_hour = employees_opening_hour;

            const sequnced_Emp = JSON.parse(
                settingList?.find((item) => item.settingName === 'calendar')?.value
            )?.employees;

            let employeesList = [];

            employees_opening_hour?.map((empObj) => {
                employeesList.push({
                    id: empObj?.id,
                    name: empObj?.name,
                    label: empObj?.name,
                    value: empObj?.id,
                    title: empObj?.name ?? 'Unnamed Employee',
                    availability: is_individual_opening_hour ? (empObj.detail.length ? true : false) : true,
                    sequence: sequnced_Emp ? sequnced_Emp[empObj.id]?.sequence : 0,
                    //  availabilityDay: empObj.detail.length ? empObj.detail[0]: null})
                    availabilityDay: is_individual_opening_hour ? (empObj.detail.length ? empObj.detail : null) : null,
                });
            });

            if (sequnced_Emp) {
                employeesList.sort((a, b) => a.sequence - b.sequence);
            } else {
                employeesList.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
            }

            setEmployees(employeesList);
            dispatch(settings(settingsObj));
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('error', error);
        }
    };



    async getNotification({ eid, setNotifications }) {
        try {
            const response = await GetBookingNotificationApi({ eid });
            if (response.status === HttpStatusCode.Ok) {
                let formattedData = response?.data?.data?.notifications?.map((item) => {
                    const { data, ...rest } = item;
                    let newItems = {
                        unread_count: response?.data?.data?.unread_count,
                        ...rest,
                        ...data,
                    };
                    return newItems;
                });
                setNotifications(formattedData);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };


    async getFormNotifications({ setFormNotifications }) {
        try {
            const response = await GetFormNotificationApi();
            if (response.status === HttpStatusCode.Ok) {
                setFormNotifications(response?.data?.data);
            }
        } catch (error) {
            console.error('Error fetching form notifications:', error);
        }
    };

    async getCalendarOpeningHour({ setOpeningHourEmp, setLoader = () => { } }) {
        try {
            setLoader(true);
            const response = await GetEmpOpeningHourApi();
            if (response.status === HttpStatusCode.Ok) {
                setOpeningHourEmp((prev) => ({
                    ...prev,
                    data: response?.data?.data
                }));
            }
        } catch (error) {
            console.error('Error fetching calendar opening hour:', error);
        } finally {
            setLoader(false);
        }

    }
}

export const calendarApi = new CalendarApis();