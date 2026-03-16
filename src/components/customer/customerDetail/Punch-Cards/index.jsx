import React from 'react';
import { useCustomerItems } from '../../../../hooks/index';
import { useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import { t } from 'i18next';
import moment from 'moment';
import FCommonTable from '../../../commonComponents/F_commonTable';

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
                : // If services is an object with keys
                  Object.keys(item?.applicableServices?.services).length > 0
                  ? Object.values(item?.applicableServices?.services)
                        .map((service) => service?.name || '')
                        .join(', ')
                  : '-',
            receiptDate: moment(item?.receiptDate).format('DD/MM-YYYY HH:mm'),
        }));

    return (
        <Stack>
            <FPrimaryHeading sx={{ mt: 4, mb: 2 }} text={t('Customer.PunchCards')} />
            <FCommonTable
                loading={isLoading}
                columns={columns}
                data={dataForTable || []}
                visibleColumns={[
                    'bundleOfferCode',
                    'bundleOfferName',
                    'residuePunches',
                    'services',
                    'usageStatus',
                    'receiptDate',
                ]}
            />
        </Stack>
    );
}
