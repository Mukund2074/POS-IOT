import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import POSButton from '@/components/POS/Common/POSButton';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import POSSelect from '@/components/POS/Common/POSSelect';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { GetApiInsightsTaxReportsType200, GetApiInsightsTaxReportsTypeTaxType } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { CSVGenerator } from '@/utils/POS/CSVGenerator';
import { Print } from '@mui/icons-material';
import { Box, CircularProgress, Stack, TablePagination, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Employee from '../../EmployeeDataType';
import Permission from '@/utils/POS/Permission';

interface ColumnTranslateMapType {
    [key: string]: string;
}

interface FormattedTotalSummary {
    id: string;
    date: string;
    paidAmountExclVAT: string;
    vat: string;
    paidAmountInclVAT: string;
}

const VatMethod = () => {
    const [filter, setFilter] = useState({
        fromDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
    });
    const employee = useSelector((state: any) => {
        const allEmp = { label: t('Common.AllEmployees'), value: -1 };
        const empList = state.settings.data.employees.map((emp: Employee) => ({
            label: emp.name,
            value: emp.id,
        }));
        return [allEmp, ...empList];
    });
    const [selectedEmployee, setSelectedEmployee] = useState(-1);

    const selectedEmp = employee.find((myid) => myid.value === selectedEmployee);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(false);

    const taxType = [
        { label: t('POS.Tax'), value: 'tax' },
        { label: t('Report.NoTax'), value: 'notax' },
    ];

    const [selectedTex, setSelectedTax] = useState<GetApiInsightsTaxReportsTypeTaxType>('tax');

    const { isAllowed } = Permission();
    const haveReadInvoicePermission = isAllowed('Invoice', 'read');

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const columnTranslateMap: ColumnTranslateMapType = {
        id: 'Id',
        date: 'Common.Date',
        paidAmountExclVAT: 'Report.PaidAmountExclVAT',
        vat: 'GiftCard.VAT',
        paidAmountInclVAT: 'Report.paidAmountInclVAT',
    };

    const taxReportColumn: ColumnType[] = ['id', 'date', 'paidAmountExclVAT', 'vat', 'paidAmountInclVAT'].map(
        (col) => ({
            id: col,
            name: t(columnTranslateMap[col]),
            selector: (row: RowType) => row[col],
        }),
    );
    const totalSummaryColumn: ColumnType[] = ['id', 'date', 'paidAmountExclVAT', 'vat', 'paidAmountInclVAT'].map(
        (col) => ({
            id: col,
            name: t(columnTranslateMap[col]),
            selector: (row: RowType) => row[col],
        }),
    );

    const [taxReportData, setTaxReportData] = useState<any>([]);
    const [totalSummary, setTotalSummary] = useState<FormattedTotalSummary[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response: GetApiInsightsTaxReportsType200 = await api.getApiInsightsTaxReportsType(
                {
                    employeeId: selectedEmployee === -1 ? undefined : selectedEmployee,
                    fromDate: filter.fromDate,
                    toDate: filter.toDate,
                    taxType: selectedTex,
                    page: pagination.page,
                    limit: pagination.limit,
                },
                'json',
            );
            setPagination(response?.data?.pagination);

            const formattedData = response?.data?.items.map((datas) => ({
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
                                window.open(`${process.env.REACT_APP_URL2}/api/invoice/${datas.salesId}/pdf`, '_blank');
                            }
                        }}
                    >
                        {datas.invoiceId}
                    </Typography>
                ),
                date: datas.salesDate,
                paidAmountExclVAT: formatCurrency(datas.totalTaxAmount),
                vat: formatCurrency(datas.totalTaxAmount),
                paidAmountInclVAT: formatCurrency(datas.totalTaxAmount),
            }));
            const formattedTotalSummary = {
                id: '',
                date: '',
                paidAmountExclVAT: formatCurrency(response?.data?.summary?.totalTaxAmount),
                vat: '',
                paidAmountInclVAT: formatCurrency(response?.data?.summary?.totalTaxAmount),
            };
            setTaxReportData(formattedData);
            setTotalSummary([formattedTotalSummary]);
        } catch (error) {
            console.error('error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const response: GetApiInsightsTaxReportsType200 = await api.getApiInsightsTaxReportsType(
            {
                employeeId: selectedEmployee,
                fromDate: filter.fromDate,
                toDate: filter.toDate,
                page: pagination.page,
                limit: pagination.limit,
                taxType: selectedTex,
            },
            'csv',
        );
        CSVGenerator({ response: response.toString(), fileTitle: 'VAT_Report' });
    };

    useEffect(() => {
        fetchData();
    }, [selectedEmployee, filter.fromDate, filter.toDate, selectedTex, pagination.page]);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('GiftCard.VAT')}
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 1, md: 4 },
                        mt: { xs: 2, md: 0 },
                    }}
                >
                    <Box sx={{ borderRadius: 2, cursor: 'pointer' }}>
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
                    <POSSelect
                        options={employee}
                        value={selectedEmployee}
                        onChange={(event) => setSelectedEmployee(Number(event.target.value))}
                        sx={{ width: { xs: '100%', md: 180 }, borderRadius: '45px', background: '#fff' }}
                        showPlaceHolder={false}
                        fontColor="#a0a0a0"
                    />
                    <POSSelect
                        options={taxType}
                        value={selectedTex}
                        onChange={(event) => setSelectedTax(event.target.value as GetApiInsightsTaxReportsTypeTaxType)}
                        sx={{ width: { xs: '100%', md: 180 }, borderRadius: '45px', background: '#fff' }}
                        showPlaceHolder={false}
                        fontColor="#a0a0a0"
                    />
                    <POSDateRangePicker
                        wrapperSx={{ width: { xs: '100%', md: 'fit-content' } }}
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

            {loading ? (
                <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                    <CircularProgress size={40} sx={{ color: 'inherit' }} />
                </Stack>
            ) : (
                <>
                    <Box sx={{ mt: 3 }}>
                        <Typography sx={{ mb: 2 }} variant="h3" fontWeight={700}>
                            {selectedEmp?.label || 'All'}
                        </Typography>
                        <POSTable columns={taxReportColumn} data={taxReportData} />
                        <TablePagination
                            component="div"
                            count={pagination.total}
                            rowsPerPage={pagination?.limit}
                            page={pagination?.page - 1}
                            onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
                            onRowsPerPageChange={(e) =>
                                setPagination((prev) => ({
                                    ...prev,
                                    limit: parseInt(e.target.value, 10),
                                    page: 1, // reset to first page
                                }))
                            }
                            sx={{
                                mt: 3,
                                '& .css-1ppsg1p-MuiTablePagination-displayedRows': {
                                    mt: 2,
                                },
                            }}
                            rowsPerPageOptions={[]}
                        />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                        <Typography sx={{ mb: 2 }} variant="h3" fontWeight={700}>
                            Total for the period
                        </Typography>
                        <POSTable columns={totalSummaryColumn} data={totalSummary} />
                    </Box>
                </>
            )}
        </Box>
    );
};

export default VatMethod;
