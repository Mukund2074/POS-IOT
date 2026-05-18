import React, { useState } from 'react';
import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import moment from 'moment';
import SalesDetailsDrawer from './SalesDetailsDrawer';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { Stack, Typography } from '@mui/material';
import { MailOutlineRounded } from '@mui/icons-material';
import SendEmailReceipt from './Modals/SendEmailReceipt';
import { Link } from 'react-router-dom';
import { t } from 'i18next';
import { GetApiSalesList200SalesItem } from '@/shared/api/models';
import SalesEditChoice from './Modals/SalesEditChoice';
import Permission from '@/utils/POS/Permission';
const DeleteIcon = require('@/assets/Delete.svg').default;

export default function SalesTable({
    setOpen,
    sales,
    loading,
}: {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    sales?: GetApiSalesList200SalesItem[];
    loading?: boolean;
}) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<GetApiSalesList200SalesItem | null>(null);
    const [sendEmailReceiptOpen, setSendEmailReceiptOpen] = useState(false);
    const [salesEditChoiceOpen, setSalesEditChoiceOpen] = useState(false);

    const { isAllowed } = Permission();
    const haveReadInvoicePermission = isAllowed('Invoice', 'read');

    const columns = [
        {
            id: 'id',
            name: 'ID',
            selector: (row: RowType) => row.invoiceId,
        },
        {
            id: 'created',
            name: 'Created',
            selector: (row: RowType) => moment(row.createdAt).format('DD/MM-YYYY HH:mm'),
        },
        {
            id: 'receiptDate',
            name: 'Receipt Date',
            selector: (row: RowType) => moment(row.salesDate).format('DD/MM-YYYY'),
        },
        {
            id: 'fullAmount',
            name: 'Full amount',
            selector: (row: RowType) => {
                const total = row?.netTotal;
                return formatCurrency(total);
            },
        },
        {
            id: 'amountPaid',
            name: 'Amount paid',
            selector: (row: RowType) => {
                const paidAmount = row?.netTotal - row?.creditAmount - row?.outstandingAmount;
                return formatCurrency(paidAmount);
            },
        },
        {
            id: 'creditedAmount',
            name: 'Credited amount',
            selector: (row: RowType) => formatCurrency(row.creditAmount),
        },
        {
            id: 'customer',
            name: 'Customer',
            selector: (row: RowType) => (
                <Typography sx={{ maxWidth: 150, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {row?.customerId ? (
                        <Link to={`/customers/${row?.customerId}`}>{row?.customerName}</Link>
                    ) : (
                        <span>{t('POS.NotSpecified')}</span>
                    )}
                </Typography>
            ),
        },
        {
            id: 'action',
            name: '',
            selector: (row: RowType) => (
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                        minWidth: 80,
                    }}
                >
                    <MailOutlineRounded
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSale(row as GetApiSalesList200SalesItem);
                            setSendEmailReceiptOpen(true);
                        }}
                        sx={{ cursor: 'pointer', fontSize: 18 }}
                    />

                    <img
                        src={DeleteIcon}
                        alt="Delete"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSale(row as GetApiSalesList200SalesItem);
                            setSalesEditChoiceOpen(true);
                        }}
                    />
                </Stack>
            ),
        },
    ];

    return (
        <React.Fragment>
            <POSTable
                data={sales ?? []}
                columns={columns}
                loading={loading}
                maxHeight={'75dvh'}
                onRowClick={(row) => {
                    if (haveReadInvoicePermission) {
                        setSelectedSale(row as GetApiSalesList200SalesItem);
                        setDrawerOpen(true);
                    }
                }}
                isServerSorting={false}
            />

            <SalesDetailsDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                salesId={selectedSale?.id?.toString() ?? null}
                setOpen={setOpen}
            />

            {sendEmailReceiptOpen && (
                <SendEmailReceipt
                    open={sendEmailReceiptOpen}
                    onClose={() => setSendEmailReceiptOpen(false)}
                    invoiceId={selectedSale?.id ?? ''}
                    email={selectedSale?.customer?.email as string}
                    showSuccessAnimation={false}
                />
            )}

            {salesEditChoiceOpen && selectedSale && (
                <SalesEditChoice
                    open={salesEditChoiceOpen}
                    onClose={() => setSalesEditChoiceOpen(false)}
                    selectedSale={selectedSale}
                />
            )}
        </React.Fragment>
    );
}
