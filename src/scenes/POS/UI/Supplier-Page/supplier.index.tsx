import { Stack } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import POSButton from '@/components/POS/Common/POSButton';
import SupplierList from './UI/List/SupplierList';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';
import { Print } from '@mui/icons-material';
import ExportSuppliers from './Shared/Modals/ExportSupplier';

export default function POSSupplier() {
    const navigate = useNavigate();
    const { isAllowed } = Permission();
    const [showExportModal, setShowExportModal] = useState(false);

    return (
        <Stack>
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: { md: 'space-between' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    pb: 2,
                    width: '100%',
                }}
            >
                <POSHeading sx={{ my: 2 }} text={t('POS.Suppliers')} />
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        width: '100%',
                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    }}
                >
                    {isAllowed('Product', 'read') && (
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
                                    {t('POS.ExportSuppliers')}
                                </Stack>
                            }
                            variant="save"
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={() => {
                                // printSuppliers();
                                setShowExportModal(true);
                            }}
                        />
                    )}
                    {isAllowed('Supplier', 'create') && (
                        <POSButton
                            title={`+ ${t('POS.AddSupplier')}`}
                            variant={'save'}
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={() => {
                                navigate('/pos/suppliers/create');
                            }}
                        />
                    )}
                </Stack>
            </Stack>

            {isAllowed('Supplier', 'read') ? <SupplierList /> : <PermissionDenied />}

            {showExportModal && (
                <ExportSuppliers
                    open
                    onClose={() => {
                        setShowExportModal(false);
                    }}
                />
            )}
        </Stack>
    );
}
