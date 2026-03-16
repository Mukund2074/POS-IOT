import { api } from '@/utils/Api/POS';
import { useQuery } from '@tanstack/react-query';

export const useGetPunchCardUsageHistoryById = (id: string) => {
    return useQuery({
        queryKey: ['punchCardUsageHistory', id],
        enabled: !!id,
        queryFn: () => api.getApiSoldBundleOffersIdHistory(id),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
};
