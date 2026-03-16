import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';
import { GetApiExpenseCategoriesParams } from '../../../../shared/api/models';


export const useGetExpensecategory = ({ params }: { params?: GetApiExpenseCategoriesParams }) => {
    const api = getApi();
    return useQuery({
        queryKey: ['ExpenseCategory'],
        queryFn: () => api.getApiExpenseCategories(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
};
