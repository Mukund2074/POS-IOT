import moment from 'moment';
import TablePagination from '@mui/material/TablePagination';
import { useEffect, useState } from 'react';
import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { api } from '@/utils/Api/POS';
import { t } from 'i18next';
import POSSelect from '@/components/POS/Common/POSSelect';
import { useNavigate } from 'react-router-dom';
import { GetApiInsightsStockReports200, GetApiInsightsStockReportsSortBy } from '@/shared/api/models';

interface StockStatysType {
    data: any[];
    totalStockStatus: string;
}

interface TranslateLangType{
    [key : string] : string
}

const StockStatus = () => {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigate();

    const sortBy = [
        { label: t('Common.Name'), value: 'name' },
        { label: t('POS.Brand'), value: 'brand' },
        { label: t('Report.SalePrice'), value: 'salePrice' },
        { label: t('Report.PurchasePrice'), value: 'purchasePrice' },
        { label: t('POS.StockStatus'), value: 'stockStatus' },
        { label: t('Report.InventoryValue'), value: 'inventoryValue' },
    ];

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const [selectedSortBy, setSelectedSortBy] = useState<GetApiInsightsStockReportsSortBy>('name');

    const translateLang: TranslateLangType = {
        name: 'Common.Name',
        brand: 'POS.Brand',
        salePrice: 'Report.SalePrice',
        purchasePrice: 'Report.PurchasePrice',
        stockStatus: 'POS.StockStatus',
        inventoryValue: 'Report.InventoryValue',
    };

    const [filter, setFilter] = useState({
        fromDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
    });

    const sotckStatusColumn: ColumnType[] = [
        'name',
        'brand',
        'salePrice',
        'purchasePrice',
        'stockStatus',
        'inventoryValue',
    ].map((col) => ({
        id: col,
        name: t(translateLang[col]),
        selector: (row: RowType) => row[col],
    }));

    const [stockStatusData, setStockStatusData] = useState<StockStatysType>({
        data: [],
        totalStockStatus: '',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const response: GetApiInsightsStockReports200 = await api.getApiInsightsStockReports({
                toDate: filter.toDate,
                sortBy: selectedSortBy,
                page: pagination.page,
                limit: pagination.limit,
            });
            const formattedData = response?.data?.items.map((fd) => ({
                name: (
                    <Typography
                        sx={{ cursor: 'pointer', textDecoration: 'underline', color: '#1976d2', fontWeight: 'bold' }}
                        onClick={() => navigation(`/pos/products/${fd?.productId}`)}
                    >
                        {fd?.name}
                    </Typography>
                ),
                brand: fd?.brand,
                salePrice: fd?.salePrice,
                purchasePrice: fd?.purchasePrice,
                stockStatus: fd?.stockStatus,
                inventoryValue: fd?.inventoryValue,
            }));
            setStockStatusData({
                data: formattedData,
                totalStockStatus: response?.data?.summary?.totalInventoryValue.toString(),
            });
            setPagination(response?.data?.pagination);
        } catch (error) {
            console.error('error : ', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter.toDate, selectedSortBy, pagination.page, pagination.limit]);

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    return (
        <Box>
            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={700}>
                    {t('POS.StockStatus')}
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
                        options={sortBy}
                        value={selectedSortBy}
                        onChange={(e) => setSelectedSortBy(e.target.value as GetApiInsightsStockReportsSortBy)}
                        sx={{ width: { xs: '100%', md: 200 }, borderRadius: '45px', background: '#fff' }}
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
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#fff',
                            p: 3,
                            mt: 3,
                            borderRadius: '45px',
                        }}
                    >
                        <Typography variant="h3" fontWeight={700}>
                            {t('Report.TotalStockValueOnSelectedDate')}
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                            {formatCurrency(stockStatusData?.totalStockStatus)}
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 4 }}>
                        <POSTable columns={sotckStatusColumn} data={stockStatusData?.data} />
                        <TablePagination
                            component="div"
                            count={pagination?.total}
                            rowsPerPage={pagination.limit}
                            page={pagination.page - 1}
                            onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
                            onRowsPerPageChange={(e) =>
                                setPagination((prev) => ({
                                    ...prev,
                                    limit: parseInt(e.target.value, 10),
                                    page: 1,
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
                </>
            )}
        </Box>
    );
};

export default StockStatus;
