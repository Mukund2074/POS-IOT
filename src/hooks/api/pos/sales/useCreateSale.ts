import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';
import { PostApiSaleBody } from '../../../../shared/api/models';

/**
 * Hook for creating a sale using TanStack Query mutation with direct Orval API
 *
 * @returns Mutation object with create sale function and state
 *
 * @example
 * ```tsx
 * const { mutate: createSale, isPending, error } = useCreateSale();
 *
 * const handleCreateSale = () => {
 *   createSale(saleData, {
 *     onSuccess: (result) => {
 *       // Handle success
 *     },
 *     onError: (error) => {
 *       console.error('Failed to create sale:', error);
 *     }
 *   });
 * };
 * ```
 */
export function useCreateSale() {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (saleData: PostApiSaleBody) => api.postApiSale(saleData),
        onSuccess: (data) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['sales'] });
        },
        onError: (error) => {
            console.error('Sale creation failed:', error);
        },
    });
}
