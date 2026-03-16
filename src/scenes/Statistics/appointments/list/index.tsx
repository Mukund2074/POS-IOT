import { Stack, Typography, useMediaQuery } from '@mui/material';
import StatisticsHeader from '../../shared/header';
import { useEffect, useState, useCallback } from 'react';
import moment, { Moment } from 'moment';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { POSTable, ColumnType, RowType } from '@/components/POS/Common';
import { t } from 'i18next';
import { useDebounce } from '@/hooks/shared/useDebounce';

import { GetApiStatisticsAppointments200ItemsItem } from '@/shared/api/models/getApiStatisticsAppointments200ItemsItem';
import { api } from '@/utils/Api/Statistics';

type Appointment = GetApiStatisticsAppointments200ItemsItem;

const AppointmentsList = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const PAGE_SIZE = 500;
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingButton, setLoadingButton] = useState(false);
    const [offset, setOffset] = useState(0);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [dataForColumn, setDataForColumn] = useState<any[]>([]);

    const columns: ColumnType[] = [
        {
            id: 'customer',
            name: t('Common.Customers'),
            selector: (row: RowType) => row.customer,
            sortable: false,
            width: isMobile ? '40%' : '25%',
        },
        {
            id: 'service',
            name: t('Common.Service'),
            selector: (row: RowType) => row.service,
            sortable: false,
            width: isMobile ? '35%' : '60%',
        },
        {
            id: 'start_time',
            name: t('Common.Time'),
            selector: (row: RowType) => row.start_time,
            sortable: false,
            width: isMobile ? '25%' : '15%',
        },
    ];

    interface Filters {
        startDate: Moment | null;
        endDate: Moment | null;
        status: string;
        service: number | null;
        createdBy: string;
    }

    const [filters, setFilters] = useState<Filters>({
        startDate: moment().subtract(1, 'month'),
        endDate: moment(),
        status: '',
        service: null,
        createdBy: '',
    });

    const debouncedFilters = useDebounce(filters, 500);
    const [totalCount, setTotalCount] = useState(0);

    const fetchAppointments = useCallback(
        async (reset = false) => {
            try {
                setLoading(true);

                const response = await api.getApiStatisticsAppointments({
                    page: reset ? 0 : offset,
                    limit: PAGE_SIZE,
                    fromDate: debouncedFilters.startDate?.format('YYYY-MM-DD'),
                    toDate: debouncedFilters.endDate?.format('YYYY-MM-DD'),
                    responseFormat: 'json',
                });

                const total = response.totalItems;
                const newAppointments = response.items;
                setTotalCount(total);

                if (reset) {
                    setAppointments(newAppointments);
                } else {
                    setAppointments((prev) => [...prev, ...newAppointments]);
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        },
        [debouncedFilters, offset, PAGE_SIZE],
    );

    useEffect(() => {
        fetchAppointments(true);
    }, [debouncedFilters, fetchAppointments]);

    const updateFilters = useCallback((updates: Partial<Filters>) => {
        setFilters((prev) => ({ ...prev, ...updates }));
        setOffset(0);
    }, []);

    const handleStartDateChange = useCallback(
        (date: Moment | null) => {
            updateFilters({ startDate: date });
        },
        [updateFilters],
    );

    const handleEndDateChange = useCallback(
        (date: Moment | null) => {
            updateFilters({ endDate: date });
        },
        [updateFilters],
    );

    const handleStatusChange = useCallback(
        (event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
            updateFilters({ status: event.target.value as string });
        },
        [updateFilters],
    );

    const handleServiceChange = useCallback(
        (event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
            const value = event.target.value === '' ? null : Number(event.target.value);
            updateFilters({ service: value });
        },
        [updateFilters],
    );

    const handleCreatedByChange = useCallback(
        (event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
            updateFilters({ createdBy: event.target.value as string });
        },
        [updateFilters],
    );

    const handleSort = useCallback(
        (column: string) => {
            const newOrder = order === 'asc' ? 'desc' : 'asc';
            setOrder(newOrder);
            setOffset(0);
            fetchAppointments(true);
        },
        [order, fetchAppointments],
    );

    const handleExportCSV = useCallback(async () => {
        try {
            setLoadingButton(true);
            const response = await api.getApiStatisticsExportAppointments({
                fromDate: debouncedFilters.startDate?.format('YYYY-MM-DD'),
                toDate: debouncedFilters.endDate?.format('YYYY-MM-DD'),
            });

            console.log('response', response);

            if (response) {
                const blob = new Blob([response], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bookings_${moment().format('YYYY_MM_DD_HH_mm_ss')}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);

                //  showToast(t('Setting.SuccessInExport'), 'success');
            }
        } catch (error) {
            console.error('Error exporting appointments:', error);
        } finally {
            setLoadingButton(false);
        }
    }, [debouncedFilters]);

    useEffect(() => {
        const data = appointments.map((appointment) => ({
            id: appointment.id,
            customer: appointment.customerName,
            service: appointment.serviceName,
            start_time: appointment.dateTime,
            status: appointment.status,
            created_by: appointment.customerName, // Using customerName as fallback since createdBy is not available
        }));
        setDataForColumn(data);
    }, [appointments]);

    // Loading state is now handled by POSTable

    return (
        <Stack sx={{ p: 2, m: 0 }}>
            <StatisticsHeader
                startDate={filters.startDate}
                endDate={filters.endDate}
                selectedStatus={filters.status}
                // selectedService={null}
                selectedCreatedBy={filters.createdBy}
                services={[]}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onGroupingChange={() => {}}
                onStatusChange={handleStatusChange}
                onServiceChange={handleServiceChange}
                onCreatedByChange={handleCreatedByChange}
                onExportCSV={handleExportCSV}
                loadingButton={loadingButton}
            />
            <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Count:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
                    {totalCount}
                </Typography>
            </Stack>

            <POSTable
                columns={columns}
                data={dataForColumn}
                loading={loading}
                onRowClick={(row) => {}}
                defaultOrder="start_time"
                isServerSorting
                onSort={handleSort}
                serverSortOrder={order}
                maxHeight="calc(100vh - 250px)"
                rowHeight="60px"
            />
        </Stack>
    );
};

export default AppointmentsList;
