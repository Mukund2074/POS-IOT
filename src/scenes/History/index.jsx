import { CircularProgress, Stack } from '@mui/material';
import { HttpStatusCode } from 'axios';
import moment from 'moment';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Bookings from '../../components/customer/customerDetail/Bookings';
import AppbarComponent from '../../components/AppBar';
import apiFetcher from '../../utils/interCeptor';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { t } from 'i18next';
import debounce from 'lodash/debounce';
import { useSelector } from 'react-redux';

const HistoryTable = () => {
    const [employeeData, setEmployeeData] = useState();
    const [selectedEmployee, setSelectedEmployee] = useState([0]);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [selectedOption, setSelectedOption] = useState(t('Common.Today'));
    const [showCalander, setShowCalander] = useState(false);
    const [loading, setLoading] = useState({
        future: false,
        previous: false,
    });
    const [selectEmpObj, setSelectedEmpObj] = useState([]);
    const [futureDates, setFutureDates] = useState({
        startDate: moment().startOf('day').format('YYYY-MM-DD'),
        endDate: moment().startOf('day').format('YYYY-MM-DD'),
    });

    const [apiDataBookings, setApiDataBookings] = useState({
        futureData: [],
        previosData: [],
    });

    const setting = useSelector((state) => state.settings?.data);

    useEffect(() => {
        if (setting?.employees) {
            setEmployeeData(setting.employees);
        }
    }, [setting]);

    moment.locale('en-gb');

    // Store AbortControllers as refs to persist across renders
    const fetchBookingsAbortRef = useRef(null);
    const getFutureDataAbortRef = useRef(null);

    // Debounced fetchBookings
    const fetchBookings = useMemo(
        () =>
            debounce(async ({ stDate, enDate, emId }) => {
                if (fetchBookingsAbortRef.current) {
                    fetchBookingsAbortRef.current.abort();
                }
                fetchBookingsAbortRef.current = new AbortController();
                const signal = fetchBookingsAbortRef.current.signal;
                try {
                    setLoading((prev) => ({ ...prev, previous: true }));
                    const previousResponse = await apiFetcher.get(
                        `api/v1/store/booking?date=${dayjs(stDate).format('YYYY-MM-DD')}&to_date=${dayjs(enDate).format('YYYY-MM-DD')}&limit=${200000}&offset=${0}&booking_type=Previous&filter_equipment_bookings=false&employee_id=${emId}&group_bookings=true`,
                        { signal },
                    );
                    if (previousResponse.status === HttpStatusCode.Ok) {
                        setApiDataBookings((prev) => ({
                            ...prev,
                            previosData: previousResponse.data.data,
                        }));
                    }
                } catch (error) {
                    if (
                        error.name !== 'CanceledError' &&
                        error.name !== 'AbortError' &&
                        error.code !== 'ERR_CANCELED'
                    ) {
                        toast.error(t('Insights.NoDataFound'));
                    }
                } finally {
                    setLoading((prev) => ({ ...prev, previous: false }));
                }
            }, 400),
        [],
    );

    // Debounced getFutureData
    const getFutureData = useMemo(
        () =>
            debounce(async ({ emId, ftStart, ftEnd }) => {
                if (getFutureDataAbortRef.current) {
                    getFutureDataAbortRef.current.abort();
                }
                getFutureDataAbortRef.current = new AbortController();
                const signal = getFutureDataAbortRef.current.signal;
                let url;
                if (ftStart === null && ftEnd === null) {
                    url = `api/v1/store/booking?limit=${200000}&offset=${0}&booking_type=Upcoming&filter_equipment_bookings=false&employee_id=${emId}&group_bookings=true`;
                } else {
                    url = `api/v1/store/booking?date=${ftStart}&to_date=${ftEnd}&limit=${200000}&offset=${0}&booking_type=Upcoming&filter_equipment_bookings=false&employee_id=${emId}&group_bookings=true`;
                }
                try {
                    setLoading((prev) => ({ ...prev, future: true }));
                    const futureResponse = await apiFetcher.get(url, { signal });
                    if (futureResponse.status === HttpStatusCode.Ok) {
                        setApiDataBookings((prev) => ({
                            ...prev,
                            futureData: futureResponse.data.data,
                        }));
                    }
                } catch (error) {
                    if (
                        error.name !== 'CanceledError' &&
                        error.name !== 'AbortError' &&
                        error.code !== 'ERR_CANCELED'
                    ) {
                        toast.error(t('Insights.NoDataFound'));
                    }
                } finally {
                    setLoading((prev) => ({ ...prev, future: false }));
                }
            }, 400),
        [],
    );

    useEffect(() => {
        fetchBookings({ emId: selectedEmployee, stDate: startDate, enDate: endDate });
        getFutureData({ emId: selectedEmployee, ftStart: futureDates.startDate, ftEnd: futureDates.endDate });
    }, [startDate, endDate, futureDates.startDate, futureDates.endDate]);

    const handleOptionChange = (value) => {
        const today = moment().startOf('day').format('YYYY-MM-DD');

        if (value === t('Common.All')) {
            setShowCalander(true);
            setStartDate(moment().subtract(1, 'month').format('YYYY-MM-DD'));
            setEndDate(moment().format('YYYY-MM-DD'));

            setFutureDates((prev) => ({ ...prev, startDate: null, endDate: null }));
        } else if (value === t('Common.ThisYear')) {
            setShowCalander(false);
            setStartDate(moment().startOf('year').format('YYYY-MM-DD'));
            setEndDate(moment().endOf('year').format('YYYY-MM-DD'));

            //  date will be extracted past days of current year
            setFutureDates((prev) => ({
                ...prev,
                startDate: today,
                endDate: moment().endOf('year').format('YYYY-MM-DD'),
            }));
        } else if (value === t('Common.ThisMonth')) {
            setShowCalander(false);
            setStartDate(moment().startOf('month').format('YYYY-MM-DD'));
            setEndDate(moment().endOf('month').format('YYYY-MM-DD'));

            setFutureDates((prev) => ({
                ...prev,
                startDate: today,
                endDate: moment().endOf('month').format('YYYY-MM-DD'),
            }));
        } else if (value === t('Common.ThisWeek')) {
            setShowCalander(false);
            setStartDate(moment().startOf('week').format('YYYY-MM-DD'));
            setEndDate(moment().endOf('week').format('YYYY-MM-DD'));

            setFutureDates((prev) => ({
                ...prev,
                startDate: today,
                endDate: moment().endOf('week').format('YYYY-MM-DD'),
            }));
        } else if (value === t('Common.Today')) {
            setShowCalander(false);
            setStartDate(today);
            setEndDate(today);

            setFutureDates((prev) => ({ ...prev, startDate: today, endDate: today }));
        }

        setSelectedOption(value);
    };

    useEffect(() => {
        if (employeeData && employeeData.length > 0) {
            let newData = employeeData.map((data) => ({
                value: data.id,
                label: data.name,
            }));

            // Only update if there's new data
            setSelectedEmpObj((prev) => [...newData]);

            setSelectedEmployee(newData.map((data) => data.value));
        }
    }, [employeeData]);

    const dataForFutureBookings = apiDataBookings.futureData.map((book) => ({
        id: book?.id,
        date: moment(book?.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM-YYYY'),
        name: book?.booking_details?.customer_name,
        time: `${moment(book?.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')} - ${moment(book?.booking_datetime_end, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')} `,
        service: book?.booking_details?.service_name,
        employee: book?.booking_details?.employee_name,
        status: book?.status,
        total: book?.booking_details?.price,
        GoTo: book?.id,
    }));

    const dataForPreviousBookings = apiDataBookings.previosData.map((book) => ({
        id: book?.id,
        date: moment(book?.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM-YYYY'),
        name: book?.booking_details?.customer_name,
        time: `${moment(book?.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')} - ${moment(book?.booking_datetime_end, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')} `,
        service: book?.booking_details?.service_name,
        employee: book?.booking_details?.employee_name,
        status: book?.status,
        total: book?.booking_details?.price,
        GoTo: book?.id,
    }));

    // let labels = ['Today', "This week", 'This month', 'This year', 'All'];
    let labels = [
        t('Common.Today'),
        t('Common.ThisWeek'),
        t('Common.ThisMonth'),
        t('Common.ThisYear'),
        t('Common.All'),
    ];

    if (!employeeData)
        return (
            <Stack
                sx={{
                    position: 'absolute',
                    zIndex: 100000,
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                }}
            >
                <CircularProgress size="2.5rem" sx={{ color: '#6f6f6f' }} />
            </Stack>
        );

    const handleSelectEmployee = (e) => {
        const selectedValues = e.target.value;

        let allID = selectEmpObj?.map((data) => data.value);

        if ((selectedValues === 0 || selectedValues.includes(0)) && allID.length === selectedEmployee.length) {
            setSelectedEmployee([]);
        } else if (selectedValues === 0 || selectedValues.includes(0)) {
            setSelectedEmployee(allID);
        } else if (selectedValues.length === 0) {
            setSelectedEmployee([]);
        } else {
            setSelectedEmployee(selectedValues);
        }
    };

    return (
        <Stack sx={{ maxHeight: '100%', overflowY: 'scroll' }}>
            <AppbarComponent labels={labels} selectedButton={selectedOption} handleClick={handleOptionChange} />

            <Stack sx={{ mt: { xs: 4, md: 0 }, p: { xs: 2, md: 4 } }}>
                <Bookings
                    asComponent={true}
                    selectedEmployee={selectedEmployee}
                    selectEmpObj={selectEmpObj}
                    handleEmployeeSelect={handleSelectEmployee}
                    handleClose={() => {
                        fetchBookings({ emId: selectedEmployee, stDate: startDate, enDate: endDate });
                        getFutureData({
                            emId: selectedEmployee,
                            ftStart: futureDates?.startDate,
                            ftEnd: futureDates?.endDate,
                        });
                    }}
                    stDate={startDate}
                    setStDate={setStartDate}
                    enDate={endDate}
                    setEnDate={setEndDate}
                    showCalander={showCalander}
                    compFutureData={dataForFutureBookings}
                    compPrevData={dataForPreviousBookings}
                    loadingAsComp={loading}
                />
            </Stack>
        </Stack>
    );
};

export default HistoryTable;
