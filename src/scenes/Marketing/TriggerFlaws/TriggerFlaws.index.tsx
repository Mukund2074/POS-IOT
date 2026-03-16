import React, { useState } from 'react';
import { t } from 'i18next';
import { ColumnType, RadixButton, RadixCard, RadixSpinner, RadixSwitch, RowType } from '@/components/radix';
import { useGetCampaigns } from '@/hooks/api/marketing';
import CampaignsList, { calculateActiveDays, CampaignWithType, getStatusDisplay } from '../Campaigns/CampaignsList';
import { TRIGGER_FLOW_CONFIG } from '../Campaigns/types';
import { useNavigate } from 'react-router-dom';
import CampaignStats from '../Campaigns/CampaignStats';
import { formatDateForDisplay } from '@/utils/dateFormatter';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { GetApiCampaignsCampaignType } from '@/shared/api/models/getApiCampaignsCampaignType';
import { useMediaQuery } from '@/hooks/shared';
import { api } from '@/utils/Api/POS';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateMarketingQueries } from '@/hooks/api/marketing';
import { toast } from '@/utils/toast';

export default function TriggerFlawsIndex() {
    const [campaignTypeFilter, setCampaignTypeFilter] = useState<string>('all');
    const [draftPage, setDraftPage] = useState<number>(1);
    const [createdPage, setCreatedPage] = useState<number>(1);
    const [updatingCampaignId, setUpdatingCampaignId] = useState<string | null>(null);
    const navigate = useNavigate();
    const isDesktop = useMediaQuery('(min-width: 960px)');
    const queryClient = useQueryClient();
    // API call for draft campaigns (filtered by DRAFT status and TRIGGER type)
    const {
        campaigns: draftCampaigns,
        isLoading: isLoadingDrafts,
        pagination: draftPagination,
    } = useGetCampaigns({
        params: {
            page: draftPage,
            limit: 10,
            campaign_status: ['DRAFT'],
        },
        campaignType: GetApiCampaignsCampaignType.TRIGGER,
        addCampaignType: false,
    });

    // API call for created campaigns (filtered by TRIGGER type and statuses - all except DRAFT)
    const {
        campaigns: createdCampaigns,
        isLoading: isLoadingCreated,
        pagination: createdPagination,
    } = useGetCampaigns({
        params: {
            page: createdPage,
            limit: 10,
            campaign_status: ['SCHEDULED', 'TRIGGERED', 'COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'],
        },
        campaignType: GetApiCampaignsCampaignType.TRIGGER,
        addCampaignType: false,
    });

    const handleCreateCampaign = () => {
        navigate('/marketing/trigger-flows/select-trigger-flow');
    };

    // Pagination handlers for draft campaigns
    const handleDraftNextPage = () => {
        if (draftPagination && draftPage < draftPagination.totalPages) {
            setDraftPage((prev) => prev + 1);
        }
    };

    const handleDraftPreviousPage = () => {
        if (draftPage > 1) {
            setDraftPage((prev) => prev - 1);
        }
    };

    // Pagination handlers for created campaigns
    const handleCreatedNextPage = () => {
        if (createdPagination && createdPage < createdPagination.totalPages) {
            setCreatedPage((prev) => prev + 1);
        }
    };

    const handleCreatedPreviousPage = () => {
        if (createdPage > 1) {
            setCreatedPage((prev) => prev - 1);
        }
    };

    const headerActions = (
        <RadixButton
            onClick={handleCreateCampaign}
            variant="primary"
            size={isDesktop ? 'base' : 'xs'}
            className="min-w-fit md:min-w-0"
        >
            {isDesktop ? TRIGGER_FLOW_CONFIG.translationKeys.createCampaign : t('GiftCard.Create')}
        </RadixButton>
    );

    const updateCampaignStatus = async ({ id, isActive }: { id: string; isActive: boolean }) => {
        setUpdatingCampaignId(id);
        try {
            const response = await api.patchApiCampaignsIdStatus(id, { isActive });
            if (response) {
                toast.success(t('Marketing.CampaignStatusUpdatedSuccessfully'));
                invalidateMarketingQueries(queryClient);
                setUpdatingCampaignId(null);
                return true;
            }
            toast.error(t('Marketing.CampaignStatusUpdateError'));
            setUpdatingCampaignId(null);
            return false;
        } catch (error) {
            toast.error(t('Marketing.CampaignStatusUpdateError'));
            setUpdatingCampaignId(null);
            return false;
        }
    };

    const triggerFlowsColumns: ColumnType[] = [
        {
            id: 'status',
            name: t('Common.Status'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                const isActive = campaign.isActive ?? false;
                const isUpdating = updatingCampaignId === campaign.id;

                // Disable switch for certain statuses where toggling doesn't make sense
                const isDisabled =
                    isUpdating ||
                    campaign.campaignStatus?.toUpperCase() === 'COMPLETED' ||
                    campaign.campaignStatus?.toUpperCase() === 'CANCELLED' ||
                    campaign.campaignStatus?.toUpperCase() === 'FAILED';

                if (updatingCampaignId === campaign.id) {
                    return <RadixSpinner size="sm" variant="primary" />;
                }
                return (
                    <RadixSwitch
                        checked={isActive}
                        onChange={() => campaign.id && updateCampaignStatus({ id: campaign.id, isActive: !isActive })}
                        disabled={isDisabled}
                    />
                );
            },
            sortable: false,
        },
        {
            id: 'campaignType',
            name: t('Marketing.CampaignType'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                // Determine if it's email or SMS based on campaign type
                const isEmail = campaign.campaignType !== 'SMS';
                return (
                    <span className="text-sm text-text-secondary">
                        {isEmail ? t('Common.Email') : t('Calendar.SMS')}
                    </span>
                );
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.campaignType?.toUpperCase() || '';
            },
        },
        {
            id: 'name',
            name: t('Common.Name'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return (
                    <button
                        type="button"
                        onClick={() => campaign.id && navigate(`${TRIGGER_FLOW_CONFIG.baseRoute}/${campaign.id}`)}
                        className="text-sm font-medium text-start text-[#507fff] underline hover:text-[#4066cc] bg-transparent border-none cursor-pointer p-0"
                    >
                        {campaign.name}
                    </button>
                );
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.name || '';
            },
        },
        {
            id: 'activeTrigger',
            name: t('Common.Active'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                // Determine if trigger is active based on status
                return (
                    <span className="text-sm text-text-secondary">
                        {campaign.isActive ? t('Customer.ButtonTitleYes') : t('Customer.ButtonTitleNo')}
                    </span>
                );
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.isActive;
            },
        },
        {
            id: 'activeDays',
            name: t('Marketing.TriggerFlowsActiveDays'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                const days = calculateActiveDays(campaign.createdAt);
                return <span className="text-sm text-text-secondary">{days}</span>;
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const days = calculateActiveDays(row.createdAt);
                return Number(days);
            },
        },
        {
            id: 'createdAt',
            name: t('Common.Created'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return <span className="text-sm text-text-secondary">{formatDateForDisplay(campaign.createdAt)}</span>;
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.createdAt ? new Date(campaign.createdAt) : null;
            },
        },
        {
            id: 'openRate',
            name: t('Marketing.OpenRate'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return (
                    <span className="text-sm text-text-secondary">
                        {campaign.openRate === 'N/A' ? '0%' : campaign.openRate}
                    </span>
                );
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.openRate === 'N/A' ? 0 : Number(campaign.openRate);
            },
        },
        {
            id: 'recipients',
            name: t('Marketing.Recipient'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return <span className="text-sm text-text-secondary">{campaign.recipients}</span>;
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.recipients;
            },
        },
        {
            id: 'revenue',
            name: t('Insights.Revenue'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return (
                    <span className="text-sm font-semibold text-text-secondary">
                        {campaign.revenue === 'N/A' ? formatCurrency(0) : formatCurrency(campaign.revenue)}
                    </span>
                );
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.revenue === 'N/A' ? 0 : Number(campaign.revenue);
            },
        },
        {
            id: 'campaignStatus',
            name: t('Common.Completed'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                const statusDisplay = getStatusDisplay(campaign.campaignStatus || '', true);
                return (
                    <span
                        className={`inline-block px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${statusDisplay.className}`}
                    >
                        {statusDisplay.text}
                    </span>
                );
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.campaignStatus?.toUpperCase() || '';
            },
        },
    ];

    const draftCampaignsColumns: ColumnType[] = [
        {
            id: 'name',
            name: t('Common.Name'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return (
                    <button
                        type="button"
                        onClick={() => campaign.id && navigate(`${TRIGGER_FLOW_CONFIG.baseRoute}/${campaign.id}`)}
                        className="text-sm font-medium text-start text-[#507fff] underline hover:text-[#4066cc] bg-transparent border-none cursor-pointer p-0"
                    >
                        {campaign.name}
                    </button>
                );
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.createdAt ? new Date(campaign.createdAt) : null;
            },
        },
        {
            id: 'createdAt',
            name: t('Common.Created'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return <span className="text-sm text-text-secondary">{formatDateForDisplay(campaign.createdAt)}</span>;
            },
            sortable: true,
        },
        {
            id: 'updatedAt',
            name: t('Common.LastEdited'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                // Use createdAt as last edited since updatedAt is not available in API response
                return <span className="text-sm text-text-secondary">{formatDateForDisplay(campaign.updatedAt)}</span>;
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.updatedAt ? new Date(campaign.updatedAt) : null;
            },
        },
        {
            id: 'recipients',
            name: t('Marketing.Recipient'),
            selector: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return <span className="text-sm text-text-secondary">{campaign.recipients.toLocaleString()}</span>;
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as CampaignWithType;
                return campaign.recipients;
            },
        },
    ];

    return (
        <div className="h-full w-full flex flex-col overflow-y-auto scrollbar-hidden">
            {/* Section 1: Header */}
            <div className="mb-6">
                <h1 className="text-lg font-semibold text-text-primary m-0">{t('Marketing.TriggerFlowsTitle')}</h1>
                <p className="text-sm text-text-secondary m-0">{t('Marketing.TriggerFlowsDescription')}</p>
            </div>

            {/* Section 1: Stats Cards */}
            <CampaignStats
                campaigns={createdCampaigns}
                campaignTypeFilter={campaignTypeFilter}
                onCampaignTypeFilterChange={setCampaignTypeFilter}
                translationKeys={TRIGGER_FLOW_CONFIG.translationKeys}
                campaignType={GetApiCampaignsCampaignType.TRIGGER}
            />

            {/* Section 2: Draft Campaigns List */}
            <RadixCard className="mt-2 md:mt-6">
                <CampaignsList
                    campaigns={draftCampaigns}
                    campaignType={GetApiCampaignsCampaignType.TRIGGER}
                    isLoading={isLoadingDrafts}
                    translationKeys={TRIGGER_FLOW_CONFIG.translationKeys}
                    baseRoute={TRIGGER_FLOW_CONFIG.baseRoute}
                    headerTitle={TRIGGER_FLOW_CONFIG.draftCampaignsKeys?.title}
                    headerActions={headerActions}
                    customColumns={draftCampaignsColumns}
                    pagination={
                        draftPagination
                            ? {
                                  currentPage: draftPagination.page,
                                  totalPages: draftPagination.totalPages,
                                  total: draftPagination.total,
                                  hasNextPage: draftPagination.page < draftPagination.totalPages,
                                  hasPreviousPage: draftPagination.page > 1,
                                  isFetchingNextPage: isLoadingDrafts,
                                  onNextPage: handleDraftNextPage,
                                  onPreviousPage: handleDraftPreviousPage,
                              }
                            : undefined
                    }
                />
            </RadixCard>

            {/* Section 3: Created Campaigns List */}
            <RadixCard className="mt-6 !p-0">
                <CampaignsList
                    campaigns={createdCampaigns}
                    campaignType={GetApiCampaignsCampaignType.TRIGGER}
                    isLoading={isLoadingCreated}
                    translationKeys={TRIGGER_FLOW_CONFIG.translationKeys}
                    headerTitle={TRIGGER_FLOW_CONFIG.translationKeys.createdCampaigns}
                    baseRoute={TRIGGER_FLOW_CONFIG.baseRoute}
                    customColumns={triggerFlowsColumns}
                    pagination={
                        createdPagination
                            ? {
                                  currentPage: createdPagination.page,
                                  totalPages: createdPagination.totalPages,
                                  total: createdPagination.total,
                                  hasNextPage: createdPagination.page < createdPagination.totalPages,
                                  hasPreviousPage: createdPagination.page > 1,
                                  isFetchingNextPage: isLoadingCreated,
                                  onNextPage: handleCreatedNextPage,
                                  onPreviousPage: handleCreatedPreviousPage,
                              }
                            : undefined
                    }
                    isTriggerFlow={true}
                />
            </RadixCard>
        </div>
    );
}
