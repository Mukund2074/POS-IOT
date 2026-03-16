import type { QueryClient } from '@tanstack/react-query';

/**
 * Invalidates all TanStack Query caches for marketing data (campaigns list,
 * single campaign, campaign statistics). Call after any marketing create/update/edit/delete.
 */
export function invalidateMarketingQueries(queryClient: QueryClient): void {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    queryClient.invalidateQueries({ queryKey: ['campaigns-statistics'] });
}
