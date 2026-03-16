import React, { useState } from 'react';
import POSTable, { RowType } from '@/components/POS/Common/POSTable';
import { useNavigate } from 'react-router-dom';
import { PunchCardTableProps } from '../PAGES/punch-card/Types/punch-card.types';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { Typography } from '@mui/material';
import { api } from '@/utils/Api/POS';
import { t } from 'i18next';
import { useQueryClient } from '@tanstack/react-query';
import POSButton from '@/components/POS/Common/POSButton';
import { GetApiBundleOffers200ItemsItem } from '@/shared/api/models';
import POSMenu from '@/components/POS/Common/POSMenu';
import { Edit, Receipt } from '@mui/icons-material';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import Permission from '@/utils/POS/Permission';
const DeleteIcon = require('@/assets/Delete.svg').default;

export default function PunchCardTable({
    punchCards,
    isLoading,
    toast,
    asComponent,
    onApplyClick,
}: PunchCardTableProps) {
    const { isAllowed } = Permission();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedPunchCard, setSelectedPunchCard] = useState<GetApiBundleOffers200ItemsItem | null>(null);

    const handleDelete = async ({ id }: { id: string }) => {
        if (!id) return;
        const toastId = toast.loading('Processing...');

        try {
            await api.deleteApiBundleOffersId(id);
            toast.update(toastId, {
                render: t('PunchCard.PunchCardDeletedSuccessfully'),
                type: 'success',
                isLoading: false,
                autoClose: 1500,
            });
            queryClient.invalidateQueries({ queryKey: ['punchCardList'] });
        } catch (error) {
            toast.update(toastId, {
                render: t('PunchCard.PunchCardDeleteFailed'),
                type: 'error',
                isLoading: false,
                autoClose: 1500,
            });
        } finally {
            setShowDeleteConfirmation(false);
        }
    };

    const renderAction = (row: RowType) => {
        const actionColumns = [];

        // Add Edit action if user has update permission
        if (isAllowed('PunchCard', 'update')) {
            actionColumns.push({
                label: 'Edit',
                icon: <Edit fontSize="small" />,
                onClick: () => {
                    navigate(`/punch-card/${row.id}`);
                },
            });
        }

        // Add Delete action if user has delete permission
        if (isAllowed('PunchCard', 'delete')) {
            actionColumns.push({
                label: 'Delete',
                icon: <img src={DeleteIcon} alt="Delete" />,
                onClick: () => {
                    setSelectedPunchCard(row as GetApiBundleOffers200ItemsItem);
                    setShowDeleteConfirmation(true);
                },
            });
        }

        // Add Sold Punch Cards action if user has read permission
        if (isAllowed('PunchCard', 'read')) {
            actionColumns.push({
                label: t('PunchCard.SoldPunchCards'),
                icon: <Receipt fontSize="small" />,
                onClick: () => {
                    navigate(`/punch-card/sold/${row.id}`);
                },
            });
        }

        return actionColumns;
    };

    const columns = [
        {
            id: 'name',
            name: 'Name',
            selector: (row: RowType) => row.name,
            sortable: true,
        },
        {
            id: 'description',
            name: 'Description',
            selector: (row: RowType) => (
                <Typography
                    sx={{
                        whiteSpace: 'pre-line',
                        overflowWrap: 'break-word',
                        maxWidth: 250,
                        lineClamp: 3,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                    }}
                >
                    {row.description}
                </Typography>
            ),
            sortable: false,
        },
        {
            id: 'bundleOfferType',
            name: 'Bundle Offer Type',
            selector: (row: RowType) => (row.bundleOfferType === 'PUNCH_BASED' ? 'Punch Based' : 'Service Based'),
            sortable: false,
        },
        {
            id: 'applicableService',
            name: 'Applicable Services',
            selector: (row: RowType) => {
                const services = row.applicableService?.services;
                const text =
                    services && Object.keys(services).length > 0
                        ? Object.values(services)
                              .map((service: any) => service.name)
                              .join(', ')
                        : `Any ${row.applicableService?.residuePunch} Services`;

                return (
                    <Typography
                        noWrap
                        sx={{
                            whiteSpace: 'pre-line',
                            overflowWrap: 'break-word',
                            maxWidth: 250,
                            lineClamp: 3,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                        }}
                    >
                        {text}
                    </Typography>
                );
            },
            sortable: false,
        },
        {
            id: 'price',
            name: 'Price',
            selector: (row: RowType) => formatCurrency(row.price || 0),
            sortable: false,
        },
        {
            id: 'expiryMonths',
            name: 'Expiry Months',
            selector: (row: RowType) => row.expiryMonths,
            sortable: false,
        },

        {
            id: 'action',
            name: '',
            selector: (row: RowType) => (
                <POSMenu menuSx={{ borderRadius: 2 }} stopPropagation={true} items={renderAction(row)} />
            ),
            sortable: false,
        },
    ];

    const componentColumns = [
        {
            id: 'name',
            name: 'Name',
            selector: (row: RowType) => <Typography sx={{ minWidth: 180 }}>{row.name}</Typography>,
            sortable: true,
        },
        {
            id: 'bundleOfferType',
            name: 'Bundle Offer Type',
            selector: (row: RowType) => (
                <Typography sx={{ minWidth: 180 }}>
                    {row.bundleOfferType === 'PUNCH_BASED' ? 'Punch Based' : 'Service Based'}
                </Typography>
            ),
            sortable: false,
        },
        {
            id: 'applicableService',
            name: 'Applicable Services',
            selector: (row: RowType) => {
                const services = row.applicableService?.services;
                const text =
                    services && Object.keys(services).length > 0
                        ? Object.values(services)
                              .map((service: any) => service.name)
                              .join(', ')
                        : `Any ${row.applicableService?.residuePunch === 0 ? '' : row.applicableService?.residuePunch} Services`;

                return (
                    <Typography
                        noWrap
                        sx={{
                            whiteSpace: 'pre-line',
                            overflowWrap: 'break-word',
                            maxWidth: 250,
                            lineClamp: 3,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                        }}
                    >
                        <Typography sx={{ minWidth: 180 }}>{text}</Typography>
                    </Typography>
                );
            },
            sortable: false,
        },
        {
            id: 'price',
            name: 'Price',
            selector: (row: RowType) => (
                <Typography sx={{ minWidth: 180 }}>{formatCurrency(row.price || 0)}</Typography>
            ),
            sortable: false,
        },
        {
            id: 'action',
            name: '',
            selector: (row: RowType) => (
                <POSButton
                    width={'fit-content'}
                    title={t('PunchCard.Sale')}
                    variant="save"
                    onClick={(e) => {
                        e.preventDefault();
                        const item = punchCards.find((p) => p.id === row.id);
                        onApplyClick?.(item as GetApiBundleOffers200ItemsItem);
                    }}
                />
            ),
        },
    ];

    return (
        <React.Fragment>
            <POSTable
                columns={asComponent ? componentColumns : columns}
                data={punchCards ?? []}
                loading={isLoading}
                maxHeight={asComponent ? '35dvh' : '75dvh'}
                onRowClick={(row) => {
                    if (asComponent) {
                        return;
                    }
                    // navigate(`/punch-card/${row.id}`);
                }}
                isServerSorting={false}
                defaultOrder="seqId"
                rowHeight={asComponent ? '40px' : 'auto'}
            />

            {showDeleteConfirmation && (
                <POSDeleteModal
                    open={showDeleteConfirmation}
                    handleClose={() => setShowDeleteConfirmation(false)}
                    title={t('PunchCard.DeleteConfirmationTitle')}
                    description={t('PunchCard.DeleteConfirmationDescription')}
                    onClickConfirm={() => {
                        if (selectedPunchCard) {
                            handleDelete({ id: selectedPunchCard.id });
                        } else {
                            toast.error(t('PunchCard.PunchCardDeleteFailed'));
                        }
                    }}
                    onClickDismiss={() => setShowDeleteConfirmation(false)}
                />
            )}
        </React.Fragment>
    );
}
