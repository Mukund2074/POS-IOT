import POSButton from '@/components/POS/Common/POSButton';
import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import React from 'react';
import { t } from 'i18next';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import moment from 'moment';

interface GiftCardListProps {
    onApply: (giftCard: any) => void;
    giftCards: any[];
}

export default function GiftCardList({ onApply, giftCards }: GiftCardListProps) {
    const columns = [
        {
            id: 'code',
            name: 'Code',
            selector: (row: RowType) => row.giftCardCode,
        },
        {
            id: 'residueValue',
            name: 'Residue Value',
            selector: (row: RowType) => formatCurrency(row.residueValue),
        },
        {
            id: 'expiresDate',
            name: 'Expires Date',
            selector: (row: RowType) => moment(row.expiresDate).format('DD/MM-YYYY HH:mm'),
        },
        {
            id: 'action',
            name: '',
            selector: (row: RowType) => (
                <POSButton
                    title={t('POS.Apply')}
                    width="fit-content"
                    sx={{
                        p: 0,
                        height: '30px',
                        width: '100%',
                        minWidth: '100px',
                    }}
                    onClick={() => {
                        onApply(row);
                    }}
                    disabled={row.residueValue <= 0}
                />
            ),
        },
    ];
    return (
        <React.Fragment>
            <POSTable
                data={giftCards}
                columns={columns}
                maxHeight="300px"
                rowHeight="40px"
            />
        </React.Fragment>
    );
}
