import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { Box, CircularProgress, IconButton, Modal, Paper, Stack, TablePagination, Typography } from '@mui/material';
import { JSX, useEffect, useState } from 'react';
import ListIcon from '@mui/icons-material/List';
import POSHeading from '@/components/POS/Common/POSHeading';
import { Close } from '@mui/icons-material';
import moment from 'moment';
import { api } from '@/utils/Api/POS';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
import POSSelect from '@/components/POS/Common/POSSelect';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import Employee from '../../EmployeeDataType';
import Permission from '@/utils/POS/Permission';

interface SaledIdType {
    product: string;
    amount: string;
    sold: string;
    credited: string;
    total: string;
    profit: string;
    menu: string;
}

interface DataIdsType {
    time: string;
    customer: string;
    salesId: string;
    number: string;
    amount: string;
}

interface ColumnTranslationType {
    salesId: SaledIdType;
    dataIds: DataIdsType;
}

interface DataForProductSale {
    product: string;
    amount: string;
    sold: number;
    credited: number;
    total: number;
    profit: string;
    menu: JSX.Element;
}

interface ProductDataType {
    time: string;
    customer: string;
    salesId: JSX.Element;
    number: number;
    amount: string;
}

const ProductSales = () => {
    const [openPopup, setOpenPopup] = useState(false);
    const [filter, setFilter] = useState({
        fromDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
    });
    const employee = useSelector((state: any) => state.settings.data.employees);

    const { isAllowed } = Permission();
    const haveReadInvoicePermission = isAllowed('Invoice', 'read');

    const allEmployees = [
        { label: t('Common.AllEmployees'), value: -1 },
        ...employee.map((emp: Employee) => ({
            label: emp.name,
            value: emp.id,
        })),
    ];

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

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handleSalesPageChange = (page: number) => {
        setDataPagination((prev) => ({ ...prev, page: page }));
    };

    const columnTranslationMap: ColumnTranslationType = {
        salesId: {
            product: 'POS.Product',
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

    const ProductSaleColumn: ColumnType[] = (
        ['product', 'amount', 'sold', 'credited', 'total', 'profit', 'menu'] as (keyof SaledIdType)[]
    ).map((product) => ({
        id: product,
        name: t(columnTranslationMap.salesId[product]),
        selector: (row: RowType) => row[product],
    }));

    const ProductDataColumn: ColumnType[] = (
        ['salesId', 'time', 'customer', 'number', 'amount'] as (keyof DataIdsType)[]
    ).map((ids) => ({
        id: ids,
        name: t(columnTranslationMap.dataIds[ids]),
        selector: (row: RowType) => row[ids],
    }));

    const [dataForProductSale, setDataForProductSale] = useState<DataForProductSale[]>([]);
    const [productData, setProductData] = useState<ProductDataType[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getApiInsightsSummaryItemTypeType('product', {
                employeeId: selectedEmployees === -1 ? undefined : selectedEmployees,
                fromDate: filter.fromDate,
                toDate: filter.toDate,
                page: pagination?.page,
                limit: pagination?.limit,
            });

            setPagination(response?.data?.pagination);

            setDataForProductSale(
                response?.data?.items.map((myProducts) => ({
                    product: myProducts.name,
                    amount: formatCurrency(myProducts.costPrice),
                    sold: myProducts.soldQuantity,
                    credited: myProducts.creditedQuantity,
                    total: myProducts.totalQuantity,
                    profit: formatCurrency(myProducts.totalRevenue),
                    menu: (
                        <Typography
                            onClick={() => {
                                setOpenPopup(true);
                                fetchSalesDetails(myProducts.id);
                            }}
                        >
                            <ListIcon />
                        </Typography>
                    ),
                })),
            );
        } catch (error) {
            console.error('Something went wrong: ', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesDetails = async (productId: string) => {
        setModalLoading(true);
        try {
            const response = await api.getApiInsightsSalesDetailsItemTypeIdType('product', productId, {
                page: pagination.page,
                limit: pagination.limit,
            });
            setDataPagination(response?.data?.pagination);
            setProductData(
                response?.data?.salesDetails.map((data) => ({
                    time: data?.salesDate,
                    customer: data?.customerName || 'No customer',
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
                                        `https://api-node-dev.fiind.app/api/invoice/${data?.salesId}/pdf`,
                                        '_blank',
                                    );
                                }
                            }}
                        >
                            {data?.invoiceId}
                        </Typography>
                    ),
                    number: data?.quantity,
                    amount: formatCurrency(data?.amount),
                })),
            );
        } catch (error) {
            console.error('Something went wrong: ', error);
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.fromDate, filter.toDate, pagination.page, selectedEmployees]);

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('Customer.ProductSales')}
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
                <Box sx={{ mt: 2 }}>
                    <POSTable columns={ProductSaleColumn} data={dataForProductSale} />
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
                            '& .css-1ppsg1p-MuiTablePagination-displayedRows': {
                                mt: 2,
                            },
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <POSHeading text={t('Customer.ProductSales')} />
                            <IconButton
                                onClick={() => {
                                    setOpenPopup(false);
                                    setDataPagination((prev) => ({
                                        ...prev,
                                        page: 0,
                                    }));
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
                            <POSTable columns={ProductDataColumn} data={productData} />
                        )}

                        {productData?.length >= 10 && (
                            <TablePagination
                                component={'div'}
                                count={dataPagination?.total}
                                page={dataPagination.page - 1}
                                rowsPerPage={dataPagination?.limit}
                                onPageChange={(_, newPage) => handleSalesPageChange(newPage + 1)}
                                onRowsPerPageChange={(e) =>
                                    setDataPagination((prev) => ({
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
                        )}
                    </Paper>
                </Modal>
            )}
        </Box>
    );
};

export default ProductSales;
