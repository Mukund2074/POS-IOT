import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';
import { GetApiPreviousSalesItemsCustomerIdParams } from '@/shared/api/models';

/**
 * Hook for fetching previous sales using TanStack Query with direct Orval API
 *
 * @param customerId - Customer ID to fetch sales for
 * @param params - Optional API parameters
 * @param enabled - Whether the query should run (default: true)
 * @returns TanStack Query result with previous sales data
 *
 * @example
 * ```tsx
 * const { data: previousSales, isLoading, error } = usePreviousSales({
 *   customerId: 123,
 *   params: { limit: 50 },
 *   enabled: !!customerId
 * });
 * ```
 */
export function usePreviousSales({
    customerId,
    params,
    enabled = true,
}: {
    customerId: number | null;
    params?: GetApiPreviousSalesItemsCustomerIdParams;
    enabled?: boolean;
}) {
    const api = getApi();

    return useQuery({
        queryKey: ['sales', 'previous', customerId, params],
        queryFn: () => {
            if (customerId) {
                return api.getApiPreviousSalesItemsCustomerId(customerId, params);
            }
        },
        enabled: enabled && !!customerId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1,
    });
}
