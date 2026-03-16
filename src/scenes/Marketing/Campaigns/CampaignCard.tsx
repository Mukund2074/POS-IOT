import React from 'react';
import { t } from 'i18next';
import { RadixCard } from '@/components/radix';
import { PostApiCampaignsBodyCampaignType, type GetApiCampaigns200CampaignsItem } from '@/shared/api/models';
import { CampaignWithType, getStatusDisplay } from './CampaignsList';
import { formatDateForDisplay } from '@/utils/dateFormatter';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';

interface CampaignCardProps {
    campaign: GetApiCampaigns200CampaignsItem | CampaignWithType;
    baseRoute?: string;
    translationKeys?: {
        campaignName: string;
        customerGroup: string;
        created: string;
        recipient: string;
        revenue: string;
    };
    useCampaignTypeRouting?: boolean;
    onClick?: (campaignId: string, campaignType?: string) => void;
    isTriggerFlow?: boolean;
}

export default function CampaignCard({
    campaign,
    baseRoute,
    translationKeys,
    useCampaignTypeRouting = false,
    onClick,
    isTriggerFlow = false,
}: CampaignCardProps) {
    const isTriggered = campaign.campaignStatus?.toUpperCase() === 'TRIGGERED';
    const statusDisplay = getStatusDisplay(campaign.campaignStatus || '', isTriggerFlow);
    const campaignWithType = campaign as CampaignWithType;

    const handleClick = () => {
        if (campaign.id && onClick) {
            onClick(campaign.id, useCampaignTypeRouting ? campaignWithType.campaignType : undefined);
        }
    };

    const openRate = campaign?.openRate === 'N/A' ? '0%' : campaign?.openRate;
    const revenue = campaign?.revenue === 'N/A' ? formatCurrency(0) : formatCurrency(campaign?.revenue);

    return (
        <RadixCard
            className={`border border-solid border-border-default rounded-lg p-4 transition-all ${
                !isTriggered && onClick ? 'cursor-pointer hover:shadow-md' : ''
            }`}
            onClick={!isTriggered && onClick ? handleClick : undefined}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <button
                        type="button"
                        onClick={handleClick}
                        className="text-base font-semibold text-[#507fff] hover:text-[#4066cc] underline bg-transparent border-none cursor-pointer p-0 text-left mb-1 truncate block w-full"
                    >
                        {campaign.name}
                    </button>
                    <p className="text-sm text-text-secondary m-0">{campaign.customerGroup}</p>
                </div>
                <span
                    className={`inline-block px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 ${statusDisplay.className}`}
                >
                    {statusDisplay.text}
                </span>
            </div>

            <div className="space-y-2 border-border-default border-t-2 border-dashed border-b-0 border-l-0 border-r-0 pb-2 pt-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{translationKeys?.created || 'Created'}:</span>
                    <span className="text-text-primary font-medium">{formatDateForDisplay(campaign.createdAt)}</span>
                </div>
                {campaignWithType.campaignType === PostApiCampaignsBodyCampaignType.EMAIL ? (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">{t('Marketing.OpenRate')}:</span>
                        <span className="text-text-primary font-medium">{openRate}</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">{t('Marketing.DeliveryRate')}:</span>
                        <span className="text-text-primary font-medium">
                            {formatCurrency(Number(campaign.perSmsCharge * campaign.recipients))}
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{translationKeys?.recipient || 'Recipient'}:</span>
                    <span className="text-text-primary font-medium">{campaign.recipients.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{translationKeys?.revenue || 'Revenue'}:</span>
                    <span className="text-text-primary font-semibold">{revenue}</span>
                </div>
            </div>
        </RadixCard>
    );
}
