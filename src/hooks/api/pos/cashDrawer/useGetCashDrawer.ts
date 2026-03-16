import { getApi } from '@/shared/api';
import {
  // GetApiCashDrawerEmployeeSummary200,
  GetApiCashDrawerEmployeeSummaryParams,
} from '@/shared/api/models';
import { useQuery } from '@tanstack/react-query';

export const useGetCashDrawer = (
  employeeId: number,
  startDate: string,
) => {
  const api = getApi();

  return useQuery({
    queryKey: ['getCashDrawer', employeeId],
    queryFn: async () => {
     try {
       const params: GetApiCashDrawerEmployeeSummaryParams = {
         employeeId,
         toDate: startDate,
       };
       return await api.getApiCashDrawerEmployeeSummary(params);
     } catch (error) {
      console.error('Error fetching cash drawer:', error);
     }
    },
  });
};
