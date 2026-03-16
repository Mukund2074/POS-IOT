import { RadixButton, RadixCard, RadixSelect, RadixTable } from '@/components/radix';
import { useState, useMemo, useEffect } from 'react';
import { t } from 'i18next';
import { RowType } from '@/components/POS/Common';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { api } from '@/utils/Api/POS';
import type { GetApiCampaignsEmailOverview200 } from '@/shared/api/models';

// icons
import plane from '@/assets/Marketing/plane.svg';
import remove from '@/assets/Marketing/remove.svg';
import message from '@/assets/Marketing/message1.svg';
import finger from '@/assets/Marketing/finger.svg';
import doller from '@/assets/Marketing/doller.svg';
import person from '@/assets/Marketing/person.svg';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import moment from 'moment';
import { calculateActiveDays } from '@/scenes/Marketing/Campaigns/CampaignsList';
import { cnMerge } from '@/utils/cnMerge';
import { useMediaQuery } from '@/hooks/shared/useMediaQuery';
import FadeDevider from '@/assets/Marketing/FadeDevider.svg';

const MarketingOverview = () => {
    const [daySelect, setDaySelect] = useState('30');
    const [overviewData, setOverviewData] = useState<GetApiCampaignsEmailOverview200 | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const isDesktop = useMediaQuery('(min-width: 768px)');
    // Calculate date range from daySelect
    const getDateRange = useMemo(() => {
        return {
            fromDate: moment().subtract(daySelect, 'days').format('YYYY-MM-DD'),
            toDate: moment().format('YYYY-MM-DD'),
        };
    }, [daySelect]);

    // Fetch email overview data
    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setLoading(true);
                const response = await api.getApiCampaignsEmailOverview({
                    fromDate: getDateRange.fromDate,
                    toDate: getDateRange.toDate,
                });
                setOverviewData(response);
            } catch (err) {
                toast.error(t('Marketing.ErrorFetchingEmailOverview'));
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, [getDateRange]);

    // Map API data to component structure
    // 1. Campaign Statistics (emailPreference)
    const emailPreference = useMemo(() => {
        const stats = overviewData?.emailPreferences || {
            messageSent: 0,
            notDelivered: 0,
            clicks: 0,
            revenue: '0',
            openRates: '0',
            unsubscribed: 0,
        };

        return [
            {
                amount: `${stats.messageSent || '0'}`,
                text: t('Marketing.MessageSent'),
                icon: <img src={plane} alt="plane" />,
            },
            {
                amount: `${stats.notDelivered || '0'}`,
                text: t('Marketing.NotDelivered'),
                icon: <img src={remove} alt="remove" />,
            },
            {
                amount: `${stats.clicks || '0'}`,
                text: t('Marketing.Clicks'),
                icon: <img src={finger} alt="finger" />,
            },
            {
                amount: `${formatCurrency(parseFloat(stats.revenue || '0')) || '0'}`,
                text: t('Insights.Revenue'),
                icon: <img src={doller} alt="doller" />,
            },
            {
                amount:
                    stats.openRates === 'N/A' || !stats.openRates || stats.openRates === '0.00%'
                        ? '0%'
                        : `${stats.openRates.includes('%') ? stats.openRates : `${stats.openRates}%`}`,
                text: t('Marketing.OpenRate'),
                icon: <img src={message} alt="message" />,
            },
            {
                amount: `${stats.unsubscribed || '0'}`,
                text: t('Marketing.Unsubscribes'),
                icon: <img src={person} alt="person" />,
            },
        ];
    }, [overviewData]);

    // 2. Audience Widget - using customerMarketingPermission from API
    const audienceWidgetData = useMemo(() => {
        const permission = (overviewData as any)?.customerMarketingPermission || {
            withPermission: 0,
            withoutPermission: 0,
        };

        // Calculate percentage changes (placeholder - API doesn't provide change data yet)
        // These would need to come from API if available
        const subscriberChange = '+0';
        const notSubscriberChange = '+0';

        return [
            {
                widgetNumber: `${permission.withPermission || '0'}`,
                text: t('Marketing.TotalSubscriber'),
                incDecNumber: subscriberChange,
            },
            {
                widgetNumber: `${permission.withoutPermission || '0'}`,
                text: t('Marketing.TotalNotSubscriber'),
                incDecNumber: notSubscriberChange,
            },
        ];
    }, [overviewData]);

    // 3. Recent Campaigns
    const column = [
        {
            id: 'name',
            name: <p className="capitalize m-0">{t('Common.Name')}</p>,
            selector: (row: RowType) => (
                <Link
                    to={`/marketing/email-campaigns/${row.id}`}
                    className=" max-w-[180px] break-words whitespace-pre-line line-clamp-1 text-[#507fff]"
                >
                    {row.name}
                </Link>
            ),
            sortable: true,
        },
        {
            id: 'type',
            name: <p className="capitalize m-0">{t('Integration.Type')}</p>,
            selector: (row: RowType) => row.type,
            sortable: true,
        },
        {
            id: 'recipient',
            name: <p className="capitalize m-0">{t('Marketing.Recipient')}</p>,
            selector: (row: RowType) => row.recipient,
            sortable: true,
        },
        {
            id: 'revenue',
            name: <p className="capitalize m-0">{t('Insights.Revenue')}</p>,
            selector: (row: RowType) => (
                <p className="text-base text-text-primary font-semibold p-0 m-0">{`${formatCurrency(row.revenue)}`}</p>
            ),
            sortable: true,
        },
    ];

    // Map API top campaigns data
    const recentCampaigns = useMemo(() => {
        if (!overviewData?.topCampaigns) {
            return [];
        }
        return overviewData.topCampaigns.map((campaign) => ({
            id: campaign.id,
            name: campaign.name,
            type: campaign.campaignType,
            recipient: campaign.recipients,
            revenue: campaign.revenue,
        }));
    }, [overviewData]);

    // 4. Automation Flow Performance - using topCampaignsByRecipients from API
    const automationFlowData = useMemo(() => {
        if (process.env.REACT_APP_SHOW_TRIGGER_FLOWS !== 'true') {
            return [];
        }
        const campaigns = overviewData?.topCampaignsByRecipients || [];

        return campaigns.slice(0, 2).map((campaign: any) => {
            // Determine activeType based on campaignStatus
            const status = campaign.campaignStatus?.toUpperCase() || '';
            const activeType = status === 'PAUSED' || status === 'CANCELLED' ? 'paused' : 'active';

            // Calculate days active from createdAt to current date
            const daysActive = campaign.createdAt ? calculateActiveDays(campaign.createdAt) : 0;

            return {
                title: campaign.name || 'Untitled Campaign',
                activeType,
                revenue: parseFloat(campaign.revenue || '0'),
                completed: campaign.recipients || 0,
                daysActive,
                createdAt: campaign.createdAt || '',
                inProgress: campaign.inProgress || 0,
            };
        });
    }, [overviewData]);

    // Format date for "Since" display
    const sinceDate = useMemo(() => {
        if (!getDateRange.fromDate) return '';
        return `Since ${moment(getDateRange.fromDate).format('DD MMMM, YYYY')}`;
    }, [getDateRange]);

    // Helper function to get stats for automation flow
    const getFlowStats = (data: (typeof automationFlowData)[0]) => [
        { value: formatCurrency(data.revenue), label: t('Insights.Revenue') },
        { value: data.completed, label: t('Common.Completed') },
        { value: data.daysActive, label: t('Marketing.DaysActive') },
    ];

    return (
        <section id="marketing-overview" data-testid="marketing-overview" className="w-full">
            {/* dashboard header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center">
                <span>
                    <h2 className="text-lg font-semibold m-0">{t('Marketing.Dashboard')}</h2>
                    <span className="text-text-secondary text-sm">{t('Marketing.OverviewOfMarketplace')}</span>
                </span>

                <RadixSelect
                    placeholder={t('Common.Select')}
                    options={[
                        { value: '30', label: `${t('Common.Last')} 30 ${t('Setting.Days')}` },
                        { value: '45', label: `${t('Common.Last')} 45 ${t('Setting.Days')}` },
                        { value: '60', label: `${t('Common.Last')} 60 ${t('Setting.Days')}` },
                        { value: '90', label: `${t('Common.Last')} 90 ${t('Setting.Days')}` },
                        { value: '180', label: `${t('Common.Last')} 180 ${t('Setting.Days')}` },
                        { value: '365', label: `${t('Common.Last')} 365 ${t('Setting.Days')}` },
                    ]}
                    value={daySelect}
                    onValueChange={(value) => setDaySelect(value)}
                    className="w-full md:max-w-fit mt-4 md:mt-0"
                />
            </div>

            {isDesktop && <div className={cnMerge('h-px w-full bg-border-default my-5')} />}

            <div className="flex flex-col gap-6 mt-4 md:mt-0">
                {/* Row 1: Email Preference & Recent Campaign */}
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                    {/* Email Preference */}
                    <div>
                        <h2 className="text-base md:text-lg font-semibold capitalize">
                            {t('Marketing.EmailPreference')}
                        </h2>

                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {emailPreference.map((preference, index) => (
                                <RadixCard
                                    key={index}
                                    className={cnMerge(
                                        'flex items-center justify-between',
                                        'border-[1px] border-border-default border-solid ',
                                        'md:min-h-[125px]',
                                        'px-3 md:px-6',
                                        'rounded-md md:rounded-lg',
                                    )}
                                >
                                    <div className="space-y-2">
                                        <div className="m-0 text-xl font-bold text-text-primary">
                                            {preference.amount}
                                        </div>
                                        <div className="m-0 text-sm text-text-secondary">{preference.text}</div>
                                    </div>
                                    <span className="m-0">{preference.icon}</span>
                                </RadixCard>
                            ))}
                        </div>
                    </div>

                    {/* Recent Campaign Preference */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-base md:text-lg font-semibold capitalize">
                                {isDesktop ? t('Marketing.RecentCampaignPreference') : t('Marketing.RecentCampaigns')}
                            </h2>
                            <RadixButton
                                children={t('Marketing.EmailCampaigns')}
                                variant="outline"
                                className="text-primary-500 !font-medium border-none underline"
                                onClick={() => navigate('/marketing/email-campaigns')}
                            />
                        </div>

                        {/* Mobile Card View */}
                        {!isDesktop && (
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8 border border-border-default rounded-md border-solid">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                                    </div>
                                ) : recentCampaigns.length === 0 ? (
                                    <div className="text-center py-8 border border-border-default rounded-md border-solid">
                                        <p className="text-text-secondary m-0">{t('Components.NoData')}</p>
                                    </div>
                                ) : (
                                    recentCampaigns.map((campaign) => (
                                        <RadixCard
                                            key={campaign.id}
                                            className="border border-solid border-border-default rounded-md p-3 cursor-pointer hover:shadow-md transition-all"
                                            onClick={() => navigate(`/marketing/email-campaigns/${campaign.id}`)}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex flex-col min-w-0">
                                                    <Link
                                                        to={`/marketing/email-campaigns/${campaign.id}`}
                                                        className="text-base font-medium text-[#507fff] hover:text-[#4066cc] underline truncate"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {campaign.name}
                                                    </Link>
                                                    <span className="text-sm text-text-secondary mt-1">
                                                        {campaign.type}
                                                        <span className="mx-2">·</span>
                                                        {campaign.recipient} {t('Marketing.Participants')}
                                                    </span>
                                                </div>
                                                <span className="text-base font-semibold text-text-primary whitespace-nowrap">
                                                    {formatCurrency(campaign.revenue)}
                                                </span>
                                            </div>
                                        </RadixCard>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Desktop Table View */}
                        {isDesktop && (
                            <RadixTable
                                columns={column}
                                data={recentCampaigns}
                                loading={loading}
                                maxHeight="400px"
                                className="h-[400px]"
                            />
                        )}
                    </div>
                </div>

                {/* Row 2: Audience Widget & Automation Flow */}
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Audience Widget */}
                    <div className="w-full">
                        <h2 className="text-base md:text-lg font-semibold capitalize m-0">
                            {t('Marketing.AudienceWidget')}
                        </h2>

                        <RadixCard className="flex flex-col border rounded-md md:rounded-lg border-border-default border-solid mt-2 md:p-4 gap-2">
                            <h2 className="text-base md:text-lg font-medium m-0 capitalize">
                                {t('Marketing.ChanelEmail')}
                            </h2>

                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {audienceWidgetData.map((data, index) => {
                                    const isPositive = data.incDecNumber.startsWith('+');
                                    return (
                                        <RadixCard
                                            key={index}
                                            className={cnMerge(
                                                'flex items-center justify-center flex-col bg-background-subtle space-y-2',
                                                'rounded-md md:rounded-lg',
                                                'p-2 md:p-4',
                                                'md:min-h-[125px]',
                                            )}
                                        >
                                            <div className="flex w-full items-center justify-between">
                                                <h2 className="m-0 text-xl font-bold text-text-primary">
                                                    {data?.widgetNumber}
                                                </h2>
                                                <span
                                                    className={`m-0 py-1 px-4 rounded-full text-sm font-normal ${isPositive ? 'bg-[#3B9A451A] text-[#3B9A45]' : 'bg-[#CD00001A] text-[#CD0000]'}`}
                                                >
                                                    {data?.incDecNumber}%
                                                </span>
                                            </div>
                                            <span className="text-sm font-normal text-text-secondary mb-0 w-full">
                                                {data?.text}
                                            </span>
                                        </RadixCard>
                                    );
                                })}
                            </div>
                        </RadixCard>
                    </div>

                    {/* Automation Flow Performance */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-base md:text-lg font-semibold capitalize m-0 p-0">
                                {isDesktop ? t('Marketing.FlowPerformance') : t('Marketing.AutomationFlow')}
                            </h2>
                            {/* <Link
                                to="/marketing/trigger-flows"
                                className="text-primary-500 !font-medium border-none underline m-0 p-0"
                            >
                                <span>{t('Marketing.GoToTriggerFlows')}</span>
                            </Link> */}
                        </div>

                        {/* Automation Flow Cards - Responsive Layout */}
                        <div className={cnMerge('space-y-3', isDesktop && 'space-y-0 mt-2')}>
                            {/* Desktop: Single card wrapper with "Since" header */}
                            {isDesktop && (
                                <RadixCard className="border border-border-default border-solid p-3">
                                    <h3 className="m-0 font-normal text-sm text-text-secondary">{sinceDate}</h3>
                                    <div className="relative grid md:grid-cols-2 gap-6 mt-4">
                                        {/* Center vertical line for desktop */}
                                        {automationFlowData.length > 0 && (
                                            <img
                                                src={FadeDevider}
                                                alt="line"
                                                className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-border-default"
                                            />
                                        )}
                                        {automationFlowData.length > 0 ? (
                                            automationFlowData.map((data, index) => (
                                                <div key={index} className="flex flex-col p-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-[16px]">{data.title}</span>
                                                        <span
                                                            className={`capitalize text-xs font-medium py-1 px-2 rounded-md ${
                                                                data.activeType === 'paused'
                                                                    ? 'bg-warning-50 text-warning-500'
                                                                    : 'bg-secondary-50 text-secondary-500'
                                                            }`}
                                                        >
                                                            {data.activeType === 'paused'
                                                                ? t('Marketing.Paused')
                                                                : t('Marketing.Active')}
                                                        </span>
                                                    </div>
                                                    <div className="grid mt-4 grid-cols-1 [@media(min-width:1250px)]:grid-cols-2">
                                                        {getFlowStats(data).map((stat, statIndex) => (
                                                            <div
                                                                key={statIndex}
                                                                className={cnMerge(
                                                                    'flex items-center gap-1 mb-4 justify-between [@media(min-width:1250px)]:justify-normal',
                                                                    statIndex === 1 &&
                                                                        '[@media(min-width:1250px)]:ms-auto',
                                                                )}
                                                            >
                                                                <span className="text-sm text-text-secondary capitalize">
                                                                    {stat.label}:
                                                                </span>
                                                                <span className="text-base text-text-primary font-semibold">
                                                                    {stat.value}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 flex items-center justify-center py-8">
                                                <p className="text-sm text-text-secondary">
                                                    {loading
                                                        ? t('Common.Loading')
                                                        : process.env.REACT_APP_SHOW_TRIGGER_FLOWS === 'true'
                                                          ? t('Marketing.NoGroupsYet')
                                                          : t('Marketing.ComingSoon')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </RadixCard>
                            )}

                            {/* Mobile: Individual cards */}
                            {!isDesktop && (
                                <>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8 border border-border-default rounded-md border-solid mt-2">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                                        </div>
                                    ) : automationFlowData.length === 0 ? (
                                        <div className="text-center py-8 border border-border-default rounded-md border-solid mt-2">
                                            <p className="text-text-secondary m-0">
                                                {' '}
                                                {process.env.REACT_APP_SHOW_TRIGGER_FLOWS === 'true'
                                                    ? t('Marketing.NoGroupsYet')
                                                    : t('Marketing.ComingSoon')}
                                            </p>
                                        </div>
                                    ) : (
                                        automationFlowData.map((data, index) => (
                                            <RadixCard
                                                key={index}
                                                className="border border-solid border-border-default rounded-md p-3 mt-2"
                                            >
                                                {/* Header: Title + Status Badge */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-base text-text-primary">
                                                            {data.title}
                                                        </span>
                                                        <span className="text-sm text-text-secondary mt-1">
                                                            {data.createdAt
                                                                ? moment(data.createdAt).format('DD MMMM, YYYY')
                                                                : ''}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`capitalize text-xs font-medium py-1 px-3 rounded-md ${
                                                            data.activeType === 'paused'
                                                                ? 'bg-warning-50 text-warning-500'
                                                                : 'bg-secondary-50 text-secondary-500'
                                                        }`}
                                                    >
                                                        {data.activeType === 'paused'
                                                            ? t('Marketing.Paused')
                                                            : t('Marketing.Active')}
                                                    </span>
                                                </div>

                                                {/* Stats Row */}
                                                <div className="grid grid-cols-3 gap-0 border-0 border-t-2 border-dashed border-border-default pt-4 mt-2">
                                                    {getFlowStats(data).map((stat, statIndex) => (
                                                        <div
                                                            key={statIndex}
                                                            className={cnMerge(
                                                                'flex flex-col items-start',
                                                                statIndex < 2 &&
                                                                    'border-0 border-r border-solid border-border-default',
                                                                statIndex === 0 ? 'pr-2' : 'px-2',
                                                            )}
                                                        >
                                                            <span className="text-base font-semibold text-text-primary">
                                                                {stat.value}
                                                            </span>
                                                            <span className="text-xs text-text-secondary mt-1 capitalize">
                                                                {stat.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </RadixCard>
                                        ))
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default MarketingOverview;
