import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../../../shared/api';
import { PostApiGiftCardsIdUseBody } from '@/shared/api/models';
import { toast } from 'react-toastify';
import { t } from 'i18next';

/**
 * Hook for using (redeeming) a gift card
 *
 * @returns TanStack Mutation result for using a gift card
 */
export const useGiftCardUse = () => {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: PostApiGiftCardsIdUseBody }) => {
            try {
                return await api.postApiGiftCardsIdUse(id, data);
            } catch (error) {
                console.error('Error using gift card:', error);
                toast.error(t('GiftCard.ToastErrUseGiftCard'));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['giftCard'] });
        },
    });
};
