import { api } from '../../../utils/Api/POS/index';
import { useQuery } from '@tanstack/react-query';

type CustomerParams = 'giftcard' | 'punchcard' | 'productsale' | 'salelist';

export const useCustomerItems = ({ id, params }: { id: number; params: CustomerParams }) => {
    const isValid = typeof id === 'number' && ['giftcard', 'punchcard', 'productsale', 'salelist'].includes(params);
    return useQuery({
        queryKey: ['customerSalesItems', id, params],
        queryFn: async () => await api.getApiCustomerIdType(id, params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        enabled: isValid, // <- only run when valid
    });
};
