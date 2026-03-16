import { Stack, Typography, useMediaQuery, Box } from '@mui/material';
import StatisticsHeader from '../../shared/header';
import { useEffect, useState, useCallback } from 'react';
import moment, { Moment } from 'moment';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { POSTable, ColumnType, RowType } from '@/components/POS/Common';
import { t } from 'i18next';
import { useDebounce } from '@/hooks/shared/useDebounce';

// import { GetApiStatisticsAppointments200ItemsItem } from '@/shared/api/models/getApiStatisticsAppointments200ItemsItem';
import { api } from '@/utils/Api/Statistics';
import { useLocation } from 'react-router-dom';
import {
    GetApiStatisticsSales200ListDataItem,
    GetApiStatisticsSalesSummary200,
    GetApiStatisticsSalesSummary200PaymentMethodItem,
    GetApiStatisticsSalesSummary200SoldItemsItem,
    GetApiStatisticsSalesSummary200Summary,
} from '@/shared/api/models';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { CommonBarChart } from '@/components/insight/charts/StatisticsCommonBarChart';

// type Appointment = GetApiStatisticsAppointments200ItemsItem;

const groupingOptions = [
    // { value: 'TIME', label: t('Statistics.Time') },
    { value: 'daily', label: t('Statistics.Daily') },
    { value: 'weekly', label: t('Statistics.Weekly') },
    { value: 'monthly', label: t('Statistics.Monthly') },
    { value: 'yearly', label: t('Statistics.Yearly') },
];

const paymentTypes = {
    CASH: t('POS.Cash'),
    CARD: t('POS.Card'),
    OTHER: t('POS.Other'),
    BANK_TRANSFER: t('POS.BankTransfer'),
    OUTSTANDING: t('POS.Outstanding'),
    MOBILE_PAY: t('POS.MOBILE_PAY'),
    GIFT_CARD: t('POS.GiftCard'),
    CUT_CARD: t('POS.CutCard'),
};

const CashRegisterSalesSummary = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [listData, setListData] = useState<GetApiStatisticsSales200ListDataItem[]>([]);
    const [barChartData, setBarChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [summaryData, setSummaryData] = useState<GetApiStatisticsSalesSummary200Summary>({
        subTotal: 0,
        tax: 0,
        netTotal: 0,
    });
    const [soldItems, setSoldItems] = useState<GetApiStatisticsSalesSummary200SoldItemsItem[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<GetApiStatisticsSalesSummary200PaymentMethodItem[]>([]);

    const [salesSummary, setSalesSummary] = useState<GetApiStatisticsSalesSummary200 & { soldItems: RowType[] }>({
        summary: {
            subTotal: 0,
            tax: 0,
            netTotal: 0,
        },
        soldItems: [],
        paymentMethod: [],
    });

    const [footerRows, setFooterRows] = useState<any[]>([]);
    // const [dataForColumn, setDataForColumn] = useState<any[]>([]);

    const columns: ColumnType[] = [
        {
            id: 'name',
            name: t('Statistics.Sales'),
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
                    {row.name}
                </Typography>
            ),
            sortable: false,
            width: isMobile ? '70%' : '70%',
            columnLabelStyles: {
                justifyContent: 'flex-start',
            },
        },
        {
            id: 'count',
            name: t('Statistics.SalesCount'),
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
                    {row.quantity}
                </Typography>
            ),
            sortable: false,
            columnLabelStyles: {
                justifyContent: 'flex-end',
            },
            width: isMobile ? '10%' : '10%',
        },
        {
            id: 'amount',
            name: t('Common.Amount'),
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
                    {formatCurrency(row.amount)}
                </Typography>
            ),
            sortable: false,
            columnLabelStyles: {
                justifyContent: 'flex-end',
            },
            width: isMobile ? '20%' : '20%',
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
        grouping: 'daily',
    });

    const debouncedFilters = useDebounce(filters, 500);
    const [totalCount, setTotalCount] = useState(0);

    const fetchSales = useCallback(
        async (reset = false) => {
            try {
                setLoading(true);

                const response = await api.getApiStatisticsSalesSummary({
                    fromDate: debouncedFilters.startDate ? debouncedFilters.startDate.format('YYYY-MM-DD') : '',
                    toDate: debouncedFilters.endDate ? debouncedFilters.endDate.format('YYYY-MM-DD') : '',
                });

                setSalesSummary({
                    ...response,
                    soldItems: response.soldItems.map((item, index) => ({ ...item, id: index })),
                });
                console.log('response', response);
                // setListData(response.listData);

                // setTotalCount(response.totalCount);
                // setBarChartData(
                //     response.listData.map((item) => ({
                //         value: item.period,
                //         count: item.amount,
                //     })),
                // );
                // setAppointments(response.listData);

                const footerRows: any[] = [
                    {
                        cells: [
                            {
                                columnId: 'name',
                                content: t('Statistics.SubTotal'),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    color: '#000',
                                },
                            },
                            {
                                columnId: 'count',
                                content: '',
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                    color: '#000',
                                },
                            },
                            {
                                columnId: 'amount',
                                content: formatCurrency(response.summary.subTotal),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                    color: '#000',
                                },
                            },
                        ],
                        sx: {
                            backgroundColor: '#ffffff',
                        },
                    },

                    {
                        cells: [
                            {
                                columnId: 'name',
                                content: t('Statistics.Tax'),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    // paddingTop: 0,
                                    // marginTop: 0,
                                    color: '#000',
                                },
                            },
                            {
                                columnId: 'count',
                                content: '',
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                    // paddingTop: 0,
                                    // marginTop: 0,
                                    color: '#000',
                                },
                            },
                            {
                                columnId: 'amount',
                                content: formatCurrency(response.summary.tax),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                    // paddingTop: 0,
                                    // marginTop: 0,
                                    color: '#000',
                                },
                            },
                        ],
                        sx: {
                            backgroundColor: '#ffffff',
                        },
                    },

                    {
                        cells: [
                            {
                                columnId: 'name',
                                content: t('Statistics.NetTotal'),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    // paddingTop: 0,
                                    // marginTop: 0,
                                    color: '#000',
                                },
                            },
                            {
                                columnId: 'count',
                                content: '',
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                    // paddingTop: 0,
                                    // marginTop: 0,
                                    color: '#000',
                                },
                            },
                            {
                                columnId: 'amount',
                                content: formatCurrency(response.summary.netTotal),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                    // paddingTop: 0,
                                    // marginTop: 0,
                                    color: '#000',
                                },
                            },
                        ],
                        sx: {
                            backgroundColor: '#ffffff',
                        },
                    },

                    {
                        cells: [
                            {
                                columnId: 'name',
                                content: t('Statistics.Payments'),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    color: '#000',
                                },
                            },
                            {
                                columnId: 'count',
                                content: '',
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                },
                            },
                            {
                                columnId: 'amount',
                                content: '',
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                },
                            },
                        ],
                        sx: {
                            backgroundColor: '#f5f5f5',
                            // borderTop: '1px solid #000',
                        },
                    },
                ];

                let totalPayment = 0;
                response.paymentMethod.forEach((payment) => {
                    console.log('payment', payment);
                    totalPayment += payment.paymentAmount;
                    footerRows.push({
                        cells: [
                            {
                                columnId: 'name',
                                content: `${paymentTypes[payment.paymentType as keyof typeof paymentTypes]}`,
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                },
                            },
                            {
                                columnId: 'count',
                                content: `${payment.paymentCount}`,
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                },
                            },
                            {
                                columnId: 'amount',
                                content: `${formatCurrency(payment.paymentAmount)}`,
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                },
                            },
                        ],
                        sx: {
                            backgroundColor: '#ffffff',
                            // borderTop: '1px solid #000',
                        },
                    });
                });
                footerRows.push({
                    cells: [
                        {
                            columnId: 'name',
                            content: `${t('Statistics.Total')}`,
                            sx: {
                                fontWeight: 700,
                                fontSize: '1rem',
                                color: '#000',
                            },
                        },
                        {
                            columnId: 'count',
                            content: '',
                            sx: {
                                fontWeight: 700,
                                fontSize: '1rem',
                                textAlign: 'right',
                            },
                        },
                        {
                            columnId: 'amount',
                            content: `${formatCurrency(totalPayment)}`,
                            sx: {
                                fontWeight: 700,
                                fontSize: '1rem',
                                textAlign: 'right',
                                color: '#000',
                            },
                        },
                    ],
                    sx: {
                        backgroundColor: '#ffffff',
                        // borderTop: '1px solid #000',
                    },
                });

                // console.log('test data', response.listData);
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
        fetchSales(true);
    }, [debouncedFilters, fetchSales]);

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
                onGroupingChange={(event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
                    // setSelectedGrouping(event.target.value as string);
                    setFilters({ ...filters, grouping: event.target.value as string });
                }}
                label={`${t('Statistics.CashRegister')}: ${t('Statistics.SalesSummary')}`}
                groupingOptions={groupingOptions}
            />

            <Stack direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('Statistics.Total')}
                </Typography>
            </Stack>
            <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} mb={2} columnGap={10}>
                <Stack direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} mb={2}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('Statistics.SubTotal')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(salesSummary.summary.subTotal)}
                    </Typography>
                </Stack>

                <Stack direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} mb={2}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('Statistics.Tax')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(salesSummary.summary.tax)}
                    </Typography>
                </Stack>

                <Stack direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} mb={2}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('Statistics.NetTotal')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(salesSummary.summary.netTotal)}
                    </Typography>
                </Stack>
            </Stack>

            <Stack direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} spacing={2}>
                <POSTable
                    columns={columns}
                    data={salesSummary.soldItems}
                    loading={loading}
                    onRowClick={(row) => {}}
                    defaultOrder="start_time"
                    isServerSorting
                    onSort={() => {}}
                    serverSortOrder="asc"
                    // maxHeight="calc(100vh - 250px)"
                    rowHeight="60px"
                    footerRows={loading ? [] : footerRows}
                />
            </Stack>
        </Stack>
    );
};

export default CashRegisterSalesSummary;
