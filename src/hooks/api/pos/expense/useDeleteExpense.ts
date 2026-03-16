import {useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';
import { toast } from 'react-toastify';
import { t } from 'i18next';

export function useDeleteExpense() {
    const api = getApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ExpenseId: string) => api.deleteApiExpenseId(ExpenseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ExpenseDelete'] });
            toast.success(t('POS.ToastExpenseDelete'));
        },
        onError: (error) => {
            toast.error(t('POS.ToastDeeltError'));
            console.error('Category deletion failed:', error);
        },
    });
}
