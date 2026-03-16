import moment from 'moment';

export function generateTimeSlots() {
    const timeSlots = [];
    const startTime = moment('00:00', 'HH:mm');
    const endTime = moment('23:55', 'HH:mm');

    while (startTime <= endTime) {
        const nextTime = moment(startTime).add(30, 'minutes');
        timeSlots.push(`${startTime.format('HH:mm')} - ${nextTime.format('HH:mm')}`);
        startTime.add(5, 'minutes');
    }

    return timeSlots;
}

export const transformServiceList = (data, fields, t) => {
    const filteredData = data.map((group) => ({
        ...group,
        services: group.services.filter((service) => {
            return !fields.some((field) => field.serviceId === service.id);
        }),
    }));

    const groupedServices = filteredData
        .filter((group) => group.id !== 0)
        .map((group) => ({
            title: group.group,
            groupId: group.id,
            data: group.services.length > 0 ? group.services : [],
        }));

    const ungroupedServices = filteredData
        .filter((group) => group.id === 0)
        .flatMap((group) => group.services)
        .map((service) => ({
            ...service,
            groupId: 0,
        }));

    return [
        {
            title: t('Calendar.ServicesWithoutGroup'),
            groupId: 0,
            data: ungroupedServices.length > 0 ? ungroupedServices : [],
        },
        ...groupedServices,
    ];
};

export function getItems(duration) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0) {
        return `${hours}t. ${minutes}min.`;
    } else {
        return `${minutes}min.`;
    }
}

export const formatPhoneNumber = (number) => {
    if (number != '') {
        return number?.replace(/(\d{2})(?=\d)/g, '$1 ');
    } else {
        return '';
    }
};

export const CountryCodeGetter = ({ code = '+45' }) => {
    const countryCode = code?.replace('+', '');
    if (code) {
        return Number(countryCode);
    } else {
        return 45;
    }
};

export const validateBooking = (cardValues) => {
    for (let i = 0; i < cardValues.length; i++) {
        const { selectedEmployee, available_time, duration_min } = cardValues[i];
        const startTime = moment(available_time, 'HH:mm'); // Parse available time
        const endTime = moment(startTime).add(duration_min, 'minutes'); // Add duration to get end time

        for (let j = 0; j < cardValues.length; j++) {
            if (i !== j) {
                const {
                    selectedEmployee: compareEmployee,
                    available_time: compareTime,
                    duration_min: compareDuration,
                } = cardValues[j];

                if (selectedEmployee.id === compareEmployee.id) {
                    const compareStartTime = moment(compareTime, 'HH:mm');
                    const compareEndTime = moment(compareStartTime).add(compareDuration, 'minutes');

                    if (
                        (startTime.isBefore(compareEndTime) && endTime.isAfter(compareStartTime)) || // If times overlap
                        (compareStartTime.isBefore(endTime) && compareEndTime.isAfter(startTime)) // If other booking times overlap this
                    ) {
                        return false; // If overlap found, return false
                    }
                }
            }
        }
    }

    return true; // No overlaps, return true
};

export const scrollToHour = ({ settings, selectedDate, selectedEmployee }) => {
    const getSafeScrollTime = (timeStr) => {
        const dateStr = selectedDate.locale('en-gb').format('YYYY-MM-DD'); // Ensure consistent format
        const fullTime = moment(`${dateStr} ${timeStr.padEnd(8, ':00')}`, 'YYYY-MM-DD HH:mm:ss');
        const scrolled = fullTime.clone().subtract(2, 'hours');

        const start = scrolled.isBefore(fullTime.clone().startOf('day')) ? fullTime.clone().startOf('day') : scrolled;

        return `${start.format('HH:mm')} - ${start.clone().add(30, 'minutes').format('HH:mm')}`;
    };

    if (!settings?.is_individual_opening_hour) {
        const day = settings?.schedule?.find((d) => d?.day === selectedDate.locale('en-gb').format('dddd'));
        if (day?.open_time) {
            return getSafeScrollTime(day?.open_time);
        }
    } else if (settings?.is_individual_opening_hour) {
        const emp = settings?.employees_opening_hour?.find((e) => e?.id === selectedEmployee?.id);
        const day = emp?.detail.find((d) => d.start_day === selectedDate.locale('en-gb').format('dddd'));

        const additionalDays = day?.additional_days || {};

        if (
            Object.keys(additionalDays).length > 0 &&
            additionalDays[selectedDate.locale('en-gb').format('YYYY-MM-DD')]
        ) {
            const additional_day = additionalDays[selectedDate.locale('en-gb').format('YYYY-MM-DD')];
            if (additional_day?.start_time) {
                return getSafeScrollTime(additional_day?.start_time);
            }
        } else {
            if (day?.start_time) {
                return getSafeScrollTime(day?.start_time);
            }
        }
    }
};

export const calendarOpeningHours = ({ data = { schedule: [], calendar: {} }, selectedDate = moment() }) => {
    const view = localStorage.getItem('calendarView') || 'week';
    const { schedule = [], calendar = {} } = data;
    const { setCalendarOpeningHour = 0, setCalendarClosingHour = 0 } = calendar || {};

    let momentStartTime = null;
    let momentEndTime = null;

    if (!schedule.length) {
        momentStartTime = moment().startOf('day');
        momentEndTime = moment().endOf('day');
        return {
            momentStartTime,
            momentEndTime,
            open_time: momentStartTime.format('HH:mm'),
            close_time: momentEndTime.format('HH:mm'),
        };
    }

    if (view === 'week') {
        // Filter out closed days before calculating min/max
        schedule
            .filter((dayObj) => !dayObj.is_closed)
            .forEach((dayObj) => {
                if (momentStartTime) {
                    if (momentStartTime.isAfter(moment(dayObj.open_time, 'HH:mm:ss'), 'minute')) {
                        momentStartTime = moment(dayObj.open_time, 'HH:mm:ss');
                    }
                } else {
                    momentStartTime = moment(dayObj.open_time, 'HH:mm:ss');
                }

                if (momentEndTime) {
                    if (momentEndTime.isBefore(moment(dayObj.close_time, 'HH:mm:ss'), 'minute')) {
                        momentEndTime = moment(dayObj.close_time, 'HH:mm:ss');
                    }
                } else {
                    momentEndTime = moment(dayObj.close_time, 'HH:mm:ss');
                }
            });
    } else {
        let currentDay = moment(selectedDate).locale('en-gb').format('dddd');
        let foundDay = schedule.find((dayObj) => dayObj.day === currentDay);

        if (foundDay?.is_closed) {
            return {
                momentStartTime: moment().startOf('day'),
                momentEndTime: moment().endOf('day'),
                open_time: moment().startOf('day').format('HH:mm'),
                close_time: moment().endOf('day').format('HH:mm'),
            };
        }

        if (foundDay) {
            momentStartTime = moment(foundDay.open_time, 'HH:mm:ss');
            momentEndTime = moment(foundDay.close_time, 'HH:mm:ss');
        } else {
            momentStartTime = moment().startOf('day');
            momentEndTime = moment().endOf('day');
        }
    }

    if (!momentStartTime || !momentEndTime) {
        return {
            momentStartTime: momentStartTime,
            momentEndTime: momentEndTime,
            open_time: momentStartTime?.format('HH:mm'),
            close_time: momentEndTime?.format('HH:mm'),
        };
    }

    // Clone moments before mutating to avoid side effects
    const startTimeClone = momentStartTime.clone();
    const endTimeClone = momentEndTime.clone();

    // Day boundaries
    const dayStart = startTimeClone.clone().startOf('day'); // 00:00:00
    const dayEnd = endTimeClone.clone().endOf('day'); // 23:59:59

    let finalStartTime =
        startTimeClone.format('HH:mm:ss') !== '00:00:00'
            ? startTimeClone.clone().minutes(0).subtract(setCalendarOpeningHour, 'minutes')
            : startTimeClone;

    // Clamp start time (must not go below 00:00:00)
    finalStartTime = moment.max(finalStartTime, dayStart);

    let finalEndTime =
        endTimeClone.format('HH:mm:ss') !== '23:59:59'
            ? endTimeClone.clone().add(setCalendarClosingHour, 'minutes')
            : endTimeClone;

    // Clamp end time (must not go beyond 23:59:59)
    finalEndTime = moment.min(finalEndTime, dayEnd);

    return {
        momentStartTime: finalStartTime,
        momentEndTime: finalEndTime,
        open_time: finalStartTime.format('HH:mm'),
        close_time: finalEndTime.format('HH:mm'),
    };
};
