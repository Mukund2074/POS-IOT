import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../../../shared/api';
import { PostApiGiftCardsBody } from '@/shared/api/models';
import { toast } from 'react-toastify';
import { t } from 'i18next';

/**
 * Hook for creating a new gift card
 *
 * @returns TanStack Mutation result for creating a gift card
 */
export const useCreateGiftCard = () => {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: PostApiGiftCardsBody) => {
            try {
                return await api.postApiGiftCards(data);
            } catch (error) {
                console.error('Error creating gift card:', error);
                toast.error(t('GiftCard.ToastErrCreateGiftCard'));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['giftCard'] });
        },
    });
};
