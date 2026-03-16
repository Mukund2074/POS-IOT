import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { Box, CircularProgress, IconButton, Modal, Paper, Stack, TablePagination, Typography } from '@mui/material';
import { JSX, useEffect, useState } from 'react';
import ListIcon from '@mui/icons-material/List';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSHeading from '@/components/POS/Common/POSHeading';
import { Close } from '@mui/icons-material';
import moment from 'moment';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import { api } from '@/utils/Api/POS';
import { useSelector } from 'react-redux';
import { t } from 'i18next';
import {
    GetApiInsightsSalesDetailsItemTypeIdType200DataSalesDetailsItemCustomerName,
    GetApiInsightsSummaryItemTypeType200,
} from '@/shared/api/models';
import Employee from '../../EmployeeDataType';
import Permission from '@/utils/POS/Permission';

interface ColumnTransationType {
    [key: string]: string;
}

interface ColumnTransationTitleType {
    salesId: ColumnTransationType;
    dataIds: ColumnTransationType;
}

interface DataForServiceSalesType {
    product: string;
    amount: string;
    sold: number;
    credited: number;
    total: number;
    profit: string;
    menu: JSX.Element;
}

interface ServiceData {
    salesId: JSX.Element;
    time: string;
    customer: GetApiInsightsSalesDetailsItemTypeIdType200DataSalesDetailsItemCustomerName;
    number: number;
    amount: string;
}

const ServiceSales = () => {
    const [openPopup, setOpenPopup] = useState(false);
    const [filter, setFilter] = useState({
        fromDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
    });
    const employee = useSelector((state: any) => state.settings.data.employees);
    const employees = employee.map((emp: Employee) => ({
        label: emp.name,
        value: emp.id,
    }));
    const allEmployees = [{ label: t('Common.AllEmployees'), value: -1 }, ...employees];
    const [selectedEmployees, setSelectedEmployees] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 1,
    });
    const [dataPagination, setDataPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const { isAllowed } = Permission();
    const haveReadInvoicePermission = isAllowed('Invoice', 'read');

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handleSalesPageChange = (page: number) => {
        setDataPagination((prev) => ({ ...prev, page: page }));
    };

    const columnTranslationMap: ColumnTransationTitleType = {
        salesId: {
            product: 'Common.Service',
            amount: 'Common.Amount',
            sold: 'POS.Sold',
            credited: 'Report.Credited',
            total: 'POS.Total',
            profit: 'Report.Profit',
            menu: 'Report.Menu',
        },
        dataIds: {
            time: 'Common.Time',
            customer: 'Insights.Customer',
            salesId: 'Report.SalesId',
            number: 'Report.Number',
            amount: 'Common.Amount',
        },
    };

    const ServiceSalesColumn: ColumnType[] = ['product', 'amount', 'sold', 'credited', 'total', 'profit', 'menu'].map(
        (service) => ({
            id: service,
            name: t(columnTranslationMap.salesId[service]),
            selector: (row: RowType) => row[service],
        }),
    );

    const ServiceDataColumn: ColumnType[] = ['salesId', 'time', 'customer', 'number', 'amount'].map((service) => ({
        id: service,
        name: t(columnTranslationMap.dataIds[service]),
        selector: (row: RowType) => row[service],
    }));

    const [dataForServiceSales, setDataForServiceSales] = useState<DataForServiceSalesType[]>([]);

    const [serviceData, setProductData] = useState<ServiceData[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response: GetApiInsightsSummaryItemTypeType200 = await api.getApiInsightsSummaryItemTypeType(
                'service',
                {
                    employeeId: selectedEmployees === -1 ? undefined : selectedEmployees,
                    fromDate: filter.fromDate,
                    toDate: filter.toDate,
                    page: pagination?.page,
                    limit: pagination.limit,
                },
            );

            setPagination(response?.data?.pagination);

            const formattedService = response?.data?.items.map((services) => ({
                product: services?.name,
                amount: formatCurrency(services?.sellingPrice),
                sold: services?.soldQuantity,
                credited: services?.creditedQuantity,
                total: services?.totalQuantity,
                profit: formatCurrency(services?.profitAmount),
                menu: (
                    <Typography
                        onClick={() => {
                            setOpenPopup(true);
                            fetchServiceSales(services?.id);
                        }}
                    >
                        <ListIcon />
                    </Typography>
                ),
            }));

            setDataForServiceSales(formattedService);
        } catch (error) {
            console.error('fetching error : ', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServiceSales = async (productId: string) => {
        try {
            setModalLoading(true);
            const response = await api.getApiInsightsSalesDetailsItemTypeIdType('service', productId, {
                page: pagination.page,
                limit: pagination.limit,
            });
            setDataPagination(response?.data?.pagination);
            const formateService = response?.data?.salesDetails.map((service) => ({
                salesId: (
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
                                window.open(
                                    `https://api-node-dev.fiind.app/api/invoice/${service?.salesId}/pdf`,
                                    '_blank',
                                );
                            }
                        }}
                    >
                        {service?.invoiceId}
                    </Typography>
                ),
                time: service?.salesDate,
                customer: service?.customerName === '' ? 'No customer' : service?.customerName,

                number: service?.quantity,
                amount: formatCurrency(service?.amount),
            }));
            setProductData(formateService);
        } catch (error) {
            console.error('fetching service sale error : ', error);
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.fromDate, filter.toDate, selectedEmployees, pagination.page]);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('Report.ServiceSales')}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 1, md: 4 },
                        mt: { xs: 2, md: 0 },
                    }}
                >
                    <POSSelect
                        options={allEmployees}
                        value={selectedEmployees}
                        onChange={(e) => {
                            setSelectedEmployees(Number(e.target.value));
                            setPagination((prev) => ({
                                ...prev,
                                page: 1,
                            }));
                        }}
                        sx={{ width: { xs: '100%', md: 180 }, borderRadius: '45px', background: '#fff' }}
                        showPlaceHolder={false}
                        fontColor="#a0a0a0"
                    />
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
            {loading ? (
                <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                    <CircularProgress size={40} sx={{ color: 'inherit' }} />
                </Stack>
            ) : (
                <Box sx={{ mt: 2 }}>
                    <POSTable columns={ServiceSalesColumn} data={dataForServiceSales} />

                    <TablePagination
                        component={'div'}
                        count={pagination?.total}
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
                            '& .css-1ppsg1p-MuiTablePagination-displayedRows': { mt: 2 },
                            display: dataForServiceSales?.length === 0 ? 'none' : 'block',
                        }}
                    />
                </Box>
            )}

            {openPopup && (
                <Modal
                    disableAutoFocus
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    open={openPopup}
                >
                    <Paper
                        sx={{
                            width: { xs: '90%', sm: '75%', md: '50%' },
                            minHeight: 250,
                            borderRadius: 4,
                            overflow: 'auto',
                            scrollbarWidth: 'none',
                            my: { xs: 1 },
                            position: 'relative',
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: ' center', mb: 3 }}>
                            <POSHeading text={t('Report.ServiceSales')} />
                            <IconButton
                                onClick={() => {
                                    setOpenPopup(false);
                                    setDataPagination((prev) => ({ ...prev, page: 0 }));
                                }}
                            >
                                <Close />
                            </IconButton>
                        </Box>
                        {modalLoading ? (
                            <Stack
                                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                            >
                                <CircularProgress size={40} sx={{ color: 'inherit' }} />
                            </Stack>
                        ) : (
                            <POSTable columns={ServiceDataColumn} data={serviceData} />
                        )}
                        {serviceData?.length >= 10 && (
                            <TablePagination
                                component={'div'}
                                count={dataPagination.total}
                                page={dataPagination.page - 1}
                                rowsPerPage={dataPagination?.limit}
                                onPageChange={(_, newPage) => handleSalesPageChange(newPage + 1)}
                                rowsPerPageOptions={[]}
                                onRowsPerPageChange={(e) =>
                                    setDataPagination((prev) => ({
                                        ...prev,
                                        limit: parseInt(e.target.value, 10),
                                        page: 1, // reset to first page
                                    }))
                                }
                            />
                        )}
                    </Paper>
                </Modal>
            )}
        </Box>
    );
};

export default ServiceSales;
