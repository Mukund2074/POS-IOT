import React, { useMemo } from 'react';
import { useCustomerItems } from '../../../../hooks/index';
import { useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import RadixTable from '@/components/radix/RadixTable';

export default function PunchCardsCustomer() {
    const params = useParams();

    const { data, isLoading } = useCustomerItems({
        id: Number(params.id),
        params: 'punchcard',
    });

    const columns = [
        { id: 'id', label: `${t('Common.ID')}`, sortable: false },
        { id: 'bundleOfferCode', label: `${t('GiftCard.Code')}`, sortable: false },
        { id: 'bundleOfferName', label: `${t('PunchCard.PunchCardName')}`, sortable: false },
        { id: 'residuePunches', label: `${t('PunchCard.RemainingPunch')}`, sortable: false },
        { id: 'services', label: `${t('POS.services')}`, sortable: false },
        { id: 'usageStatus', label: `${t('POS.Status')}`, sortable: false },
        { id: 'receiptDate', label: `${t('POS.ReceiptDate')}`, sortable: false },
    ];

    const dataForTable =
        data &&
        data.length > 0 &&
        data?.map((item) => ({
            id: item.id,
            bundleOfferName: item?.bundleOfferName,
            bundleOfferCode: (
                <Stack
                    sx={{ cursor: 'pointer', textDecoration: 'underline', color: '#1976d2', fontWeight: 'bold' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`${process.env.REACT_APP_URL2}/api/punch-card/${item.id}/pdf`, '_blank');
                    }}
                >
                    {item?.bundleOfferCode}
                </Stack>
            ),
            residuePunches: item?.residuePunches,
            usageStatus: item?.status,
            services: !item?.applicableServices?.services
                ? '-'
                : Object.keys(item?.applicableServices?.services).length > 0
                  ? Object.values(item?.applicableServices?.services)
                        .map((service) => service?.name || '')
                        .join(', ')
                  : '-',
            receiptDate: moment(item?.receiptDate).format('DD/MM-YYYY HH:mm'),
        }));

    const visible = [
        'bundleOfferCode',
        'bundleOfferName',
        'residuePunches',
        'services',
        'usageStatus',
        'receiptDate',
    ];

    const radixColumns = useMemo(
        () =>
            columns
                .filter((c) => visible.includes(c.id))
                .map((c) => ({
                    id: c.id,
                    name: c.label,
                    sortable: c.sortable,
                    selector: (row) => row[c.id] ?? '',
                })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [t, isLoading],
    );

    return (
        <Stack>
            <Typography sx={{ mt: 4, mb: 2, color: '#545454', fontSize: '22px' }} variant="h6">
                {t('Customer.PunchCards')}
            </Typography>
            <RadixTable loading={isLoading} columns={radixColumns} data={dataForTable || []} />
        </Stack>
    );
}
