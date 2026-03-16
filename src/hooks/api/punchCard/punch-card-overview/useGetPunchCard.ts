import { api } from '@/utils/Api/POS';
import { useQuery } from '@tanstack/react-query';

export const useGetPunchCard = () => {
    return useQuery({
        queryKey: ['punchCardList'],
        queryFn: () => api.getApiBundleOffers,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
};
