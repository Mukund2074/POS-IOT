import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../../../shared/api';
import { PatchApiGiftCardsIdStatusBodyStatus } from '@/shared/api/models';
import { toast } from 'react-toastify';
import { t } from 'i18next';

/**
 * Hook for updating gift card status
 *
 * @returns TanStack Mutation result for updating gift card status
 */
export const useUpdateGiftCardStatus = () => {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: PatchApiGiftCardsIdStatusBodyStatus }) => {
            try {
                return await api.patchApiGiftCardsIdStatus(id, { status });
            } catch (error) {
                console.error('Error updating gift card status:', error);
                toast.error(t('GiftCard.ToastErrStatusGiftCard'));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['giftCard'] });
        },
    });
};
