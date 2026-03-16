import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';
import { GetApiExpenses200 } from '../../../../shared/api/models';


export const useGetExpenseData = ({ params }: { params?: GetApiExpenses200 }) => {
    const api = getApi();
    return useQuery({
        queryKey: ['ExpensegetData'],
        queryFn: () => api.getApiExpenses(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
};
