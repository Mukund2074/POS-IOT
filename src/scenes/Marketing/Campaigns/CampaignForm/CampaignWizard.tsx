import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { t } from 'i18next';
import { toast } from '@/utils/toast';
import {
    setCurrentStep,
    resetCampaignForm,
    setStepCompleted,
    setCreatedCampaign,
    setEditingCampaignId,
    loadCampaignData,
    setIsCreating,
    setCampaignType,
    CreatedCampaign,
} from '@/redux/slices/Marketing/campaigns';
import { RadixBreadcrumbs, RadixSpinner } from '@/components/radix';
import WizardFooter from './WizardFooter';
import Step1Details from './steps/Step1Details';
import Step2CustomerGroup from './steps/Step2CustomerGroup';
import Step3Content from './steps/Step3Content';
import Step4Sender from './steps/Step4Sender';
import Step5Summary from './steps/Step5Summary';
import Stepper from './Stepper';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateMarketingQueries } from '@/hooks/api/marketing';
import {
    prepareCampaignPayload,
    prepareCampaignUpdatePayload,
    mapApiResponseToCampaignData,
    updateStepData,
} from '@/redux/slices/Marketing/campaigns';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import { api } from '@/utils/Api/POS';
import { useMediaQuery } from '@/hooks/shared';
import ChevronRightIcon from '@/assets/Marketing/ChevronRight.svg';
import { buildDefaultEmailTemplate } from '@/data/Marketing/DefaultTemplates';

interface CampaignWizardProps {
    campaignType: PostApiCampaignsBodyCampaignType;
    baseRoute: string;
    breadcrumbAccountLabel: string;
    breadcrumbCreateLabel: string;
    breadcrumbEditLabel: string;
    titleCreateLabel: string;
    titleEditLabel: string;
    descriptionCreateLabel: string;
    descriptionEditLabel: string;
    cannotEditTriggeredLabel: string;
    createSuccessLabel: string;
    createErrorLabel: string;
}

export default function CampaignWizard(props: CampaignWizardProps) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id?: string }>();
    const campaignsState = useSelector((s: any) => s.campaigns);
    const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
    const [canEditCampaign, setCanEditCampaign] = useState(true);
    const isDesktop = useMediaQuery('(min-width: 960px)'); // md breakpoint from tailwind config
    const campaignId = id && id !== 'create' ? id : null;
    const isEditing = Boolean(campaignId);
    const activeStep = campaignsState.currentStep || 1;
    const settings = useSelector((state: any) => state.settings.data);
    const profileImageUrl = settings?.profile?.profile_image;
    const imgUrl = profileImageUrl ? `${process.env.REACT_APP_IMG_URL || ''}${profileImageUrl}` : undefined;
    const defaultEmailContent =
        props.campaignType === PostApiCampaignsBodyCampaignType.EMAIL ? buildDefaultEmailTemplate(imgUrl) : '';

    const hasExistingData = useMemo(
        () =>
            Boolean(
                campaignsState.campaignData?.step1?.campaignName ||
                    campaignsState.campaignData?.step2?.selectedGroups?.length ||
                    campaignsState.campaignData?.step2?.selectedGroup ||
                    campaignsState.campaignData?.step3?.content ||
                    campaignsState.currentStep > 0,
            ),
        [campaignsState],
    );

    const updateHash = useCallback(
        (step: number) => {
            const hash = `#step${step}`;
            if (location.hash !== hash) {
                navigate(`${location.pathname}${hash}`, { replace: true });
            }
        },
        [location.pathname, location.hash, navigate],
    );

    const goHome = useCallback(() => {
        dispatch(resetCampaignForm());
        dispatch(setEditingCampaignId(null));
        navigate(props.baseRoute);
    }, [dispatch, navigate, props.baseRoute]);

    /* ------------------------------ Load Campaign ------------------------------ */
    useEffect(() => {
        if (!isEditing) {
            setCanEditCampaign(true);

            // Clear editingCampaignId when on /create route (new campaign)
            if (id === 'create' || !id) {
                dispatch(setEditingCampaignId(null));
            }

            // Reset form when on /create route or when campaign type changes
            if (
                campaignsState.campaignType !== props.campaignType ||
                id === 'create' ||
                !id ||
                (!hasExistingData && !campaignsState.editingCampaignId)
            ) {
                dispatch(resetCampaignForm());
                const step3Data: { content: string; sender?: string } = { content: defaultEmailContent };
                if (props.campaignType === PostApiCampaignsBodyCampaignType.SMS) {
                    step3Data.sender = (settings?.profile?.name ?? '').slice(0, 11);
                }
                dispatch(updateStepData({ step: 'step3', data: step3Data }));
            }

            dispatch(setCampaignType(props.campaignType));
            return;
        }

        const load = async () => {
            try {
                setIsLoadingCampaign(true);
                setCanEditCampaign(true);

                const data = await api.getApiCampaignsId(campaignId!);
                const isDraftOrScheduled =
                    data.campaignStatus?.toUpperCase() === 'DRAFT' ||
                    data.campaignStatus?.toUpperCase() === 'SCHEDULED';
                // If campaign is not draft/scheduled, we still allow opening it in read-only mode.
                // Editing actions will be hidden in the footer/stepper.
                setCanEditCampaign(isDraftOrScheduled);

                dispatch(setEditingCampaignId(campaignId));
                dispatch(loadCampaignData(mapApiResponseToCampaignData(data)));
                dispatch(
                    setCampaignType((data.campaignType as PostApiCampaignsBodyCampaignType) || props.campaignType),
                );

                dispatch(
                    setCreatedCampaign({
                        ...data,
                    } as CreatedCampaign),
                );

                dispatch(setCurrentStep(5));
                updateHash(5);
            } catch {
                goHome();
            } finally {
                setIsLoadingCampaign(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId]);

    /* ------------------------------ Hash Sync ------------------------------ */
    // Sync hash to currentStep (when step changes, update hash)
    useEffect(() => {
        // Read-only mode: always keep the wizard on step 5 (summary)
        if (isEditing && !canEditCampaign) {
            if (activeStep !== 5) {
                dispatch(setCurrentStep(5));
            }
            updateHash(5);
            return;
        }
        if (activeStep >= 1 && activeStep <= 5) {
            updateHash(activeStep);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep]);

    // Sync currentStep to hash (when hash changes, update step)
    useEffect(() => {
        // Read-only mode: prevent navigating to step 1-4 via URL hash manipulation
        if (isEditing && !canEditCampaign) {
            if (location.hash !== '#step5') {
                updateHash(5);
            }
            if (activeStep !== 5) {
                dispatch(setCurrentStep(5));
            }
            return;
        }
        const match = location.hash.match(/^#step(\d)$/);
        if (match) {
            const step = Number(match[1]);
            if (step !== activeStep && step >= 1 && step <= 5) {
                dispatch(setCurrentStep(step));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.hash]);

    const step2Data = campaignsState.campaignData?.step2;

    const isStep2Valid = useMemo(() => {
        // if Booking in choosen intervals and not seleed employee || fromdate || todate || treatments return false
        if (
            step2Data?.selectedGroup?.includes('booking') &&
            (!step2Data?.filters?.employee ||
                !step2Data?.filters?.fromDate ||
                !step2Data?.filters?.toDate ||
                !step2Data?.filters?.treatments)
        ) {
            return false;
        }
        return true;
    }, [step2Data]);

    /* ------------------------------ Step Validation ------------------------------ */
    const validators = {
        1: () => campaignsState.campaignData?.step1?.campaignName?.trim(),
        2: () => isStep2Valid,
        3: () => {
            const { subject = '', content = '' } = campaignsState.campaignData?.step3 || {};
            const text = content.replace(/<[^>]*>/g, '').trim();
            return props.campaignType === PostApiCampaignsBodyCampaignType.SMS
                ? text.length > 0
                : subject.trim() && text;
        },
        4: () => {
            const { isManualTrigger, sendDateTime } = campaignsState.campaignData?.step4 || {};
            return isManualTrigger || Boolean(sendDateTime?.trim());
        },
    };

    const next = async () => {
        // Read-only mode: do not allow navigating into steps 1-4
        if (isEditing && !canEditCampaign) return;
        if (!validators[activeStep as keyof typeof validators]?.()) return;

        dispatch(setStepCompleted({ step: activeStep, completed: true }));

        if (activeStep < 4) {
            dispatch(setCurrentStep(activeStep + 1));
            updateHash(activeStep + 1);
            return;
        }
        try {
            dispatch(setIsCreating(true));
            const response = isEditing
                ? await api.putApiCampaignsId(campaignId!, prepareCampaignUpdatePayload(campaignsState))
                : await api.postApiCampaigns(prepareCampaignPayload(campaignsState));

            toast.success(props.createSuccessLabel);

            // Get the campaign ID from response (for create) or use existing campaignId (for update)
            const finalCampaignId = response?.id || campaignId;

            if (!finalCampaignId) {
                console.error('No campaign ID found in response:', response);
                toast.error('Failed to get campaign ID from response');
                return;
            }

            // Replace '/create' with the campaign ID in the current pathname
            let newPath = location.pathname.replace(/\/create$/, `/${finalCampaignId}`);

            // Fallback: if replacement didn't work (pathname doesn't contain /create), use baseRoute
            if (newPath === location.pathname && !isEditing) {
                newPath = `${props.baseRoute}/${finalCampaignId}`;
            }

            const finalUrl = `${newPath}#step5`;
            dispatch(setEditingCampaignId(finalCampaignId));
            dispatch(setCampaignType(props.campaignType));

            // Invalidate cache and fetch fresh campaign data
            invalidateMarketingQueries(queryClient);

            // Fetch fresh campaign data by ID to get complete updated data
            const freshCampaignData = await api.getApiCampaignsId(finalCampaignId);

            // Map and load the fresh campaign data into Redux
            dispatch(loadCampaignData(mapApiResponseToCampaignData(freshCampaignData)));
            dispatch(setCreatedCampaign(freshCampaignData as any));

            navigate(finalUrl, { replace: true });
        } catch (e: any) {
            toast.error(e?.response?.data?.message || props.createErrorLabel);
        } finally {
            dispatch(setIsCreating(false));
        }
    };

    if (isLoadingCampaign) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <RadixSpinner />
                <span className="mt-4 text-text-secondary text-lg font-medium">{t('Common.Loading')}</span>
            </div>
        );
    }

    return (
        <div className=" w-full">
            <RadixBreadcrumbs
                startSeparator={<img src={ChevronRightIcon} alt="arrow-left" className="rotate-180" />}
                items={[
                    { label: props.breadcrumbAccountLabel, onClick: goHome },
                    {
                        label: isEditing
                            ? canEditCampaign
                                ? props.breadcrumbEditLabel
                                : t('Marketing.CampaignSummary')
                            : props.breadcrumbCreateLabel,
                        isCurrentPage: true,
                    },
                ]}
                separatorClassName="rotate-180"
            />

            <div className="flex gap-6 items-start w-full  ">
                <div className={`${isDesktop ? 'w-[65%]' : 'min-w-full'}`}>
                    <h1 className="text-xl font-semibold text-text-primary m-0 mt-3">
                        {isEditing
                            ? canEditCampaign
                                ? props.titleEditLabel
                                : t('Marketing.CampaignSummary')
                            : props.titleCreateLabel}
                    </h1>
                    <p className="text-sm text-text-secondary m-0">
                        {isEditing ? props.descriptionEditLabel : props.descriptionCreateLabel}
                    </p>

                    {activeStep === 5 ? (
                        <Step5Summary canEditCampaign={canEditCampaign} />
                    ) : (
                        <div className="space-y-3 mt-6 w-full">
                            <Step1Details />
                            <Step2CustomerGroup isCurrentStep={activeStep === 2} isDisabled={activeStep !== 2} />
                            <Step3Content isCurrentStep={activeStep === 3} isDisabled={activeStep !== 3} />
                            <Step4Sender isCurrentStep={activeStep === 4} isDisabled={activeStep !== 4} />
                        </div>
                    )}

                    <div className="mt-3 w-full md:w-auto">
                        <WizardFooter onNext={next} canEditCampaign={canEditCampaign} />
                    </div>
                </div>

                {isDesktop && (
                    <div className="w-[35%] justify-center items-center">
                        <Stepper hideCampaignActions={!canEditCampaign} />
                    </div>
                )}
            </div>
        </div>
    );
}
