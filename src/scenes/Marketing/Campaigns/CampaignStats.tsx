import React, { useState, useMemo, useEffect } from 'react';
import { t } from 'i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { invalidateMarketingQueries } from '@/hooks/api/marketing';
import { RadixCard, RadixMultiSelect, RadixSelect, RadixSpinner } from '@/components/radix';
import { getApi } from '@/shared/api';
import type { GetApiCampaigns200CampaignsItem, PostApiCampaignsStatistics200Item } from '@/shared/api/models';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';

import plane from '@/assets/Marketing/plane.svg';
import remove from '@/assets/Marketing/remove.svg';
import message from '@/assets/Marketing/message1.svg';
import finger from '@/assets/Marketing/finger.svg';
import doller from '@/assets/Marketing/doller.svg';
import person from '@/assets/Marketing/person.svg';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';

const formatNumber = (num: number): string => {
    return num.toLocaleString();
};

interface CampaignStatsProps {
    campaigns: GetApiCampaigns200CampaignsItem[];
    campaignTypeFilter?: string;
    onCampaignTypeFilterChange?: (value: string) => void;
    translationKeys: {
        preference: string; // "Email preference" or "SMS preference"
        revenue: string;
    };
    campaignType: PostApiCampaignsBodyCampaignType;
}

export default function CampaignStats({
    campaigns,
    translationKeys,
    campaignTypeFilter = 'all',
    onCampaignTypeFilterChange,
    campaignType,
}: CampaignStatsProps) {
    const queryClient = useQueryClient();
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());

    // Set first campaign as default when campaigns are loaded
    useEffect(() => {
        if (campaigns.length > 0 && selectedCampaignIds.size === 0) {
            const firstCampaignId = campaigns.find((campaign) => campaign.id)?.id;
            if (firstCampaignId) {
                setSelectedCampaignIds(new Set([firstCampaignId]));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaigns]);

    // Fetch statistics for selected campaigns
    const { data: statisticsData, isLoading: isLoadingStats } = useQuery<PostApiCampaignsStatistics200Item[]>({
        queryKey: ['campaigns-statistics', Array.from(selectedCampaignIds).sort().join(',')],
        queryFn: () => {
            const campaignIds = selectedCampaignIds.size > 0 ? Array.from(selectedCampaignIds) : null;
            return getApi().postApiCampaignsStatistics({ campaignId: campaignIds });
        },
        enabled: selectedCampaignIds.size > 0, // Fetch only if campaigns are selected
        staleTime: 0,
        gcTime: 0,
    });

    const aggregatedStats = useMemo(() => {
        if (!Array.isArray(statisticsData) || statisticsData.length === 0) {
            return {
                messageSent: 0,
                notDelivered: 0,
                clicks: 0,
                unsubscribed: 0,
                openRate: '0%',
                revenue: formatCurrency(0),
            };
        }

        let openRateSum = 0;
        let openRateCount = 0;

        const totals = statisticsData.reduce(
            (acc, campaign) => {
                acc.messageSent += Number(campaign.messageSent) || 0;
                acc.notDelivered += Number(campaign.notDelivered) || 0;
                acc.clicks += Number(campaign.clicks) || 0;
                acc.unsubscribed += Number(campaign.unsubscribed) || 0;
                acc.totalRevenue += Number(campaign.revenue) || 0;

                if (campaign.openRate && campaign.openRate !== 'N/A') {
                    openRateSum += parseFloat(campaign.openRate.replace('%', '')) || 0;
                    openRateCount += 1;
                }

                return acc;
            },
            {
                messageSent: 0,
                notDelivered: 0,
                clicks: 0,
                unsubscribed: 0,
                totalRevenue: 0,
            },
        );

        const averageOpenRate = openRateCount > 0 ? openRateSum / openRateCount : 0;

        return {
            messageSent: totals.messageSent,
            notDelivered: totals.notDelivered,
            clicks: totals.clicks,
            unsubscribed: totals.unsubscribed,
            openRate: averageOpenRate % 1 === 0 ? `${averageOpenRate}%` : `${averageOpenRate.toFixed(1)}%`,
            revenue: formatCurrency(totals.totalRevenue),
        };
    }, [statisticsData]);

    // Convert campaigns to options format
    const campaignOptions = useMemo(() => {
        return campaigns
            .filter((campaign) => campaign.id)
            .map((campaign) => ({
                label: campaign.name || '',
                value: campaign.id!,
                disabled: false,
            }));
    }, [campaigns]);

    const stats = [
        {
            label: t('Marketing.MessageSent'),
            value: isLoadingStats ? <RadixSpinner size="sm" /> : formatNumber(aggregatedStats.messageSent),
            color: 'bg-[rgba(91,59,154,0.1)]',
            icon: <img src={plane} alt="plane" />,
        },
        {
            label: t('Marketing.NotDelivered'),
            value: isLoadingStats ? <RadixSpinner size="sm" /> : formatNumber(aggregatedStats.notDelivered),
            color: 'bg-[#fae6e6]',
            icon: <img src={remove} alt="remove" />,
        },
    ];

    if (campaignType !== PostApiCampaignsBodyCampaignType.SMS) {
        stats.push(
            {
                label: t('Marketing.OpenRate'),
                value: isLoadingStats ? <RadixSpinner size="sm" /> : aggregatedStats?.openRate,
                color: 'bg-[rgba(237,209,0,0.1)]',
                icon: <img src={message} alt="message" />,
            },
            {
                label: t('Marketing.Clicks'),
                value: isLoadingStats ? <RadixSpinner size="sm" /> : formatNumber(aggregatedStats.clicks),
                color: 'bg-[rgba(91,121,255,0.1)]',
                icon: <img src={finger} alt="finger" />,
            },
            {
                label: translationKeys.revenue,
                value: isLoadingStats ? <RadixSpinner size="sm" /> : aggregatedStats.revenue,
                color: 'bg-[#ecf5ed]',
                icon: <img src={doller} alt="doller" />,
            },
            {
                label: t('Marketing.Unsubscribes'),
                value: isLoadingStats ? <RadixSpinner size="sm" /> : formatNumber(aggregatedStats.unsubscribed),
                color: 'bg-[rgba(255,168,91,0.1)]',
                icon: <img src={person} alt="person" />,
            },
        );
    }

    return (
        <div className="mt-6 md:mt-0">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-4 md:gap-3 xs:gap-0">
                <h2 className="text-lg font-semibold text-text-primary m-0">{translationKeys.preference}</h2>
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4 w-full xs:w-auto mt-2 md:mt-0">
                    {onCampaignTypeFilterChange && (
                        <RadixSelect
                            options={[
                                { label: t('Common.Email'), value: 'email' },
                                { label: t('Calendar.SMS'), value: 'sms' },
                                { label: t('Common.All'), value: 'all' },
                            ]}
                            value={campaignTypeFilter}
                            onValueChange={(e) => {
                                onCampaignTypeFilterChange(e);
                                setSelectedCampaignIds(new Set());
                                invalidateMarketingQueries(queryClient);
                            }}
                            className="min-w-[150px] h-10"
                        />
                    )}
                    <RadixMultiSelect
                        className="w-full h-10"
                        options={campaignOptions}
                        selectedValues={selectedCampaignIds}
                        onSelectionChange={(values) => {
                            setSelectedCampaignIds(values);
                            invalidateMarketingQueries(queryClient);
                        }}
                        placeholder={t('Marketing.SelectCampaigns')}
                        selectAllLabel={t('SpOffers.SelAll')}
                        textToDisplayWithCount={
                            selectedCampaignIds.size === 1
                                ? t('Marketing.CampaignSelected')
                                : selectedCampaignIds.size > 1
                                  ? t('Marketing.CampaignsSelected')
                                  : ''
                        }
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map((stat, index) => (
                    <RadixCard
                        key={index}
                        className="flex border border-solid p-3 items-center justify-between gap-3 h-[100px] px-4 rounded-md md:rounded-lg"
                    >
                        <div className="flex flex-col items-start justify-center gap-1">
                            <p className="text-base font-semibold text-text-primary my-1">{stat.value}</p>
                            <p className="text-sm text-text-secondary m-0">{stat.label}</p>
                        </div>
                        <div>{stat?.icon}</div>
                    </RadixCard>
                ))}
            </div>
        </div>
    );
}
