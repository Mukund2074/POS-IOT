import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSSelect from '@/components/POS/Common/POSSelect';
import { api } from '@/utils/Api/POS';
import { Close } from '@mui/icons-material';
import { CircularProgress, IconButton, Modal, Paper, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ModalProps {
    open: boolean;
    onClose: () => void;
}

export default function ExportSuppliers({ open, onClose }: ModalProps) {
    const [type, setType] = useState<'csv' | 'pdf' | 'html'>('pdf');
    const [loading, setLoading] = useState(false);

    const navigateForPdf = async () => {
        try {
            toast.info(t('POS.Processing'), {
                toastId: 'processing',
            });

            const token = localStorage.getItem('auth_token');
            const encodedToken = btoa(token || '');
            window.open(`${process.env.REACT_APP_URL2}/api/supplier-list-print/pdf?et=${encodedToken}`, '_blank');
        } catch (error) {
            toast.update('processing', {
                render: t('POS.SomethingWentWrong'),
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
            console.error(error);
        } finally {
            toast.dismiss('processing');
        }
    };

    const downloadCsv = async () => {
        try {
            setLoading(true);
            const response = await api.getApiSupplierListPrintType(type);
            if (response) {
                const blob = new Blob([response], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `supplier-list-${moment().format('YYYY_MM_DD_HH_mm_ss')}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (type === 'pdf') {
            navigateForPdf();
        } else if (type === 'csv') {
            downloadCsv();
        }
    };

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

                <POSHeading text={t('POS.ExportSuppliers')} />

                <POSHeading text={t('POS.ExportType')} sx={{ mt: 3, fontSize: 16, fontWeight: 600 }} />
                <POSSelect
                    value={type}
                    options={[
                        { value: 'pdf', label: 'PDF' },
                        { value: 'csv', label: 'CSV' },
                    ]}
                    onChange={(e) => setType(e.target.value as typeof type)}
                />

                <POSButton
                    variant="save"
                    title={
                        loading ? (
                            <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <CircularProgress size={20} color="inherit" />
                                <Typography>{t('POS.Processing')}</Typography>
                            </Stack>
                        ) : (
                            t('POS.ExportSuppliers')
                        )
                    }
                    onClick={handleExport}
                    width={{ xs: '100%', md: 'auto' }}
                    sx={{ mt: 3 }}
                />
            </Paper>
        </Modal>
    );
}
