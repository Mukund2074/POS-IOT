import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';
import { toast } from 'react-toastify';
import { PostApiExpenseBody } from '../../../../shared/api/models';
import { t } from 'i18next';

export function useCreateExpense() {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ExpenseData: PostApiExpenseBody) => api.postApiExpense(ExpenseData),
    
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['Expense'] });
            toast.success(t('POS.ToastExpenseCreateSucessfully'));
        },
        onError: (error) => {
            toast.error(t('POS.ToastExpenseCreateError'));
            console.error('Expense creation failed:', error);
        },
    });
}