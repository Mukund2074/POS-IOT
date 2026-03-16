import React from 'react';
import { useCustomerItems } from '../../../../hooks/index';
import { useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import { t } from 'i18next';
import moment from 'moment';
import FCommonTable from '../../../commonComponents/F_commonTable';
import { formatCurrency } from '../../../../scenes/POS/Core/pos.utils';

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

    return (
        <Stack>
            <FPrimaryHeading sx={{ mt: 4, mb: 2 }} text={t('Customer.ProductSales')} />
            <FCommonTable
                loading={isLoading}
                columns={columns}
                data={dataForTable || []}
                visibleColumns={['name', 'subtotal', 'quantity', 'totalPrice', 'receiptDate']}
            />
        </Stack>
    );
}
