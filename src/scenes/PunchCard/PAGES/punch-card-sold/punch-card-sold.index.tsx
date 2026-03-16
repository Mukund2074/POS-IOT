import React, { useEffect, useState } from 'react';
import SoldPunchCardList from '../../Shared/SoldPunchCardList';
import { useParams } from 'react-router-dom';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import { Stack } from '@mui/material';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import moment, { Moment } from 'moment';
import { api } from '@/utils/Api/POS';
import { GetApiBundleOffersSoldIdType200Item, GetApiBundleOffersSoldIdTypeParams } from '@/shared/api/models';
import { toast } from 'react-toastify';

export default function SoldPunchCards() {
    const params = useParams<{ id: string }>();
    const [filters, setFilters] = useState<{
        fromDate: Moment | null;
        toDate: Moment | null;
    }>({
        fromDate: moment().subtract(1, 'month').startOf('month'),
        toDate: moment().endOf('month'),
    });
    const { id } = params;
    const [data, setData] = useState<GetApiBundleOffersSoldIdType200Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getSoldPunchCards = async ({
        id,
        queryParams,
    }: {
        id?: string;
        queryParams: GetApiBundleOffersSoldIdTypeParams;
    }) => {
        try {
            setIsLoading(true);
            const response = await api.getApiBundleOffersSoldIdType(id || '', queryParams, 'json');
            setData(response);
        } catch (error) {
            toast.error(t('PunchCard.FailedToGetSoldPunchCards'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const queryParams: GetApiBundleOffersSoldIdTypeParams = {
            fromDate: filters.fromDate?.format('YYYY-MM-DD') || undefined,
            toDate: filters.toDate?.format('YYYY-MM-DD') || undefined,
        };

        getSoldPunchCards({ id: id || '', queryParams });
    }, [filters, id]);

    const { isAllowed } = Permission();
    if (!isAllowed('PunchCard', 'read')) {
        return <PermissionDenied />;
    }

    return (
        <Stack sx={{ gap: 2 }}>
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: { md: 'space-between' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    pb: 2,
                    width: '100%',
                }}
            >
                <POSHeading text={t('PunchCard.SoldPunchCards')} />

                <POSDateRangePicker
                    startdate={filters.fromDate?.format('YYYY-MM-DD') || ''}
                    endDate={filters.toDate?.format('YYYY-MM-DD') || ''}
                    setStartDate={(date: Moment) => setFilters((prev) => ({ ...prev, fromDate: date }))}
                    setEndDate={(date: Moment) => setFilters((prev) => ({ ...prev, toDate: date }))}
                    wrapperSx={{ width: { xs: '100%', md: 'fit-content' } }}
                    borderRadius={50}
                />
            </Stack>
            <SoldPunchCardList data={data} isLoading={isLoading} />
        </Stack>
    );
}
