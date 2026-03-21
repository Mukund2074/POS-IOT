import React, { useMemo } from 'react';
import { useCustomerItems } from '../../../../hooks/index';
import { useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { formatCurrency } from '../../../../scenes/POS/Core/pos.utils';
import RadixTable from '@/components/radix/RadixTable';

export default function GiftCardsCustomer() {
    const params = useParams();

    const { data, isLoading } = useCustomerItems({
        id: Number(params.id),
        params: 'giftcard',
    });

    const columns = [
        { id: 'id', label: `${t('Common.ID')}`, sortable: false },
        { id: 'giftCardCode', label: `${t('GiftCard.Code')}`, sortable: false },
        { id: 'originalValue', label: `${t('Calendar.TotalAmount')}`, sortable: false },
        { id: 'residueValue', label: `${t('POS.Remaining')}`, sortable: false },
        { id: 'usageStatus', label: `${t('POS.Status')}`, sortable: false },
        { id: 'receiptDate', label: `${t('POS.ReceiptDate')}`, sortable: false },
    ];

    const dataForTable =
        data &&
        data.length > 0 &&
        data?.map((item) => ({
            id: item.id,
            giftCardCode: (
                <Stack
                    sx={{ cursor: 'pointer', textDecoration: 'underline', color: '#1976d2', fontWeight: 'bold' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`${process.env.REACT_APP_URL2}/api/gift-cards/${item?.id}/pdf`, '_blank');
                    }}
                >
                    {item?.giftCardCode}
                </Stack>
            ),
            residueValue: formatCurrency(item?.residueValue),
            usageStatus: item?.status,
            originalValue: formatCurrency(item?.originalValue),
            receiptDate: moment(item?.receiptDate).format('DD/MM-YYYY HH:mm'),
        }));

    const visible = ['giftCardCode', 'residueValue', 'originalValue', 'usageStatus', 'receiptDate'];

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
        [columns, visible],
    );

    return (
        <Stack>
            <Typography sx={{ mt: 4, mb: 2, color: '#545454', fontSize: '22px' }} variant="h6">
                {t('POS.GiftCards')}
            </Typography>
            <RadixTable loading={isLoading} columns={radixColumns} data={dataForTable || []} />
        </Stack>
    );
}
