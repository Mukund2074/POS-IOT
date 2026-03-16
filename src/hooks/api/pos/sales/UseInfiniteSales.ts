import { useInfiniteQuery } from '@tanstack/react-query';
import { GetApiSalesListParams } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';

export const useInfiniteSalesList = ({ params }: { params?: GetApiSalesListParams }) => {
    return useInfiniteQuery({
        queryKey: ['sales', 'list', params],
        queryFn: ({ pageParam = 1 }) => api.getApiSalesList({ page: pageParam, ...params }),
        getNextPageParam: (lastPage) => {
            if (!lastPage) return undefined; // no more pages

            // If there are more pages, increment currentPage
            if (
                typeof lastPage?.currentPage === 'number' &&
                typeof lastPage?.totalPages === 'number' &&
                lastPage.currentPage < lastPage.totalPages
            ) {
                // 1 < 1 = false
                return (lastPage?.currentPage ?? 0) + 1;
            }
            return undefined; // no more pages
        },
        initialPageParam: 1, // ✅ Required in v5
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 1,
    });
};
