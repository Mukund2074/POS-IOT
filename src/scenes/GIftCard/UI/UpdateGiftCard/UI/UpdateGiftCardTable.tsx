import POSHeading from '@/components/POS/Common/POSHeading';
import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import moment from 'moment';
import { UpdateGiftCardTableProps } from '../Types/UpdateGiftCard.types';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import Permission from '@/utils/POS/Permission';

const UpdateGiftCardTable = ({ data }: UpdateGiftCardTableProps) => {
    const { isAllowed } = Permission();
    const haveReadInvoicePermission = isAllowed('Invoice', 'read');

    const columns = [
        {
            id: 'invoiceNumber',
            name: 'Sales',
            selector: (row: RowType) => (
                <POSHeading
                    fontSize={14}
                    text={'Sales ' + row.invoiceNumber}
                    sx={haveReadInvoicePermission && { color: '#268', textDecoration: 'underline' }}
                    onClick={() => {
                        if (row?.salesId && haveReadInvoicePermission) {
                            window.open(`${process.env.REACT_APP_URL2}/api/invoice/${row?.salesId}/pdf`, '_blank');
                        }
                    }}
                />
            ),
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
