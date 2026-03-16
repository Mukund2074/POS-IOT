/**
 * Hook for fetching gift card details by code
 *
 * @param code - Gift card code to fetch
 * @returns TanStack Query result with gift card details
 */
import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../shared/api';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { AxiosError } from 'axios';

export const useGiftCardByCode = ({
    code,
    enabled,
    isReverseCheck = false,
}: {
    code: string;
    enabled: boolean;
    isReverseCheck?: boolean;
}) => {
    const api = getApi();

    return useQuery({
        queryKey: ['giftCardByCode', code, isReverseCheck],
        queryFn: async () => {
            try {
                const result = await api.getApiGiftCardsCodeCode(code);
                // If we get a successful response, the code is already taken
                if (isReverseCheck) {
                    return { valid: false, giftCard: result };
                } else {
                    return { valid: true, giftCard: result };
                }
            } catch (error) {
                console.error('Error fetching gift card by code:', error);
                if (error instanceof AxiosError && error?.status === 404) {
                    if (isReverseCheck) {
                        return { valid: true, giftCard: null };
                    }
                } else {
                    toast.error(t('GiftCard.ToastErrCodeGiftCard'));
                    throw error;
                }
            }
        },
        retry: 1,
        enabled: enabled,
    });
};
