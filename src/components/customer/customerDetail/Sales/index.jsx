import React, { useMemo } from 'react';
import { useCustomerItems } from '../../../../hooks/index';
import { useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { formatCurrency } from '../../../../scenes/POS/Core/pos.utils';
import Permission from '@/utils/POS/Permission';
import RadixTable from '@/components/radix/RadixTable';

export default function SalesListCustomer() {
    const params = useParams();

    const { data, isLoading } = useCustomerItems({
        id: Number(params.id),
        params: 'salelist',
    });

    const { isAllowed } = Permission();
    const haveReadInvoicePermission = isAllowed('Invoice', 'read');

    const columns = [
        { id: 'id', label: `${t('Common.ID')}`, sortable: false },
        { id: 'invoiceNumber', label: `${t('PunchCard.InvoiceNumber')}`, sortable: false },
        { id: 'subtotal', label: `${t('POS.Subtotal')}`, sortable: false },
        { id: 'tenderAmount', label: `${t('POS.TenderAmount')}`, sortable: false },
        { id: 'netTotal', label: `${t('POS.NetTotal')}`, sortable: false },
        { id: 'receiptDate', label: `${t('POS.ReceiptDate')}`, sortable: false },
    ];

    const dataForTable =
        data &&
        data.length > 0 &&
        data?.map((item) => ({
            id: item.id,
            invoiceNumber: item?.invoiceNumber,
            subtotal: formatCurrency(item?.amount),
            tenderAmount: formatCurrency(item?.tenderAmount),
            netTotal: formatCurrency(item?.netTotal),
            receiptDate: moment(item?.receiptDate).format('DD/MM-YYYY HH:mm'),
        }));

    const visible = ['invoiceNumber', 'subtotal', 'tenderAmount', 'netTotal', 'receiptDate'];

    const radixColumns = useMemo(
        () =>
            columns
                .filter((c) => visible.includes(c.id))
                .map((c) => ({
                    id: c.id,
                    name: c.label,
                    sortable: c.sortable,
                    selector: (row) => row[c.id] ?? '',
                })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [t, isLoading, haveReadInvoicePermission],
    );

    return (
        <Stack>
            <Typography sx={{ mt: 4, mb: 2, color: '#545454', fontSize: '22px' }} variant="h6">
                {t('POS.Sales')}
            </Typography>
            <RadixTable loading={isLoading} columns={radixColumns} data={dataForTable || []} />
        </Stack>
    );
}
