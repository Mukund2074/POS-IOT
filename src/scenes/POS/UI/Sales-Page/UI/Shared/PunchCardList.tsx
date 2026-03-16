import { POSTable, RowType } from '@/components/POS/Common';
import POSButton from '@/components/POS/Common/POSButton';
import { GetApiCustomers200CustomersItemBundleOffersItem } from '@/shared/api/models';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import React, { useState } from 'react';

interface PunchCardListProps {
    onApply: (punchCard: GetApiCustomers200CustomersItemBundleOffersItem) => void;
    disabled: boolean;
    data: GetApiCustomers200CustomersItemBundleOffersItem[] | null;
}

export default function PunchCardList({ onApply, disabled, data }: PunchCardListProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const PunchCardListColumns = [
        {
            id: 'name',
            name: t('Common.Name'),
            selector: (row: RowType) => row.bundleOfferName,
        },
        {
            id: 'code',
            name: t('GiftCard.Code'),
            selector: (row: RowType) => row.bundleOfferCode,
        },

        {
            id: 'residuePunches',
            name: t('PunchCard.RemainingPunch'),
            selector: (row: RowType) => <Typography sx={{ textAlign: 'center' }}>{row.residuePunches}</Typography>,
        },
        {
            id: 'expiryDate',
            name: t('Calendar.Expiry'),
            selector: (row: RowType) => moment(row.expiryDate).format('DD/MM-YYYY'),
        },
        {
            id: 'action',
            name: '',
            selector: (row: RowType, index: number) => (
                <POSButton
                    disabled={row.residuePunches <= 0 || disabled}
                    title={
                        disabled && selectedIndex === index ? (
                            <Stack sx={{ display: 'flex', gap: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <CircularProgress size={16} color="inherit" />
                                {t('POS.Processing')}
                            </Stack>
                        ) : (
                            t('POS.Apply')
                        )
                    }
                    sx={{
                        p: 0,
                        maxWidth: 150,
                        bgcolor: disabled ? '#d2d2d2' : '#44B904',
                    }}
                    variant="save"
                    onClick={() => {
                        setSelectedIndex(index);
                        onApply(row as GetApiCustomers200CustomersItemBundleOffersItem);
                    }}
                />
            ),
        },
    ];
    return (
        <POSTable
            columns={PunchCardListColumns}
            data={data?.map((item, index) => ({ ...item, id: item.id ?? `${index}` })) || []}
        />
    );
}
