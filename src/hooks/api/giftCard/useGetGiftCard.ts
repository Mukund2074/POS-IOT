import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../shared/api';
import { GetApiGiftCardsParams } from '@/shared/api/models';
import { toast } from 'react-toastify';
import { t } from 'i18next';

/**
 * Hook for fetching gift card details
 *
 * @param params - Query parameters for the API call
 * @returns TanStack Query result with gift card details
 */
export const useGetGiftCards = ({ params }: { params?: GetApiGiftCardsParams }) => {
    const api = getApi();

    return useQuery({
        queryKey: ['giftCard', params],
        queryFn: async () => {
            try {
                return await api.getApiGiftCards(params);
            } catch (error) {
                console.error('Error fetching gift cards:', error);
                toast.error(t('GiftCard.ToastErrGetGiftCard'));
            }
        },
        staleTime:0, // 5 minutes
        retry: 1,
    });
};
