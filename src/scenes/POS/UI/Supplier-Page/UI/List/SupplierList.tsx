import React from 'react';
import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import { useGetSupplier } from '@/hooks/api/pos';
import { useNavigate } from 'react-router-dom';
import { formatMobileNumber } from '@/utils/POS/Functions';
import Permission from '@/utils/POS/Permission';
import { ArrowForward } from '@mui/icons-material';
import { IconButton } from '@mui/material';

export default function SupplierList() {
    const navigate = useNavigate();
    const { isAllowed } = Permission();
    const { data: suppliers, isLoading } = useGetSupplier();

    const columns = [
        {
            id: 'name',
            name: 'Name',
            selector: (row: RowType) => row.name,
            sortable: true,
        },
        {
            id: 'Contact person',
            name: 'Contact person',
            selector: (row: RowType) => row.contactPersonName,
            sortable: true,
        },
        {
            id: 'contactPersonPhone',
            name: 'Phone',
            selector: (row: RowType) =>
                row?.contactPersonPhone
                    ? `${row.countryCode || '+44'} ${formatMobileNumber(row.contactPersonPhone)}`
                    : '',
            sortable: true,
        },
        {
            id: 'Email',
            name: 'Email',
            selector: (row: RowType) => row.contactPersonEmail,
            sortable: true,
        },
        {
            id: 'ArrowIcon',
            name: '',
            selector: (row: RowType) => (
                <IconButton
                    onClick={() => {
                        if (isAllowed('Supplier', 'update')) {
                            navigate(`/pos/suppliers/${row.id}`);
                        }
                    }}
                    sx={{ display: 'flex', marginLeft: ' auto', color: '#44B904' }}
                >
                    <ArrowForward sx={{ fontSize: 20 }} />
                </IconButton>
            ),
            sortable: false, // Arrow column is not sortable
        },
    ];
    return (
        <POSTable
            columns={columns}
            data={suppliers ?? []}
            loading={isLoading}
            onRowClick={(row) => {
                if (isAllowed('Supplier', 'update')) {
                    navigate(`/pos/suppliers/${row.id}`);
                }
            }}
            isServerSorting={false}
            defaultOrder="seqId"
        />
    );
}
