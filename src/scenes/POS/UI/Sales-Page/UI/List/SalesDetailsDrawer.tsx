import React, { useState } from 'react';
import {
    Drawer,
    Stack,
    Typography,
    IconButton,
    Card,
    CardContent,
    Chip,
    Grid2,
    Avatar,
    Skeleton,
    Alert,
    Divider,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    Close as CloseIcon,
    Receipt as ReceiptIcon,
    Person as PersonIcon,
    ShoppingCart as CartIcon,
    Payment as PaymentIcon,
    Sync as SyncIcon,
} from '@mui/icons-material';
import { useSalesDetails } from '@/hooks/api/pos/sales/useSalesDetails';
import { t } from 'i18next';
import POSButton from '@/components/POS/Common/POSButton';
import { useCart } from '@/context/POS/CartContext';
import { handleSales } from '../../Core/sales.handler';
import moment from 'moment';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import Permission from '@/utils/POS/Permission';
import PaymentModal from '../Create/Modals/Payment/PaymentModal';
import { GetApiSalesDetailsId200TransactionsItem } from '@/shared/api/models';
import apiFetcher2 from '@/utils/Api/POS/Interceptor2';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

interface SalesDetailsDrawerProps {
    open: boolean;
    onClose: () => void;
    salesId: string | null;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SalesDetailsDrawer: React.FC<SalesDetailsDrawerProps> = ({ open, onClose, salesId, setOpen }) => {
    const settingsSelector = useSelector((state: any) => state.settings.data);
    const isInspectionModuleEnabled = settingsSelector?.profile?.inspection_module;

    const { data: salesData, isLoading, error, refetch } = useSalesDetails(salesId || '', open && !!salesId);
    const { setCart, addItem, addRefundItem, clearCart } = useCart();
    const { isAllowed } = Permission();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Check if sales is synced - check for salesSync object
    const salesDataAny = salesData as any;
    const hasSalesSyncObject = salesDataAny?.salesSync && typeof salesDataAny.salesSync === 'object';
    const isSalesSynced = hasSalesSyncObject;
    const showSyncButton = isInspectionModuleEnabled && !isSalesSynced && salesData;

    const handleResale = async ({ id }: { id?: string }) => {
        if (salesData) {
            await clearCart();
            const response = await handleSales.resaleItem({
                seletedSales: salesData,
                setCart,
                addItem,
                addRefundItem,
                id,
            });
            if (response && !id) {
                onClose();
                setOpen(true);
            }
            if (response && id) {
                setShowPaymentModal(true);
            }
        }
    };

    const syncSales = async () => {
        if (!salesId || !salesData) {
            return;
        }
        try {
            setIsSyncing(true);
            const response = await apiFetcher2.post('/api/economic/sync-sales', {
                salesId: salesId,
            });

            const responseData = response.data;

            // Show success message
            if (responseData?.success) {
                if (responseData?.message) {
                    toast.success(responseData.message);
                } else {
                    toast.success(t('POS.SyncSuccess') || 'Sales synced successfully');
                }
            } else {
                // Show sync failed message
                toast.error(t('POS.SyncError') || 'Sync failed');
            }

            // Show failed customers message if present
            if (
                responseData?.failedCustomers &&
                Array.isArray(responseData.failedCustomers) &&
                responseData.failedCustomers.length > 0
            ) {
                toast.error(t('POS.SyncErrorCustomer') || 'Failed to sync customer');
            }

            // Refetch sales details only on success to update sync status
            if (responseData?.success) {
                refetch();
            }
        } catch (error: any) {
            console.error('Error syncing sales:', error);

            // Check if there are failed customers in the error response
            const errorData = error?.response?.data;
            if (
                errorData?.failedCustomers &&
                Array.isArray(errorData.failedCustomers) &&
                errorData.failedCustomers.length > 0
            ) {
                toast.error(t('POS.SyncErrorCustomer') || 'Failed to sync customer');
            } else {
                const errorMessage =
                    errorData?.message || errorData?.msg || error?.message || t('POS.SyncError') || 'Sync failed';
                toast.error(errorMessage);
            }
        } finally {
            setIsSyncing(false);
        }
    };
    // const salesData = data;
    const getPaymentTypeDisplay = (type: string): string => {
        const types: Record<string, string> = {
            CASH: t('POS.Cash'),
            CARD: t('POS.Card'),
            MOBILE_PAY: t('POS.MobilePay'),
            BANK_TRANSFER: t('POS.BankTransfer'),
            OUTSTANDING: t('POS.Outstanding'),
            GIFT_CARD: t('POS.GiftCard'),
            BONUS: t('POS.Bonus'),
            OTHER: t('POS.Other'),
        };
        return types[type] || type;
    };

    // const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    //     switch (status) {
    //         case 'SUCCEEDED':
    //             return 'success';
    //         case 'PENDING':
    //             return 'warning';
    //         case 'FAILED':
    //             return 'error';
    //         default:
    //             return 'default';
    //     }
    // };

    // const hasOutstanding = salesData?.transactions?.some(
    //     (tx: GetApiSalesDetailsId200TransactionsItem) => tx.paymentType === 'OUTSTANDING',
    // );

    // const paidAmount =
    //     salesData?.transactions
    //         ?.filter(
    //             (tx: GetApiSalesDetailsId200TransactionsItem) =>
    //                 tx.paymentType !== 'OUTSTANDING' && !tx.paymentType?.toLowerCase().includes('credit'), // exclude *_CREDIT
    //         )
    //         ?.reduce((sum: number, tx: GetApiSalesDetailsId200TransactionsItem) => sum + (tx.amount || 0), 0) || 0;

    // const creditAmount =
    //     salesData?.transactions
    //         ?.filter((tx: GetApiSalesDetailsId200TransactionsItem) => tx.paymentType?.toLowerCase().includes('credit'))
    //         ?.reduce((sum: number, tx: GetApiSalesDetailsId200TransactionsItem) => sum + (tx.amount || 0), 0) || 0;

    // const shouldShowButton = hasOutstanding && paidAmount - creditAmount < (salesData?.netTotal || 0);
    const LoadingSkeleton = () => (
        <Stack sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={100} />
        </Stack>
    );
    // const isCreditOrOutStanding = (tx: GetApiSalesDetailsId200TransactionsItem) =>
    //     tx.paymentType === 'OUTSTANDING' || tx.paymentType?.toLowerCase().includes('credit');

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={() => {
                onClose();
                clearCart();
            }}
            sx={{
                '& .MuiDrawer-paper': {
                    width: { xs: '100%', sm: 500, md: 600 },
                    maxWidth: '100vw',
                },
            }}
        >
            <Stack sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Stack
                    sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'background.paper',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                    }}
                >
                    <Stack sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <ReceiptIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                            {t('POS.SaleDetails')}
                        </Typography>
                    </Stack>
                    <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                        {showSyncButton && (
                            <Tooltip title={t('POS.SyncSalesWithEconomic')}>
                                <IconButton
                                    size="small"
                                    disabled={isSyncing}
                                    onClick={syncSales}
                                    sx={{
                                        backgroundColor: '#F1D5BD',
                                        border: '1px solid #847A71',
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: '#E5C8A8',
                                        },
                                        '&.Mui-disabled': {
                                            backgroundColor: '#E5E5E5',
                                            borderColor: '#A7A7A7',
                                        },
                                    }}
                                >
                                    {isSyncing ? (
                                        <CircularProgress size={16} sx={{ color: '#847A71' }} />
                                    ) : (
                                        <SyncIcon fontSize="small" sx={{ color: '#847A71' }} />
                                    )}
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton
                            onClick={() => {
                                onClose();
                                clearCart();
                            }}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>

                {/* Content */}
                <Stack sx={{ flex: 1, overflow: 'scroll', scrollbarWidth: 'none', p: 3 }}>
                    {isLoading && <LoadingSkeleton />}

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {t('POS.FailedToLoadSaleDetails')}
                        </Alert>
                    )}

                    {salesData && (
                        <Stack spacing={3}>
                            {/* Economic Sync Information Alert */}
                            {isInspectionModuleEnabled && isSalesSynced && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <Stack spacing={0.5}>
                                        <Typography variant="body2">
                                            <strong>
                                                {'e-conomic fakturanr. '}: #{salesDataAny.salesSync.syncSalesId}
                                            </strong>
                                        </Typography>
                                    </Stack>
                                </Alert>
                            )}

                            {/* Sale Overview */}
                            <Card elevation={2}>
                                <CardContent>
                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mb: 2,
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <ReceiptIcon color="primary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            {t('POS.SaleOverview')}
                                        </Typography>
                                    </Stack>

                                    <Grid2 container spacing={2}>
                                        <Grid2 size={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('POS.InvoiceID')}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {salesData.invoiceId || t('Common.N/A')}
                                            </Typography>
                                        </Grid2>
                                        <Grid2 size={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('POS.SaleDate')}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {moment(salesData.salesDate).format('DD/MM-YYYY')}
                                            </Typography>
                                        </Grid2>
                                        <Grid2 size={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('POS.SaleType')}
                                            </Typography>
                                            <Chip
                                                label={salesData.salesType || 'SALE'}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Grid2>
                                    </Grid2>
                                </CardContent>
                            </Card>

                            {/* Customer Information */}
                            {salesData.customer && (
                                <Card elevation={2}>
                                    <CardContent>
                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                mb: 2,
                                                flexDirection: 'row',
                                            }}
                                        >
                                            <PersonIcon color="primary" />
                                            <Typography variant="h6" fontWeight={600}>
                                                {t('Customer.CustomerInformation')}
                                            </Typography>
                                        </Stack>

                                        <Grid2 container spacing={2}>
                                            <Grid2 size={12}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('Common.Name')}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {salesData.customer.name ||
                                                        salesData.customerName ||
                                                        t('POS.WalkInCustomer')}
                                                </Typography>
                                            </Grid2>
                                            {salesData.customer.phoneNumber && (
                                                <Grid2 size={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('Calendar.PhoneNumber')}
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {salesData.customer.phoneNumber}
                                                    </Typography>
                                                </Grid2>
                                            )}
                                            {salesData.customer.email && (
                                                <Grid2 size={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('Common.Email')}
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {salesData.customer.email}
                                                    </Typography>
                                                </Grid2>
                                            )}
                                        </Grid2>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Items & Financial Summary */}
                            <Card elevation={2}>
                                <CardContent>
                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mb: 2,
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <CartIcon color="primary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            {t('POS.SaleItems')} & {t('Common.Total')}
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            gap: 1,
                                            width: '100%',
                                        }}
                                    >
                                        {/* Items */}
                                        {salesData.items?.map((item: any, index: number) => (
                                            <Stack key={item.id || index} sx={{ width: '100%' }}>
                                                {/* Item Line */}
                                                <Stack
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        width: '100%',
                                                        alignItems: 'center',
                                                        py: 1,
                                                    }}
                                                >
                                                    <Stack
                                                        sx={{
                                                            flex: 1,
                                                            flexDirection: 'column',
                                                            alignItems: 'flex-start',
                                                        }}
                                                    >
                                                        <Typography variant="body1" fontWeight={500}>
                                                            {item.itemName || t('POS.Product')}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {item.quantity} x {formatCurrency(item.amount)}
                                                            {item.itemType && (
                                                                <Chip
                                                                    label={item.itemType}
                                                                    size="small"
                                                                    color={
                                                                        item.itemType === 'PRODUCT'
                                                                            ? 'primary'
                                                                            : 'secondary'
                                                                    }
                                                                    variant="outlined"
                                                                    sx={{ ml: 1, fontSize: '10px', height: '20px' }}
                                                                />
                                                            )}
                                                        </Typography>
                                                        {item.note && (
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ fontStyle: 'italic' }}
                                                            >
                                                                {t('Common.Note')}: {item.note}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                                    </Typography>
                                                </Stack>

                                                {/* Item Discount (if any) */}
                                                {/* {(item.discountAmount || 0) > 0 && (
                                                    <Stack
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            width: '100%',
                                                            py: 0.5,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            color="error.main"
                                                            sx={{ fontStyle: 'italic' }}
                                                        >
                                                            {t('POS.Discount')}
                                                        </Typography>
                                                        <Typography variant="body2" color="error.main" fontWeight={500}>
                                                            -{formatCurrency(item.discountAmount)}
                                                        </Typography>
                                                    </Stack>
                                                )} */}

                                                {/* Item Subtotal (if there was a discount) */}
                                                {/* {(item.discountAmount || 0) > 0 && (
                                                    <Stack
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            width: '100%',
                                                            py: 0.5,
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            {t('Common.Total')}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {formatCurrency(item?.amount + item?.taxAmount || 0) || 0}
                                                        </Typography>
                                                    </Stack>
                                                )} */}
                                            </Stack>
                                        ))}

                                        {/* Financial Summary */}
                                        <Divider sx={{ my: 2 }} />

                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                width: '100%',
                                            }}
                                        >
                                            <Typography variant="body1" fontWeight={500}>
                                                {t('POS.Subtotal')}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {formatCurrency(salesData.subTotal)}
                                            </Typography>
                                        </Stack>

                                        {(salesData.totalDiscount || 0) > 0 && (
                                            <Stack
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                }}
                                            >
                                                <Typography variant="body1" fontWeight={500} color="error.main">
                                                    {t('POS.TotalDiscount')}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500} color="error.main">
                                                    -{formatCurrency(salesData.totalDiscount)}
                                                </Typography>
                                            </Stack>
                                        )}

                                        {(salesData.totalTax || 0) > 0 && (
                                            <Stack
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                }}
                                            >
                                                <Typography variant="body1" fontWeight={500}>
                                                    {`${t('POS.TotalTax')} (${t('POS.Inclusive')})`}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {formatCurrency(salesData.totalTax)}
                                                </Typography>
                                            </Stack>
                                        )}

                                        {(salesData.tips || 0) > 0 && (
                                            <Stack
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                }}
                                            >
                                                <Typography variant="body1" fontWeight={500}>
                                                    {t('POS.Tips')}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {formatCurrency(salesData.tips)}
                                                </Typography>
                                            </Stack>
                                        )}

                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                width: '100%',
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                {t('POS.TenderAmount')}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {formatCurrency(salesData.tenderAmount)}
                                            </Typography>
                                        </Stack>

                                        <Divider sx={{ my: 1 }} />

                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                width: '100%',
                                            }}
                                        >
                                            <Typography variant="h6" fontWeight={600}>
                                                {t('POS.NetTotal')}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600} color="primary.main">
                                                {formatCurrency(salesData.netTotal)}
                                            </Typography>
                                        </Stack>

                                        {(salesData.change || 0) > 0 && (
                                            <Stack
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ textAlign: 'left' }}
                                                >
                                                    {t('POS.Change')}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={500}
                                                    color="success.main"
                                                    sx={{ textAlign: 'right' }}
                                                >
                                                    {formatCurrency(salesData.change)}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* Payment Methods */}
                            {salesData.transactions && salesData.transactions.length > 0 && (
                                <Card elevation={2}>
                                    <CardContent>
                                        <Stack
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                mb: 2,
                                                flexDirection: 'row',
                                            }}
                                        >
                                            <PaymentIcon color="primary" />
                                            <Typography variant="h6" fontWeight={600}>
                                                {t('POS.PaymentMethods')}
                                            </Typography>
                                        </Stack>

                                        <Stack spacing={1}>
                                            {salesData.transactions.map(
                                                (
                                                    transaction: GetApiSalesDetailsId200TransactionsItem,
                                                    index: number,
                                                ) => (
                                                    <Stack
                                                        key={transaction.id || index}
                                                        sx={{
                                                            p: 2,
                                                            border: 1,
                                                            borderColor: 'divider',
                                                            borderRadius: 2,
                                                            bgcolor: 'background.default',
                                                        }}
                                                        spacing={2}
                                                    >
                                                        {/* Payment method name and status in one row */}
                                                        <Stack
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                        >
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {getPaymentTypeDisplay(transaction.paymentType)}
                                                            </Typography>
                                                            {/* {!isCreditOrOutStanding(transaction) && ( */}
                                                            {/* <Chip
                                                                label={transaction.txStatus}
                                                                size="small"
                                                                color={getStatusColor(transaction.txStatus)}
                                                                variant="outlined"
                                                            /> */}
                                                            {/* )} */}
                                                        </Stack>

                                                        {/* Payment details in 4-column grid */}
                                                        <Grid2 container spacing={2}>
                                                            <Grid2 size={3}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {t('Common.Amount')}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body1"
                                                                    fontWeight={500}
                                                                    sx={
                                                                        {
                                                                            // color: isCreditOrOutStanding(transaction)
                                                                            //     ? '#FF0000'
                                                                            //     : 'text.primary',
                                                                        }
                                                                    }
                                                                >
                                                                    {/* {isCreditOrOutStanding(transaction) ? '-' : ''}{' '} */}
                                                                    {formatCurrency(transaction.amount)}
                                                                </Typography>
                                                            </Grid2>
                                                            <Grid2 size={3}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {t('POS.Tender')}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body1"
                                                                    fontWeight={500}
                                                                    sx={
                                                                        {
                                                                            // color: isCreditOrOutStanding(transaction)
                                                                            //     ? '#FF0000'
                                                                            //     : 'text.primary',
                                                                        }
                                                                    }
                                                                >
                                                                    {/* {isCreditOrOutStanding(transaction) ? '-' : ''}{' '} */}
                                                                    {formatCurrency(transaction.tenderAmount)}
                                                                </Typography>
                                                            </Grid2>
                                                            {(transaction.change || 0) > 0 && (
                                                                <Grid2 size={3}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {t('POS.Change')}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body1"
                                                                        fontWeight={500}
                                                                        color="success.main"
                                                                    >
                                                                        {formatCurrency(transaction.change)}
                                                                    </Typography>
                                                                </Grid2>
                                                            )}
                                                            {transaction.cardFourDigit && (
                                                                <Grid2 size={3}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {t('POS.Card')}
                                                                    </Typography>
                                                                    <Typography variant="body1" fontWeight={500}>
                                                                        ****{transaction.cardFourDigit}
                                                                    </Typography>
                                                                </Grid2>
                                                            )}
                                                        </Grid2>
                                                    </Stack>
                                                ),
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Sales Note */}
                            {salesData.salesNote && (
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                                            {t('POS.SalesNote')}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {salesData.salesNote}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Stack>
                    )}
                </Stack>
                {isAllowed('Sales', 'create') && !isLoading && (
                    <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, mx: 'auto' }}>
                        <POSButton
                            icon={<CartIcon sx={{ height: 20, width: 20, mr: 2 }} />}
                            sx={{
                                my: 1.5,
                            }}
                            width={{ xs: '100%', md: 'fit-content' }}
                            variant={'save'}
                            title={t('POS.Resale')}
                            onClick={handleResale}
                        />
                        {/* {shouldShowButton && (
                            <POSButton
                                icon={<PaymentIcon sx={{ height: 20, width: 20, mr: 2 }} />}
                                sx={{ my: 1.5 }}
                                width={{ xs: '100%', md: 'fit-content' }}
                                variant="save"
                                title={t('POS.MakePayment')}
                                onClick={() => handleResale({ id: salesData && salesData?.id })}
                            />
                        )} */}
                    </Stack>
                )}
            </Stack>

            {showPaymentModal && (
                <PaymentModal
                    open={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onComplete={() => setShowPaymentModal(false)}
                    asEditSale={true}
                />
            )}
        </Drawer>
    );
};

export default SalesDetailsDrawer;
