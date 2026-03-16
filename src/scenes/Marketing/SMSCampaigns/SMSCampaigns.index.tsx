import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetCampaignForm, setCampaignType } from '@/redux/slices/Marketing/campaigns';
import { RadixButton, RadixCard } from '@/components/radix';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import { GetApiCampaignsCampaignType } from '@/shared/api/models/getApiCampaignsCampaignType';
import { GetApiCampaignsSortBy } from '@/shared/api/models/getApiCampaignsSortBy';
import { GetApiCampaignsSortOrder } from '@/shared/api/models/getApiCampaignsSortOrder';
import { useGetCampaigns } from '@/hooks/api/marketing';
import CampaignsList from '../Campaigns/CampaignsList';
import CampaignStats from '../Campaigns/CampaignStats';
import { SMS_CAMPAIGN_CONFIG } from '../Campaigns/types';
import { useMediaQuery } from '@/hooks/shared';
import { t } from 'i18next';

export default function SMSCampaigns() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<GetApiCampaignsSortBy | undefined>();
    const [sortOrder, setSortOrder] = useState<GetApiCampaignsSortOrder>(GetApiCampaignsSortOrder.DESC);
    const pageSize = 10; // Number of items per page
    const isDesktop = useMediaQuery('(min-width: 960px)');

    // Convert column ID to API sortBy field name
    const getApiSortField = (columnId: string): GetApiCampaignsSortBy | null => {
        if (columnId === GetApiCampaignsSortBy.isActive) {
            return GetApiCampaignsSortBy.isActive;
        }
        if (Object.values(GetApiCampaignsSortBy).includes(columnId as GetApiCampaignsSortBy)) {
            return columnId as GetApiCampaignsSortBy;
        }
        return null;
    };

    // Fetch SMS campaigns using the hook
    const { campaigns, isLoading, pagination } = useGetCampaigns({
        params: {
            page: currentPage,
            limit: pageSize,
            ...(sortBy && { sortBy, sortOrder }),
        },
        campaignType: GetApiCampaignsCampaignType.SMS,
        addCampaignType: false, // Not needed for single type view
    });

    const handleCreateCampaign = () => {
        dispatch(resetCampaignForm());
        dispatch(setCampaignType(PostApiCampaignsBodyCampaignType.SMS));
        navigate('/marketing/sms-campaigns/create#step1');
    };

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleSortChange = (columnId: string) => {
        const apiField = getApiSortField(columnId);
        if (apiField) {
            // Toggle sort order if clicking the same column, otherwise default to DESC
            const newSortOrder =
                sortBy === apiField && sortOrder === GetApiCampaignsSortOrder.DESC
                    ? GetApiCampaignsSortOrder.ASC
                    : GetApiCampaignsSortOrder.DESC;
            setSortBy(apiField);
            setSortOrder(newSortOrder);
            setCurrentPage(1); // Reset to first page on sort change
        }
    };

    return (
        <React.Fragment>
            <div className="mb-2 md:mb-6">
                <h1 className="text-lg font-semibold text-text-primary m-0">
                    {SMS_CAMPAIGN_CONFIG.translationKeys.title}
                </h1>
                <p className="text-sm text-text-secondary m-0">{SMS_CAMPAIGN_CONFIG.translationKeys.description}</p>
            </div>

            <CampaignStats
                campaigns={campaigns}
                translationKeys={SMS_CAMPAIGN_CONFIG.translationKeys}
                campaignType={PostApiCampaignsBodyCampaignType.SMS}
            />

            <RadixCard className="mt-6 !p-0">
                <div className="flex items-center justify-between px-1 pt-0 pb-2 border-b border-border-default">
                    <h2 className="text-lg font-semibold text-text-primary m-0">
                        {SMS_CAMPAIGN_CONFIG.translationKeys.createdCampaigns}
                    </h2>
                    <RadixButton onClick={handleCreateCampaign} className="min-w-fit md:min-w-0">
                        {isDesktop ? SMS_CAMPAIGN_CONFIG.translationKeys.createCampaign : t('GiftCard.Create')}
                    </RadixButton>
                </div>
                <CampaignsList
                    campaignType={PostApiCampaignsBodyCampaignType.SMS}
                    campaigns={campaigns}
                    isLoading={isLoading}
                    baseRoute={SMS_CAMPAIGN_CONFIG.baseRoute}
                    translationKeys={SMS_CAMPAIGN_CONFIG.translationKeys}
                    pagination={
                        pagination
                            ? {
                                  currentPage: pagination.page,
                                  totalPages: pagination.totalPages,
                                  total: pagination.total,
                                  hasNextPage: pagination.page < pagination.totalPages,
                                  hasPreviousPage: pagination.page > 1,
                                  isFetchingNextPage: isLoading,
                                  onNextPage: handleNextPage,
                                  onPreviousPage: handlePreviousPage,
                              }
                            : undefined
                    }
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                />
            </RadixCard>
        </React.Fragment>
    );
}
