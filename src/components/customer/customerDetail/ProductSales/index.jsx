import React, { useMemo } from 'react';
import { useCustomerItems } from '../../../../hooks/index';
import { useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { formatCurrency } from '../../../../scenes/POS/Core/pos.utils';
import RadixTable from '@/components/radix/RadixTable';

export default function ProductSalesCustomer() {
    const params = useParams();

    const { data, isLoading } = useCustomerItems({
        id: Number(params.id),
        params: 'productsale',
    });

    const columns = [
        { id: 'id', label: `${t('Common.ID')}`, sortable: false },
        { id: 'name', label: `${t('Common.Name')}`, sortable: false },
        { id: 'subtotal', label: `${t('POS.Subtotal')}`, sortable: false },
        { id: 'quantity', label: `${t('POS.Quantity')}`, sortable: false },
        { id: 'totalPrice', label: `${t('POS.NetTotal')}`, sortable: false },
        { id: 'receiptDate', label: `${t('POS.ReceiptDate')}`, sortable: false },
    ];

    const dataForTable =
        data &&
        data.length > 0 &&
        data?.map((item) => ({
            id: item.id,
            name: item?.name,
            subtotal: formatCurrency(item?.amount),
            quantity: item?.quantity,
            totalPrice: formatCurrency(item?.totalPrice),
            receiptDate: moment(item?.receiptDate).format('DD/MM-YYYY HH:mm'),
        }));

    const visible = ['name', 'subtotal', 'quantity', 'totalPrice', 'receiptDate'];

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
        [t, isLoading],
    );

    return (
        <Stack>
            <Typography sx={{ mt: 4, mb: 2, color: '#545454', fontSize: '22px' }} variant="h6">
                {t('Customer.ProductSales')}
            </Typography>
            <RadixTable loading={isLoading} columns={radixColumns} data={dataForTable || []} />
        </Stack>
    );
}
