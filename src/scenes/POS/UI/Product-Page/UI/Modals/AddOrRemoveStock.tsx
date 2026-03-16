import { Close } from '@mui/icons-material';
import { CircularProgress, IconButton, Modal, Paper, Stack } from '@mui/material';
import React from 'react';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSButton from '@/components/POS/Common/POSButton';
import POSInput from '@/components/POS/Common/POSInput';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { productApi } from '../../Core/product.api';
import { PostApiStockBodyType } from '@/shared/api/models';
import { toast } from 'react-toastify';

export default function AddOrRemoveStock({
    open,
    onClose,
    type,
    productId,
    refetch,
}: {
    open: boolean;
    onClose: () => void;
    type: 'add' | 'remove';
    productId: string;
    refetch: () => void;
}) {
    const showToast = (message: string, type: 'success' | 'error') => {
        if (type === 'success') {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    const formik = useFormik({
        initialValues: {
            cause: type === 'add' ? 'RECEIVED' : 'DAMAGED',
            quantity: 0,
        },
        validationSchema: Yup.object().shape({
            cause: Yup.string().required(t('POS.CauseRequired')).nullable(),
            quantity: Yup.number().required(t('POS.QuantityRequired')).min(1, t('POS.QuantityRequired')),
        }),
        onSubmit: async () => {
            await productApi.addOrRemoveStock({
                body: {
                    productId: productId,
                    type: formik.values.cause as PostApiStockBodyType,
                    quantity: formik.values.quantity,
                },
                showToast,
            });
            refetch();
            onClose();
        },
    });

    const addOptions = [
        { value: 'RECEIVED', label: t('POS.NewItem') },
        { value: 'REFUNDED', label: t('POS.Refunded') },
        { value: 'RESTOCKED', label: t('POS.Restocked') },
    ];

    const removeOptions = [
        { value: 'DAMAGED', label: t('POS.Damaged') },
        { value: 'LOST', label: t('POS.Lost') },
        { value: 'RE-COUNTED', label: t('POS.ReCounted') },
        { value: 'RESTOCKED', label: t('POS.Restocked') },
        { value: 'THEFT', label: t('POS.Theft') },
        { value: 'EXPIRED', label: t('POS.Expired') },
        { value: 'TRANSFERRED', label: t('POS.Transferred') },
        { value: 'SOLD', label: t('POS.Sold') },
        { value: 'RETURNED-TO-SUPPLIER', label: t('POS.ReturnedToSupplier') },
    ];

    return (
        <Modal
            open={open}
            onClose={onClose}
            keepMounted
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    position: 'relative',
                    width: { xs: '90%', md: '40%' },
                    maxHeight: '90%',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    borderRadius: 4,
                    p: { xs: 2, md: 3 },
                }}
            >
                <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
                    <Close />
                </IconButton>

                <POSHeading text={type === 'add' ? t('POS.AddStock') : t('POS.RemoveStock')} />

                <Stack sx={{ mt: 4 }}>
                    <POSHeading sx={{ fontSize: 16, fontWeight: 600, color: '#010101' }} text={t('POS.Cause')} />

                    <POSSelect
                        options={type === 'add' ? addOptions : removeOptions}
                        onChange={(e) => {
                            const value = e.target.value as string;
                            formik.setFieldValue('cause', value);
                        }}
                        value={formik.values.cause}
                        error={formik.touched.cause && Boolean(formik.errors.cause)}
                        helperText={formik.touched.cause ? (formik.errors.cause as string) : ''}
                    />
                </Stack>

                <Stack sx={{ mt: 4 }}>
                    <POSHeading sx={{ fontSize: 16, fontWeight: 600, color: '#010101' }} text={t('POS.Quantity')} />

                    <POSInput
                        value={formik.values.quantity}
                        onChange={(e) => formik.setFieldValue('quantity', e.target.value)}
                        InputProps={{ type: 'number' }}
                        error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                        helperText={formik.touched.quantity ? (formik.errors.quantity as string) : ''}
                    />
                </Stack>

                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 1,
                        mt: { xs: 4, md: 6 },
                        justifyContent: 'flex-end',
                    }}
                >
                    <POSButton
                        title={t('Setting.Cancel')}
                        variant="save"
                        width={{ xs: '100%', md: 'fit-content' }}
                        sx={{ backgroundColor: '#D2D2D2' }}
                        onClick={onClose}
                    />
                    <POSButton
                        disabled={formik.isSubmitting}
                        title={
                            formik.isSubmitting ? (
                                <Stack sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}>
                                    <CircularProgress color="inherit" size={20} /> {t('POS.Updating')}
                                </Stack>
                            ) : (
                                t('GiftCard.update')
                            )
                        }
                        variant="save"
                        sx={{ backgroundColor: formik.isSubmitting && '#D2D2D2' }}
                        onClick={formik.handleSubmit}
                        width={{ xs: '100%', md: 'fit-content' }}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
