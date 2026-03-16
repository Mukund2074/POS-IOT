import { POSTable, RowType } from '@/components/POS/Common';
import { GetApiSoldBundleOffersIdHistory200Item } from '@/shared/api/models';
import { Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import React from 'react';
import Permission from '@/utils/POS/Permission';

interface PunchCardUsageTableProps {
    data: GetApiSoldBundleOffersIdHistory200Item[];
    isLoading: boolean;
}

export default function PunchCardUsageTable({ data, isLoading }: PunchCardUsageTableProps) {
    const { isAllowed } = Permission();
    const haveReadInvoicePermission = isAllowed('Invoice', 'read');

    const columns = [
        {
            id: 'invoiceNumber',
            name: t('PunchCard.InvoiceNumber'),
            selector: (row: RowType) => (
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
                            window.open(`${process.env.REACT_APP_URL2}/api/invoice/${row.salesId}/pdf`, '_blank');
                        }
                    }}
                >
                    {row.invoiceNumber}
                </Typography>
            ),
        },
        {
            id: 'punchesUsed',
            name: t('PunchCard.PunchesUsed'),
            selector: (row: RowType) => row.punchesUsed,
        },
        {
            id: 'appliedService',
            name: t('PunchCard.AppliedService'),
            selector: (row: RowType) =>
                row.appliedService?.services?.map((service: any) => service.serviceName).join(', ') || '',
        },
        {
            id: 'punchesRemaining',
            name: t('PunchCard.RemainingPunch'),
            selector: (row: RowType) => row.punchesRemaining,
        },
        {
            id: 'usedBy',
            name: t('PunchCard.SoldBy'),
            selector: (row: RowType) => row.employee?.name || '-',
        },
        {
            id: 'createdAt',
            name: t('Common.createdAt'),
            selector: (row: RowType) => moment(row.createdAt).format('DD/MM-YYYY HH:mm'),
        },
    ];
    return <POSTable data={data || []} columns={columns} loading={isLoading} />;
}
