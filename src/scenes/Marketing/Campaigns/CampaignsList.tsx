import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import moment from 'moment';
import { RadixTable, ColumnType, RowType, RadixButton } from '@/components/radix';
import type { GetApiCampaigns200CampaignsItem } from '@/shared/api/models';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import { GetApiCampaignsSortBy } from '@/shared/api/models/getApiCampaignsSortBy';
import { GetApiCampaignsSortOrder } from '@/shared/api/models/getApiCampaignsSortOrder';
import { SMS_CAMPAIGN_CONFIG } from './types';
import { EMAIL_CAMPAIGN_CONFIG } from './types';
import { TRIGGER_FLOW_CONFIG } from './types';
import { formatDateForDisplay } from '@/utils/dateFormatter';
import ChevronRightIcon from '@/assets/Marketing/ChevronRight.svg';
import CampaignsCardList from './CampaignsCardList';
import { useMediaQuery } from '@/hooks/shared/useMediaQuery';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { cnMerge } from '@/utils/cnMerge';
export type CampaignWithType = GetApiCampaigns200CampaignsItem & {
    campaignType?: 'EMAIL' | 'SMS';
};

export const getStatusDisplay = (status: string, isTriggerFlow = false): { text: string; className: string } => {
    const upperStatus = status.toUpperCase();

    // If it's a trigger flow and status is TRIGGERED, treat it as IN_PROGRESS
    if (isTriggerFlow && upperStatus === 'TRIGGERED') {
        return {
            text: t('Marketing.InProgress'),
            className: 'bg-[#fff2e8] text-primary-500 uppercase',
        };
    }

    switch (upperStatus) {
        case 'TRIGGERED':
        case 'COMPLETED':
            return {
                text: t('Common.Completed'),
                className: 'bg-[#ecf5ed] text-[#3b9a45] uppercase',
            };
        case 'IN_PROGRESS':
        case 'SCHEDULED':
            return {
                text: t('Marketing.InProgress'),
                className: 'bg-[#fff2e8] text-primary-500 uppercase',
            };
        case 'DRAFT':
            return {
                text: status,
                className: 'bg-[#5B79FF1A] text-[#5B79FF] uppercase',
            };
        default:
            return {
                text: t('Marketing.InProgress'),
                className: 'bg-[#fff2e8] text-primary-500 uppercase',
            };
    }
};

export const calculateActiveDays = (createdAt: string): number => {
    try {
        const created = moment(createdAt);
        const now = moment();
        return now.diff(created, 'days');
    } catch {
        return 0;
    }
};

interface CampaignsListProps {
    campaigns: (GetApiCampaigns200CampaignsItem | CampaignWithType)[];
    campaignType: PostApiCampaignsBodyCampaignType;
    isLoading?: boolean;
    baseRoute?: string; // e.g., '/marketing/email-campaigns' or '/marketing/sms-campaigns'
    translationKeys?: {
        campaignName: string;
        customerGroup: string;
        created: string;
        recipient: string;
        revenue: string;
    };
    // Custom columns - if provided, will use these instead of default
    customColumns?: ColumnType[];
    // Header configuration
    headerTitle?: string;
    headerActions?: ReactNode;
    // Use campaignType for routing (for Trigger Flows)
    useCampaignTypeRouting?: boolean;
    // Pagination props
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
    // Sorting props
    sortBy?: GetApiCampaignsSortBy;
    sortOrder?: GetApiCampaignsSortOrder;
    onSortChange?: (columnId: string) => void;
    isTriggerFlow?: boolean;
}

export default function CampaignsList({
    campaigns,
    campaignType,
    isLoading,
    baseRoute,
    translationKeys,
    customColumns,
    headerTitle,
    headerActions,
    useCampaignTypeRouting = false,
    pagination,
    sortBy,
    sortOrder,
    onSortChange,
    isTriggerFlow = false,
}: CampaignsListProps) {
    const navigate = useNavigate();
    const isDesktop = useMediaQuery('(min-width: 960px)'); // md breakpoint from tailwind config

    // Check if a column supports server-side sorting by checking if columnId matches API sortBy field
    const isColumnServerSortable = (columnId: string): boolean => {
        // Check if columnId is a valid GetApiCampaignsSortBy value
        return (
            Object.values(GetApiCampaignsSortBy).includes(columnId as GetApiCampaignsSortBy) ||
            columnId === GetApiCampaignsSortBy.isActive
        );
    };

    // Handle sort change - only for server-sortable columns
    const handleSort = (columnId: string) => {
        if (isColumnServerSortable(columnId) && onSortChange) {
            onSortChange(columnId);
        }
    };

    const handleCampaignClick = (campaignId: string, campaignType?: string) => {
        if (useCampaignTypeRouting && campaignType) {
            // Use campaignType to determine route (for Trigger Flows)
            const baseRoute =
                campaignType === PostApiCampaignsBodyCampaignType.SMS
                    ? SMS_CAMPAIGN_CONFIG.baseRoute
                    : campaignType === PostApiCampaignsBodyCampaignType.EMAIL
                      ? EMAIL_CAMPAIGN_CONFIG.baseRoute
                      : campaignType === PostApiCampaignsBodyCampaignType.TRIGGER
                        ? TRIGGER_FLOW_CONFIG.baseRoute
                        : undefined;
            if (baseRoute) {
                navigate(`${baseRoute}/${campaignId}#step1`);
            }
        } else if (baseRoute) {
            // Use baseRoute (for Email/SMS campaigns)
            navigate(`${baseRoute}/${campaignId}#step1`);
        }
    };

    const paginationComponent = () => {
        if (!pagination) return null;
        return (
            <div className="flex items-center justify-between p-4 border-solid border-[1px] mt-4 md:mt-2 rounded-md border-border-default">
                <div className="text-sm text-text-primary">
                    {t('Common.Showing')} {campaigns.length} {t('Common.of')} {pagination?.total} {t('Common.items')}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-primary">
                        {t('Common.Page')} {pagination?.currentPage} {t('Common.of')} {pagination?.totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <RadixButton
                            variant="outline"
                            size="sm"
                            onClick={pagination?.onPreviousPage}
                            iconOnly
                            disabled={!pagination?.hasPreviousPage || pagination?.isFetchingNextPage || isLoading}
                        >
                            <img src={ChevronRightIcon} alt="Chevron Right" className="w-4 h-4 rotate-[180deg]" />
                        </RadixButton>
                        <RadixButton
                            variant="outline"
                            size="sm"
                            onClick={pagination?.onNextPage}
                            iconOnly
                            disabled={!pagination?.hasNextPage || pagination?.isFetchingNextPage || isLoading}
                        >
                            <img src={ChevronRightIcon} alt="Chevron Left" className="w-4 h-4" />
                        </RadixButton>
                    </div>
                </div>
            </div>
        );
    };

    // If custom columns are provided, use them
    if (customColumns) {
        return (
            <>
                {(headerTitle || headerActions) && (
                    <div className="flex items-center justify-between px-1 pt-0 pb-2 border-b border-border-default">
                        {headerTitle && <h2 className="text-lg font-semibold text-text-primary m-0">{headerTitle}</h2>}
                        {headerActions && <div>{headerActions}</div>}
                    </div>
                )}
                {/* Mobile Card View - shown on screens smaller than md (960px) */}
                {!isDesktop && (
                    <CampaignsCardList
                        campaigns={campaigns}
                        isLoading={isLoading}
                        baseRoute={baseRoute}
                        translationKeys={translationKeys}
                        useCampaignTypeRouting={useCampaignTypeRouting}
                        onCampaignClick={handleCampaignClick}
                        pagination={pagination}
                        isTriggerFlow={isTriggerFlow}
                    />
                )}

                {/* Desktop Table View - shown on md screens and larger */}
                {isDesktop && (
                    <>
                        <RadixTable
                            columns={customColumns}
                            data={campaigns as RowType[]}
                            loading={isLoading}
                            className="border-0"
                            isServerSorting={!!onSortChange}
                            onSort={handleSort}
                            serverSortOrder={sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc'}
                            defaultOrder={sortBy || ''}
                        />
                        {pagination && pagination.totalPages > 1 && paginationComponent()}
                    </>
                )}
            </>
        );
    }

    // Default columns for Email/SMS campaigns
    if (!translationKeys || !baseRoute) {
        return null;
    }

    const columns: ColumnType[] = [
        {
            id: 'name',
            name: translationKeys.campaignName,
            selector: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem | CampaignWithType;
                const campaignWithType = campaign as CampaignWithType;
                return (
                    <button
                        type="button"
                        onClick={() =>
                            campaign.id &&
                            handleCampaignClick(
                                campaign.id,
                                useCampaignTypeRouting ? campaignWithType.campaignType : undefined,
                            )
                        }
                        className={cnMerge(
                            'text-sm text-[#507fff] hover:text-[#4066cc] text-start ',
                            'border-none bg-transparent',
                            'cursor-pointer',
                            'p-0 m-0',
                            'font-medium',
                            'underline',
                        )}
                    >
                        {campaign.name}
                    </button>
                );
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return campaign.name || '';
            },
        },
        {
            id: 'customerGroup',
            name: translationKeys.customerGroup,
            selector: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return <span className="text-sm text-text-primary">{campaign.customerGroup}</span>;
            },
            sortable: false, // No API support - disable sorting
            sortValue: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return campaign.customerGroup || '';
            },
        },
        {
            id: 'createdAt',
            name: translationKeys.created,
            selector: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return <span className="text-sm text-text-primary">{formatDateForDisplay(campaign.createdAt)}</span>;
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return campaign.createdAt ? new Date(campaign.createdAt) : null;
            },
        },
        {
            id: 'openRate',
            name: t('Marketing.OpenRate'),
            selector: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return (
                    <span className="text-sm text-text-primary">
                        {campaign?.openRate === 'N/A' || campaign?.openRate === '0.00%' ? '0%' : campaign?.openRate}
                    </span>
                );
            },
            sortable: false, // No API support - disable sorting
            sortValue: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                if (campaign?.openRate === 'N/A' || campaign?.openRate === '0.00%') return 0;
                return typeof campaign?.openRate === 'number' ? campaign.openRate : 0;
            },
        },
        {
            id: 'recipients',
            name: translationKeys.recipient,
            selector: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return <span className="text-sm text-text-primary">{campaign.recipients.toLocaleString()}</span>;
            },
            sortable: false, // No API support - disable sorting
            sortValue: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return campaign.recipients || 0;
            },
        },
        {
            id: 'revenue',
            name: translationKeys.revenue,
            selector: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return (
                    <span className="text-sm font-semibold text-text-primary">
                        {campaign?.revenue === 'N/A' ? formatCurrency(0) : formatCurrency(campaign?.revenue)}
                    </span>
                );
            },
            sortable: false, // No API support - disable sorting
            sortValue: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                if (campaign?.revenue === 'N/A') return 0;
                return typeof campaign?.revenue === 'number' ? Number(campaign.revenue) : 0;
            },
        },
        {
            id: 'campaignStatus',
            name: t('Common.Completed'),
            selector: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                const statusDisplay = getStatusDisplay(campaign.campaignStatus || '');
                return (
                    <span
                        className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${statusDisplay.className}`}
                    >
                        {statusDisplay.text}
                    </span>
                );
            },
            sortable: true,
            sortValue: (row: RowType) => {
                const campaign = row as GetApiCampaigns200CampaignsItem;
                return campaign.campaignStatus || '';
            },
        },
    ];

    if (campaignType === PostApiCampaignsBodyCampaignType.SMS) {
        const openRateIndex = columns.findIndex((column) => column.id === 'openRate');

        if (openRateIndex !== -1) {
            columns.splice(openRateIndex, 1, {
                id: 'deliveryRate',
                name: t('Marketing.DeliveryRate'),
                selector: (row: RowType) => {
                    const campaign = row as GetApiCampaigns200CampaignsItem;
                    return (
                        <span className="text-sm text-text-primary">
                            {formatCurrency(Number(campaign?.perSmsCharge || 0))}
                        </span>
                    );
                },
                sortable: true, // No API support - disable sorting
                sortValue: (row: RowType) => {
                    const campaign = row as GetApiCampaigns200CampaignsItem;
                    return campaign?.perSmsCharge || 0;
                },
            });
        }
    }

    return (
        <>
            {/* Mobile Card View - shown on screens smaller than md (960px) */}
            {!isDesktop && (
                <CampaignsCardList
                    campaigns={campaigns}
                    isLoading={isLoading}
                    baseRoute={baseRoute}
                    translationKeys={translationKeys}
                    useCampaignTypeRouting={useCampaignTypeRouting}
                    onCampaignClick={handleCampaignClick}
                    pagination={pagination}
                />
            )}

            {/* Desktop Table View - shown on md screens and larger */}
            {isDesktop && (
                <>
                    <RadixTable
                        columns={columns}
                        data={campaigns as RowType[]}
                        loading={isLoading}
                        className="border-0"
                        isServerSorting={!!onSortChange}
                        onSort={handleSort}
                        serverSortOrder={sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc'}
                        defaultOrder={sortBy || ''}
                    />
                    {pagination && pagination.totalPages > 1 && paginationComponent()}
                </>
            )}
        </>
    );
}
