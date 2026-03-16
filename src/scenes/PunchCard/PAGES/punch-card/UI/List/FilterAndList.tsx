import { useGetInfinitePunchCard } from '@/hooks/api/punchCard';
import { Stack } from '@mui/material';
import React, { useMemo, useState } from 'react';
import PunchCardTable from '../../../../Shared/PunchCardTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
// import moment, { Moment } from 'moment';
import { toast } from 'react-toastify';
import POSSelect from '@/components/POS/Common/POSSelect';
import POSInput from '@/components/POS/Common/POSInput';
// import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import { useDebounce } from '@/hooks/shared';
import { GetApiBundleOffers200ItemsItem } from '@/shared/api/models/getApiBundleOffers200ItemsItem';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';

interface FilterAndListProps {
    asComponent?: boolean;
    onApplyClick?: (row: GetApiBundleOffers200ItemsItem) => void;
}

export default function FilterAndList({ asComponent, onApplyClick }: FilterAndListProps) {
    const { isAllowed } = Permission();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<{
        limit: number;
        bundleOfferType: 'PUNCH_BASED' | 'SERVICE_BASED' | 'all';
        keyword: string;
        // fromDate: string | undefined;
        // toDate: string | undefined;
    }>({
        limit: 10,
        bundleOfferType: 'all',
        keyword: '',
        // fromDate: asComponent ? undefined : moment().subtract(3, 'months').format('YYYY-MM-DD'),
        // toDate: asComponent ? undefined : moment().format('YYYY-MM-DD'),
    });

    const DebouncedFilters = useDebounce(filters, 500);
    const params = useMemo(() => {
        return {
            limit: DebouncedFilters.limit,
            bundleOfferType: DebouncedFilters.bundleOfferType === 'all' ? undefined : DebouncedFilters.bundleOfferType,
            keyword: DebouncedFilters.keyword,
            // fromDate: DebouncedFilters?.fromDate,
            // toDate: DebouncedFilters?.toDate,
        };
    }, [DebouncedFilters]);

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetInfinitePunchCard(params);

    const punchCards = data?.pages.flatMap((page) => page.items) || [];

    return (
        <Stack gap={2}>
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: { md: 'space-between' },
                    alignItems: { md: 'center' },
                    pb: 2,
                }}
            >
                <POSHeading sx={{ display: asComponent ? 'none' : 'block' }} text={t('PunchCard.PunchCard')} />
                <Stack
                    sx={{
                        display: 'flex',
                        width: { xs: '100%', md: 'auto' },
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        gap: { xs: 1, md: 2 },
                    }}
                >
                    {isAllowed('PunchCard', 'read') && (
                        <React.Fragment>
                            {/* <POSDateRangePicker
                                wrapperSx={{
                                    display: asComponent ? 'none' : 'block',
                                    width: { xs: '100%', md: 'fit-content' },
                                }}
                                borderRadius={50}
                                startdate={filters?.fromDate ?? ''}
                                endDate={filters?.toDate ?? ''}
                                setStartDate={(date: Moment) => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        fromDate: date.format('YYYY-MM-DD'),
                                    }));
                                }}
                                setEndDate={(date: Moment) => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        toDate: date.format('YYYY-MM-DD'),
                                    }));
                                }}
                            /> */}
                            <POSSelect
                                options={[
                                    { value: 'all', label: t('PunchCard.AllPunchCards') },
                                    { value: 'SERVICE_BASED', label: t('PunchCard.ServiceBasedOffer') },
                                    { value: 'PUNCH_BASED', label: t('PunchCard.PunchBasedOffer') },
                                ]}
                                onChange={(e) => {
                                    const value = e.target.value as 'PUNCH_BASED' | 'SERVICE_BASED' | 'all';
                                    setFilters((prev) => ({
                                        ...prev,
                                        bundleOfferType: value,
                                    }));
                                }}
                                borderRadius={50}
                                backgroundColor="#fff"
                                wrapperSx={{
                                    width: { xs: '100%', md: 'fit-content' },
                                    display: asComponent ? 'none' : 'block',
                                }}
                                sx={{ width: '100%', borderRadius: 50 }}
                                value={filters.bundleOfferType}
                            />
                            <POSInput
                                value={filters.keyword || ''}
                                onChange={(e) => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        keyword: e.target.value,
                                    }));
                                }}
                                sx={{ width: { xs: '100%', md: 250 }, borderRadius: 50 }}
                                placeholder={t('PunchCard.SearchByFilters')}
                            />
                        </React.Fragment>
                    )}

                    {isAllowed('PunchCard', 'create') && (
                        <POSButton
                            variant="save"
                            title={`+ ${t('PunchCard.CreatePunchCard')}`}
                            sx={{ display: asComponent ? 'none' : 'block' }}
                            width={{ xs: '100%', md: 'fit-content' }}
                            onClick={() => {
                                navigate('/punch-card/create');
                            }}
                        />
                    )}
                </Stack>
            </Stack>
            {isAllowed('PunchCard', 'read') ? (
                <InfiniteScroll
                    dataLength={punchCards.length} // current loaded items
                    next={fetchNextPage} // function to load more
                    hasMore={!!hasNextPage} // tells InfiniteScroll to keep going
                    loader={
                        isFetchingNextPage && (
                            <POSHeading
                                sx={{ textAlign: 'center', mt: 2 }}
                                text={t('PunchCard.LoadingMorePunchCards')}
                            />
                        )
                    }
                    endMessage={
                        !hasNextPage &&
                        !isFetchingNextPage &&
                        !isLoading &&
                        punchCards.length > 0 &&
                        !asComponent && (
                            <POSHeading sx={{ textAlign: 'center', mt: 2 }} text={t('PunchCard.NoMorePunchCards')} />
                        )
                    }
                    scrollableTarget="scrollableDiv"
                >
                    <PunchCardTable
                        punchCards={punchCards}
                        isLoading={isLoading && !isFetchingNextPage}
                        toast={toast}
                        asComponent={asComponent}
                        onApplyClick={(row) => {
                            if (onApplyClick) {
                                onApplyClick(row);
                            }
                        }}
                    />
                </InfiniteScroll>
            ) : (
                <PermissionDenied />
            )}
        </Stack>
    );
}
