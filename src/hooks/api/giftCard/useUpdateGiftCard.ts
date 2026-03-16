import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../../../shared/api';
import { PatchApiGiftCardsIdBody } from '@/shared/api/models';
import { toast } from 'react-toastify';
import { t } from 'i18next';

/**
 * Hook for updating a gift card
 *
 * @returns TanStack Mutation result for updating a gift card
 */
export const useUpdateGiftCard = () => {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: PatchApiGiftCardsIdBody }) => {
            try {
                return await api.patchApiGiftCardsId(id, data);
            } catch (error) {
                console.error('Error updating gift card:', error);
                toast.error(t('GiftCard.ToastErrUpdateGiftCard'));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['giftCard'] });
        },
    });
};
