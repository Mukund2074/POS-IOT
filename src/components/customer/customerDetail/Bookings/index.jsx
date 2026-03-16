import { Grid2, Stack, Typography } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { t } from 'i18next';
import { Circle } from '@mui/icons-material';
import FSelect from '../../../commonComponents/F_Select';
import FButton from '../../../commonComponents/F_Button';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import FCommonTable from '../../../commonComponents/F_commonTable';
import moment from 'moment';
import { toast } from 'react-toastify';
import { HttpStatusCode } from 'axios';
import { DropDown } from '../../../insight/customDropDown';
import dayjs from 'dayjs';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCustomerBookingsApi } from '../../../../utils/Api/Customer';
import { useCustomer } from '../../../../context/customer/CustomerContext';

export default function Bookings({
    asComponent = false,
    selectedEmployee,
    selectEmpObj,
    handleEmployeeSelect,
    handleClose,
    stDate = dayjs(),
    setStDate,
    enDate = dayjs(),
    setEnDate,
    showCalander = false,

    compFutureData,
    compPrevData,
    loadingAsComp = false,
}) {
    const [apiDataBookings, setApiDataBookings] = useState({
        futureData: [],
        previosData: [],
    });
    const navigate = useNavigate();
    const location = useLocation();
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [customer, setCustomer] = useState(location?.state?.data);
    const { customer: customerData } = useCustomer();
    const { id } = useParams();

    moment.locale('en-gb');

    useEffect(() => {
        if (customerData) {
            setCustomer(customerData);
        }
    }, [customerData]);

    const bookigsColumns = [
        { id: 'id', label: `${t('Common.ID')}`, sortable: false },
        { id: 'date', label: `${t('Common.Date')}`, sortable: true },
        { id: 'name', label: `${t('Common.Name')}`, sortable: true },
        { id: 'time', label: `${t('Common.Time')}`, sortable: false },
        { id: 'service', label: `${t('Common.Service')}`, sortable: false },
        { id: 'employee', label: `${t('Common.CapsEmployee')}`, sortable: false },
        { id: 'status', label: `${t('Common.Status')}`, sortable: false },
        { id: 'total', label: `${t('Common.Total')}`, sortable: true },
        { id: 'GoTo', label: '', sortable: false },
    ];

    const fetchBookings = async () => {
        try {
            const futureResponse = await getCustomerBookingsApi({
                id,
                params: { date: moment().format('YYYY-MM-DD') },
            });
            const previousResponse = await getCustomerBookingsApi({
                id,
                params: { to_date: moment().format('YYYY-MM-DD') },
            });

            if (futureResponse.status === HttpStatusCode.Ok) {
                setApiDataBookings((prev) => ({
                    ...prev,
                    futureData: futureResponse.data.data,
                }));
            }
            if (previousResponse.status === HttpStatusCode.Ok) {
                setApiDataBookings((prev) => ({
                    ...prev,
                    previosData: previousResponse.data.data,
                }));
            }
        } catch (error) {
            toast.error('Failed to fetch bookings');
        }
    };

    useEffect(() => {
        if (customer?.id && !asComponent) {
            fetchBookings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer?.id, startDate, endDate]);

    // const statusObj = {
    //     BOOKED: t('Common.Pending'),
    //     RESCHEDULED: t('Common.Pending'),
    //     OFFER_ACCEPTED: t('Common.Pending'),
    //     NOSHOW: t('Common.Absence'),
    //     OFFERED: t('Common.Cancelled'),
    //     CANCELLED: t('Common.Cancelled'),
    //     COMPLETED: t('Common.Completed'),
    //     AUTOCOMPLETED: t('Common.Completed'),
    //     Pending: t('Common.Pending'),
    //     Completed: t('Common.Completed'),
    //     Cancelled: t('Common.Cancelled'),
    //     Absence: t('Common.Absence'),
    // };

    // Function to count statuses
    const countStatuses = (bookings) => {
        let counts = {
            BOOKED: 0,
            RESCHEDULED: 0,
            OFFER_ACCEPTED: 0,
            NOSHOW: 0,
            OFFERED: 0,
            CANCELLED: 0,
            COMPLETED: 0,
            AUTOCOMPLETED: 0,
        };

        bookings.forEach((booking) => {
            counts[booking.status]++;
        });

        return [
            { label: `${counts.BOOKED} ${t('Common.Pending')}`, color: '#E19957' },
            {
                label: `${parseInt(counts.COMPLETED) + parseInt(counts.AUTOCOMPLETED)} ${t('Common.Completed')}`,
                color: '#367B3D',
            },
            {
                label: `${counts.CANCELLED} ${t('Common.Cancelled')}`,
                color: '#C74141',
            },
            { label: `${counts.NOSHOW} ${t('Common.Absence')}`, color: '#A36437' },
        ];
    };

    // Preparing data for future and previous bookings
    const dataForFutureBookings = apiDataBookings.futureData.map((book) => ({
        id: book?.id,
        date: moment(book?.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM-YYYY'),
        name: book?.booking_details?.customer_name,
        time: `${moment(book?.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')} - ${moment(
            book?.booking_datetime_end,
            'YYYY-MM-DDTHH:mm:ss',
        ).format('HH:mm')} `,
        service: book?.booking_details?.service_name,
        employee: book?.booking_details?.employee_name,
        status: book?.status,
        total: parseFloat(book?.total_amount),
        GoTo: book?.id,
    }));

    const dataForPreviousBookings = apiDataBookings.previosData.map((book) => ({
        id: book?.id,
        date: moment(book?.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM-YYYY'),
        name: book?.booking_details?.customer_name,
        time: `${moment(book?.booking_datetime_start, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')} - ${moment(
            book?.booking_datetime_end,
            'YYYY-MM-DDTHH:mm:ss',
        ).format('HH:mm')} `,
        service: book?.booking_details?.service_name,
        employee: book?.booking_details?.employee_name,
        status: book?.status,
        total: parseFloat(book?.total_amount),
        GoTo: book?.id,
    }));

    // Count statuses for future and previous bookings
    // const rawDataFuture = countStatuses(apiDataBookings.futureData);
    // const rawDataPrevious = countStatuses(apiDataBookings.previosData);

    const rawDataPrevious = useMemo(() => {
        return countStatuses(asComponent ? compPrevData : apiDataBookings?.previosData);
    }, [asComponent ? compPrevData : apiDataBookings?.previosData]);

    const filterdColumns = bookigsColumns.filter((column) => column.id !== 'id');

    const handleRowClick = (data) => {
        // Convert moment object to a serializable string
        const item = {
            date: moment(data?.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            booking_id: data?.id,
        };

        // Now you can safely pass this to navigate
        navigate(`/calendar?d=${item?.date}&i=${item?.booking_id}`);
    };

    return (
        <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack
                display={'flex'}
                flexDirection={{ xs: 'column', lg: 'row' }}
                justifyContent={'space-between'}
                alignItems={{ xs: 'flex-start', lg: 'center' }}
                mt={asComponent ? 4 : 1}
            >
                <FPrimaryHeading
                    sx={{ textWrap: 'nowrap' }}
                    fontColor={'#545454'}
                    text={t('Customer.FutureBookings')}
                />
                {asComponent ? (
                    <FSelect
                        sx={{ minWidth: { xs: '100%', lg: '20%' } }}
                        placeholderText={t('Common.SelectEmployee')}
                        isMultiSelect
                        padding="0"
                        options={selectEmpObj}
                        value={selectedEmployee}
                        selectAllRenderText={t('Common.AllEmployees')}
                        TextToDisplayWithCount={t('Common.Employees')}
                        onChange={handleEmployeeSelect}
                        onClose={handleClose}
                    />
                ) : (
                    <Stack display={{ md: 'flex' }} flexDirection={'row'} width={'100%'} justifyContent={'flex-end'}>
                        <FButton
                            variant={'save'}
                            title={`+ ${t('Customer.NewBooking')}`}
                            sx={{ py: 1, width: { xs: '100%', md: '24%' }, mt: { xs: 2, md: 0 } }}
                            onClick={() => {
                                navigate('/calendar', { state: customer });
                            }}
                        />
                    </Stack>
                )}
            </Stack>
            <FCommonTable
                visibleColumns={['date', 'name', 'time', 'service', 'employee', 'status', 'total', 'GoTo']}
                columnWidths={{
                    date: '10%',
                    name: '15%',
                    time: '10%',
                    service: '35%',
                    employee: '15%',
                    status: '10%',
                    total: '10%',
                    GoTo: '0%',
                }}
                columns={filterdColumns}
                data={asComponent ? compFutureData : dataForFutureBookings}
                loading={asComponent ? loadingAsComp.future : false}
                onRowClick={handleRowClick}
                showNavigatorArrow={false}
            />

            <Stack mt={4} gap={1} display={'flex'} flexDirection={'column'} alignItems={'center'}>
                {showCalander && (
                    <Stack width={{ xs: '100%', md: '20%' }} ml={'auto'}>
                        <DropDown
                            show={showCalander}
                            setStartDate={asComponent ? setStDate : setStartDate}
                            setEndDate={asComponent ? setEnDate : setEndDate}
                            startdate={asComponent ? stDate : startDate}
                            endDate={asComponent ? enDate : endDate}
                        />
                    </Stack>
                )}
                <Stack
                    width={'100%'}
                    display={'flex'}
                    flexDirection={{ xs: 'column', md: 'row' }}
                    justifyContent={'space-between'}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                    <FPrimaryHeading fontColor={'#545454'} text={t('Customer.PreviousBookings')} />

                    {/* REPLACE this Stack with a responsive Grid */}
                    <Grid2 container spacing={2} mt={{ xs: 2, md: 0 }} sx={{ width: { xs: '100%', md: '50%' } }}>
                        {rawDataPrevious.length > 0 &&
                            rawDataPrevious.map((data, i) => (
                                <Grid2 item size={{ xs: 6, md: 3 }} key={i}>
                                    <Typography
                                        noWrap
                                        display={'flex'}
                                        alignItems={'center'}
                                        gap={1}
                                        variant="body1"
                                        sx={{ fontWeight: 500, color: '#545454' }}
                                    >
                                        <Circle fontSize="10px" sx={{ color: data.color }} />
                                        {data.label}
                                    </Typography>
                                </Grid2>
                            ))}
                    </Grid2>
                </Stack>
            </Stack>

            <FCommonTable
                visibleColumns={['date', 'name', 'time', 'service', 'employee', 'status', 'total', 'GoTo']}
                columnWidths={{
                    date: '10%',
                    name: '15%',
                    time: '10%',
                    service: '35%',
                    employee: '15%',
                    status: '10%',
                    total: '10%',
                    GoTo: '0%',
                }}
                columns={filterdColumns}
                data={asComponent ? compPrevData : dataForPreviousBookings}
                loading={asComponent ? loadingAsComp.previous : false}
                onRowClick={handleRowClick}
                showNavigatorArrow={false}
            />
        </Stack>
    );
}
