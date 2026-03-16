import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/shared/api';

export const useGetSupplier = () => {
    const api = getApi();
    return useQuery({
        queryKey: ['supplier'],
        queryFn: () => api.getApiListSuppliers(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
};
