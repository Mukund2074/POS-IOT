import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { RadixCard, RadixBreadcrumbs, RadixSpinner } from '@/components/radix';
import { resetCampaignForm, setCampaignType } from '@/redux/slices/Marketing/campaigns';
import { t } from 'i18next';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import { getApi } from '@/shared/api';
import CalendarIcon from '@/assets/Marketing/Calendar.svg';
import CampaignIcon from '@/assets/Marketing/CampaignFlow.svg';
import ClockIcon from '@/assets/Marketing/Clock.svg';
import GiftBoxIcon from '@/assets/Marketing/GiftBox.svg';
import CakeIcon from '@/assets/Marketing/Cake.svg';
import CrownIcon from '@/assets/Marketing/Crown.svg';
import CurrencyIcon from '@/assets/Marketing/Currency.svg';
import CheckIcon from '@/assets/Marketing/Check.svg';
import CloseCircleIcon from '@/assets/Marketing/CloseCircle.svg';
import EnvelopeIcon from '@/assets/Marketing/Envelope.svg';
import MessageIcon from '@/assets/Marketing/Message.svg';
import UserIcon from '@/assets/Marketing/User.svg';
import { cnMerge } from '@/utils/cnMerge';
import AddPlusIcon from '@/assets/Marketing/AddPlus.svg';
import { toast } from '@/utils/toast';

interface TriggerFlow {
    id: string;
    title: string;
    description: string;
    icons: string[]; // Array of 3 icons per card
    campaignType: 'EMAIL' | 'SMS';
    isFromScratch?: boolean; // Special styling for "Build it from scratch"
}

// Default icon sets for different template types
const getDefaultIcons = (name: string): string[] => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('welcome') || lowerName.includes('new')) {
        return [UserIcon, EnvelopeIcon, CampaignIcon];
    }
    if (lowerName.includes('gift')) {
        return [GiftBoxIcon, ClockIcon, CampaignIcon];
    }
    if (lowerName.includes('inactive') || lowerName.includes('win back')) {
        return [ClockIcon, UserIcon, CampaignIcon];
    }
    if (lowerName.includes('birthday') || lowerName.includes('birth')) {
        return [CakeIcon, UserIcon, CampaignIcon];
    }
    if (lowerName.includes('loyal') || lowerName.includes('reward')) {
        return [CrownIcon, CurrencyIcon, CampaignIcon];
    }
    if (lowerName.includes('missed') || lowerName.includes('appointment')) {
        return [CalendarIcon, CloseCircleIcon, CampaignIcon];
    }
    if (lowerName.includes('review')) {
        return [CalendarIcon, CheckIcon, MessageIcon];
    }
    // Default icons
    return [UserIcon, EnvelopeIcon, CampaignIcon];
};

// Map API template to TriggerFlow format
const mapApiTemplateToTriggerFlow = (apiTemplate: any): TriggerFlow => {
    return {
        id: apiTemplate.id,
        title: apiTemplate.name || 'Untitled Template',
        description: apiTemplate.description || `${apiTemplate.name} - Trigger flow template`,
        icons: getDefaultIcons(apiTemplate.name),
        campaignType: apiTemplate.campaignType === 'SMS' ? 'SMS' : 'EMAIL',
    };
};

export default function SelectTriggerFlow() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const api = getApi();

    // Fetch trigger templates from API
    const { data: templatesData, isLoading } = useQuery({
        queryKey: ['triggerTemplates'],
        queryFn: () =>
            api.getApiTriggerTemplates().catch((error) => {
                console.error('Error fetching trigger templates:', error);
                toast.error(t('Marketing.ErrorLoadingTriggerTemplates'));
            }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });

    // Build trigger flows from API data + hardcoded "Build from scratch" option
    const triggerFlows: TriggerFlow[] = [
        // Map API templates to TriggerFlow format
        ...(templatesData?.campaigns?.map(mapApiTemplateToTriggerFlow) || []),
        // Always include "Build it from scratch" option
        {
            id: 'build_from_scratch',
            title: t('Marketing.BuildItFromScratch'),
            description: '',
            icons: [],
            campaignType: 'EMAIL',
            isFromScratch: true,
        },
    ];

    const handleFlowClick = (flow: TriggerFlow) => {
        dispatch(resetCampaignForm());

        // Special handling for "Build it from scratch" - redirect to trigger builder
        if (flow.id === 'build_from_scratch' || flow.isFromScratch) {
            navigate('/marketing/trigger-flows/builder');
            return;
        }

        // For API templates, navigate to create NEW trigger flow from template
        if (flow.id && flow.id !== 'build_from_scratch') {
            navigate(`/marketing/trigger-flows/${flow.id}?fromTemplate=true`);
            return;
        }

        // Redirect based on campaign type (fallback for hardcoded flows)
        if (flow.campaignType === 'EMAIL') {
            navigate('/marketing/email-campaigns/create#step1');
        } else if (flow.campaignType === 'SMS') {
            dispatch(setCampaignType(PostApiCampaignsBodyCampaignType.SMS));
            navigate('/marketing/sms-campaigns/create#step1');
        } else {
            // Default to email if no type specified
            navigate('/marketing/email-campaigns/create#step1');
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto scrollbar-hidden">
            {/* Breadcrumbs */}
            <div className="mb-6 mt-4">
                <RadixBreadcrumbs
                    items={[
                        {
                            label: t('Marketing.Account'),
                            href: '/marketing/trigger-flows',
                            onClick: () => navigate('/marketing/trigger-flows'),
                        },
                        {
                            label: t('Marketing.SelectTriggerFlow'),
                            isCurrentPage: true,
                        },
                    ]}
                    startSeparator
                    startSeparatorClassName="rotate-180"
                    separatorClassName="rotate-180"
                />
            </div>

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-lg font-semibold text-text-primary m-0 leading-tight">
                    {t('Marketing.ChooseATriggerFlow')}
                </h1>
                <p className="text-sm text-text-secondary m-0 leading-relaxed ">
                    {t('Marketing.SelectFromReadyMadeTriggerFlows')}
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20 min-h-[60dvh]">
                    <RadixSpinner />
                </div>
            )}

            {/* Trigger Flow Cards Grid - 3 columns (3x3) */}
            {!isLoading && (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-6 w-full">
                    {triggerFlows.map((flow) => (
                        <RadixCard
                            key={flow.id}
                            onClick={() => handleFlowClick(flow)}
                            className={cnMerge(
                                'h-full flex flex-col',
                                flow.isFromScratch
                                    ? 'border-2 border-dashed border-primary-500'
                                    : 'border border-solid border-border-default hover:shadow-md p-4',
                            )}
                        >
                            <div className="flex flex-col h-full flex-grow">
                                {/* Icons Section */}
                                {flow.isFromScratch ? (
                                    <div className="flex items-center justify-center flex-col h-full">
                                        <img src={AddPlusIcon} alt="Add Plus" className="w-5 h-5 mb-4" />
                                        <p className="text-center text-primary-500 font-regular text-lg leading-tight">
                                            {flow.title}
                                        </p>
                                    </div>
                                ) : (
                                    <RadixBreadcrumbs
                                        className="w-full items-center"
                                        items={flow.icons.map((icon: string) => ({
                                            label: (<img src={icon} alt="" className="w-5 h-5" />) as unknown as string,
                                            href: '#',
                                        }))}
                                        separatorClassName="h-5 w-3 mb-1"
                                    />
                                )}

                                {!flow.isFromScratch && <span className="h-[1px] w-full bg-border-default mt-2" />}
                                {/* Title */}
                                {!flow.isFromScratch && (
                                    <h3
                                        className={cnMerge(
                                            'text-base mb-3 leading-6',
                                            'text-left text-text-primary font-medium',
                                            'line-clamp-2',
                                        )}
                                    >
                                        {flow.title}
                                    </h3>
                                )}

                                {/* Description */}
                                {flow.description && (
                                    <p className="text-sm text-text-secondary text-left leading-relaxed flex-grow">
                                        {flow.description}
                                    </p>
                                )}
                            </div>
                        </RadixCard>
                    ))}
                </div>
            )}
        </div>
    );
}
