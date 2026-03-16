import POSButton from '@/components/POS/Common/POSButton';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSelect from '@/components/POS/Common/POSSelect';
import {
    GetApiSalesListPrintTypeParams,
    GetApiSalesListPrintTypeSalesType,
    GetApiSalesListPrintTypeSortBy,
} from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { Close, Print } from '@mui/icons-material';
import { CircularProgress, IconButton, Modal, Paper, Stack } from '@mui/material';
import { useFormik } from 'formik';
import { t } from 'i18next';
import moment from 'moment';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface SalesPrintFiltersProps {
    open: boolean;
    onClose: () => void;
    typeOptions: { value: string; label: string }[];
    filterOptions: { value: string; label: string }[];
}

type QueryString = {
    paymentType?: string;
    salesType?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
};
export default function SalesPrintFilters({
    open,
    onClose = () => {},
    typeOptions,
    filterOptions,
}: SalesPrintFiltersProps) {
    const [loading, setLoading] = useState(false);
    const initialValues = {
        keyword: '',
        startDate: moment(),
        endDate: moment(),
        paymentType: 'ALL',
        salesType: 'NONE',
        type: 'pdf',
    };

    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: (values) => {
            if (values.type === 'csv') {
                const queryParams: GetApiSalesListPrintTypeParams = {};
                if (values.paymentType) queryParams.sortBy = values.paymentType as GetApiSalesListPrintTypeSortBy;
                if (values.salesType && values.salesType !== 'NONE')
                    queryParams.salesType = values.salesType as GetApiSalesListPrintTypeSalesType;
                if (values.keyword) queryParams.keyword = values.keyword;
                if (values.startDate) queryParams.fromDate = values.startDate.format('YYYY-MM-DD');
                if (values.endDate) queryParams.toDate = values.endDate.format('YYYY-MM-DD');
                downloadCsv({ params: queryParams, type: 'csv' });
            } else {
                const params = new URLSearchParams();
                const token = localStorage.getItem('auth_token');
                const encodedToken = btoa(token || '');
                if (values.paymentType) params.append('sortBy', values.paymentType);
                if (values.salesType && values.salesType !== 'NONE') params.append('salesType', values.salesType);
                if (values.keyword) params.append('keyword', values.keyword);
                if (values.startDate) params.append('fromDate', values.startDate.format('YYYY-MM-DD'));
                if (values.endDate) params.append('toDate', values.endDate.format('YYYY-MM-DD'));
                if (encodedToken) params.append('et', encodedToken);
                printSalesList(params as QueryString);
            }
        },
    });

    const printSalesList = async (params: QueryString) => {
        try {
            toast.info(t('POS.Processing'), { toastId: 'processing' });

            const url = `${process.env.REACT_APP_URL2}/api/sales-list-print/pdf?${params.toString()}`;

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

    const downloadCsv = async ({ params, type }: { params: GetApiSalesListPrintTypeParams; type: string }) => {
        try {
            setLoading(true);
            const response = await api.getApiSalesListPrintType(params, type as 'html' | 'pdf' | 'csv');
            if (response) {
                const blob = new Blob([response], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `sale-list-${moment().format('YYYY_MM_DD_HH_mm_ss')}.csv`;
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

                <POSHeading text={t('POS.ExportSales')} />

                <Stack sx={{ p: 2, gap: 2 }}>
                    <Stack>
                        <POSHeading text={t('POS.ByInvoiceNumbr')} sx={{ fontSize: 14, fontWeight: 600 }} />
                        <POSInput
                            value={formik.values.keyword}
                            onChange={(e) => formik.setFieldValue('keyword', e.target.value)}
                            placeholder={t('POS.EnterKeyword')}
                        />
                    </Stack>

                    <Stack>
                        <POSHeading text={t('POS.ByDate')} sx={{ fontSize: 14, fontWeight: 600 }} />
                        <POSDateRangePicker
                            disableMonths={1200}
                            startdate={formik.values.startDate?.format('YYYY-MM-DD')}
                            endDate={formik.values.endDate?.format('YYYY-MM-DD')}
                            setStartDate={(date) => formik.setFieldValue('startDate', date)}
                            setEndDate={(date) => formik.setFieldValue('endDate', date)}
                        />
                    </Stack>

                    <Stack>
                        <POSHeading text={t('POS.ByPaymentType')} sx={{ fontSize: 14, fontWeight: 600 }} />
                        <POSSelect
                            value={formik.values.paymentType}
                            onChange={(e) => formik.setFieldValue('paymentType', e.target.value)}
                            options={filterOptions}
                            placeholderText={t('POS.SelectPaymentType')}
                        />
                    </Stack>

                    <Stack>
                        <POSHeading text={t('POS.BySalesType')} sx={{ fontSize: 14, fontWeight: 600 }} />
                        <POSSelect
                            value={formik.values.salesType}
                            onChange={(e) => formik.setFieldValue('salesType', e.target.value)}
                            options={typeOptions}
                            placeholderText={t('POS.SelectSalesType')}
                        />
                    </Stack>

                    <Stack>
                        <POSHeading text={t('POS.ExportType')} sx={{ fontSize: 16, fontWeight: 600 }} />
                        <POSSelect
                            value={formik.values.type}
                            options={[
                                { value: 'pdf', label: 'PDF' },
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
                                {t('POS.ExportSales')}
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
