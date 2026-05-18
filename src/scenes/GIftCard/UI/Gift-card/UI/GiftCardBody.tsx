import POSHeading from '@/components/POS/Common/POSHeading';
import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { GiftCardBodyProps } from '../Types/GiftCard.types';
import Permission from '@/utils/POS/Permission';

const GiftCardBody = ({ giftCardData, isFetching }: GiftCardBodyProps) => {
    const navigate = useNavigate();
    const { isAllowed } = Permission();

    const columns = [
        {
            id: 'createdAt',
            name: t('Common.Created'),
            selector: (row: RowType) => moment(row.createdAt).format('DD/MM-YYYY'),
            sortable: false,
        },
        {
            id: 'expiryDate',
            name: t('GiftCard.Expire'),
            selector: (row: RowType) => moment(row.expiryDate).format('DD/MM-YYYY HH:mm'),
            sortable: false,
        },
        {
            id: 'giftCardCode',
            name: t('GiftCard.Code'),
            selector: (row: RowType) => row.giftCardCode,
            sortable: false,
        },
        {
            id: 'recipientName',
            name: t('GiftCard.RecipientName'),
            selector: (row: RowType) => row.recipientName,
            sortable: false,
        },
        {
            id: 'residueValue',
            name: t('GiftCard.ResidueValue'),
            selector: (row: RowType) => formatCurrency(row.residueValue),
            sortable: false,
        },
        {
            id: 'originalValue',
            name: t('GiftCard.OriginalValue'),
            selector: (row: RowType) => formatCurrency(row.originalValue),
            sortable: false,
        },
        {
            id: 'status',
            name: t('GiftCard.Used'),
            selector: (row: RowType) => (
                <POSHeading
                    text={row.status === 'USED' ? t('Customer.ButtonTitleYes') : t('Customer.ButtonTitleNo')}
                    fontColor={row.status === 'USED' ? 'green' : row.status !== 'UNUSED' ? '#ff8c00' : '#f00'}
                    fontSize={14}
                />
            ),
            sortable: false,
        },
        {
            id: 'action',
            name: '',
            selector: (row: RowType) => (
                <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    {isAllowed('GiftCard', 'update') && (
                        <FaArrowRight
                            color="#44b904"
                            size={16}
                            onClick={(e) => navigate(`/gift-card/update/${row.id}`)}
                        />
                    )}
                </Stack>
            ),
            sortable: false,
        },
    ];

    return (
        <POSTable
            data={giftCardData ?? []}
            columns={columns}
            loading={isFetching}
            isServerSorting={false}
            defaultOrder="seqId"
            onRowClick={(row: RowType) => {
                if (isAllowed('GiftCard', 'update')) {
                    navigate(`/gift-card/update/${row.id}`);
                }
            }}
        />
    );
};

export default GiftCardBody;
