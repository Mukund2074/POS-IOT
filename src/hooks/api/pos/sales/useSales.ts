import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';
import { GetApiSalesListParams } from '../../../../shared/api/models';

interface UseGetSalesListParams {
    params?: GetApiSalesListParams;
    enabled?: boolean;
}

/**
 * Hook for fetching sales list with TanStack Query
 *
 * @param params - Optional API parameters for filtering/pagination
 * @param enabled - Whether the query should run (default: true)
 * @returns TanStack Query result with sales list data
 *
 * @example
 * ```tsx
 * const { data: salesList, isLoading, error } = useSalesList({
 *   params: { page: 1, limit: 50 },
 *   enabled: true
 * });
 * ```
 */
export function useSalesList({ params, enabled = true }: UseGetSalesListParams = {}) {
    const api = getApi();

    return useQuery({
        queryKey: ['sales', 'list', params],
        queryFn: () => api.getApiSalesList(params),
        enabled,
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 1,
    });
}

/**
 * Hook for fetching single sale details
 *
 * @param saleId - Sale ID to fetch
 * @param enabled - Whether the query should run
 * @returns TanStack Query result with sale details
 */
export function useSaleDetails(saleId: string, enabled: boolean = true) {
    const api = getApi();

    return useQuery({
        queryKey: ['sales', 'details', saleId],
        queryFn: () => api.getApiSaleId(saleId),
        enabled: enabled && !!saleId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1,
    });
}
