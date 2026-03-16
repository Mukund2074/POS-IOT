import { Stack } from '@mui/material';
import React from 'react';
import PunchCardUsageTable from '../../Shared/PunchCardUsageTable';
import { useGetPunchCardUsageHistoryById } from '@/hooks/api/punchCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';

export default function PunchCardUsage() {
    const params = window?.location.pathname;
    const id = params.split('/').pop();
    const navigate = useNavigate();

    const { data, isLoading, error } = useGetPunchCardUsageHistoryById(id || '');
    if (error) {
        toast.error(t('PunchCard.InvalidPunchCard'));
        setTimeout(() => {
            navigate('/punch-card');
        }, 1000);
    }
    return (
        <Stack sx={{ gap: 2 }}>
            <POSHeading text={t('PunchCard.UsageHistory')} />

            <PunchCardUsageTable data={data || []} isLoading={isLoading} />
        </Stack>
    );
}
