import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import React, { useMemo, useState } from 'react';
import SalesTable from '../List/SalesTable';
import { useDebounce, useInfiniteSalesList } from '@/hooks/index';
// import { GetApiSalesList200Item } from '@/shared/api/models';
import POSSelect from '@/components/POS/Common/POSSelect';
import type {
    GetApiSalesList200SalesItem,
    GetApiSalesListSalesType,
    GetApiSalesListSortBy,
    GetApiSalesListSortOrder,
} from '@/shared/api/models';
import Permission, { PermissionDenied } from '@/utils/POS/Permission';
import POSInput from '@/components/POS/Common/POSInput';
import { Print } from '@mui/icons-material';
import SalesPrintFilters from '../List/Modals/SalesPrintFilters';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';
import moment, { Moment } from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function ListAndFilter({
    setOpen,
}: {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    sales?: GetApiSalesList200SalesItem[];
    loading?: boolean;
}) {
    const { isAllowed } = Permission();

    const filterOptions = [
        { value: 'ALL', label: t('Common.All') },
        { value: 'CASH', label: t('POS.CashPayment') },
        { value: 'CARD', label: t('POS.CardPayment') },
        { value: 'GIFT_CARD', label: t('POS.GiftCardPayment') },
    ];

    const typeOptions = [
        { value: 'NONE', label: t('POS.SelectType') },
        { value: 'SALES', label: t('POS.Sales') },
        { value: 'RETURN', label: t('POS.CreditSale') },
        { value: 'NOSHOW', label: t('POS.NoShow') },
    ];

    const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

    const [params, setParams] = useState({
        page: 1,
        limit: 50,
        sortBy: 'ALL' as GetApiSalesListSortBy,
        sortOrder: 'desc' as GetApiSalesListSortOrder,
        salesType: 'NONE',
        keyword: '',
        fromDate: moment().format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
    });

    // ✅ debounce the whole params object once
    const debouncedParams = useDebounce(params, 500);
    const payloadParams = useMemo(() => debouncedParams, [debouncedParams]);

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteSalesList({
        params: {
            page: payloadParams.page,
            limit: payloadParams.limit,
            sortBy: payloadParams.sortBy,
            sortOrder: payloadParams.sortOrder,
            salesType:
                payloadParams.salesType === 'NONE' ? undefined : (payloadParams.salesType as GetApiSalesListSalesType),
            keyword: payloadParams.keyword,
            fromDate: payloadParams.fromDate,
            toDate: payloadParams.toDate,
        },
    });

    const sales = data?.pages?.flatMap((page) => page.sales) ?? [];

    return (
        <React.Fragment>
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: { md: 'space-between' },
                    alignItems: { md: 'center' },
                    my: 2,
                    width: '100%',
                }}
            >
                <POSHeading text={t('POS.Sales')} sx={{ mb: { xs: 2, md: 0 } }} />

                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        alignItems: 'center',
                        width: { xs: '100%', md: 'auto' },
                    }}
                >
                    {isAllowed('Sales', 'read') && (
                        <React.Fragment>
                            <POSDateRangePicker
                                startdate={params?.fromDate}
                                endDate={params?.toDate}
                                setStartDate={(date: Moment) => {
                                    setParams((prev) => ({ ...prev, fromDate: date.format('YYYY-MM-DD') }));
                                }}
                                setEndDate={(date: Moment) => {
                                    setParams((prev) => ({ ...prev, toDate: date.format('YYYY-MM-DD') }));
                                }}
                                wrapperSx={{ width: { xs: '100%', md: 'fit-content' }, minWidth: 250 }}
                            />
                            <POSInput
                                placeholder={t('POS.SearchBYINV')}
                                value={params.keyword}
                                onChange={(e) => setParams((prev) => ({ ...prev, keyword: e.target.value }))}
                                sx={{ bgcolor: '#fff', minWidth: 200, width: { xs: '100%', md: 'auto' } }}
                            />
                            <POSSelect
                                options={typeOptions}
                                value={params.salesType}
                                sx={{ bgcolor: '#fff' }}
                                wrapperSx={{ width: { xs: '100%', md: 'fit-content' }, minWidth: 150 }}
                                onChange={(event) => {
                                    setParams((prev) => ({ ...prev, salesType: event.target.value as string }));
                                }}
                                showPlaceHolder={false}
                            />
                            <POSSelect
                                options={filterOptions}
                                value={params?.sortBy}
                                sx={{ bgcolor: '#fff' }}
                                wrapperSx={{ width: { xs: '100%', md: 'fit-content' }, minWidth: 150 }}
                                onChange={(event) => {
                                    setParams((prev) => ({
                                        ...prev,
                                        sortBy: event.target.value as GetApiSalesListSortBy,
                                    }));
                                }}
                            />
                        </React.Fragment>
                    )}
                    {isAllowed('Sales', 'create') && (
                        <POSButton
                            title={`+ ${t('POS.CreatrSale')}`}
                            variant={'save'}
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={() => {
                                setOpen(true);
                            }}
                        />
                    )}
                </Stack>
            </Stack>
            {isAllowed('Sales', 'read') && (
                <POSButton
                    title={
                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Print />
                            {t('POS.ExportSales')}
                        </Stack>
                    }
                    variant="save"
                    width={{ xs: '100%', md: 'auto' }}
                    sx={{ ml: 'auto', mb: 2 }}
                    onClick={() => {
                        setShowPrintModal(true);
                    }}
                />
            )}

            {isAllowed('Sales', 'read') ? (
                <InfiniteScroll
                    dataLength={sales.length} // current loaded items
                    next={fetchNextPage} // function to load more
                    hasMore={!!hasNextPage} // tells InfiniteScroll to keep going
                    loader={
                        isFetchingNextPage && (
                            <POSHeading sx={{ textAlign: 'center', mt: 2 }} text={t('POS.LoadingMoreSales')} />
                        )
                    }
                    endMessage={
                        !hasNextPage &&
                        !isFetchingNextPage &&
                        !isLoading &&
                        sales.length > 0 &&
                        debouncedParams.page !== 1 && (
                            <POSHeading sx={{ textAlign: 'center', mt: 2 }} text={t('POS.NoMoreSales')} />
                        )
                    }
                    scrollableTarget="scrollableDiv"
                >
                    <SalesTable setOpen={setOpen} sales={sales as GetApiSalesList200SalesItem[]} loading={isLoading} />
                </InfiniteScroll>
            ) : (
                <PermissionDenied />
            )}

            {showPrintModal && (
                <SalesPrintFilters
                    open={showPrintModal}
                    onClose={() => setShowPrintModal(false)}
                    typeOptions={typeOptions}
                    filterOptions={filterOptions}
                />
            )}
        </React.Fragment>
    );
}
