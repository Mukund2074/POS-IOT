import { IconButton, Modal, Paper, Stack } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import { CashDrawerUtils } from '../../Core/cash-drawer.utils';
import { Close } from '@mui/icons-material';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import moment from 'moment';
import { t } from 'i18next';

export default function ListByPaymentType({
    openSaleDetails,
    setOpenSaleDetails,
    modalName,
    cashDrawerUtils,
}: {
    openSaleDetails: boolean;
    setOpenSaleDetails: (open: boolean) => void;
    modalName: string;
    cashDrawerUtils: CashDrawerUtils;
}) {
    const columns = [
        {
            id: 'id',
            name: modalName === 'OUTLAYS' ? 'OUTLAYS ID' : 'Sales ID',
            selector: (row: RowType) => <POSHeading text={row.invoiceId} fontSize={14} />,
            sortable: true,
        },
        {
            id: 'amount',
            name: 'Amount',
            selector: (row: RowType) => formatCurrency(row.amount),
            sortable: true,
        },
        {
            id: 'created',
            name: 'Created',
            selector: (row: RowType) => moment(row.createdAt).format('DD/MM-YYYY HH:mm'),
            sortable: true,
        },
    ];

    const modalNames = {
        BONUS: t('POS.Bonus'),
        MOBILE_PAY: t('POS.MobilePay'),
        BANK_TRANSFER: t('POS.BankTransfer'),
        CARD: t('POS.Cards'),
        CASH: t('POS.Cash'),
        GIFT_CARD: t('POS.GiftCard'),
        CUT_CARD: t('POS.CutCard'),
        OUTSTANDING: t('POS.Outstanding'),
        OUTLAYS: t('POS.Outlays'),
    };
    return (
        <Modal
            open={openSaleDetails}
            onClose={() => setOpenSaleDetails(false)}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Paper
                sx={{
                    backgroundColor: '#fff',
                    borderRadius: 4,
                    boxShadow: 24,
                    p: 4,
                    width: { xs: '100%', sm: '70%', md: '50%' },
                    maxWidth: '98%',
                    mx: 'auto',
                    my: 'auto',
                    position: 'relative',
                    maxHeight: '90%',
                }}
            >
                <IconButton
                    size="small"
                    onClick={() => setOpenSaleDetails(false)}
                    sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                >
                    <Close />
                </IconButton>
                <POSHeading
                    text={'Payment Method Sale - ' + modalNames[modalName as keyof typeof modalNames]}
                    fontColor="#1F1F1F"
                    fontSize="22px"
                    variant="h6"
                    sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}
                />

                <Stack sx={{ mt: 5 }}>
                    <POSTable
                        columns={columns}
                        data={
                            cashDrawerUtils
                                .getListByPaymentType(modalName as keyof typeof modalNames)
                                ?.map((item: any) => ({
                                    id: item.salesId,
                                    ...item,
                                })) || []
                        }
                        maxHeight="50vh"
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
