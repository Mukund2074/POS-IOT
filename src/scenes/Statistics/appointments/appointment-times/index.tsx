import { Stack, Typography, useMediaQuery, Box } from '@mui/material';
import StatisticsHeader from '../../shared/header';
import { useEffect, useState, useCallback } from 'react';
import moment, { Moment } from 'moment';
import { useLocation } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { POSTable, ColumnType, RowType } from '@/components/POS/Common';
import i18next, { t } from 'i18next';
import { useDebounce } from '@/hooks/shared/useDebounce';

import { api } from '@/utils/Api/Statistics';
import {
    GetApiProductsListing200,
    GetApiStatisticsAppointmentsByTimeDateFilterType,
    GetApiStatisticsAppointmentsByTimeGroupBy,
    GetApiStatisticsAppointmentsByTimeSource,
    GetApiStatisticsAppointmentsByTime200ListData,
} from '@/shared/api/models';
import { usePOS } from '@/context/POS/POSContext';
import { CommonBarChart } from '@/components/insight/charts/StatisticsCommonBarChart';

const groupingOptions = [
    { value: 'time', label: t('Statistics.Time') },
    { value: 'week', label: t('Statistics.Weekdays') },
];

const AppointmentsTime = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const formatPercentage = (percentage: number): string => {
        const currentLang = i18next.language;

        // Use comma for Danish, decimal point for others
        return currentLang === 'da' ? percentage.toFixed(2).replace('.', ',') : percentage.toFixed(2);
    };
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [appointments, setAppointments] = useState<GetApiStatisticsAppointmentsByTime200ListData>([]);
    const [barChartData, setBarChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [services, setServices] = useState<any[]>([]);

    const [footerRows, setFooterRows] = useState<any[]>([]);

    const { product: productData } = usePOS() as {
        product: { data: GetApiProductsListing200 | null; isLoading: boolean; error: any; refetch: () => void };
    };

    useEffect(() => {
        if (productData?.data?.services) {
            const serviceGroup: any = productData.data.services.map((service) => service.services);
            console.log('serviceGroup', serviceGroup.flat());

            const parsedServices = serviceGroup.flat().map((service: any) => ({
                value: service.id,
                label: service.name,
            }));
            setServices([{ value: null, label: 'ALL' }, ...parsedServices]);
        }
    }, [productData]);

    console.log('services', services);

    interface Filters {
        startDate: Moment | null;
        endDate: Moment | null;
        grouping: string;
        createdBy: string;
        serviceId: number | null;
        type: GetApiStatisticsAppointmentsByTimeDateFilterType;
    }

    const [filters, setFilters] = useState<Filters>({
        startDate: moment().subtract(1, 'month'),
        endDate: moment(),
        grouping: 'time',
        createdBy: 'ALL',
        serviceId: null,
        type: searchParams.get('type') === 'booking' ? 'bookingDate' : 'createdDate',
    });

    const columns: ColumnType[] = [
        {
            id: 'timeSlot',
            name: filters.type === 'bookingDate' ? t('Statistics.BookingTime') : t('Statistics.CreationTime'),
            selector: (row: RowType) => (
                <Typography
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {filters.grouping === 'week' ? row.dayOfWeek : row.timeSlot}
                </Typography>
            ),
            sortable: false,
            width: isMobile ? '80%' : '85%',
            columnLabelStyles: {
                justifyContent: 'flex-start',
            },
        },
        {
            id: 'percentage',
            name: t('Statistics.Percentage'),
            selector: (row: RowType) => (
                <Typography
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'right',
                    }}
                >
                    {formatPercentage(row?.percentage)}%
                </Typography>
            ),
            sortable: false,
            columnLabelStyles: {
                justifyContent: 'flex-end',
            },
            width: isMobile ? '20%' : '15%',
        },
        {
            id: 'count',
            name: t('Statistics.AppointmentsCount'),
            selector: (row: RowType) => (
                <Typography
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'right',
                    }}
                >
                    {row.count}
                </Typography>
            ),
            sortable: false,
            columnLabelStyles: {
                justifyContent: 'flex-end',
            },
            width: isMobile ? '20%' : '15%',
        },
    ];

    const debouncedFilters = useDebounce(filters, 500);
    const [totalCount, setTotalCount] = useState(0);

    const fetchAppointments = useCallback(
        async (reset = false) => {
            try {
                setLoading(true);

                console.log('debouncedFilters', debouncedFilters);

                const response = await api.getApiStatisticsAppointmentsByTime({
                    fromDate: debouncedFilters.startDate ? debouncedFilters.startDate.format('YYYY-MM-DD') : '',
                    toDate: debouncedFilters.endDate ? debouncedFilters.endDate.format('YYYY-MM-DD') : '',
                    groupBy: debouncedFilters.grouping as GetApiStatisticsAppointmentsByTimeGroupBy,
                    serviceId: debouncedFilters.serviceId,
                    source: debouncedFilters.createdBy as GetApiStatisticsAppointmentsByTimeSource,
                    dateFilterType: debouncedFilters.type as GetApiStatisticsAppointmentsByTimeDateFilterType,
                });

                setTotalCount(response.totalCount);
                setBarChartData(response.barChartData);
                if (debouncedFilters.grouping === 'week') {
                    const finalResponse = response.listData.map((item) => {
                        return {
                            ...item,
                            timeSlot: item.dayOfWeek,
                        };
                    });
                    setAppointments(finalResponse);

                    const finalBarChartData = response.barChartData.map((item) => {
                        return {
                            ...item,
                            value: (item as any).dayOfWeek,
                        };
                    });
                    setBarChartData(finalBarChartData);
                } else {
                    setAppointments(response.listData);
                    const finalBarChartData = response.barChartData.map((item) => {
                        return {
                            ...item,
                            value: (item as any).timeSlot,
                        };
                    });
                    setBarChartData(finalBarChartData);
                }

                console.log('footerRows', footerRows);
                setFooterRows(footerRows);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        },
        [debouncedFilters],
    );

    useEffect(() => {
        fetchAppointments(true);
    }, [debouncedFilters, fetchAppointments]);

    const updateFilters = useCallback((updates: Partial<Filters>) => {
        setFilters((prev) => ({ ...prev, ...updates }));
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

    const handleCreatedByChange = useCallback(
        (event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
            updateFilters({ createdBy: event.target.value as string });
        },
        [updateFilters],
    );

    const handleServiceChange = useCallback(
        (event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
            updateFilters({ serviceId: event.target.value as number });
        },
        [updateFilters],
    );

    return (
        <Stack sx={{ p: 2, m: 0 }}>
            <StatisticsHeader
                startDate={filters.startDate}
                endDate={filters.endDate}
                exportButton={false}
                services={services}
                selectedService={filters.serviceId ? Number(filters.serviceId) : null}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                selectedCreatedBy={filters.createdBy}
                onCreatedByChange={handleCreatedByChange}
                selectedGrouping={filters.grouping}
                onServiceChange={handleServiceChange}
                onGroupingChange={(event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
                    // setSelectedGrouping(event.target.value as string);
                    setFilters({ ...filters, grouping: event.target.value as string });
                }}
                label={`${t('Statistics.Appointments')}: ${
                    searchParams.get('type') === 'booking'
                        ? t('Statistics.BookingTimes')
                        : t('Statistics.AppointmentTimes')
                }`}
                groupingOptions={groupingOptions}
            />
            <Box mb={3} mt={2}>
                <CommonBarChart data={barChartData} loading={loading} />
            </Box>
            {/* )} */}

            <POSTable
                columns={columns}
                data={appointments}
                loading={loading}
                onRowClick={(row) => {}}
                defaultOrder="start_time"
                isServerSorting
                onSort={() => {}}
                serverSortOrder="asc"
                maxHeight="calc(100vh - 250px)"
                rowHeight="60px"
                footerRows={footerRows}
            />
        </Stack>
    );
};

export default AppointmentsTime;
