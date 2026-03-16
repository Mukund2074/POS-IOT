import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getApi } from '../../../../shared/api';
import {
    GetApiProductsListing200,
    GetApiProductsListingParams,
    PutApiProductIdBody,
    PutApiUpdateProductsBody,
} from '../../../../shared/api/models';
import { toast } from 'react-toastify';
import { t } from 'i18next';

interface ProductServiceParams {
    page?: number;
    limit?: number;
    text?: string;
    getServices?: boolean;
    [key: string]: any;
}

/**
 * Hook for fetching products and services with debouncing
 *
 * @param params - Optional parameters for the API call (page, limit, text, etc.)
 * @param debounceMs - Optional debounce delay in milliseconds (default: 500)
 * @param minSearchLength - Optional minimum search text length to trigger API call (default: 0)
 * @returns Object containing products, services, loading state, and utility functions
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useProductService({
 *   text: searchText,
 *   getServices: true
 * }, 300);
 * ```
 */
export function useProductService(
    params: ProductServiceParams = {},
    debounceMs: number = 500,
    minSearchLength: number = 0,
    enabled: boolean = true,
    shouldFetchApi: boolean = false,
) {
    const [debouncedParams, setDebouncedParams] = useState<ProductServiceParams>(params);
    const api = getApi();

    // Debounce the params, especially the text search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedParams(params);
        }, debounceMs);

        return () => {
            clearTimeout(handler);
        };
    }, [params, debounceMs]);

    // Check if search text meets minimum length requirement
    const searchText = params.text || '';
    const shouldFetch = !searchText || searchText.length >= minSearchLength;

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['products', 'services', debouncedParams],
        queryFn: () =>
            api.getApiProductsListing({
                page: 1,
                limit: 100,
                ...debouncedParams,
            } as GetApiProductsListingParams),
        enabled: (shouldFetch && enabled) || shouldFetchApi,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });

    // Transform the data to separate products and services
    const products = data?.products || [];
    const services = data?.services || [];

    return {
        data: data as GetApiProductsListing200,
        isLoading,
        error,
        refetch,
        isSuccess: !!data && !error,
        isEmpty: !isLoading && !products.length && !services.length,
        /** Helper: true if search is being debounced */
        isDebouncing: JSON.stringify(params) !== JSON.stringify(debouncedParams),
    };
}

/**
 * Hook for fetching single product details
 *
 * @param productId - Product ID to fetch
 * @param enabled - Whether the query should run
 * @returns TanStack Query result with product details
 */
export function useProductDetails(productId: string, enabled: boolean = true) {
    const api = getApi();

    return useQuery({
        queryKey: ['products', 'details', productId],
        queryFn: () => api.getApiProductsId(productId),
        enabled: enabled && !!productId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}

/**
 * Hook for deleting a product
 *
 * @param productId - Product ID to delete
 * @param enabled - Whether the query should run
 * @returns TanStack Query result with product details
 */
export function useDeleteProducts() {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => api.deleteApiProducts({ ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', 'services'] });
            toast.success(t('POS.ToastSuccProdDel'));
        },
        onError: () => {
            toast.error(t('POS.ToastErrProdDel'));
        },
    });
}

/**
 * Hook for updating a product
 *
 * @param productId - Product ID to update
 * @param enabled - Whether the query should run
 * @returns TanStack Query result with product details
 */
export function useUpdateProduct(data: PutApiProductIdBody) {
    const api = getApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (productId: string) => api.putApiProductId(productId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', 'services'] });
            toast.success(t('POS.ToastSuccProdUp'));
        },
    });
}

export function useUpdateProducts(data: PutApiUpdateProductsBody) {
    const api = getApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: PutApiUpdateProductsBody) => api.putApiUpdateProducts(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', 'services'] });
            toast.success(t('POS.ToastSuccProdUp'));
        },
    });
}
