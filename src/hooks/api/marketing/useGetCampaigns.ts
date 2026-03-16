import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { GetApiCampaigns200, GetApiCampaignsParams } from '@/shared/api/models';
import { GetApiCampaignsCampaignType } from '@/shared/api/models/getApiCampaignsCampaignType';
import { CampaignWithType } from '@/scenes/Marketing/Campaigns/CampaignsList';
import { api } from '@/utils/Api/POS';

interface UseGetCampaignsOptions {
    params?: Omit<GetApiCampaignsParams, 'campaign_type'>;
    campaignType?: GetApiCampaignsCampaignType;
    staleTime?: number;
    enabled?: boolean;
    // If true, adds campaignType property to each campaign
    addCampaignType?: boolean;
}

interface UseGetCampaignsResult {
    campaigns: CampaignWithType[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    emailQuery?: UseQueryResult<GetApiCampaigns200>;
    smsQuery?: UseQueryResult<GetApiCampaigns200>;
}

/**
 * Hook for fetching marketing campaigns
 *
 * @param options - Configuration options
 * @param options.params - Query parameters (page, limit, etc.) - campaign_type is handled separately
 * @param options.campaignType - Optional campaign type filter. If not provided, fetches both EMAIL and SMS
 * @param options.staleTime - Cache stale time in milliseconds (default: 5 minutes)
 * @param options.enabled - Whether the query should run (default: true)
 * @param options.addCampaignType - If true, adds campaignType property to each campaign (default: true when campaignType is not provided)
 *
 * @returns Object containing campaigns array, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * // Fetch all campaigns (EMAIL + SMS)
 * const { campaigns, isLoading } = useGetCampaigns();
 *
 * // Fetch only EMAIL campaigns
 * const { campaigns, isLoading } = useGetCampaigns({ campaignType: GetApiCampaignsCampaignType.EMAIL });
 *
 * // Fetch with custom params
 * const { campaigns, isLoading } = useGetCampaigns({
 *   params: { page: 1, limit: 50 },
 *   campaignType: GetApiCampaignsCampaignType.SMS
 * });
 * ```
 */
export const useGetCampaigns = (options: UseGetCampaignsOptions = {}): UseGetCampaignsResult => {
    const {
        params = { page: 1, limit: 100 },
        campaignType,
        staleTime = 5 * 60 * 1000, // 5 minutes default
        enabled = true,
        addCampaignType = !campaignType, // Add type if fetching combined or not specified
    } = options;

    // Query for single campaign type (when campaignType is specified)
    const singleTypeQuery = useQuery<GetApiCampaigns200>({
        queryKey: ['campaigns', campaignType, params],
        queryFn: () => api.getApiCampaigns({ ...params, campaign_type: campaignType! }),
        staleTime,
        enabled: enabled && !!campaignType, // Only enable if campaignType is provided
        retry: 1,
    });

    // Query for all campaigns (when campaignType is NOT specified - no filter)
    const allCampaignsQuery = useQuery<GetApiCampaigns200>({
        queryKey: ['campaigns', 'all', params],
        queryFn: () => api.getApiCampaigns(params), // No campaign_type parameter
        staleTime,
        enabled: enabled && !campaignType, // Only enable if no campaignType specified
        retry: 1,
    });

    // Legacy queries for EMAIL and SMS (kept for backward compatibility but disabled)
    const emailQuery = useQuery<GetApiCampaigns200>({
        queryKey: ['campaigns', GetApiCampaignsCampaignType.EMAIL, params],
        queryFn: () => api.getApiCampaigns({ ...params, campaign_type: GetApiCampaignsCampaignType.EMAIL }),
        staleTime,
        enabled: false, // Disabled - use allCampaignsQuery instead
        retry: 1,
    });

    const smsQuery = useQuery<GetApiCampaigns200>({
        queryKey: ['campaigns', GetApiCampaignsCampaignType.SMS, params],
        queryFn: () => api.getApiCampaigns({ ...params, campaign_type: GetApiCampaignsCampaignType.SMS }),
        staleTime,
        enabled: false, // Disabled - use allCampaignsQuery instead
        retry: 1,
    });

    // If campaignType is specified, use single type query
    if (campaignType) {
        const campaigns: CampaignWithType[] = (singleTypeQuery.data?.campaigns || []).map((campaign) => ({
            ...campaign,
            ...(addCampaignType && { campaignType }),
        })) as CampaignWithType[];

        return {
            campaigns,
            isLoading: singleTypeQuery.isLoading,
            isError: singleTypeQuery.isError,
            error: singleTypeQuery.error as Error | null,
            refetch: () => singleTypeQuery.refetch(),
            pagination: singleTypeQuery.data
                ? {
                      total: singleTypeQuery.data.total,
                      page: singleTypeQuery.data.page,
                      limit: singleTypeQuery.data.limit,
                      totalPages: singleTypeQuery.data.totalPages,
                  }
                : undefined,
        };
    }

    // If no campaignType specified, use all campaigns query (single API call without filter)
    // Try to extract campaignType from API response if it exists (may not be in TypeScript types)
    const campaigns: CampaignWithType[] = (allCampaignsQuery.data?.campaigns || []).map((campaign) => {
        const campaignWithType = campaign as any; // Use any to access potentially missing TypeScript property
        return {
            ...campaign,
            // Extract campaignType from response if it exists, otherwise leave undefined
            ...(addCampaignType && campaignWithType.campaignType
                ? { campaignType: campaignWithType.campaignType as 'EMAIL' | 'SMS' }
                : {}),
        };
    }) as CampaignWithType[];

    return {
        campaigns,
        isLoading: allCampaignsQuery.isLoading,
        isError: allCampaignsQuery.isError,
        error: allCampaignsQuery.error as Error | null,
        refetch: () => allCampaignsQuery.refetch(),
        pagination: allCampaignsQuery.data
            ? {
                  total: allCampaignsQuery.data.total,
                  page: allCampaignsQuery.data.page,
                  limit: allCampaignsQuery.data.limit,
                  totalPages: allCampaignsQuery.data.totalPages,
              }
            : undefined,
        emailQuery,
        smsQuery,
    };
};
