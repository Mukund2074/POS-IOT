import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';
import { PostApiProductCategoriesBody, PutApiProductCategoriesIdBody } from '../../../../shared/api/models';
import { toast } from 'react-toastify';
import { t } from 'i18next';

/**
 * Hook for fetching product categories
 *
 * @param enabled - Whether the query should run (default: true)
 * @returns TanStack Query result with categories data
 */
export function useProductCategories(enabled: boolean = true) {
    const api = getApi();

    return useQuery({
        queryKey: ['products', 'categories'],
        queryFn: () => api.getApiProductCategories(),
        enabled,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
    });
}

/**
 * Hook for creating a product category
 *
 * @returns Mutation object for creating categories
 */
export function useCreateProductCategory() {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryData: PostApiProductCategoriesBody) => api.postApiProductCategories(categoryData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', 'categories'] });
            toast.success(t('POS.ToastSuccCatCr'));
        },
        onError: (error) => {
            toast.error(t('POS.ToastFailCatCr'));
            console.error('Category creation failed:', error);
        },
    });
}

/**
 * Hook for updating a product category
 *
 * @returns Mutation object for updating categories
 */
export function useUpdateProductCategory() {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: PutApiProductCategoriesIdBody }) =>
            api.putApiProductCategoriesId(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', 'categories'] });
            toast.success(t('POS.ToastSuccCatUp'));
        },
        onError: (error) => {
            toast.error(t('POS.ToastErrCatUp'));
            console.error('Category update failed:', error);
        },
    });
}

/**
 * Hook for deleting a product category
 *
 * @returns Mutation object for deleting categories
 */
export function useDeleteProductCategory() {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryId: string) => api.deleteApiProductCategoriesId(categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', 'categories'] });
            toast.success(t('POS.ToastSuccCatDel'));
        },
        onError: (error) => {
            toast.error(t('POS.ToastErrCatDel'));
            console.error('Category deletion failed:', error);
        },
    });
}
