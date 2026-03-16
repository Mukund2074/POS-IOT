import { POSTable, RowType } from '@/components/POS/Common';
import POSMenu from '@/components/POS/Common/POSMenu';
import { GetApiBundleOffersSoldIdType200Item } from '@/shared/api/models';
import { Edit, Print, Receipt } from '@mui/icons-material';
import { t } from 'i18next';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SoldPunchCardListProps {
    data: GetApiBundleOffersSoldIdType200Item[] | undefined;
    isLoading: boolean;
}

export default function SoldPunchCardList({ data, isLoading }: SoldPunchCardListProps) {
    const navigate = useNavigate();
    const columns = [
        {
            id: 'bundleOfferName',
            name: 'Punch Card Name',
            selector: (row: RowType) => row.bundleOffer?.name,
        },
        {
            id: 'bundleOfferCode',
            name: 'Code',
            selector: (row: RowType) => row.bundleOfferCode,
        },
        {
            id: 'residuePunches',
            name: 'Remaining',
            selector: (row: RowType) => row.residuePunches,
        },
        {
            id: 'services',
            name: 'Services',
            selector: (row: RowType) => {
                if (!row.applicableServices?.services) return '-';
                // If services is an object with keys
                return Object.keys(row.applicableServices?.services).length > 0
                    ? Object.values(row.applicableServices?.services)
                          .map((service) => (service as { name?: string })?.name || '')
                          .join(', ')
                    : '-';
            },
        },
        {
            id: 'status',
            name: 'Status',
            selector: (row: RowType) => row.status,
        },
        {
            id: 'customerName',
            name: 'Customer Name',
            selector: (row: RowType) => row.customer?.name ?? '-',
        },
        {
            id: 'action',
            name: '',
            selector: (row: RowType) => (
                <POSMenu
                    menuSx={{ borderRadius: 2 }}
                    stopPropagation={true}
                    items={[
                        {
                            label: 'Edit',
                            icon: <Edit fontSize="small" />,
                            onClick: () => {
                                navigate(`/punch-card/sold/${row.id}/edit`, { state: { soldPunchCard: row } });
                            },
                        },

                        {
                            label: t('PunchCard.PunchCardUsage'),
                            icon: <Receipt fontSize="small" />,
                            onClick: () => {
                                navigate(`/punch-card/usage/${row.id}`);
                            },
                        },
                        {
                            label: t('PunchCard.DownloadPunchCard'),
                            icon: <Print fontSize="small" />,
                            onClick: () => {
                                window.open(`${process.env.REACT_APP_URL2}/api/punch-card/${row.id}/pdf`, '_blank');
                            },
                        },
                    ]}
                />
            ),
            sortable: false,
        },
    ];

    return (
        <POSTable
            onRowClick={(row) => {
                // navigate(`/punch-card/usage/${row.id}`);
            }}
            columns={columns}
            data={data || []}
            loading={isLoading}
        />
    );
}
