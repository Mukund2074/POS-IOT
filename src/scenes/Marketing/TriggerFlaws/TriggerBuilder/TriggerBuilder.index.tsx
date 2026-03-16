import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { toast } from '@/utils/toast';
import { useMediaQuery } from '@/hooks/shared';
import TriggerLibrary from './components/TriggerLibrary';
import TriggerPlayground from './components/TriggerPlayground';
import { type ConditionComponentRef } from './components/ConditionRenderer';
import TriggerConfiguration, { type TriggerConfigurationRef } from './components/TriggerConfiguration';
import {
    setCreatedCampaign,
    setEditingCampaignId,
    setCampaignType,
    TriggerCondition,
    TriggerGroup,
} from '@/redux/slices/Marketing/campaigns';
import {
    setSelectedTriggerCondition,
    addConditionToGroup,
    loadTriggerFlowData,
    resetTriggerFlow,
    mapApiResponseToTriggerFlowData,
    setIsSaving,
    setIsActivating,
    prepareTriggerFlowPayload,
    type TriggerFlowState,
} from '@/redux/slices/Marketing/triggerFlow';
import { MarketingConditionSchema } from '@/data/Marketing/MarketingCondition';
import { api } from '@/utils/Api/POS';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import { t } from 'i18next';
import { RadixButton, RadixDrawer, RadixDialog, RadixDropdown, RadixSpinner } from '@/components/radix';
import ChevronRightIconSvg from '@/assets/Marketing/ChevronRight.svg';
import DeleteIcon from '@/assets/Delete.svg';
import { LuLibrary } from 'react-icons/lu';
import { HiDotsVertical } from 'react-icons/hi';
import { cnMerge } from '@/utils/cnMerge';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateMarketingQueries } from '@/hooks/api/marketing';
import { type CreatedCampaign } from '@/redux/slices/Marketing/campaigns';

export default function TriggerBuilder() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const params = useParams<{ id?: string }>();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const isDesktop = useMediaQuery('(min-width: 960px)');

    // Shared ref for validating whichever "mode" form is currently mounted
    // (ConditionRenderer / TriggerSettingForm / ContentBoxForm / consent)
    const conditionRef = useRef<ConditionComponentRef | null>(null);
    const configRef = useRef<TriggerConfigurationRef | null>(null);
    const [draggedCondition, setDraggedCondition] = useState<MarketingConditionSchema | null>(null);
    const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const triggerFlowData = useSelector((state: any) => state.triggerFlow?.triggerFlowData);
    const triggerFlowState = useSelector((state: any) => state.triggerFlow);
    const campaignsState = useSelector((state: any) => state.campaigns);
    const triggerGroups = useMemo(() => triggerFlowData?.triggerGroups || [], [triggerFlowData?.triggerGroups]);
    const selectedConditionId = triggerFlowData?.selectedTriggerConditionId;
    // Check if creating from template - if so, ignore URL ID to ensure we create new campaign
    const isFromTemplate = searchParams.get('fromTemplate') === 'true';
    const campaignIdFromUrl = isFromTemplate ? null : params.id;
    const campaignId = campaignIdFromUrl || campaignsState.editingCampaignId || campaignsState.createdCampaign?.id;

    // Get drawer states from URL parameters
    const libraryDrawerOpen = searchParams.get('library') === 'open';
    // Settings drawer opens on mobile when a condition is selected, but NOT for content-box
    const settingsDrawerOpen =
        !isDesktop &&
        selectedConditionId !== null &&
        selectedConditionId !== 'content-box' &&
        searchParams.get('settings') !== 'open';

    // Form validation for activation
    const isFormValid = useMemo(() => {
        const triggerSetting = triggerFlowData?.triggerSetting;
        const consentValue = triggerFlowData?.consent?.value ?? null;
        const content = triggerFlowData?.content;
        const triggerType = triggerSetting?.triggerType || 'EMAIL';

        const hasSettings = triggerSetting && triggerSetting.name && triggerSetting.triggerType;
        const hasConsent = consentValue !== null && consentValue !== undefined && typeof consentValue === 'boolean';
        const hasContent =
            content &&
            content.content &&
            content.content.trim() !== '' &&
            (triggerType === 'SMS' || (content.sender && content.sender.trim() !== ''));
        const hasTriggers =
            triggerGroups &&
            triggerGroups.length > 0 &&
            triggerGroups.some((group: TriggerGroup) => group.conditions && group.conditions.length > 0);

        return hasSettings && hasConsent && hasContent && hasTriggers;
    }, [triggerFlowData, triggerGroups]);

    // Handler functions for mobile menu
    const handleSaveAsDraft = async () => {
        try {
            dispatch(setIsSaving(true));
            const payload = prepareTriggerFlowPayload(triggerFlowState as TriggerFlowState);

            let response;
            if (campaignId) {
                response = await api.putApiCampaignsId(campaignId, payload);
            } else {
                response = await api.postApiCampaigns(payload);
            }

            if (response && response.id) {
                dispatch(setCreatedCampaign(response as CreatedCampaign));
                dispatch(setEditingCampaignId(response.id));
                const newUrl = `/marketing/trigger-flows/${response.id}${location.search}`;
                navigate(newUrl, { replace: true });
                invalidateMarketingQueries(queryClient);
                toast.success(t('Marketing.TriggerSavedAsDraftSuccessfully'));
            }
        } catch (error: any) {
            console.error('[Trigger Builder] Error saving as draft:', error);
            const errorMessage =
                error?.response?.data?.message || error?.message || t('Marketing.TriggerSaveAsDraftError');
            toast.error(errorMessage);
        } finally {
            dispatch(setIsSaving(false));
        }
    };

    const handleActivateTrigger = async () => {
        if (!isFormValid) {
            toast.error(t('Marketing.PleaseFixValidationErrors'));
            return;
        }

        try {
            dispatch(setIsActivating(true));
            let finalCampaignId = campaignId;

            if (!finalCampaignId) {
                const payload = prepareTriggerFlowPayload(triggerFlowState as TriggerFlowState);
                const draftResponse = await api.postApiCampaigns(payload);
                if (draftResponse && draftResponse.id) {
                    finalCampaignId = draftResponse.id;
                    dispatch(setCreatedCampaign(draftResponse as CreatedCampaign));
                    dispatch(setEditingCampaignId(draftResponse.id));
                    invalidateMarketingQueries(queryClient);
                } else {
                    throw new Error('Failed to create draft');
                }
            }

            const response = await api.postApiCampaignsIdTrigger(finalCampaignId);
            if (response) {
                navigate(`/marketing/trigger-flows`, { replace: true });
                invalidateMarketingQueries(queryClient);
                toast.success(t('Marketing.TriggerActivatedSuccessfully'));
            }
        } catch (error: any) {
            console.error('[Trigger Builder] Error activating trigger:', error);
            const errorMessage =
                error?.response?.data?.message || error?.message || t('Marketing.TriggerActivationError');
            toast.error(errorMessage);
        } finally {
            dispatch(setIsActivating(false));
        }
    };

    const handleDeleteCampaign = async () => {
        if (!campaignId) return;

        try {
            setIsDeleting(true);
            await api.deleteApiCampaignsId(campaignId);
            invalidateMarketingQueries(queryClient);
            toast.success(t('Marketing.CampaignDeletedSuccessfully'));
            navigate('/marketing/trigger-flows', { replace: true });
        } catch (error: any) {
            console.error('[Trigger Builder] Error deleting campaign:', error);
            const errorMessage = error?.response?.data?.message || error?.message || t('Marketing.CampaignDeleteError');
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    // Get drawer title based on current mode
    const getDrawerTitle = () => {
        if (selectedConditionId === 'consent') {
            return t('Marketing.ChooseTrigger');
        }
        if (selectedConditionId === 'trigger-setting') {
            return t('Marketing.SettingDetails');
        }
        if (selectedConditionId === 'content-box') {
            return t('Marketing.ContentBox');
        }
        if (selectedConditionId) {
            // Find the condition to get its label
            for (const group of triggerGroups) {
                const condition = group.conditions.find((c: any) => c.id === selectedConditionId);
                if (condition) {
                    return t('Marketing.ConfigureTrigger');
                }
            }
        }
        return t('Marketing.TriggerSetting');
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    // Load campaign data when ID is present in URL
    useEffect(() => {
        const campaignId = params.id;

        if (campaignId) {
            const loadCampaign = async () => {
                try {
                    setIsLoadingCampaign(true);
                    dispatch(resetTriggerFlow());
                    // Always reset editing ID - will be set only if NOT creating from template
                    dispatch(setEditingCampaignId(null));

                    const campaignData = await api.getApiCampaignsId(campaignId);
                    if (campaignData) {
                        // Map API response to trigger flow data (separate from campaign steps)
                        const mappedData = mapApiResponseToTriggerFlowData(campaignData);

                        // Only set editing ID if NOT creating from template
                        if (!isFromTemplate) {
                            dispatch(setEditingCampaignId(campaignId));
                        }
                        // Otherwise, keep editingCampaignId as null so it creates new campaign

                        dispatch(loadTriggerFlowData(mappedData));

                        // Set createdCampaign only if NOT creating from template
                        if (campaignData.id && !isFromTemplate) {
                            dispatch(
                                setCreatedCampaign({
                                    id: campaignData.id,
                                    outletId: campaignData.outletId,
                                    name: campaignData.name || '',
                                    description: campaignData.description || null,
                                    messageType: campaignData.messageType || '',
                                    campaignType: campaignData.campaignType || '',
                                    campaignStatus: campaignData.campaignStatus || '',
                                    createdAt: campaignData.createdAt || '',
                                    updatedAt: campaignData.updatedAt || '',
                                    recipientCount:
                                        (campaignData as any).totalRecipients ??
                                        (campaignData as any).recipientCount ??
                                        0,
                                }),
                            );
                        }

                        const apiCampaignType =
                            (campaignData.campaignType as PostApiCampaignsBodyCampaignType) ||
                            PostApiCampaignsBodyCampaignType.TRIGGER;
                        dispatch(setCampaignType(apiCampaignType));
                    }
                } catch (error) {
                    console.error('Error fetching campaign details:', error);
                    toast.error(t('Marketing.CampaignsCreateError'));
                    dispatch(resetTriggerFlow());
                    dispatch(setEditingCampaignId(null));
                    navigate('/marketing/trigger-flows');
                } finally {
                    setIsLoadingCampaign(false);
                }
            };

            loadCampaign();
        } else {
            // Reset trigger flow for new campaigns
            dispatch(setEditingCampaignId(null));
            dispatch(setCampaignType(PostApiCampaignsBodyCampaignType.TRIGGER));
            dispatch(resetTriggerFlow());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id, isFromTemplate]);

    // Sync URL with state
    useEffect(() => {
        const groupIndex = searchParams.get('g');
        const conditionId = searchParams.get('c');

        // Handle consent mode (special case)
        if (conditionId === 'consent') {
            dispatch(setSelectedTriggerCondition('consent'));
            return;
        }

        // Handle trigger setting mode (special case)
        if (conditionId === 'trigger-setting') {
            dispatch(setSelectedTriggerCondition('trigger-setting'));
            return;
        }

        // Handle content box mode (special case) - don't open drawer on mobile
        if (conditionId === 'content-box') {
            dispatch(setSelectedTriggerCondition('content-box'));
            // Content box mode should not open drawer on mobile
            return;
        }

        if (groupIndex !== null && conditionId !== null) {
            const groupIdx = parseInt(groupIndex, 10);

            if (groupIdx >= 0 && groupIdx < triggerGroups.length) {
                const group = triggerGroups[groupIdx];
                // Try to find by full ID first (e.g., "c10-0"), then by condition_render_id
                let condition = group.conditions.find((c: any) => c.id === conditionId);

                if (!condition) {
                    // Fallback: find by condition_render_id (for backward compatibility)
                    const conditionIdNum = parseInt(conditionId, 10);
                    if (!isNaN(conditionIdNum)) {
                        condition = group.conditions.find(
                            (c: any) => c.condition_render_id === conditionIdNum || c.conditionId === conditionIdNum,
                        );
                    }
                }

                if (condition) {
                    dispatch(setSelectedTriggerCondition(condition.id));
                    // On mobile, settings drawer opens automatically when condition is selected (via selectedConditionId)
                } else {
                    dispatch(setSelectedTriggerCondition(null));
                }
            } else {
                dispatch(setSelectedTriggerCondition(null));
            }
        } else {
            dispatch(setSelectedTriggerCondition(null));
        }
    }, [searchParams, dispatch, triggerGroups, isDesktop]);

    const handleConditionSelect = async (groupId: string, conditionId: string) => {
        await configRef.current?.persistCurrentConditionToRedux?.();

        // Find the condition and group index
        let groupIndex: number | null = null;

        for (let i = 0; i < triggerGroups.length; i++) {
            if (triggerGroups[i].id === groupId) {
                groupIndex = i;
                break;
            }
        }

        // Update URL with simple IDs - use the condition's internal ID directly
        const newSearchParams = new URLSearchParams(searchParams);
        if (groupIndex !== null) {
            newSearchParams.set('g', String(groupIndex));
        }
        // Use the condition's internal ID (e.g., "c10-0") instead of just schema ID
        newSearchParams.set('c', conditionId);
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over) return;

        // Check if dropped on a group
        if (over.id.toString().startsWith('group-')) {
            const groupId = over.id.toString().replace('group-', '');
            const draggedData = active.data.current;

            if (draggedData?.type === 'condition' && draggedData?.condition) {
                const conditionSchema = draggedData.condition as MarketingConditionSchema;

                // Find the group to get the next condition index
                const group = triggerGroups.find((g: TriggerGroup) => g.id === groupId);

                if (!group) return;

                // Check if this condition already exists in the group
                // Use condition_render_id as it's unique for all conditions
                const conditionRenderId = conditionSchema.condition_render_id;
                const alreadyExists = group.conditions.some((existingCondition: TriggerCondition) => {
                    const existingRenderId = existingCondition.condition_render_id;
                    return existingRenderId === conditionRenderId;
                });

                if (alreadyExists) {
                    toast.error(t('Marketing.ConditionAlreadyExists'));
                    return;
                }

                const conditionIndex = group.conditions.length;

                // Create a new trigger condition instance with unique ID based on condition_render_id
                const renderId = conditionSchema.condition_render_id ?? conditionSchema.conditionId;
                const newCondition: TriggerCondition = {
                    id: `c${renderId}-${conditionIndex}`,
                    ...conditionSchema,
                    field: conditionSchema.field || '',
                    fieldValue: undefined,
                    entity: '',
                    parentEntity: null,
                    jsonPath: [],
                    aggregate_fn: null,
                    aggregate_group: null,
                    logical_group: 'OR',
                };

                dispatch(addConditionToGroup({ groupId, condition: newCondition }));
            }
        }
    };

    // Handle click-to-add from library drawer (mobile)
    const handleConditionAdd = (condition: MarketingConditionSchema) => {
        // Find the first group or create logic to add to a specific group
        // For now, add to the first group if it exists
        if (triggerGroups.length === 0) {
            toast.error(t('Marketing.NoTriggerGroupAvailable'));
            // Close library drawer by removing URL param
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('library');
            navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
            return;
        }

        const group = triggerGroups[0]; // Add to first group by default

        // Check if condition already exists
        const conditionRenderId = condition.condition_render_id;
        const alreadyExists = group.conditions.some((existingCondition: TriggerCondition) => {
            const existingRenderId = existingCondition.condition_render_id;
            return existingRenderId === conditionRenderId;
        });

        if (alreadyExists) {
            toast.error(t('Marketing.ConditionAlreadyExists'));
            return;
        }

        const conditionIndex = group.conditions.length;
        const renderId = condition.condition_render_id ?? condition.conditionId;
        const newCondition: TriggerCondition = {
            id: `c${renderId}-${conditionIndex}`,
            ...condition,
            field: condition.field || '',
            fieldValue: undefined,
            entity: '',
            parentEntity: null,
            jsonPath: [],
            aggregate_fn: null,
            aggregate_group: null,
            logical_group: 'OR',
        };

        dispatch(addConditionToGroup({ groupId: group.id, condition: newCondition }));
        // Close library drawer by removing URL param
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('library');
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
        toast.success(t('Marketing.ConditionAdded'));
    };

    if (isLoadingCampaign) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-lg font-medium text-text-primary flex items-center gap-2">
                    <RadixSpinner size="md" variant="primary" />
                    {t('Common.Loading')}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background-subtle w-full">
            <DndContext
                sensors={sensors}
                onDragStart={(event) => {
                    const draggedData = event.active.data.current;
                    if (draggedData?.type === 'condition' && draggedData?.condition) {
                        setDraggedCondition(draggedData.condition as MarketingConditionSchema);
                    } else {
                        setDraggedCondition(null);
                    }
                }}
                onDragEnd={(event) => {
                    setDraggedCondition(null);
                    handleDragEnd(event);
                }}
            >
                <div className="flex items-center overflow-hidden h-full w-full">
                    {/* Column 1: Trigger Library */}
                    {isDesktop && (
                        <div className="overflow-hidden w-full h-full max-w-[350px] bg-background-paper">
                            <TriggerLibrary />
                        </div>
                    )}
                    {/* Column 2: Trigger Playground */}
                    <div className="h-full md:px-4 relative w-full">
                        <div
                            className={cnMerge(
                                'flex items-center justify-between p-1 md:p-4 relative',
                                !isDesktop && 'bg-background-paper border-b border-border-default',
                            )}
                        >
                            {isDesktop && (
                                <RadixButton
                                    onClick={() => navigate(-1)}
                                    iconOnly
                                    className="bg-transparent border-none gap-2"
                                >
                                    <img
                                        src={ChevronRightIconSvg}
                                        alt="Chevron Right"
                                        className="w-4 h-4 text-text-primary rotate-180"
                                    />
                                    <p className="text-sm leading-5 font-normal text-text-primary whitespace-nowrap">
                                        {t('Common.Back')}
                                    </p>
                                </RadixButton>
                            )}
                            {!isDesktop && (
                                <button
                                    onClick={() => {
                                        const newSearchParams = new URLSearchParams(searchParams);
                                        newSearchParams.set('library', 'open');
                                        navigate(`${location.pathname}?${newSearchParams.toString()}`, {
                                            replace: true,
                                        });
                                    }}
                                    type="button"
                                    className={cnMerge(
                                        'bg-transparent',
                                        'absolute left-2 !p-[2px] my-1',
                                        'focus:outline-none focus:ring-0',
                                        'text-text-secondary',
                                        ' border-solid border-border-default border-[1px] rounded-sm',
                                    )}
                                    title={t('Marketing.ChooseTrigger')}
                                >
                                    <LuLibrary size={20} />
                                </button>
                            )}

                            {!isDesktop && campaignsState.createdCampaign?.recipientCount !== undefined && (
                                <p className="font-medium bg-background-subtle my-1 p-2 rounded-md mx-auto text-center">
                                    {t('Marketing.EmailCampaignsTotalReceivers')}{' '}
                                    {campaignsState.createdCampaign?.recipientCount}
                                </p>
                            )}
                            {!isDesktop && (
                                <RadixDropdown
                                    trigger={
                                        <button
                                            type="button"
                                            className={cnMerge(
                                                'bg-transparent',
                                                'absolute right-2 p-[2px] my-1',
                                                'focus:outline-none focus:ring-0',
                                                'text-text-secondary',
                                                ' border-solid border-border-default border-[1px] rounded-sm',
                                            )}
                                            title={t('Marketing.Actions')}
                                        >
                                            <HiDotsVertical size={20} />
                                        </button>
                                    }
                                    items={[
                                        {
                                            label: (
                                                <RadixButton
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        triggerFlowState?.isSaving || triggerFlowState?.isActivating
                                                    }
                                                    className="w-full justify-start"
                                                >
                                                    {triggerFlowState?.isSaving ? (
                                                        <>
                                                            <RadixSpinner
                                                                size="sm"
                                                                variant="primary"
                                                                className="mr-2"
                                                            />
                                                            {t('Common.Loading')}
                                                        </>
                                                    ) : campaignId ? (
                                                        t('Common.Save')
                                                    ) : (
                                                        t('Marketing.SaveAsDraft')
                                                    )}
                                                </RadixButton>
                                            ),
                                            onClick: () => handleSaveAsDraft(),
                                            disabled: triggerFlowState?.isSaving || triggerFlowState?.isActivating,
                                        },
                                        {
                                            label: (
                                                <RadixButton
                                                    variant="primary"
                                                    size="sm"
                                                    disabled={
                                                        !isFormValid ||
                                                        triggerFlowState?.isActivating ||
                                                        triggerFlowState?.isSaving
                                                    }
                                                    className="w-full justify-start bg-primary-500 text-white hover:bg-primary-600"
                                                >
                                                    {triggerFlowState?.isActivating ? (
                                                        <>
                                                            <RadixSpinner size="sm" variant="white" className="mr-2" />
                                                            {t('Common.Loading')}
                                                        </>
                                                    ) : (
                                                        t('Marketing.ActivateTrigger')
                                                    )}
                                                </RadixButton>
                                            ),
                                            onClick: () => handleActivateTrigger(),
                                            disabled:
                                                !isFormValid ||
                                                triggerFlowState?.isActivating ||
                                                triggerFlowState?.isSaving,
                                        },
                                        ...(campaignId
                                            ? [
                                                  {
                                                      separator: true,
                                                  },
                                                  {
                                                      label: (
                                                          <RadixButton
                                                              variant="outline"
                                                              size="sm"
                                                              disabled={
                                                                  isDeleting ||
                                                                  triggerFlowState?.isActivating ||
                                                                  triggerFlowState?.isSaving
                                                              }
                                                              className="w-full justify-start text-error-500 hover:text-error-600 hover:bg-error-50"
                                                          >
                                                              {isDeleting ? (
                                                                  <>
                                                                      <RadixSpinner
                                                                          size="sm"
                                                                          variant="primary"
                                                                          className="mr-2"
                                                                      />
                                                                      {t('Common.Loading')}
                                                                  </>
                                                              ) : (
                                                                  <>
                                                                      <img
                                                                          src={DeleteIcon}
                                                                          alt="Delete"
                                                                          className="w-4 h-4 mr-2"
                                                                      />
                                                                      {t('SpOffers.DelCmp')}
                                                                  </>
                                                              )}
                                                          </RadixButton>
                                                      ),
                                                      onClick: () => setDeleteDialogOpen(true),
                                                      disabled:
                                                          isDeleting ||
                                                          triggerFlowState?.isActivating ||
                                                          triggerFlowState?.isSaving,
                                                  },
                                              ]
                                            : []),
                                    ]}
                                    align="end"
                                    side="bottom"
                                    contentClassName="p-2"
                                    itemClassName="p-0"
                                />
                            )}
                        </div>

                        <div className="max-w-[800px] mx-auto w-full h-[90%] overflow-y-auto scrollbar-hidden pb-20">
                            <TriggerPlayground
                                onConditionSelect={handleConditionSelect}
                                conditionRef={conditionRef}
                                persistBeforeSelectionChange={async () => {
                                    await configRef.current?.persistCurrentConditionToRedux?.();
                                }}
                            />
                        </div>
                    </div>

                    {/* Column 3: Trigger Configuration */}
                    {isDesktop && (
                        <div className="overflow-hidden w-full h-full max-w-[350px] bg-background-paper">
                            <TriggerConfiguration conditionRef={conditionRef} configRef={configRef} />
                        </div>
                    )}
                </div>

                {/* Drag Overlay - Only for Desktop */}
                {isDesktop &&
                    createPortal(
                        <DragOverlay className="z-[9999] pointer-events-none">
                            {draggedCondition ? (
                                <div className="bg-background-subtle flex flex-col p-2 rounded-[6px] border border-primary-500 shadow-lg min-w-[200px] z-50">
                                    <p className="text-sm text-text-primary font-normal m-0 p-0 line-clamp-1 mb-1">
                                        {draggedCondition.condition_label}
                                    </p>
                                    <p className="text-xs text-text-secondary font-normal m-0 p-0 line-clamp-2">
                                        {draggedCondition.description}
                                    </p>
                                </div>
                            ) : null}
                        </DragOverlay>,
                        document.body,
                    )}

                {/* Mobile: Library Side Drawer */}
                {!isDesktop && (
                    <RadixDrawer
                        open={libraryDrawerOpen}
                        onOpenChange={(open) => {
                            const newSearchParams = new URLSearchParams(searchParams);
                            if (open) {
                                newSearchParams.set('library', 'open');
                            } else {
                                newSearchParams.delete('library');
                            }
                            navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
                        }}
                        position="left"
                        showCloseButton={true}
                    >
                        <TriggerLibrary onConditionSelect={handleConditionAdd} clickToAdd={true} />
                    </RadixDrawer>
                )}

                {/* Mobile: Settings Bottom Drawer */}
                {!isDesktop && (
                    <RadixDialog
                        open={settingsDrawerOpen}
                        onOpenChange={(open) => {
                            if (!open) {
                                // Close drawer by clearing condition selection
                                dispatch(setSelectedTriggerCondition(null));
                                const newSearchParams = new URLSearchParams(searchParams);
                                newSearchParams.delete('c');
                                newSearchParams.delete('g');
                                navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
                            }
                        }}
                        title={getDrawerTitle()}
                        position="bottom"
                        showCloseButton={true}
                    >
                        <TriggerConfiguration
                            onClose={() => {
                                dispatch(setSelectedTriggerCondition(null));
                                const newSearchParams = new URLSearchParams(searchParams);
                                newSearchParams.delete('c');
                                newSearchParams.delete('g');
                                navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
                            }}
                            conditionRef={conditionRef}
                            configRef={configRef}
                        />
                    </RadixDialog>
                )}

                {/* Delete Confirmation Dialog */}
                <RadixDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={t('Marketing.EmailCampaignsDeleteConfirmTitle') || t('SpOffers.DelCmp')}
                    description={t('Marketing.EmailCampaignsDeleteConfirmWarning')}
                    descriptionClassName="whitespace-pre-line"
                    footer={
                        <div className="flex justify-end gap-3">
                            <RadixButton
                                onClick={() => setDeleteDialogOpen(false)}
                                variant="outline"
                                size="lg"
                                disabled={isDeleting}
                            >
                                {t('Setting.Cancel')}
                            </RadixButton>
                            <RadixButton
                                onClick={handleDeleteCampaign}
                                variant="danger"
                                size="lg"
                                disabled={isDeleting || triggerFlowState?.isActivating || triggerFlowState?.isSaving}
                            >
                                {isDeleting ? <RadixSpinner size="sm" variant="white" /> : t('SpOffers.DelCmp')}
                            </RadixButton>
                        </div>
                    }
                />
            </DndContext>
        </div>
    );
}
