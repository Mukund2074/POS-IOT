import { Stack, Typography, useMediaQuery, Box } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState, useCallback } from 'react';
import moment, { Moment } from 'moment';
import i18next, { t } from 'i18next';

import { POSTable, ColumnType, RowType } from '@/components/POS/Common';
import { useDebounce } from '@/hooks/shared/useDebounce';
import { GetApiStatisticsAppointments200ItemsItem } from '@/shared/api/models/getApiStatisticsAppointments200ItemsItem';
import { api } from '@/utils/Api/Statistics';
import { GetApiStatisticsGroupedGrouping } from '@/shared/api/models/getApiStatisticsGroupedGrouping';
import StatisticsHeader from '../../shared/header';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { CommonBarChart } from '@/components/insight/charts/StatisticsCommonBarChart';

type Appointment = GetApiStatisticsAppointments200ItemsItem;

const groupingOptions = [
    // { value: 'TIME', label: t('Statistics.Time') },
    { value: 'weekly', label: t('Statistics.Weekly') },
    { value: 'monthly', label: t('Statistics.Monthly') },
    { value: 'yearly', label: t('Statistics.Yearly') },
];

const AppointmentsRevenue = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [barChartData, setBarChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [footerRows, setFooterRows] = useState<any[]>([]);
    // const [dataForColumn, setDataForColumn] = useState<any[]>([]);

    const columns: ColumnType[] = [
        {
            id: 'period',
            name: t('Statistics.Period'),
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
                    {row.period}
                </Typography>
            ),
            sortable: false,
            width: isMobile ? '80%' : '85%',
            columnLabelStyles: {
                justifyContent: 'flex-start',
            },
        },
        {
            id: 'revenue',
            name: t('Statistics.Value'),
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
                    {formatCurrency(row.revenue)}
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
        grouping: string;
    }

    const [filters, setFilters] = useState<Filters>({
        startDate: moment().subtract(1, 'month'),
        endDate: moment(),
        grouping: 'weekly',
    });

    const debouncedFilters = useDebounce(filters, 500);
    const [totalCount, setTotalCount] = useState(0);

    const fetchAppointments = useCallback(
        async (reset = false) => {
            try {
                setLoading(true);

                const response = await api.getApiStatisticsGrouped({
                    grouping: debouncedFilters.grouping as GetApiStatisticsGroupedGrouping, // fix type error if needed
                    fromDate: debouncedFilters.startDate ? debouncedFilters.startDate.format('YYYY-MM-DD') : '',
                    toDate: debouncedFilters.endDate ? debouncedFilters.endDate.format('YYYY-MM-DD') : '',
                    metric: 'revenue',
                    status: 'ALL',
                });

                console.log('response', response);

                setTotalCount(response.totalRevenue);
                setBarChartData(
                    response.barChartData.map((item) => ({
                        value: item.period,
                        count: item.revenue,
                    })),
                );
                setAppointments(response.listData);

                const footerRows: any[] = [
                    {
                        cells: [
                            {
                                columnId: 'period',
                                content: t('Statistics.Total'),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                },
                            },
                            {
                                columnId: 'revenue',
                                content: formatCurrency(response.totalRevenue),
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

                // console.log('test data', response.listData);
                if (response.listData.length > 0) {
                    if (
                        response.listData[0].period.includes('*') ||
                        response.listData[response.listData.length - 1].period.includes('*')
                    ) {
                        footerRows.push({
                            cells: [
                                {
                                    columnId: 'period',
                                    content: `*${t('Statistics.PeriodNotComplete')}`,
                                    sx: {
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
                                        paddingTop: 0,
                                        marginTop: 0,
                                    },
                                },
                                {
                                    columnId: 'revenue',
                                    content: '',
                                    sx: {
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
                                        paddingTop: 0,
                                        marginTop: 0,
                                    },
                                },
                            ],
                            sx: {
                                backgroundColor: '#f5f5f5',
                            },
                        });
                    }
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

    return (
        <Stack sx={{ p: 2, m: 0 }}>
            <StatisticsHeader
                startDate={filters.startDate}
                endDate={filters.endDate}
                exportButton={false}
                selectedGrouping={filters.grouping}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onGroupingChange={(event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
                    // setSelectedGrouping(event.target.value as string);
                    setFilters({ ...filters, grouping: event.target.value as string });
                }}
                label={`${t('Statistics.Appointments')}: ${t('Statistics.Value')}`}
                groupingOptions={groupingOptions}
            />
            {/* <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Count:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
                    {formatCurrency(totalCount)}
                </Typography>
            </Stack> */}

            {/* {barChartData.length > 0 && ( */}
            <Box mb={3} mt={2}>
                <CommonBarChart
                    data={barChartData}
                    loading={loading}
                    tooltipLabel={t('Common.Amount')}
                    formaCurrency={true}
                />
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

export default AppointmentsRevenue;
