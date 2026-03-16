
import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';
import { GetApiCustomersParams } from '../../../../shared/api/models';
/**
 * Hook for fetching customer details
 *
 * @returns TanStack Query result with customer details
 */

export const useCustomer = ({ params }: { params?: GetApiCustomersParams }) => {
    const api = getApi();
    return useQuery({
        queryKey: ['customer'],
        queryFn: () => api.getApiCustomers(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
};  