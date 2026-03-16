import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../shared/api';

/**
 * Hook for fetching gift card details by ID
 *
 * @param id - Gift card ID to fetch
 * @returns TanStack Query result with gift card details
 */
export const useGiftCardById = ({ id }: { id: string }) => {
    const api = getApi();
    return useQuery({
        queryKey: ['giftCard', id],
        queryFn: () => api.getApiGiftCardsId(id),
        retry: 1,
        enabled: !!id,
    });
};
