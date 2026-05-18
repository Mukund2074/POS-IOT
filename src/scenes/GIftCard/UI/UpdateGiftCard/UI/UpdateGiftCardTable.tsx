import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import moment from 'moment';
import { UpdateGiftCardTableProps } from '../Types/UpdateGiftCard.types';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';

const UpdateGiftCardTable = ({ data }: UpdateGiftCardTableProps) => {
    const columns = [
        {
            id: 'invoiceNumber',
            name: 'Sales',
            selector: (row: RowType) => row.invoiceNumber,
            sortable: false,
        },
        {
            id: 'amountUsed',
            name: 'Amount Used',
            selector: (row: RowType) => formatCurrency(row.amountUsed),
            sortable: false,
        },
        {
            id: 'dateTime',
            name: 'Time',
            selector: (row: RowType) => moment(row.dateTime).format('DD/MM-YYYY HH:mm'),
            sortable: false,
        },
    ];

    return <POSTable columns={columns} data={data ?? []} />;
};

export default UpdateGiftCardTable;
