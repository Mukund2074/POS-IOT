import { Stack, Typography, useMediaQuery, Box } from '@mui/material';
import StatisticsHeader from '../../shared/header';
import { useEffect, useState, useCallback } from 'react';
import moment, { Moment } from 'moment';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { POSTable, ColumnType, RowType } from '@/components/POS/Common';
import i18next, { t } from 'i18next';
import { useDebounce } from '@/hooks/shared/useDebounce';

import { GetApiStatisticsAppointments200ItemsItem } from '@/shared/api/models/getApiStatisticsAppointments200ItemsItem';
import { api } from '@/utils/Api/Statistics';
import { GetApiStatisticsServices200ServicesItem, GetApiStatisticsServicesStatus } from '@/shared/api/models';
import { CommonBarChart } from '@/components/insight/charts/StatisticsCommonBarChart';

type Appointment = GetApiStatisticsAppointments200ItemsItem;

const formatPercentage = (percentage: number): string => {
    const currentLang = i18next.language;

    // Use comma for Danish, decimal point for others
    return currentLang === 'da' ? percentage.toFixed(2).replace('.', ',') : percentage.toFixed(2);
};

const AppointmentsServices = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [services, setServices] = useState<GetApiStatisticsServices200ServicesItem[]>([]);
    const [barChartData, setBarChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [footerRows, setFooterRows] = useState<any[]>([]);
    // const [dataForColumn, setDataForColumn] = useState<any[]>([]);

    const columns: ColumnType[] = [
        {
            id: 'serviceName',
            name: t('Statistics.Service'),
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
                    {row.serviceName}
                </Typography>
            ),
            sortable: false,
            width: isMobile ? '80%' : '75%',
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
                    {formatPercentage(row.percentage)}%
                </Typography>
            ),
            sortable: false,
            columnLabelStyles: {
                justifyContent: 'flex-end',
            },
            width: isMobile ? '10%' : '10%',
        },
        {
            id: 'numberOfBookings',
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
                    {row.numberOfBookings}
                </Typography>
            ),
            sortable: false,
            columnLabelStyles: {
                justifyContent: 'flex-end',
            },
            width: isMobile ? '20%' : '15%',
        },
    ];

    interface Filters {
        startDate: Moment | null;
        endDate: Moment | null;
        status: string;
    }

    const [filters, setFilters] = useState<Filters>({
        startDate: moment().subtract(1, 'month'),
        endDate: moment(),
        status: 'ALL',
    });

    const debouncedFilters = useDebounce(filters, 500);
    const [totalCount, setTotalCount] = useState(0);

    const fetchAppointments = useCallback(
        async (reset = false) => {
            try {
                setLoading(true);

                console.log('debouncedFilters', debouncedFilters);
                const response = await api.getApiStatisticsServices({
                    status: debouncedFilters.status as GetApiStatisticsServicesStatus, // fix type error if needed
                    fromDate: debouncedFilters.startDate ? debouncedFilters.startDate.format('YYYY-MM-DD') : '',
                    toDate: debouncedFilters.endDate ? debouncedFilters.endDate.format('YYYY-MM-DD') : '',
                });

                console.log('response', response);
                setServices(
                    response.services.map((serviceObj) => ({
                        ...serviceObj,
                        id: serviceObj.serviceId,
                    })),
                );
                setBarChartData(
                    response.services.map((serviceObj) => ({
                        value: serviceObj.serviceName,
                        count: serviceObj.numberOfBookings,
                    })),
                );
                setTotalCount(response.totalBookings);
                // setBarChartData(response.services);

                const footerRows: any[] = [
                    {
                        cells: [
                            {
                                columnId: 'serviceName',
                                content: t('Statistics.Total'),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                },
                            },
                            {
                                columnId: 'percentage',
                                content: '',
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                },
                            },
                            {
                                columnId: 'numberOfBookings',
                                content: response.totalBookings,
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                },
                            },
                        ],
                        sx: {
                            backgroundColor: '#f5f5f5',
                        },
                    },
                ];

                // // console.log('test data', response.listData);
                // if (response.listData.length > 0) {
                //     if (
                //         response.listData[0].period.includes('*') ||
                //         response.listData[response.listData.length - 1].period.includes('*')
                //     ) {
                //         footerRows.push({
                //             cells: [
                //                 {
                //                     columnId: 'period',
                //                     content: `*${t('Statistics.PeriodNotComplete')}`,
                //                     sx: {
                //                         fontWeight: 500,
                //                         fontSize: '0.85rem',
                //                         paddingTop: 0,
                //                         marginTop: 0,
                //                     },
                //                 },
                //                 {
                //                     columnId: 'count',
                //                     content: '',
                //                     sx: {
                //                         fontWeight: 500,
                //                         fontSize: '0.85rem',
                //                         paddingTop: 0,
                //                         marginTop: 0,
                //                     },
                //                 },
                //             ],
                //             sx: {
                //                 backgroundColor: '#f5f5f5',
                //             },
                //         });
                //     }
                // }

                // console.log('footerRows', footerRows);
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

    return (
        <Stack sx={{ p: 2, m: 0 }}>
            <StatisticsHeader
                startDate={filters.startDate}
                endDate={filters.endDate}
                exportButton={false}
                // selectedGrouping={filters.grouping}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                // onGroupingChange={(event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
                //     // setSelectedGrouping(event.target.value as string);
                //     setFilters({ ...filters, grouping: event.target.value as string });
                // }}
                label={`${t('Statistics.Appointments')}: ${t('Statistics.AppointmentsServices')}`}
                // groupingOptions={groupingOptions}
                selectedStatus={filters.status}
                onStatusChange={(event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
                    // setSelectedGrouping(event.target.value as string);
                    updateFilters({ status: event.target.value as string });
                }}
            />
            {/* <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Count:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
                    {totalCount}
                </Typography>
            </Stack> */}

            {/* {barChartData.length > 0 && ( */}
            <Box mb={3} mt={2}>
                <CommonBarChart data={barChartData} loading={loading} />
            </Box>
            {/* )} */}

            <POSTable
                columns={columns}
                data={services}
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

export default AppointmentsServices;
