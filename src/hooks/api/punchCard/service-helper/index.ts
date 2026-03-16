import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/shared/api';

export const useGetServiceList = () => {
    const api = getApi();
    return useQuery({
        queryKey: ['serviceList'],
        queryFn: () => api.getApiBundleOfferServiceList(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
    });
};
