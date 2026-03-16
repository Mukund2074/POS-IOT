import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';

export const useSalesDetails = (salesId: string | undefined, enabled: boolean = true) => {
    const api = getApi();

    const shouldFetch = enabled && !!salesId;

    return useQuery({
        queryKey: shouldFetch ? ['sales-details', salesId] : [],
        queryFn: () => (shouldFetch ? api.getApiSalesDetailsId(salesId!) : Promise.resolve(undefined)),
        enabled: shouldFetch,
        staleTime: 0,
        retry: 1,
    });
};
