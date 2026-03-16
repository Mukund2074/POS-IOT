import { getApi } from '@/shared/api';
import { PostApiCashDrawerOpenBody } from '@/shared/api/models';
import { useMutation } from '@tanstack/react-query';

/**
 * Custom hook to create a cash drawer using mutation.
 * @returns The mutation object with mutate, status, etc.
 */

export const useCreateCashDrawer = () => {
    const api = getApi();

    return useMutation({
        mutationFn: async (body: PostApiCashDrawerOpenBody) => {
            try {
                return await api.postApiCashDrawerOpen(body);
            } catch (error) {
                console.error('Error creating cash drawer:', error);
                throw error;
            }
        },
    });
};
