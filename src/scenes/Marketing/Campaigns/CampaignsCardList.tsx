import React from 'react';
import { t } from 'i18next';
import { RadixButton, RadixSpinner } from '@/components/radix';
import type { GetApiCampaigns200CampaignsItem } from '@/shared/api/models';
import { CampaignWithType } from './CampaignsList';
import CampaignCard from './CampaignCard';
import ChevronRightIcon from '@/assets/Marketing/ChevronRight.svg';

interface CampaignsCardListProps {
    campaigns: (GetApiCampaigns200CampaignsItem | CampaignWithType)[];
    isLoading?: boolean;
    baseRoute?: string;
    translationKeys?: {
        campaignName: string;
        customerGroup: string;
        created: string;
        recipient: string;
        revenue: string;
    };
    useCampaignTypeRouting?: boolean;
    onCampaignClick?: (campaignId: string, campaignType?: string) => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        total: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        isFetchingNextPage: boolean;
        onNextPage: () => void;
        onPreviousPage: () => void;
    };
    isTriggerFlow?: boolean;
}

export default function CampaignsCardList({
    campaigns,
    isLoading,
    baseRoute,
    translationKeys,
    useCampaignTypeRouting = false,
    onCampaignClick,
    pagination,
    isTriggerFlow = false,
}: CampaignsCardListProps) {
    if (isLoading && campaigns.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <RadixSpinner size="md" />
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="text-center py-8 border border-border-default rounded-md p-4 border-solid">
                <p className="text-text-secondary">{t('Customer.NoDataFound')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                {campaigns.map((campaign) => (
                    <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        baseRoute={baseRoute}
                        translationKeys={translationKeys}
                        useCampaignTypeRouting={useCampaignTypeRouting}
                        onClick={onCampaignClick}
                        isTriggerFlow={isTriggerFlow}
                    />
                ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-border-default rounded-md mt-4">
                    <div className="text-sm text-text-primary">
                        {t('Common.Showing')} {campaigns.length} {t('Common.of')} {pagination.total} {t('Common.items')}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-text-primary">
                            {t('Common.Page')} {pagination.currentPage} {t('Common.of')} {pagination.totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <RadixButton
                                variant="outline"
                                size="sm"
                                onClick={pagination.onPreviousPage}
                                iconOnly
                                disabled={!pagination.hasPreviousPage || pagination.isFetchingNextPage || isLoading}
                            >
                                <img src={ChevronRightIcon} alt="Previous" className="w-4 h-4 rotate-[180deg]" />
                            </RadixButton>
                            <RadixButton
                                variant="outline"
                                size="sm"
                                onClick={pagination.onNextPage}
                                iconOnly
                                disabled={!pagination.hasNextPage || pagination.isFetchingNextPage || isLoading}
                            >
                                <img src={ChevronRightIcon} alt="Next" className="w-4 h-4" />
                            </RadixButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
