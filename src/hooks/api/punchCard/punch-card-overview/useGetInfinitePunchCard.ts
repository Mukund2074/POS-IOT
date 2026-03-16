import { useInfiniteQuery } from '@tanstack/react-query';
import { GetApiBundleOffersParams } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';

export const useGetInfinitePunchCard = ({
    bundleOfferType,
    keyword,
    fromDate,
    toDate,
    limit = 3,
}: GetApiBundleOffersParams) => {
    return useInfiniteQuery({
        queryKey: ['punchCardList', { bundleOfferType, keyword, fromDate, toDate, limit }],
        queryFn: ({ pageParam = 1 }) =>
            api.getApiBundleOffers({
                page: pageParam,
                limit,
                bundleOfferType,
                keyword,
                fromDate,
                toDate,
            }),

        getNextPageParam: (lastPage) => {
            // If there are more pages, increment currentPage
            if (lastPage.currentPage < lastPage.totalPages) {
                // 1 < 1 = false
                return lastPage.currentPage + 1;
            }
            return undefined; // no more pages
        },
        initialPageParam: 1, // ✅ Required in v5
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};
