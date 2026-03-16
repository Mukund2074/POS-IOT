import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
    GetApiDoctorsPortalDoctors200,
    GetApiDoctorsPortalDoctorsConnectionStatus,
} from '@/shared/api/models';
import { api } from '@/utils/Api/POS';

export interface UseGetDoctorsListParams {
    page: number;
    limit: number;
    keyword?: string;
    active?: boolean;
    connectionStatus?: GetApiDoctorsPortalDoctorsConnectionStatus;
}

const mapResponse = (
    res: Awaited<ReturnType<typeof api.getApiDoctorsPortalDoctors>>,
): GetApiDoctorsPortalDoctors200 => ({
    doctors: res.doctors,
    currentPage: res.currentPage,
    totalPages: res.totalPages,
    limit: res.limit,
    total: res.total,
});

const emptyResponse = (limit: number): GetApiDoctorsPortalDoctors200 => ({
    doctors: [],
    currentPage: 1,
    totalPages: 0,
    limit: limit,
    total: 0,
});

/**
 * Hook for fetching doctors list from the Node API (doctors-portal/doctors).
 */
export const useGetDoctorsList = (params: UseGetDoctorsListParams) => {
    const { page, limit, keyword, active = true, connectionStatus } = params;

    return useQuery<GetApiDoctorsPortalDoctors200>({
        queryKey: ['doctorPortal', 'doctorsList', active, keyword, page, connectionStatus],
        queryFn: async () => {
            try {
                const res = await api.getApiDoctorsPortalDoctors({
                    page,
                    limit,
                    keyword: keyword?.trim() || undefined,
                    active,
                    connectionStatus,
                });
                return mapResponse(res);
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 404) {
                    return emptyResponse(limit);
                }
                throw error;
            }
        },
        staleTime: 60000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
    });
};
