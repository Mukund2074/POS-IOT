import React from 'react';
import { useCustomerItems } from '../../../../hooks/index';
import { useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import { t } from 'i18next';
import moment from 'moment';
import FCommonTable from '../../../commonComponents/F_commonTable';
import { formatCurrency } from '../../../../scenes/POS/Core/pos.utils';
import Permission from '@/utils/POS/Permission';

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
            invoiceNumber: (
                <Stack
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
                        if (haveReadInvoicePermission) {
                            window.open(`${process.env.REACT_APP_URL2}/api/invoice/${item.id}/pdf`, '_blank');
                        }
                    }}
                >
                    {' '}
                    {item?.invoiceNumber}
                </Stack>
            ),
            subtotal: formatCurrency(item?.amount),
            tenderAmount: formatCurrency(item?.tenderAmount),
            netTotal: formatCurrency(item?.netTotal),
            receiptDate: moment(item?.receiptDate).format('DD/MM-YYYY HH:mm'),
        }));

    return (
        <Stack>
            <FPrimaryHeading sx={{ mt: 4, mb: 2 }} text={t('POS.Sales')} />
            <FCommonTable
                loading={isLoading}
                columns={columns}
                data={dataForTable || []}
                visibleColumns={['invoiceNumber', 'subtotal', 'tenderAmount', 'netTotal', 'receiptDate']}
            />
        </Stack>
    );
}
