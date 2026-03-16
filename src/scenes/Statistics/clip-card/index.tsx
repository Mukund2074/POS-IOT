import { Stack, Typography, useMediaQuery } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import moment, { Moment } from 'moment';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { POSTable, ColumnType, RowType } from '@/components/POS/Common';
import { t } from 'i18next';
import { useDebounce } from '@/hooks/shared/useDebounce';
import { api } from '@/utils/Api/Statistics';
import { GetApiStatisticsBundleOffers200, GetApiStatisticsBundleOffersGrouping } from '@/shared/api/models';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import StatisticsHeader from '../shared/header';

// type Appointment = GetApiStatisticsAppointments200ItemsItem;

const groupingOptions = [
    // { value: 'TIME', label: t('Statistics.Time') },
    { value: 'false', label: t('Statistics.No') },
    { value: 'true', label: t('Statistics.Yes') },
];

const ClipCardSummary = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(true);

    const [bundleOffers, setBundleOffers] = useState<GetApiStatisticsBundleOffers200>({
        totalAmount: 0,
        totalOriginalPunches: 0,
        totalResiduePunches: 0,
        soldBundleOffers: [],
    });

    const [footerRows, setFooterRows] = useState<any[]>([]);

    interface Filters {
        startDate: Moment | null;
        endDate: Moment | null;
        grouping: string;
    }

    const [filters, setFilters] = useState<Filters>({
        startDate: moment().subtract(1, 'month'),
        endDate: moment(),
        grouping: 'false',
    });

    const columns: ColumnType[] = [
        {
            id: 'bundleOfferName',
            name: t('Statistics.BundleOfferName'),
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
                    {row.bundleOfferName}
                </Typography>
            ),
            sortable: false,
            width: isMobile
                ? filters.grouping === 'true'
                    ? '60%'
                    : '70%'
                : filters.grouping === 'true'
                  ? '60%'
                  : '70%',
            columnLabelStyles: {
                justifyContent: 'flex-start',
            },
        },
        ...(filters.grouping === 'true'
            ? [
                  {
                      id: 'quantity',
                      name: t('Statistics.Quantity'),
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
                      width: isMobile ? '10%' : '10%',
                  },
              ]
            : []),
        {
            id: 'originalPunches',
            name: t('Statistics.OriginalPunches'),
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
                    {row.originalPunches}
                </Typography>
            ),
            sortable: false,
            columnLabelStyles: {
                justifyContent: 'flex-end',
            },
            width: isMobile ? '10%' : '10%',
        },
        {
            id: 'residuePunches',
            name: t('Statistics.ResiduePunches'),
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
                    {row.residuePunches}
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

    const debouncedFilters = useDebounce(filters, 500);

    const fetchSales = useCallback(
        async (reset = false) => {
            try {
                setLoading(true);

                const response = await api.getApiStatisticsBundleOffers({
                    fromDate: debouncedFilters.startDate ? debouncedFilters.startDate.format('YYYY-MM-DD') : '',
                    toDate: debouncedFilters.endDate ? debouncedFilters.endDate.format('YYYY-MM-DD') : '',
                    grouping: debouncedFilters.grouping as GetApiStatisticsBundleOffersGrouping,
                });

                setBundleOffers(response);

                const totalCount = response.soldBundleOffers.reduce((sum, item) => sum + (item.count || 0), 0);

                const footerRows: any[] = [
                    {
                        cells: [
                            {
                                columnId: 'bundleOfferName',
                                content: t('Statistics.Total'),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    color: '#000',
                                },
                            },
                            ...(debouncedFilters.grouping === 'true'
                                ? [
                                      {
                                          columnId: 'quantity',
                                          content: totalCount,
                                          sx: {
                                              fontWeight: 700,
                                              fontSize: '1rem',
                                              textAlign: 'right',
                                              color: '#000',
                                          },
                                      },
                                  ]
                                : []),
                            {
                                columnId: 'originalPunches',
                                content: response.totalOriginalPunches,
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                    color: '#000',
                                },
                            },
                            {
                                columnId: 'residuePunches',
                                content: response.totalResiduePunches,
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                    color: '#000',
                                },
                            },
                            {
                                columnId: 'amount',
                                content: formatCurrency(response.totalAmount),
                                sx: {
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                    color: '#000',
                                },
                            },
                        ],
                        sx: {
                            backgroundColor: '#f5f5f5',
                        },
                    },
                ];

                // if (!loading) {
                setFooterRows(footerRows);
                // }
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
                selectedGrouping={filters.grouping}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onGroupingChange={(event: SelectChangeEvent<string | number | (string | number)[] | null>) => {
                    // setSelectedGrouping(event.target.value as string);
                    setFilters({ ...filters, grouping: event.target.value as string });
                }}
                label={`${t('Statistics.ClipCard')}: ${t('Statistics.ClipCardSummary')}`}
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
                        {t('Statistics.TotalAmount')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(bundleOffers.totalAmount)}
                    </Typography>
                </Stack>

                <Stack direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} mb={2}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('Statistics.OriginalPunches')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {bundleOffers.totalOriginalPunches}
                    </Typography>
                </Stack>

                <Stack direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} mb={2}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('Statistics.ResiduePunches')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {bundleOffers.totalResiduePunches}
                    </Typography>
                </Stack>
            </Stack>

            <Stack direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} spacing={2}>
                <POSTable
                    columns={columns}
                    data={bundleOffers.soldBundleOffers.map((item, index) => ({ ...item, id: index }))}
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

export default ClipCardSummary;
