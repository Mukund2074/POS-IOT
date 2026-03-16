import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateMarketingQueries } from '@/hooks/api/marketing';
import { useMediaQuery } from '@/hooks/shared';
import ConditionRenderer, { ConditionComponentRef, SpecialModeRenderer } from './ConditionRenderer';
import {
    TriggerCondition,
    TriggerGroup,
    setCreatedCampaign,
    setEditingCampaignId,
    type CreatedCampaign,
} from '@/redux/slices/Marketing/campaigns';
import {
    updateConditionValue,
    updateCompositeConditionValue,
    updateConditionSeqId,
    setSelectedTriggerCondition,
    setTriggerSetting,
    setConsent,
    setIsSaving,
    setIsActivating,
    prepareTriggerFlowPayload,
    type TriggerFlowData,
    TriggerFlowState,
} from '@/redux/slices/Marketing/triggerFlow';
import { RadixButton, RadixCard, RadixDialog, RadixSpinner } from '@/components/radix';
import CloseIconSvg from '../../../../../assets/Marketing/Close.svg';
import { MarketingConditionSchema, marketingConditions } from '@/data/Marketing/MarketingCondition';
import { t } from 'i18next';
import { api } from '@/utils/Api/POS';
import DeleteIcon from '@/assets/Delete.svg';
import { cnMerge } from '@/utils/cnMerge';
import { usePlaygroundFormRegistry } from '../hooks/usePlaygroundFormRegistry';
import type { TriggerBuilderRootState } from '../types';

export interface TriggerConfigurationRef {
    persistCurrentConditionToRedux: () => Promise<void>;
}

interface TriggerConfigurationProps {
    onClose?: () => void; // Callback when drawer should close (for mobile)
    conditionRef?: React.MutableRefObject<ConditionComponentRef | null>;
    configRef?: React.MutableRefObject<TriggerConfigurationRef | null>;
}

export default function TriggerConfiguration({
    onClose,
    conditionRef: sharedConditionRef,
    configRef,
}: TriggerConfigurationProps = {}) {
    // Hooks
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<{ id?: string }>();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const isDesktop = useMediaQuery('(min-width: 960px)');

    // States
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const campaignsState = useSelector((state: TriggerBuilderRootState) => state.campaigns);
    const triggerFlowState = useSelector((state: TriggerBuilderRootState) => state.triggerFlow);
    const triggerFlowData = triggerFlowState?.triggerFlowData;

    const triggerGroups = useMemo(() => triggerFlowData?.triggerGroups || [], [triggerFlowData?.triggerGroups]);
    const selectedConditionId = triggerFlowData?.selectedTriggerConditionId;

    // Get campaign ID from URL params or Redux state
    // If creating from template, ignore URL ID to ensure we create new campaign
    const isFromTemplate = searchParams.get('fromTemplate') === 'true';
    const campaignIdFromUrl = isFromTemplate ? null : params?.id;
    const campaignIdFromRedux = campaignsState.editingCampaignId || campaignsState.createdCampaign?.id;
    const campaignId = campaignIdFromUrl || campaignIdFromRedux;

    const isConsentMode = selectedConditionId === 'consent';
    const isTriggerSettingMode = selectedConditionId === 'trigger-setting';
    const isContentBoxMode = selectedConditionId === 'content-box';

    // For new campaigns (not saved yet), keep consent as undefined
    // This ensures no radio button is selected until the user saves
    const consentValue = campaignId
        ? (triggerFlowData?.consent?.value ?? null)
        : (triggerFlowData?.consent?.value ?? undefined);
    const triggerSetting = triggerFlowData?.triggerSetting;

    const setTriggerSettingValue = (value: TriggerFlowData['triggerSetting']) => {
        dispatch(setTriggerSetting(value));
    };

    // Single ref that can be used for ConditionRenderer, TriggerSettingForm, ContentBoxForm, and consent
    const localConditionRef = useRef<ConditionComponentRef | null>(null);
    const conditionRef = sharedConditionRef ?? localConditionRef;
    const content = triggerFlowData?.content;

    const selectedCondition = useMemo(() => {
        if (!selectedConditionId || isConsentMode || isTriggerSettingMode || isContentBoxMode) return null;

        for (const group of triggerGroups) {
            const condition = group.conditions.find((c: TriggerCondition) => c.id === selectedConditionId);
            if (condition) {
                return { group, condition };
            }
        }
        return null;
    }, [triggerGroups, selectedConditionId, isConsentMode, isTriggerSettingMode, isContentBoxMode]);

    const { getForm, validateAllPlaygroundForms, getAllPlaygroundValues } = usePlaygroundFormRegistry();

    // Values are managed locally in condition components until submit

    const clearUrlParameter = () => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('c');
        navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    };

    // Check if form is valid for activation
    const isFormValid = useMemo(() => {
        const hasSettings = triggerSetting && triggerSetting.name && triggerSetting.triggerType;
        const hasConsent = consentValue !== null && consentValue !== undefined && typeof consentValue === 'boolean';
        const triggerType = triggerSetting?.triggerType || 'EMAIL';
        const hasContent =
            content &&
            content.content &&
            content.content.trim() !== '' &&
            content.content !== '<p><br></p>' &&
            (triggerType === 'SMS' || (content.sender && content.sender.trim() !== ''));
        const hasTriggers =
            triggerGroups &&
            triggerGroups.length > 0 &&
            triggerGroups.some((group: TriggerGroup) => group.conditions && group.conditions.length > 0);

        return hasSettings && hasConsent && hasContent && hasTriggers;
    }, [triggerSetting, consentValue, content, triggerGroups]);

    const handleSaveAsDraft = async () => {
        const allValid = await validateAllPlaygroundForms();
        console.log('[ALL VALID]', allValid);
        console.log('[ALL PLAYGROUND VALUES]', getAllPlaygroundValues());
        if (!allValid) {
            toast.error(t('Marketing.PleaseFixValidationErrors'));
            return;
        }
        try {
            dispatch(setIsSaving(true));
            const payload = prepareTriggerFlowPayload(triggerFlowState as TriggerFlowState);
            console.log('[PAYLOAD OF CREATE TRIGGER FLOW]', JSON.stringify(payload, null, 2));

            let response;
            if (campaignId) {
                // Update existing draft
                response = await api.putApiCampaignsId(campaignId, payload);
            } else {
                // Create new draft
                response = await api.postApiCampaigns(payload);
            }

            if (response && response.id) {
                // Store campaign ID in Redux
                dispatch(setCreatedCampaign(response as CreatedCampaign));
                dispatch(setEditingCampaignId(response.id));

                // Update URL with campaign ID
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
            return;
        }
        const allValid = await validateAllPlaygroundForms();
        console.log('[ALL VALID]', allValid);
        console.log('[ALL PLAYGROUND VALUES]', getAllPlaygroundValues());
        if (!allValid) {
            toast.error(t('Marketing.PleaseFixValidationErrors'));
            return;
        }
        try {
            dispatch(setIsActivating(true));
            let finalCampaignId = campaignId;

            // If no campaign ID exists, create draft first
            if (!finalCampaignId) {
                const payload = prepareTriggerFlowPayload(triggerFlowState as TriggerFlowState);

                const draftResponse = await api.postApiCampaigns(payload);
                if (draftResponse && draftResponse.id) {
                    finalCampaignId = draftResponse.id;
                    // Store campaign ID in Redux
                    dispatch(setCreatedCampaign(draftResponse as CreatedCampaign));
                    dispatch(setEditingCampaignId(draftResponse.id));
                    invalidateMarketingQueries(queryClient);
                } else {
                    throw new Error('Failed to create draft');
                }
            }

            // Activate trigger using the campaign ID
            const response = await api.postApiCampaignsIdTrigger(finalCampaignId);

            if (response) {
                // Update URL with campaign ID if not already present
                navigate(`/marketing/trigger-flows`, {
                    replace: true,
                });
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
            toast.success(t('SpOffers.ToastSCmpDel'));

            invalidateMarketingQueries(queryClient);

            // Navigate back to trigger flows list
            navigate('/marketing/trigger-flows');
        } catch (error: any) {
            console.error('[Trigger Builder] Error deleting campaign:', error);
            const errorMessage = error?.response?.data?.message || error?.message || t('SpOffers.ToastErrCmpDel');
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    // Dispatch condition form values to Redux (used by save and by auto-save on panel switch)
    const dispatchConditionValuesToRedux = useCallback(
        (
            group: TriggerGroup,
            condition: TriggerCondition,
            originalCondition: MarketingConditionSchema | null,
            rendererValues: unknown,
        ) => {
            if (rendererValues === undefined) return;
            if (
                condition.conditionId === 18 &&
                typeof rendererValues === 'object' &&
                rendererValues !== null &&
                !Array.isArray(rendererValues)
            ) {
                const renderedValue = rendererValues as Record<string, unknown>;
                if (renderedValue.fieldValue !== undefined) {
                    dispatch(
                        updateConditionValue({
                            groupId: group.id,
                            conditionId: condition.id,
                            value: renderedValue.fieldValue,
                        }),
                    );
                }
            } else if (
                typeof rendererValues === 'object' &&
                rendererValues !== null &&
                !Array.isArray(rendererValues)
            ) {
                Object.entries(rendererValues).forEach(([key, value]) => {
                    dispatch(
                        updateCompositeConditionValue({
                            groupId: group.id,
                            conditionId: condition.id,
                            key,
                            value,
                        }),
                    );
                });
            } else {
                dispatch(
                    updateConditionValue({
                        groupId: group.id,
                        conditionId: condition.id,
                        value: rendererValues,
                    }),
                );
            }
            if (originalCondition?.subconditions && originalCondition.subconditions.length > 0) {
                originalCondition.subconditions.forEach((subcondition) => {
                    if (!subcondition.conditionDefinition) return;
                    const existingSubCondition = group.conditions.find(
                        (c) => c.conditionId === subcondition.conditionId,
                    );
                    let subConditionValue: unknown = null;
                    if (
                        typeof rendererValues === 'object' &&
                        rendererValues !== null &&
                        !Array.isArray(rendererValues)
                    ) {
                        const valueMapping = subcondition.valueMapping;
                        if (valueMapping) {
                            const sourceValue = (rendererValues as Record<string, unknown>)[valueMapping.from];
                            subConditionValue = valueMapping.transform
                                ? valueMapping.transform(sourceValue)
                                : sourceValue;
                        } else {
                            subConditionValue = rendererValues;
                        }
                    } else {
                        subConditionValue = rendererValues;
                    }
                    if (existingSubCondition) {
                        if (
                            typeof subConditionValue === 'object' &&
                            subConditionValue !== null &&
                            !Array.isArray(subConditionValue)
                        ) {
                            Object.entries(subConditionValue as Record<string, unknown>).forEach(([key, value]) => {
                                dispatch(
                                    updateCompositeConditionValue({
                                        groupId: group.id,
                                        conditionId: existingSubCondition.id,
                                        key,
                                        value,
                                    }),
                                );
                            });
                        } else {
                            dispatch(
                                updateConditionValue({
                                    groupId: group.id,
                                    conditionId: existingSubCondition.id,
                                    value: subConditionValue,
                                }),
                            );
                        }
                    }
                });
                if (typeof rendererValues === 'object' && rendererValues !== null && !Array.isArray(rendererValues)) {
                    Object.entries(rendererValues as Record<string, unknown>).forEach(([key, value]) => {
                        const isMappedToSubcondition = originalCondition.subconditions?.some(
                            (sc) => sc.valueMapping?.from === key,
                        );
                        if (!isMappedToSubcondition) {
                            dispatch(
                                updateCompositeConditionValue({
                                    groupId: group.id,
                                    conditionId: condition.id,
                                    key,
                                    value,
                                }),
                            );
                        }
                    });
                } else {
                    dispatch(
                        updateConditionValue({
                            groupId: group.id,
                            conditionId: condition.id,
                            value: rendererValues,
                        }),
                    );
                }
            } else if (
                typeof rendererValues === 'object' &&
                rendererValues !== null &&
                !Array.isArray(rendererValues)
            ) {
                Object.entries(rendererValues as Record<string, unknown>).forEach(([key, value]) => {
                    dispatch(
                        updateCompositeConditionValue({
                            groupId: group.id,
                            conditionId: condition.id,
                            key,
                            value,
                        }),
                    );
                });
            } else {
                dispatch(
                    updateConditionValue({
                        groupId: group.id,
                        conditionId: condition.id,
                        value: rendererValues,
                    }),
                );
            }
        },
        [dispatch],
    );

    const persistCurrentConditionToRedux = useCallback(async () => {
        if (!selectedCondition) return;
        const { group, condition } = selectedCondition;
        const originalCondition = condition.condition_render_id
            ? (marketingConditions.find((c) => c.condition_render_id === condition.condition_render_id) as
                  | MarketingConditionSchema
                  | undefined) || null
            : condition.conditionId
              ? (marketingConditions.find((c) => c.conditionId === condition.conditionId) as
                    | MarketingConditionSchema
                    | undefined) || null
              : null;
        const form = condition.id ? getForm(condition.id) : undefined;
        if (!form) return;
        const rendererValues = form.getValues();
        dispatchConditionValuesToRedux(group, condition, originalCondition, rendererValues);
    }, [selectedCondition, getForm, dispatchConditionValuesToRedux]);

    useImperativeHandle(
        configRef,
        () => ({
            persistCurrentConditionToRedux,
        }),
        [persistCurrentConditionToRedux],
    );

    // Helper function to save condition values
    const saveConditionValues = async (
        group: TriggerGroup,
        condition: TriggerCondition,
        originalCondition: MarketingConditionSchema,
        nextSeqId: number,
    ): Promise<boolean> => {
        try {
            let isValid: boolean | undefined = true;
            const form = condition?.id ? getForm(condition.id) : undefined;

            if (form) {
                isValid = await form.validate();
            }

            if (isValid === false) {
                toast.error(t('Marketing.PleaseFixValidationErrors'));
                return false;
            }

            // Update condition's seq_id
            dispatch(
                updateConditionSeqId({
                    groupId: group.id,
                    conditionId: condition.id,
                    seqId: nextSeqId,
                }),
            );

            const rendererValues = form?.getValues();
            dispatchConditionValuesToRedux(group, condition, originalCondition, rendererValues);

            return true;
        } catch (error) {
            console.error('Validation error:', error);
            toast.error(t('Marketing.ValidationError') || 'Validation error occurred');
            return false;
        }
    };

    const renderContent = () => {
        if (isConsentMode) {
            return <SpecialModeRenderer mode="consent" consentValue={consentValue} conditionRef={conditionRef} />;
        }

        if (isTriggerSettingMode) {
            return (
                <SpecialModeRenderer
                    mode="trigger-setting"
                    triggerSetting={triggerSetting as TriggerFlowData['triggerSetting']}
                    conditionRef={conditionRef}
                    onTriggerSettingChange={setTriggerSettingValue}
                />
            );
        }

        if (isContentBoxMode) {
            return (
                <SpecialModeRenderer
                    mode="content-box"
                    content={content}
                    triggerSetting={triggerSetting as TriggerFlowData['triggerSetting']}
                    conditionRef={conditionRef}
                />
            );
        }

        if (!selectedCondition) {
            return (
                <RadixCard className="h-full flex flex-col md:px-2 rounded-t-none rounded-br-none justify-center items-center">
                    <div className="text-center text-text-secondary">
                        <p className="text-xs">{t('Marketing.NoTriggerSelected')}</p>
                        <p className="text-xs mt-1">{t('Marketing.ClickOnTriggerInPlaygroundToConfigure')}</p>
                    </div>
                </RadixCard>
            );
        }

        const { condition } = selectedCondition;

        // Safety check: ensure condition exists
        if (!condition) {
            return (
                <RadixCard className="h-full flex flex-col px-2 rounded-t-none rounded-br-none justify-center items-center">
                    <div className="text-center text-text-secondary">
                        <p className="text-xs">{t('Marketing.ConditionNotFound')}</p>
                    </div>
                </RadixCard>
            );
        }

        // Find the original condition schema using condition_render_id
        // condition_render_id is always unique, so we can match directly
        const originalCondition = condition.condition_render_id
            ? (marketingConditions.find((c) => c.condition_render_id === condition.condition_render_id) as
                  | MarketingConditionSchema
                  | undefined) || null
            : condition.conditionId
              ? (marketingConditions.find((c) => c.conditionId === condition.conditionId) as
                    | MarketingConditionSchema
                    | undefined) || null
              : null;

        // If no matching condition schema found, show error message
        if (!originalCondition) {
            return (
                <RadixCard className="h-full flex flex-col md:px-2 rounded-t-none rounded-br-none justify-center items-center">
                    <div className="text-center text-text-secondary">
                        <p className="text-xs">{t('Marketing.ConditionNotFound')}</p>
                        <p className="text-xs mt-1">
                            {condition.conditionId
                                ? `Condition ID: ${condition.conditionId}`
                                : 'Custom condition without template'}
                        </p>
                    </div>
                </RadixCard>
            );
        }

        const handleClose = () => {
            dispatch(setSelectedTriggerCondition(null));
            clearUrlParameter();
        };

        return (
            <div className="h-full flex flex-col">
                {isDesktop && (
                    <div className="flex items-center justify-between mb-2 px-4 pt-4">
                        <h3 className="text-lg font-medium leading-7 m-0 p-0 text-text-primary">
                            {t('Marketing.ConfigureTrigger')}
                        </h3>
                        <RadixButton
                            onClick={handleClose}
                            iconOnly
                            title="Close"
                            className="p-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0"
                        >
                            <img src={CloseIconSvg} alt="Close" className="w-4 h-4" />
                        </RadixButton>
                    </div>
                )}
                <div className="flex-1 flex flex-col gap-3 md:px-4 ">
                    <div className="flex flex-col gap-2">
                        <div className="h-0 w-full border-t border-border-default" />
                        <div className="flex flex-col gap-1">
                            <p className="text-base leading-6 font-normal m-0 p-0 text-text-primary">
                                {originalCondition?.condition_label}
                            </p>
                            <p className="text-sm leading-5 font-normal m-0 p-0 text-text-secondary">
                                {originalCondition?.settingsDescription}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <ConditionRenderer
                            condition={originalCondition}
                            value={condition.fieldValue}
                            compositeValues={condition.compositeValues}
                            conditionInstanceId={condition.id}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Unified Done handler that saves and optionally activates
    const handleUnifiedDone = async () => {
        // Calculate next seq_id by building payload and getting conditions length
        const calculateNextSeqId = (): number => {
            try {
                const payload = prepareTriggerFlowPayload(triggerFlowState as TriggerFlowState, true);
                const conditionsLength = payload.conditions?.length || 0;
                return conditionsLength + 1; // Next seq_id is length + 1 (seq_id starts at 1)
            } catch (error) {
                // Silent error bypass - if payload building fails, default to 1
                console.warn('Failed to calculate next seq_id:', error);
                return 1;
            }
        };

        const nextSeqId = calculateNextSeqId();
        console.log('Next seq_id:', nextSeqId);

        // Handle validation and saving for trigger-setting mode
        if (isTriggerSettingMode && conditionRef.current) {
            const isValid = await conditionRef.current.validate();
            if (isValid === false) {
                toast.error(t('Marketing.PleaseFixValidationErrors'));
                return;
            }

            const triggerSettingValue = conditionRef.current.getValues();
            if (triggerSettingValue && typeof triggerSettingValue === 'object' && !Array.isArray(triggerSettingValue)) {
                setTriggerSettingValue({
                    ...triggerSettingValue,
                    seq_id: nextSeqId,
                } as TriggerFlowData['triggerSetting']);
            }
            // Close after trigger setting is saved (no API call)
            dispatch(setSelectedTriggerCondition(null));
            clearUrlParameter();
            if (onClose) onClose();
            return;
        }

        // Handle consent mode - validate and dispatch consent value
        if (isConsentMode && conditionRef.current) {
            // Consent validation: must be a boolean (true or false), not undefined or null
            const consentValueRaw = conditionRef.current.getValues();
            if (consentValueRaw && typeof consentValueRaw === 'object' && !Array.isArray(consentValueRaw)) {
                setConsent((consentValueRaw as TriggerFlowData['consent']).value);
            }
            // For consent, getValues returns boolean | null | undefined
            const consentValue =
                typeof consentValueRaw === 'boolean' || consentValueRaw === null || consentValueRaw === undefined
                    ? (consentValueRaw as boolean | null | undefined)
                    : undefined;
            if (consentValue === undefined || consentValue === null) {
                toast.error(t('Marketing.PleaseFixValidationErrors') || 'Please select a consent option');
                return;
            }
            dispatch(setConsent(consentValue));
            dispatch(setSelectedTriggerCondition(null));
            clearUrlParameter();
            if (onClose) onClose();
            // Just close without calling API - user can save later using Save as Draft button
            return;
        }

        // Handle content-box mode - validate content
        if (isContentBoxMode) {
            if (conditionRef.current) {
                const isValid = await conditionRef.current.validate();
                if (!isValid) return;
            } else {
                toast.error(t('Marketing.PleaseFixValidationErrors'));
                return;
            }
            // Content is already saved in Redux via ContentBoxForm onChange
            dispatch(setSelectedTriggerCondition(null));
            clearUrlParameter();
            if (onClose) onClose();
            // Just close without calling API - user can save later using Save as Draft button
            return;
        }

        // Handle condition-specific done logic if there's a selected condition
        if (selectedCondition) {
            const { group, condition } = selectedCondition;
            const originalCondition = condition.condition_render_id
                ? (marketingConditions.find((c) => c.condition_render_id === condition.condition_render_id) as
                      | MarketingConditionSchema
                      | undefined) || null
                : condition.conditionId
                  ? (marketingConditions.find((c) => c.conditionId === condition.conditionId) as
                        | MarketingConditionSchema
                        | undefined) || null
                  : null;

            if (originalCondition) {
                const conditionSaved = await saveConditionValues(group, condition, originalCondition, nextSeqId);
                if (!conditionSaved) return;

                dispatch(setSelectedTriggerCondition(null));
                clearUrlParameter();
                if (onClose) onClose();
                // Just close without calling API - user can save later using Save as Draft button
            }
            return;
        }
    };

    // Main wrapper with sticky top and bottom
    return (
        <React.Fragment>
            <div
                className={cnMerge(
                    'flex flex-col',
                    isDesktop ? 'h-full overflow-hidden p-2' : 'flex-1 min-h-0 overflow-hidden',
                    !isDesktop && 'rounded-t-none',
                )}
            >
                {/* Fixed buttons at top - only show on desktop (and only when editable) */}
                {isDesktop && (
                    <div className="flex items-center gap-3 pl-3 border-b flex-shrink-0 sticky top-0 bg-background-paper z-10 h-[60px]">
                        <RadixButton
                            variant="outline"
                            size="base"
                            onClick={handleSaveAsDraft}
                            disabled={triggerFlowState?.isSaving || triggerFlowState?.isActivating}
                            className="flex-1 border border-border-default text-text-primary hover:bg-gray-50"
                        >
                            {triggerFlowState?.isSaving
                                ? t('Common.Loading')
                                : campaignId
                                  ? t('Common.Save')
                                  : t('Marketing.SaveAsDraft')}
                        </RadixButton>
                        <RadixButton
                            variant="primary"
                            size="base"
                            onClick={handleActivateTrigger}
                            disabled={!isFormValid || triggerFlowState?.isActivating || triggerFlowState?.isSaving}
                            className={`flex-1 bg-primary-500 text-white hover:bg-primary-600 ${
                                !isFormValid || triggerFlowState?.isActivating || triggerFlowState?.isSaving
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }`}
                        >
                            {triggerFlowState?.isActivating || triggerFlowState?.isSaving
                                ? t('Common.Loading')
                                : t('Marketing.ActivateTrigger')}
                        </RadixButton>
                        {campaignId && (
                            <RadixButton
                                variant="outline"
                                iconOnly
                                size="base"
                                onClick={() => setDeleteDialogOpen(true)}
                                disabled={isDeleting || triggerFlowState?.isActivating || triggerFlowState?.isSaving}
                            >
                                {isDeleting ? (
                                    <RadixSpinner size="sm" variant="primary" />
                                ) : (
                                    <img src={DeleteIcon} alt="Delete" className="w-4 h-4" />
                                )}
                            </RadixButton>
                        )}
                    </div>
                )}

                {campaignsState.createdCampaign?.recipientCount !== undefined && (
                    <p className="font-medium text-sm bg-background-subtle w-full my-1 p-2 rounded-md">
                        {t('Marketing.EmailCampaignsTotalReceivers')} {campaignsState.createdCampaign?.recipientCount}
                    </p>
                )}

                {/* Scrollable content area - 90% */}
                <div
                    className={cnMerge(
                        'overflow-y-auto scrollbar-hidden pb-5',
                        isDesktop ? 'flex-1 min-h-0' : 'flex-1 min-h-0',
                    )}
                >
                    {renderContent()}
                </div>

                {/* Fixed Done button at bottom - 10% */}
                {(selectedCondition || isConsentMode || isTriggerSettingMode || isContentBoxMode) && (
                    <div className="px-4 py-3 -mb-2 bg-background-paper flex-shrink-0 border-t border-border-default flex items-center justify-center">
                        <RadixButton
                            variant="primary"
                            size="lg"
                            onClick={handleUnifiedDone}
                            disabled={triggerFlowState?.isSaving || triggerFlowState?.isActivating}
                            className="w-full bg-primary-500 text-white hover:bg-primary-600"
                        >
                            {triggerFlowState?.isSaving || triggerFlowState?.isActivating
                                ? t('Common.Loading')
                                : t('Marketing.Done')}
                        </RadixButton>
                    </div>
                )}
            </div>
            {/* Delete Confirmation Dialog */}
            <RadixDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t('Marketing.EmailCampaignsDeleteConfirmTitle') || t('SpOffers.DelCmp')}
                description={t('Marketing.EmailCampaignsDeleteConfirmWarning')}
                descriptionClassName="whitespace-pre-line"
            >
                <div className="flex flex-col gap-4 pt-6">
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
                </div>
            </RadixDialog>
        </React.Fragment>
    );
}
