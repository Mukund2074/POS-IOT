import React from 'react';
import { useCustomerItems } from '../../../../hooks/index';
import { useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import { t } from 'i18next';
import moment from 'moment';
import FCommonTable from '../../../commonComponents/F_commonTable';
import { formatCurrency } from '../../../../scenes/POS/Core/pos.utils';

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

    return (
        <Stack>
            <FPrimaryHeading sx={{ mt: 4, mb: 2 }} text={t('POS.GiftCards')} />
            <FCommonTable
                loading={isLoading}
                columns={columns}
                data={dataForTable || []}
                visibleColumns={['giftCardCode', 'residueValue', 'originalValue', 'usageStatus', 'receiptDate']}
            />
        </Stack>
    );
}
