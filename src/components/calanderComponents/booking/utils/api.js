import { calendarOpeningHours, formatPhoneNumber, generateTimeSlots, transformServiceList } from './functions';
import apiFetcher from '../../../../utils/interCeptor';
import axios, { HttpStatusCode } from 'axios';
import { debounce } from 'lodash';
import moment from 'moment';
import { reasons } from '../../../../data/CalendarPauseReasons';
import { CreateCustomerApi } from '../../../../utils/Api/Customer';
import { CreateBookingApi, GetTimingsApi } from '../../../../utils/Api/Booking';
import * as Sentry from '@sentry/react';

export class ApiManger {
    // get services
    async fetchServiceApi({
        setServiceList,
        setLoading,
        fields,
        t,
        setValue,
        getValues,
        rescheduleProps,
        setCardValues,
    }) {
        setLoading((prev) => ({ ...prev, serviceApi: true }));
        try {
            const response = await apiFetcher.get(`api/v1/store/service_group?include_special_services=true`);
            if (response) {
                setServiceList(transformServiceList(response.data.data, fields, t));
                if (rescheduleProps) {
                    let values = getValues('cards');
                    let allServices = [];
                    response.data.data &&
                        response.data.data.flatMap((item) => ({
                            service: item?.services?.map((serv) => allServices.push({ ...serv })),
                        }));

                    let newCards = values.map((card, i) => ({
                        ...card,
                        employeeList:
                            allServices &&
                            allServices.find((service) => service?.id === card?.selectedService?.id)?.employees,
                    }));

                    setValue('cards', newCards);
                    setCardValues(newCards);
                }
            } else {
                setServiceList([]);
            }
        } catch (error) {
            console.error(t('Calendar.ToastErrService'));
            setServiceList([]);
        } finally {
            setLoading((prev) => ({ ...prev, serviceApi: false }));
        }
    }

    // submit booking
    async handleSubmit(payload, closeForm, toast, t, isEdit, setEvents, refreshBookings, socket) {
        // let url = isEdit ? `api/v1/store/booking/edit-multi` : `api/v1/store/booking/multi`;
        try {
            const metaData = payload?.customer_info_metadata || [];
            const bookingData = payload?.services || [];

            const newData = bookingData?.map((item, index) => ({
                id: payload?.booking_id ? payload?.booking_id : moment().unix() + index,
                title: payload?.customer_name,
                start: moment(
                    `${payload?.booking_date}T${item?.time_slot.split('-')[0]}:00`,
                    'YYYY-MM-DDTHH:mm',
                ).toDate(),
                end: moment(
                    `${payload?.booking_date}T${item?.time_slot.split('-')[1]}:00`,
                    'YYYY-MM-DDTHH:mm',
                ).toDate(),
                status: 'BOOKED',
                resourceId: item?.employee_id,
                customerName: payload?.customer_name,
                customerPhone: payload?.customer_phone_number,
                customerNote: payload?.note,
                serviceDuration: item?.duration,
                createdDate: moment().format('YYYY-MM-DDTHH:mm:ss'),
                servicePrice: item?.total_amount,
                type: 'BOOKING',
                employeeId: item?.employee_id,
                isEventLoading: true,
            }));

            closeForm();

            if (isEdit) {
                setEvents((prev) => prev.filter((item) => item?.id !== payload?.booking_id));
            }

            setEvents((prev) => [...(prev || []), ...(newData || [])]);

            const response = await CreateBookingApi({ isEdit, body: { ...payload, google_calendar_sync: true } });
            // apiFetcher.post(url, payload);
            if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
                // sent form only
                if (metaData.length > 0 && bookingData.length == 0) {
                    toast.success(isEdit ? t('Calendar.UpdateToastBk') : t('Calendar.BookingToastSuccessFormOnly'));
                    return;
                }
                // sent form and booking created
                if (metaData.length > 0 && bookingData.length > 0) {
                    toast.success(
                        isEdit ? t('Calendar.BookingToastSuccessFormEdit') : t('Calendar.BookingToastSuccessForm'),
                    );
                    return;
                }
                // create booking only
                if (metaData.length == 0 && bookingData.length > 0) {
                    toast.success(isEdit ? t('Calendar.UpdateToastBk') : t('Calendar.BookingToastSuccess'));
                    return;
                }

                toast.success(isEdit ? t('Calendar.UpdateToastBk') : t('Calendar.BookingToastSuccess'));
            }
        } catch (error) {
            console.error('create booking error', error);
            toast.error(
                isEdit
                    ? error === '400: Selected employee already booked for selected date & time-slot'
                        ? 'Selected employee already booked for selected date & time-slot'
                        : t('Calendar.UpdateToastBkFail')
                    : t('Calendar.BookingToastError'),
            );
        } finally {
            // if socket is connected then send event to socket
            if (socket?.connected) {
                socket.emit('booking_created', {});
            }
            refreshBookings();
        }
    }

    // debounced customer get api
    fetchSuggestions = debounce(async ({ cus, cancelToken, setCancelToken, setCustomers, setLoading, t }) => {
        if (cancelToken) {
            cancelToken.cancel('Canceling previous request');
        }
        const source = axios.CancelToken.source();
        setCancelToken(source);
        setLoading((prev) => ({
            ...prev,
            customerApi: true,
        }));
        apiFetcher(`api/v1/store/customer/outlet?search=${cus}`, {
            cancelToken: source.token,
        })
            .then((response) => {
                if (response.status === HttpStatusCode.Ok) {
                    let customerObj = response.data.data?.data.map((item) => ({
                        label: `${item.name} (${formatPhoneNumber(item.phone_number)})`,
                        ...item,
                    }));
                    setCustomers([{ label: t('Customer.AddNewCustomer'), id: 0 }, ...customerObj]);
                }
            })
            .catch((thrown) => {
                if (axios.isCancel(thrown)) {
                    console.error('Request canceled:', thrown.message);
                } else {
                    console.error('Error fetching suggestions:', thrown);
                }
            })
            .finally(() => {
                setLoading((prev) => ({
                    ...prev,
                    customerApi: false,
                }));
            });
    }, 500);

    // create customer
    async createCustomer(payload, closeForm, toast, t, setCustomer) {
        try {
            const response = await CreateCustomerApi(payload);
            // capture exception
            Sentry.logger.info('Response from create customer via calendar', response);
            if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
                let customerObj = {
                    ...response.data.data,
                    label: `${response.data.data.name} (${formatPhoneNumber(response.data.data.phone_number)})`,
                };
                setCustomer([{ label: t('Customer.AddNewCustomer'), id: 0 }, customerObj]);
                toast.success(t('Customer.CustomerCreateSuccess'));
                closeForm();
            }
        } catch (error) {
            Sentry.logger.error('Error from create customer via calendar', error);
            toast.error(error?.response?.data?.detail || t('Customer.CustomerCreateError'));
            console.error('Error creating customer:', error);
        }
    }

    // submit function for pause calender
    async handleSubmitPause(payload, closeForm, toast, t, pauseProps, setEvents) {
        const lang = localStorage.getItem('language');
        let id = pauseProps?.id ? pauseProps?.id : moment().unix();
        const newEvent = {
            id: id,
            title: lang == 'da' ? reasons[payload.reason] : payload.reason,
            reason: payload?.reason,
            headline: payload.headline,
            description: payload.description,
            start: moment(payload.datetime_start).toDate(),
            end: moment(payload.datetime_end).toDate(),
            status: null,
            resourceId: payload?.employee_ids[0],
            customerName: '',
            customerPhone: '',
            customerNote: '',
            employeeName: '',
            serviceDuration: '',
            createdDate: moment().format('YYYY-MM-DDTHH:mm:ss'),
            servicePrice: 0,
            serviceType: '',
            serviceId: null, // Now correctly retrieving serviceId
            employeeId: payload?.employee_ids[0],
            type: 'CALENDAR_PAUSE',
        };
        setEvents((prev) => [...prev.filter((item) => item?.id !== id), newEvent]);
        closeForm();

        let call;
        if (pauseProps && pauseProps?.id) {
            let edit = {
                employee_id: payload?.employee_ids[0],
                ...payload,
            };
            call = apiFetcher.put(`api/v1/store/employee/pause-calendar/${pauseProps?.id}`, edit);
        } else {
            call = apiFetcher.post(`api/v1/store/employee/pause-calendar`, payload);
        }
        try {
            const response = await call;
            if (response.status === HttpStatusCode.Ok || response.status === HttpStatusCode.Created) {
                const responseData = response?.data?.data;
                // Handle both array and object responses
                const dataArray = Array.isArray(responseData) ? responseData : responseData ? [responseData] : [];

                const combinedResponse = dataArray.map((item) => {
                    return {
                        ...newEvent,
                        id: item?.id,
                        resourceId: item?.employee_id,
                    };
                });
                setEvents((prev) => [...prev.filter((item) => item?.id !== id), ...combinedResponse]);
                toast.success(t('Calendar.PauseToastSuccess'));
            }
        } catch (error) {
            toast.error(t('Calendar.PauseToastError'));
            setEvents((prev) => prev.filter((item) => item.id !== id));
        }
    }

    async availableTimeSlots(rescheduleProps, setValue, setCardValues, setLoading, setting) {
        setLoading((prev) => ({
            ...prev,
            timeSlotApi: new Array(prev.timeSlotApi.length).fill(true),
        }));

        try {
            let timeSlots = await generateTimeSlots();
            let employees = [];
            let available_time = [];
            let exclude_employee_time_slots = {};
            let services = [];

            rescheduleProps &&
                rescheduleProps?.booking.forEach((item) => {
                    services.push({
                        booking_id: item?.booking_id,
                        service_id: item?.selectedService?.id,
                        employee_id: item?.selectedEmployee?.id,
                        custom_duration: item?.duration_min,
                    });
                    employees.push(item?.selectedEmployee?.id);
                    let [startTime, endTime] = item?.available_time.split('-');

                    let startMoment = moment(startTime.trim(), 'HH:mm'); // Parse the start time in "HH:mm" format
                    let endMoment = startMoment.clone().add(item?.duration_min, 'minutes');
                    let formattedEndTime = endMoment.format('HH:mm');

                    let updatedAvailableTime = `${startTime.trim()} - ${formattedEndTime}`;

                    available_time.push(updatedAvailableTime);

                    if (item?.selectedEmployee?.id && updatedAvailableTime) {
                        if (!exclude_employee_time_slots[item?.selectedEmployee?.id]) {
                            exclude_employee_time_slots[item?.selectedEmployee?.id] = [];
                        }
                        exclude_employee_time_slots[item?.selectedEmployee?.id].push(updatedAvailableTime);
                    }
                });

            const body = { services: services };
            const response = await apiFetcher.post(
                `api/v1/store/booking/multi-timings?date=${moment(rescheduleProps?.date).format('YYYY-MM-DD')}`,
                body,
            );
            if (response.status === HttpStatusCode.Ok) {
                let data = response?.data?.data;

                // let day;
                const { open_time, close_time } = calendarOpeningHours({
                    data: setting,
                    selectedDate: rescheduleProps?.date,
                    view: 'week',
                });
                // if (setting?.is_individual_opening_hour) {
                //     const emp = setting?.employees_opening_hour?.find((e) => e?.id === rescheduleProps?.employeeId);
                //     const foundDay = emp?.detail.find(
                //         (d) => d.start_day === moment(rescheduleProps?.date).format('dddd'),
                //     );
                //     const additionalDay = foundDay?.additional_days?.[rescheduleProps?.date.format('YYYY-MM-DD')];
                //     day = {
                //         ...foundDay,
                //         open_time: additionalDay?.start_time || foundDay?.start_time,
                //         close_time: additionalDay?.end_time || foundDay?.end_time,
                //     };
                // } else {
                //     day = setting?.schedule?.find(
                //         (schedule) => schedule?.day === moment(rescheduleProps?.date).format('dddd'),
                //     );
                // }

                function isOutsideOpenAndCloseTime(slotStartTime) {
                    const startMoment = moment(slotStartTime, 'HH:mm');
                    const openMoment = moment(open_time, 'HH:mm');
                    const closeMoment = moment(close_time, 'HH:mm');
                    return startMoment.isBefore(openMoment) || startMoment.isAfter(closeMoment);
                }

                const newUpdatedCads = Object.keys(data).map((key) => {
                    const tms = timeSlots
                        .map((item) => {
                            const startTime = item.split(' - ')[0];
                            // TODO: Removed validation of slots in edit mode as they are already validated in the backend
                            const isTimeAvailable = true;
                            // const isTimeAvailable = data[key].some((timeSlot) => timeSlot.split(' - ')[0] == startTime);

                            if (isOutsideOpenAndCloseTime(startTime)) {
                                return null;
                            }

                            const isBetween = moment(startTime, 'HH:mm').isBetween(
                                moment(open_time, 'HH:mm:ss'),
                                moment(close_time, 'HH:mm:ss'),
                                null,
                                '[]', // inclusive start and end
                            );

                            return {
                                value: item,
                                label: startTime, // Use simple string instead of Typography component
                                disabled: setting?.calendar?.allow_overlap ? false : !isTimeAvailable,
                                // Store styling information separately for the consuming component
                                styling: {
                                    color: !isBetween ? '#d7d7d7' : !isTimeAvailable ? '#C60404' : '#1f1f1f',
                                    textDecoration: !isTimeAvailable ? 'line-through' : 'none',
                                    variant: startTime.endsWith(':00') ? 'body1' : 'body2',
                                    fontWeight: startTime.endsWith(':00') ? 700 : 400,
                                },
                            };
                        })
                        .filter((slot) => slot !== null);

                    const cardData = rescheduleProps?.booking.find((card) => card?.booking_id == key);
                    const availableStart = cardData?.available_time?.split('-')[0]?.trim();
                    const isInsideOpenAndCloseTime = moment(availableStart, 'HH:mm').isBetween(
                        moment(open_time, 'HH:mm:ss'),
                        moment(close_time, 'HH:mm:ss'),
                        null,
                        '[]', // inclusive start and end
                    );
                    if (!isInsideOpenAndCloseTime) {
                        return {
                            ...cardData,
                            availableTimeSlots: tms,
                            available_time: '',
                        };
                    } else {
                        return {
                            ...cardData,
                            availableTimeSlots: tms,
                        };
                    }
                });

                setCardValues(newUpdatedCads);
                setValue('cards', newUpdatedCads);

                // Object.keys(data).map((key) => {
                //     let tms = timeSlots
                //         .map((item) => {
                //             const startTime = item.split(' - ')[0];
                //             // TODO: Removed validation of slots in edit mode as they are already validated in the backend
                //             const isTimeAvailable = true;
                //             // const isTimeAvailable = data[key].some((timeSlot) => timeSlot.split(' - ')[0] == startTime);

                //             if (isOutsideOpenAndCloseTime(startTime)) {
                //                 return null;
                //             }

                //             const isBetween = moment(startTime, 'HH:mm').isBetween(
                //                 moment(day?.open_time, 'HH:mm:ss'),
                //                 moment(day?.close_time, 'HH:mm:ss'),
                //                 null,
                //                 '[]', // inclusive start and end
                //             );

                //             return {
                //                 value: item,
                //                 label: startTime, // Use simple string instead of Typography component
                //                 disabled: setting?.calendar?.allow_overlap ? false : !isTimeAvailable,
                //                 // Store styling information separately for the consuming component
                //                 styling: {
                //                     color: !isBetween ? '#d7d7d7' : !isTimeAvailable ? '#C60404' : '#1f1f1f',
                //                     textDecoration: !isTimeAvailable ? 'line-through' : 'none',
                //                     variant: startTime.endsWith(':00') ? 'body1' : 'body2',
                //                     fontWeight: startTime.endsWith(':00') ? 700 : 400,
                //                 },
                //             };
                //         })
                //         .filter((slot) => slot !== null);

                //     const availableStart = rescheduleProps?.booking
                //         .find((card) => card?.booking_id == key)
                //         ?.available_time?.split('-')[0]
                //         ?.trim();

                //     const isInsideOpenAndCloseTime = moment(availableStart, 'HH:mm').isBetween(
                //         moment(day?.open_time, 'HH:mm:ss'),
                //         moment(day?.close_time, 'HH:mm:ss'),
                //         null,
                //         '[]', // inclusive start and end
                //     );
                //     console.log('availableStart', availableStart);
                //     console.log('isInsideOpenAndCloseTime', isInsideOpenAndCloseTime);

                //     setCardValues((prev) =>
                //         prev.map((card, i) => (card?.booking_id == key ? { ...card, availableTimeSlots: tms } : card)),
                //     );
                //     let indexOfCard = rescheduleProps?.booking.findIndex((card) => card?.booking_id == key);
                //     setValue(`cards.${indexOfCard}.availableTimeSlots`, tms);
                // });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading((prev) => ({
                ...prev,
                timeSlotApi: new Array(prev.timeSlotApi.length).fill(false),
            }));
        }
    }

    async removePause(payload, toast, t, setEvents) {
        setEvents((prev) => prev.filter((item) => item?.id !== payload?.id));
        try {
            const response = await apiFetcher.delete(
                `api/v1/store/employee/pause-calendar/${payload?.id}?google_calendar_sync=true`,
            );
            if (response.status === HttpStatusCode.Ok) {
                toast.success(t('Calendar.RemovePauseToastSuccess'));
            }
        } catch (error) {
            setEvents((prev) => [
                ...prev,
                {
                    id: payload?.id,
                    title: payload.reason,
                    reason: payload?.reason,
                    headline: payload.headline,
                    description: payload.description,
                    start: payload?.start,
                    end: payload?.end,
                    status: null,
                    resourceId: payload?.resourceId,
                    customerName: '',
                    customerPhone: '',
                    customerNote: '',
                    employeeName: '',
                    serviceDuration: '',
                    createdDate: payload?.createdDate,
                    servicePrice: 0,
                    serviceType: '',
                    serviceId: null, // Now correctly retrieving serviceId
                    employeeId: payload?.employeeId,
                    type: 'CALENDAR_PAUSE',
                },
            ]);
            toast.error(t('Calendar.RemovePauseToastError'));
        }
    }

    async GetTimingsByEmployee({ params, body }) {
        try {
            const response = await GetTimingsApi({
                params: params,
                body: body,
                byEmoployee: true,
            });
            if (response.status === HttpStatusCode.Ok) {
                return response?.data?.data;
            }
        } catch (error) {
            console.error(error);
        }
    }
}

export const apiMangerBooking = new ApiManger();
