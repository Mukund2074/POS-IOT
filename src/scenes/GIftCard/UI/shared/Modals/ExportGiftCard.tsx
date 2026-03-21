import POSButton from '@/components/POS/Common/POSButton';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSelect, { POSSelectOption } from '@/components/POS/Common/POSSelect';
import { GetApiGiftCardsListTypeParams } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { Close, Print } from '@mui/icons-material';
import { CircularProgress, IconButton, Modal, Paper, Stack } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import moment, { Moment } from 'moment';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ExportGiftCardProps {
    open: boolean;
    onClose: () => void;
    giftCardFilters: POSSelectOption[];
}

type QueryString = {
    status?: string;
    keyword?: string;
    fromDate?: string;
    toDate?: string;
};

export default function ExportGiftCard({ open, onClose, giftCardFilters }: ExportGiftCardProps) {
    const [loading, setLoading] = useState(false);
    const initialValues = {
        status: 'ALL',
        keyword: '',
        fromDate: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        toDate: moment().add(3, 'months').format('YYYY-MM-DD'),
        type: 'csv',
    };

    const formik = useFormik({
        initialValues,
        onSubmit: async (values) => {
            const queryString: QueryString = {
                status: values.status,
                keyword: values.keyword,
                fromDate: moment(values.fromDate, 'YYYY-MM-DD').toDate().toISOString(),
                toDate: moment(values.toDate, 'YYYY-MM-DD').toDate().toISOString(),
            };

            if (values.type === 'csv') {
                await downloadCsv({
                    params: queryString as GetApiGiftCardsListTypeParams,
                    type: 'csv',
                });
            } else {
                await printGiftCardList(queryString);
            }
        },
    });

    const printGiftCardList = async (QueryString: QueryString) => {
        try {
            toast.info(t('POS.Processing'), { toastId: 'processing' });

            const token = localStorage.getItem('auth_token');
            const encodedToken = btoa(token || '');

            // Build query params dynamically
            const params = new URLSearchParams();

            if (QueryString.status) params.append('status', QueryString.status);
            if (QueryString.keyword) params.append('keyword', QueryString.keyword);
            if (QueryString.fromDate) params.append('fromDate', QueryString.fromDate);
            if (QueryString.toDate) params.append('toDate', QueryString.toDate);
            if (encodedToken) params.append('et', encodedToken);

            const url = `${process.env.REACT_APP_URL2}/api/gift-cards-list/csv?${params.toString()}`;

            window.open(url, '_blank');
        } catch (error) {
            toast.update('processing', {
                render: t('POS.FailedToPrintCategory'),
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
            console.error(error);
        } finally {
            toast.dismiss('processing');
        }
    };

    const downloadCsv = async ({ params, type }: { params: GetApiGiftCardsListTypeParams; type: string }) => {
        try {
            setLoading(true);
            const response = await api.getApiGiftCardsListType(params, type as 'html' | 'pdf' | 'csv');
            if (response) {
                const blob = new Blob([response], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `gift-card-list-${moment().format('YYYY_MM_DD_HH_mm_ss')}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('POS.SomethingWentWrong'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            disableAutoFocus
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            open={open}
            onClose={onClose}
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
                <IconButton sx={{ position: 'absolute', right: 0, top: 0 }} onClick={onClose}>
                    <Close />
                </IconButton>

                <POSHeading text={t('GiftCard.ExportGiftCards')} />

                <Stack sx={{ p: 2, gap: 2 }}>
                    <Stack>
                        <POSHeading text={t('GiftCard.GiftCardFilter')} sx={{ fontSize: 15, fontWeight: 500 }} />
                        <POSSelect
                            options={giftCardFilters}
                            value={formik.values.status}
                            onChange={(e) => formik.setFieldValue('status', e.target.value)}
                        />
                    </Stack>

                    <Stack>
                        <POSHeading text={t('GiftCard.Keyword')} sx={{ fontSize: 15, fontWeight: 500 }} />
                        <POSInput
                            value={formik.values.keyword}
                            onChange={(e) => formik.setFieldValue('keyword', e.target.value)}
                            placeholder={t('GiftCard.KeywordDesc')}
                        />
                    </Stack>

                    <Stack>
                        <POSHeading text={t('POS.ByDate')} sx={{ fontSize: 15, fontWeight: 500 }} />
                        <POSDateRangePicker
                            startdate={formik.values.fromDate}
                            endDate={formik.values.toDate}
                            setEndDate={(date: Moment) => formik.setFieldValue('toDate', date.format('YYYY-MM-DD'))}
                            setStartDate={(date: Moment) => formik.setFieldValue('fromDate', date.format('YYYY-MM-DD'))}
                        />
                    </Stack>

                    <Stack>
                        <POSHeading text={t('POS.ExportType')} sx={{ fontSize: 16, fontWeight: 600 }} />
                        <POSSelect
                            value={formik.values.type}
                            options={[
                                { value: 'csv', label: 'CSV' },
                            ]}
                            onChange={(e) => formik.setFieldValue('type', e.target.value)}
                        />
                    </Stack>
                </Stack>

                <POSButton
                    title={
                        loading ? (
                            <Stack
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <CircularProgress size={20} sx={{ color: 'inherit' }} />
                                {t('POS.Processing')}
                            </Stack>
                        ) : (
                            <Stack
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Print />
                                {t('GiftCard.ExportGiftCards')}
                            </Stack>
                        )
                    }
                    variant="save"
                    sx={{ ml: 'auto', mt: 3 }}
                    width={{ xs: '100%', md: 'auto' }}
                    onClick={() => {
                        formik.handleSubmit();
                    }}
                />
            </Paper>
        </Modal>
    );
}
