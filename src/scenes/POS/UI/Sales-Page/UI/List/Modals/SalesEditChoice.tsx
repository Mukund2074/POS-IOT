import { CircularProgress, Modal, Paper, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import { Replay } from '@mui/icons-material';
import POSButton from '@/components/POS/Common/POSButton';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import { salesApi } from '../../../Core/sales.api';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useSalesDetails } from '@/hooks/api/pos/sales/useSalesDetails';
import {
    GetApiSalesList200SalesItem,
    PostApiSaleBodyDataPaymentItem,
    PutApiCreditSaleIdBody,
} from '@/shared/api/models';
import { defaultCart } from '@/context/POS/CartContext';
import moment from 'moment';
import PaymentModal from '../../Create/Modals/Payment/PaymentModal';
import { api } from '@/utils/Api/POS';
import { useSalesList } from '@/hooks/index';
import Permission from '@/utils/POS/Permission';
import { CartOverride } from '@/types/CartContext.type';
const DeleteIcon = require('../../../../../../../assets/Delete.svg').default;

export default function SalesEditChoice({
    open,
    onClose,
    selectedSale,
}: {
    open: boolean;
    onClose: () => void;
    selectedSale: GetApiSalesList200SalesItem;
}) {
    const [editSales, setEditSales] = useState(false);
    const [cancelSale, setCancelSale] = useState(false);
    const [cart, setCart] = useState<CartOverride>({ ...defaultCart, saleId: selectedSale.id });
    const [loading, setLoading] = useState(false);
    const { isAllowed } = Permission();

    const showToast = (message: string, type: 'success' | 'error') => {
        toast(message, {
            type,
        });
    };

    const { data: saleDetailsData } = useSalesDetails(selectedSale.id, selectedSale.id !== undefined);
    const { refetch: refetchSalesList } = useSalesList();

    useEffect(() => {
        if (saleDetailsData) {
            setCart((prev) => ({
                ...prev,
                saleId: saleDetailsData?.id || selectedSale.id,
                customerId: saleDetailsData?.customerId || prev.customerId,
                customerName: saleDetailsData?.customerName || prev.customerName,
                salesNote: prev.salesNote || saleDetailsData?.salesNote || '',
                sellBy: Number(saleDetailsData?.sellBy) || Number(localStorage.getItem('employee_id')),
                salesDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                netTotal: saleDetailsData?.netTotal || prev.netTotal,
                subTotal: saleDetailsData?.subTotal || prev.subTotal,
                totalTax: saleDetailsData?.totalTax || prev.totalTax,
                tenderAmount: saleDetailsData?.tenderAmount || prev.tenderAmount,
                change: saleDetailsData?.change || prev.change,
                roundOff: saleDetailsData?.roundOff || prev.roundOff,
                tips: saleDetailsData?.tips || prev.tips,
                remainingCredit: saleDetailsData?.netTotal - (selectedSale?.creditAmount || 0) || 0,
                items:
                    saleDetailsData?.items
                        ?.filter((item) => item.itemType === 'PRODUCT')
                        .map((item) => ({
                            productId: item.productId,
                            serviceId: item.serviceId,
                            itemName: item.itemName || '',
                            itemType: item.itemType ?? 'PRODUCT',
                            saleType: item.saleType ?? 'SALE',
                            quantity: item.quantity ?? 1,
                            amount: Number(item.amount) ?? 0,
                            price: Number(item.price) ?? 0,
                            taxAmount: Number(item.taxAmount) ?? 0,
                            note: item.note || '',
                            employeeId: Number(item.employeeId) || Number(localStorage.getItem('employee_id')),
                            description: item.description || '',
                            netQuantity: item.netQuantity ?? 0,
                            discountAmount:
                                item.discounts?.[0]?.amountType === 'VARIABLE_PERCENTAGE' && item.price
                                    ? (Number(item.discountAmount) / Number(item.price)) * 100
                                    : (Number(item.discountAmount) ?? 0),

                            discountType: item?.discounts?.[0]?.amountType || 'VARIABLE_PERCENTAGE',
                            // calculate already credit with netquantity * price
                            alreadyCredit: (item.quantity - (item.netQuantity ?? 0)) * (item.price ?? 0),
                            discounts:
                                item.discounts?.map((discount) => ({
                                    discountAmount:
                                        discount.amountType === 'VARIABLE_PERCENTAGE' && item.price
                                            ? (Number(discount.amount) / Number(item.price)) * 100
                                            : (Number(discount.amount) ?? 0),
                                    amountType: discount.amountType || 'VARIABLE_PERCENTAGE',
                                    amount: Number(discount.amount) ?? 0,
                                    couponId: discount.couponId ?? null,
                                    discountId: discount.discountId ?? null,
                                    discountName: discount.discountName ?? '',
                                    percentage:
                                        discount.amountType === 'VARIABLE_PERCENTAGE' && item.price
                                            ? (Number(discount.amount) / Number(item.price)) * 100
                                            : (Number(discount.amount) ?? 0),
                                })) || [],
                        })) || [],
            }));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saleDetailsData]);

    const addPayment = (payment: PostApiSaleBodyDataPaymentItem) => {
        setCart((prev) => ({
            ...prev,
            payment: [...prev.payment, payment],
        }));
    };

    const removePayment = (index: number) => {
        setCart((prev) => ({
            ...prev,
            payment: prev.payment.filter((_, i) => i !== index),
        }));
    };

    const clearPayments = () => {
        setCart((prev) => ({
            ...prev,
            payment: [],
        }));
    };

    const setPayments = (payments: PostApiSaleBodyDataPaymentItem[]) => {
        setCart((prev) => ({
            ...prev,
            payment: payments,
        }));
    };

    const onSubmit = async () => {
        const body: PutApiCreditSaleIdBody = {
            payment: cart.payment,
            products: cart.items
                .filter((item) => item.itemType === 'PRODUCT')
                .map((item) => ({
                    productId: item.productId?.toString() ?? '',
                    quantity: item.quantity,
                })),
        };

        await creditSale(body);
    };

    const creditSale = async (body: PutApiCreditSaleIdBody) => {
        setLoading(true);
        await api
            .putApiCreditSaleId(selectedSale.id, body)
            .then(() => {
                toast.success(t('POS.SaleEdited'));
                queryClient.invalidateQueries({ queryKey: ['sales', 'list'] });
                refetchSalesList();
                setTimeout(() => {
                    setLoading(false);
                    setEditSales(false);
                    onClose();
                }, 1500);
            })
            .catch((error) => {
                toast.error(t('POS.SaleEditError'));
                console.error('Error editing credit sale:', error);
                setTimeout(() => {
                    setLoading(false);
                    setEditSales(false);
                    onClose();
                }, 1500);
            });
    };
    const onDeleteSale = async () => {
        try {
            setLoading(true);
            await salesApi.cancelSale({ invoiceId: selectedSale.id, showToast });
            // refetch sales
            queryClient.invalidateQueries({ queryKey: ['sales', 'list'] });
            refetchSalesList();
            setCancelSale(false);
            onClose();
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        } catch (error) {
            showToast(t('POS.SaleDeleteError'), 'error');
            console.error('Error deleting sale:', error);
        } finally {
            setLoading(false);
        }
    };
    const queryClient = useQueryClient();

    if (selectedSale.creditAmount && selectedSale.creditAmount >= selectedSale.netTotal) {
        return (
            <POSDeleteModal
                open={true}
                handleClose={() => {
                    setCancelSale(false);
                    onClose();
                }}
                title={t('POS.CancelSale')}
                description={t('POS.CancelSaleDesc')}
                descriptionStyle={{ whiteSpace: 'pre-line', mt: 1 }}
                onClickDismiss={() => {
                    setCancelSale(false);
                    onClose();
                }}
                onClickConfirm={onDeleteSale}
                disabled={loading}
            />
        );
    }
    return (
        <Modal
            disableAutoFocus
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, width: '100%' }}
            open={open}
            onClose={(_, reason) => {
                if (reason !== 'backdropClick') onClose();
            }}
        >
            <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                <Stack
                    sx={{
                        width: { xs: '100%', md: '40%' },
                        borderRadius: 4,
                        position: 'relative',
                        bgcolor: 'transparent',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: { xs: 2, md: 4 },
                        mx: 'auto',
                        maxWidth: 600,
                    }}
                >
                    {isAllowed('Sales', 'update') && (
                        <Paper
                            sx={{
                                p: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                cursor: 'pointer',
                                width: '100%',
                                borderRadius: 2,
                                '&:hover': {
                                    bgcolor: '#f0f0f0',
                                    transform: 'scale(1.02)',
                                    transition: 'all 0.3s ease-in-out',
                                },
                            }}
                            onClick={() => {
                                setEditSales(true);
                            }}
                        >
                            <Replay sx={{ fontSize: 40 }} />
                            <POSHeading text={t('POS.EditSales')} sx={{ fontSize: 20, fontWeight: 600 }} />
                        </Paper>
                    )}
                    {isAllowed('Sales', 'delete') && (
                        <Paper
                            sx={{
                                p: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                cursor: 'pointer',
                                width: '100%',
                                borderRadius: 2,
                                '&:hover': {
                                    bgcolor: '#f0f0f0',
                                    transform: 'scale(1.02)',
                                    transition: 'all 0.3s ease-in-out',
                                },
                            }}
                            onClick={() => setCancelSale(true)}
                        >
                            <img src={DeleteIcon} alt="Delete" style={{ width: 40, height: 40 }} />
                            <POSHeading text={t('POS.CancelSale')} sx={{ fontSize: 20, fontWeight: 600 }} />
                        </Paper>
                    )}
                </Stack>

                <POSButton
                    title={
                        loading ? (
                            <Stack sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}>
                                <CircularProgress size={20} sx={{ color: 'inherit' }} />
                                {t('POS.Processing')}
                            </Stack>
                        ) : (
                            t('Setting.Cancel')
                        )
                    }
                    variant="save"
                    type="button"
                    width={{ xs: '100%', md: 'fit-content' }}
                    onClick={loading ? undefined : onClose}
                    disabled={loading}
                    sx={{ mx: 'auto' }}
                />

                {/* Only show PaymentModal if not in the direct-delete case */}
                {editSales && (selectedSale?.creditAmount ?? 0) < selectedSale?.netTotal && (
                    <PaymentModal
                        open={editSales}
                        onClose={() => setEditSales(false)}
                        onComplete={onSubmit}
                        asCreditSale={true}
                        creditSale={{
                            cart,
                            addPayment,
                            removePayment,
                            clearPayments,
                            setPayments,
                            setCartOption: setCart,
                        }}
                    />
                )}

                {cancelSale && (
                    <POSDeleteModal
                        open={true}
                        handleClose={() => {
                            setCancelSale(false);
                            onClose();
                        }}
                        title={t('POS.CancelSale')}
                        description={t('POS.CancelSaleDesc')}
                        descriptionStyle={{ whiteSpace: 'pre-line', mt: 1 }}
                        onClickDismiss={() => {
                            setCancelSale(false);
                            onClose();
                        }}
                        onClickConfirm={onDeleteSale}
                        disabled={loading}
                    />
                )}
            </Stack>
        </Modal>
    );
}
