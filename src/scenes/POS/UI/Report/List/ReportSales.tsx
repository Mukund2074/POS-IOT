import { Box, Modal, Paper, Stack, TablePagination, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { Print } from '@mui/icons-material';
import POSSelect from '@/components/POS/Common/POSSelect';
import { useEffect, useState } from 'react';
import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { FooterRowType } from '@/components/POS/Common/POSTable';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSButton from '@/components/POS/Common/POSButton';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import moment from 'moment';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
import { api } from '@/utils/Api/POS';
import { CSVGenerator } from '@/utils/POS/CSVGenerator';
import {
    GetApiInsightsSalesType200,
    GetApiInsightsSalesType200DataRecordsItem,
    GetApiInsightsSalesTypeBookingType,
    GetApiInsightsSalesTypeSortBy,
} from '@/shared/api/models';
import Employee from '../EmployeeDataType';
import Permission from '@/utils/POS/Permission';

interface SalesColumnType {
    [key: string]: string;
}

const ReportSales = () => {
    const [closeTab, setCloseTab] = useState<boolean>(false);
    const sortByOpitons = [
        { label: t('Common.Date'), value: 'date' },
        { label: t('Common.CapsEmployee'), value: 'employee' },
        { label: t('Common.Amount'), value: 'amount' },
    ];
    const bookingTypeOptions = [
        { label: t('Common.AllEmployees'), value: 'all' },
        { label: t('Report.Online'), value: 'online' },
        { label: t('Report.Manually'), value: 'manual' },
    ];
    const [selectedSortBy, setSelectedSortBy] = useState<GetApiInsightsSalesTypeSortBy>('date');
    const [filter, setFilter] = useState({
        fromDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
    });
    const employee = useSelector((state: any) =>
        state.settings.data.employees.map((emp: Employee) => ({
            label: emp.name,
            value: emp.id,
        })),
    );
    const allEmployees = [{ label: t('Common.AllEmployees'), value: 0 }, ...employee];
    const [selectedEmployee, setSelectedEmployee] = useState(0);
    const [selectedBookingtypeOptions, setSelectedBookingtypeOptions] =
        useState<GetApiInsightsSalesTypeBookingType>('all');
    const filteredEmp = allEmployees.filter((myid) => myid.value === selectedEmployee);
    const [loading, setLoading] = useState(false);
    const [footerRows, setFooterRow] = useState<FooterRowType[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 1,
    });

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };
    const [data, setData] = useState<any>({});

    const salesCloumnTranslate: SalesColumnType = {
        id: t('Common.ID'),
        date: t('Common.Date'),
        product: t('POS.Product'),
        service: t('Common.Service'),
        giftCards: t('POS.GiftCards'),
        punchCards: t('Customer.PunchCards'),
        credited: t('Report.Credited'),
        giftCardUse: t('Report.GiftCardUse'),
        punchCardUse: t('Report.PunchCardUse'),
        paidAmount: t('Report.PaidAmount'),
    };

    const myColumn: ColumnType[] = [
        'id',
        'date',
        'product',
        'service',
        'giftCards',
        'punchCards',
        'credited',
        'giftCardUse',
        'punchCardUse',
        'paidAmount',
    ].map((sales) => ({
        id: sales,
        name: t(salesCloumnTranslate[sales]),
        selector: (row: RowType) => row[sales],
    }));

    const totalForThePeriodColumn: ColumnType[] = [
        'product',
        'service',
        'giftCards',
        'punchCards',
        'credited',
        'giftCardUse',
        'punchCardUse',
        'paidAmount',
    ].map((totalForTheColumn) => ({
        id: totalForTheColumn,
        name: t(salesCloumnTranslate[totalForTheColumn]),
        selector: (row: RowType) => row[totalForTheColumn],
    }));

    const [dataForColumn, setDataForColumn] = useState<any>([]);

    const [totalForThePeriodData, setTotalForThePeriodData] = useState<any>([]);

    const { isAllowed } = Permission();
    const haveReadInvoicePermission = isAllowed('Invoice', 'read');

    const fetchData = async () => {
        try {
            setLoading(true);

            const response: GetApiInsightsSalesType200 = await api.getApiInsightsSalesType({
                employeeId: selectedEmployee,
                fromDate: filter.fromDate,
                toDate: filter.toDate,
                bookingType: selectedBookingtypeOptions as GetApiInsightsSalesTypeBookingType,
                sortBy: selectedSortBy as GetApiInsightsSalesTypeSortBy,
                page: pagination.page,
                limit: pagination.limit,
            });

            setPagination(response?.data?.pagination);
            setData(response);

            const records: GetApiInsightsSalesType200DataRecordsItem[] = response?.data?.records || [];
            const summary: any = response?.data?.summary?.periodSummary || {};

            const boldCurrency = (value: number | null | undefined) => (
                <Typography fontWeight={800}>{formatCurrency(value || 0)}</Typography>
            );

            const columns: (keyof GetApiInsightsSalesType200DataRecordsItem)[] = [
                'product',
                'service',
                'giftCards',
                'punchCards',
                'credited',
                'giftCardUse',
                'punchCardUse',
                'paidAmount',
            ];

            const formatData = records.map((sales) => {
                const formattedColumns = {} as Record<string, string>;

                for (const key of [
                    'product',
                    'service',
                    'giftCards',
                    'punchCards',
                    'credited',
                    'giftCardUse',
                    'punchCardUse',
                    'paidAmount',
                ] as const) {
                    const value = sales[key];
                    formattedColumns[key] =
                        typeof value === 'number' || typeof value === 'string'
                            ? formatCurrency(value)
                            : formatCurrency(0);
                }

                return {
                    id: (
                        <Typography
                            sx={
                                haveReadInvoicePermission && {
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    color: '#1976d2',
                                    fontWeight: 'bold',
                                }
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (haveReadInvoicePermission) {
                                    window.open(`${process.env.REACT_APP_URL2}/api/invoice/${sales?.id}/pdf`, '_blank');
                                }
                            }}
                        >
                            {sales?.invoiceId}
                        </Typography>
                    ),
                    date: sales.date,
                    ...formattedColumns,
                };
            });

            // Format footer row cells
            const footerSummaryCells = [
                {
                    columnId: 'id',
                    content: <Typography fontWeight={800}>Total</Typography>,
                    colSpan: 2,
                },
                ...columns.map((key) => ({
                    columnId: key,
                    content: boldCurrency(summary?.[key]),
                    colSpan: 1,
                })),
            ];

            const formatDataForFooterRow = [
                {
                    sx: { borderTop: '2px solid #000' },
                    cells: footerSummaryCells,
                    colSpan: 10,
                },
            ];

            const formatTotalForThePeriod = Object.keys(summary).reduce(
                (acc, key) => {
                    acc[key] = formatCurrency(summary[key] || 0);
                    return acc;
                },
                {} as Record<string, string>,
            );

            // Set final states
            setDataForColumn(formatData);
            setFooterRow(formatDataForFooterRow);
            setTotalForThePeriodData([formatTotalForThePeriod]);
        } catch (error) {
            console.error('Failed to fetch sales insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response: GetApiInsightsSalesType200 = await api.getApiInsightsSalesType(
                {
                    employeeId: selectedEmployee,
                    fromDate: filter.fromDate,
                    toDate: filter.toDate,
                    bookingType: selectedBookingtypeOptions,
                    sortBy: selectedSortBy as GetApiInsightsSalesTypeSortBy,
                    page: pagination.page,
                    limit: pagination.limit,
                },
                'csv',
            );

            CSVGenerator({ response: response.toString(), fileTitle: 'sales_report' });
        } catch (error) {
            console.log('Failed', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.page, selectedEmployee, filter, selectedBookingtypeOptions, selectedSortBy]);

    return (
        <Box>
            {/* title section */}
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: '#1F1F1F', fontSize: '22px' }} fontWeight={700} variant="h6">
                    {t('POS.Sales')}
                </Typography>
                <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 4, alignItems: 'center' }}>
                    <Box sx={{ borderRadius: 2, cursor: 'pointer', mt: 2 }}>
                        <POSButton
                            title={
                                <Stack
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <Print />
                                    {t('Setting.Export')}
                                </Stack>
                            }
                            variant="save"
                            width={{ xs: '100%', md: 'auto' }}
                            sx={{ ml: 'auto', mb: 2 }}
                            onClick={handleSave}
                        />
                    </Box>
                    <Box
                        sx={{
                            background: '#fff',
                            borderRadius: 50,
                            cursor: 'pointer',
                            display: 'flex',
                            px: 5,
                            py: 1,
                            gap: 1,
                            border: '1px solid #D9D9d9',
                            mb: { xs: '10px', md: 0 },
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onClick={() => setCloseTab(true)}
                    >
                        <TuneIcon sx={{ fontSize: '20px', color: '#a0a0a0' }} />
                        <Typography sx={{ fontSize: 17, color: '#a0a0a0' }}>{t('Report.Filter')}</Typography>
                    </Box>
                    <POSSelect
                        options={allEmployees}
                        onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                        value={selectedEmployee}
                        sx={{ width: { xs: '100%', md: 180 }, mb: { xs: '10px', md: 0 } }}
                        backgroundColor="#fff"
                        fontColor="#a0a0a0"
                        borderRadius={10}
                        showPlaceHolder={false}
                    />

                    <Box>
                        <POSDateRangePicker
                            wrapperSx={{
                                width: { xs: '100%', md: 'fit-content' },
                            }}
                            borderRadius={50}
                            startdate={filter.fromDate}
                            endDate={filter.toDate}
                            setStartDate={(date) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    fromDate: moment(date).format('YYYY-MM-DD'),
                                }))
                            }
                            setEndDate={(date) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    toDate: moment(date).format('YYYY-MM-DD'),
                                }))
                            }
                        />
                    </Box>
                </Box>
            </Box>

            {/* table section */}

            <>
                <Box>
                    <Typography variant="h3" sx={{ mb: 2, mt: { xs: '10px', md: 0 } }}>
                        {filteredEmp[0].label}
                    </Typography>
                    <POSTable columns={myColumn} data={dataForColumn} footerRows={footerRows} loading={loading} />
                    <Typography
                        sx={{ fontWeight: 'bold', mt: 3 }}
                    >{`${t('Report.EmployeeTurnoverForThePeriod')} : ${formatCurrency(data?.data?.summary?.periodSummary?.product + data?.data?.summary?.periodSummary?.service)}`}</Typography>
                    <TablePagination
                        component="div"
                        count={pagination.total}
                        page={pagination.page - 1}
                        rowsPerPage={pagination.limit}
                        onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
                        rowsPerPageOptions={[]}
                        onRowsPerPageChange={(e) =>
                            setPagination((prev) => ({
                                ...prev,
                                limit: parseInt(e.target.value, 10),
                                page: 1, // reset to first page
                            }))
                        }
                        sx={{
                            mt: 3,
                            '& .MuiTablePagination-displayedRows': { mt: 2 },
                        }}
                    />
                </Box>

                <Box sx={{ mt: 5 }}>
                    <Typography variant="h3" sx={{ mb: 2 }}>
                        {t('Report.TotalForThePeriod')}
                    </Typography>
                    <POSTable columns={totalForThePeriodColumn} data={totalForThePeriodData} loading={loading} />
                    <Typography sx={{ mt: 2, color: '#00000099' }}>
                        {t('Report.TotalForThePeriodDescription')}
                    </Typography>
                </Box>
            </>

            {closeTab && (
                <Modal
                    open={true}
                    onClose={() => setCloseTab(false)}
                    disableAutoFocus
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Paper
                        sx={{
                            position: 'relative',
                            maxWidth: '90%',
                            maxHeight: '80%',
                            overflow: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 8,
                            padding: 4,
                            minWidth: '30%',
                            minHeight: '10%',
                        }}
                    >
                        <POSHeading text={t('Report.SortBy')} />
                        <Box>
                            <POSSelect
                                options={sortByOpitons}
                                value={selectedSortBy}
                                onChange={(e) => setSelectedSortBy(e.target.value as GetApiInsightsSalesTypeSortBy)}
                                sx={{ mt: 1 }}
                            />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <POSHeading text={t('Report.BookingType')} />
                            <Typography>{t('Report.BookingTypeDescription')}</Typography>
                            <POSSelect
                                options={bookingTypeOptions}
                                value={selectedBookingtypeOptions}
                                onChange={(e) =>
                                    setSelectedBookingtypeOptions(e.target.value as GetApiInsightsSalesTypeBookingType)
                                }
                                sx={{ mt: 1 }}
                            />
                        </Box>
                        <POSButton
                            title={t('Report.SetupFilter')}
                            titleColor="#fff"
                            sx={{ background: '#44B904', mx: 'auto', mt: 4 }}
                            onClick={() => {
                                setCloseTab(false);
                                fetchData();
                            }}
                        />
                    </Paper>
                </Modal>
            )}
        </Box>
    );
};

export default ReportSales;
