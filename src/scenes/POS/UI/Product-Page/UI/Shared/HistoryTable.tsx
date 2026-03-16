import React from 'react';
import { GetApiProductsId200InventoryTransactionItem } from '@/shared/api/models';
import { Stack } from '@mui/material';
import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import moment from 'moment';
import { getTransactionType } from '../../Core/product.utils';

export default function HistoryTable({ data }: { data: GetApiProductsId200InventoryTransactionItem[] }) {
    const colors = {
        RECEIVED: '#E6F7E6',
        SOLD: '#F7E6E6',
        RETURNED: '#E6F7E6',
        'RETURNED-TO-SUPPLIER': '#F7E6E6',
        TRANSFERRED: '#F7E6E6',
        DAMAGED: '#F7E6E6',
        LOST: '#F7E6E6',
        'RE-COUNTED': '#F7E6E6',
        REFUNDED: '#E6F7E6',
        RESTOCKED: '#E6F7E6',
        THEFT: '#F7E6E6',
        EXPIRED: '#F7E6E6',
    };

    const columns = [
        {
            id: 'date',
            name: 'Date',
            selector: (row: RowType) => moment(row?.createdAt).format('DD/MM-YYYY HH:mm') ?? '',
            rowColor: (row: RowType) => colors[row?.transactionType as keyof typeof colors] ?? '#fff',
        },
        {
            id: 'employee',
            name: 'Employee',
            selector: (row: RowType) => row?.updatedBy ?? '',
            rowColor: (row: RowType) => colors[row?.transactionType as keyof typeof colors] ?? '#fff',
        },
        {
            id: 'customer',
            name: 'Customer',
            selector: (row: RowType) => row?.customerName || '-',
            rowColor: (row: RowType) => colors[row?.transactionType as keyof typeof colors] ?? '#fff',
        },
        {
            id: 'quantity',
            name: 'Quantity',
            selector: (row: RowType) => row?.quantity,
            rowColor: (row: RowType) => colors[row?.transactionType as keyof typeof colors] ?? '#fff',
        },
        {
            id: 'newStockStatus',
            name: 'New stock status',
            selector: (row: RowType) => row?.inStock ?? '',
            rowColor: (row: RowType) => colors[row?.transactionType as keyof typeof colors] ?? '#fff',
        },
        {
            id: 'action',
            name: 'Action',
            selector: (row: RowType) => getTransactionType(row?.transactionType) ?? '',
            rowColor: (row: RowType) => colors[row?.transactionType as keyof typeof colors] ?? '#fff',
        },
    ];
    return (
        <Stack sx={{ mt: 3 }}>
            <POSTable
                maxHeight="350px"
                columns={columns}
                data={data?.map((item, index) => ({ ...item, id: index.toString() })) ?? []}
                loading={false}
            />
        </Stack>
    );
}
