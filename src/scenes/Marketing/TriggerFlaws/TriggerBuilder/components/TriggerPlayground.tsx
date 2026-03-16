import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { RadixButton, RadixCard, RadixInput } from '@/components/radix';
import { TriggerGroup } from '@/redux/slices/Marketing/campaigns';
import {
    setSelectedTriggerCondition,
    addTriggerGroup,
    removeConditionFromGroup,
    removeTriggerGroup,
    setContent,
} from '@/redux/slices/Marketing/triggerFlow';
import { ContentBoxForm } from './renderers';
import CloseIconSvg from '@/assets/Marketing/Close.svg';
import WarningIconSvg from '@/assets/Marketing/Warning.svg';
import CheckIconSvg from '@/assets/Marketing/Check.svg';
import { useMediaQuery } from '@/hooks/shared';
import { toast } from '@/utils/toast';
import { t } from 'i18next';
import ChevronRightIconSvg from '@/assets/Marketing/ChevronRight.svg';
import { type ConditionComponentRef } from './ConditionRenderer';
import { usePlaygroundFormRegistry } from '../hooks/usePlaygroundFormRegistry';

/** Context holding per-condition validation results from form validators (condition id -> valid). */
const ConditionValidationContext = createContext<Record<string, boolean>>({});

/** Hook: returns whether the condition with the given id is valid according to its form validator. No heuristic fallback. */
export function useConditionValid(conditionId: string | undefined): boolean {
    const map = useContext(ConditionValidationContext);
    if (conditionId == null) return false;
    return map[conditionId] === true;
}

const defaultTriggerGroup: TriggerGroup = {
    id: 'g0',
    name: 'Trigger',
    conditions: [],
    logicalOperator: 'AND',
};
interface TriggerPlaygroundProps {
    onConditionSelect: (groupId: string, conditionId: string) => void;
    conditionRef?: React.MutableRefObject<ConditionComponentRef | null>;
    /** Called before switching to consent/trigger-setting/content-box to persist current condition form to Redux */
    persistBeforeSelectionChange?: () => void | Promise<void>;
}

interface DroppableGroupProps {
    group: TriggerGroup;
    onConditionSelect: (groupId: string, conditionId: string) => void;
}

function ConditionChip({
    condition,
    groupId,
    onConditionSelect,
    onRemoveCondition,
}: {
    condition: any;
    groupId: string;
    onConditionSelect: (groupId: string, conditionId: string) => void;
    onRemoveCondition: (conditionId: string) => void;
}) {
    const isValid = useConditionValid(condition?.id);

    return (
        <RadixCard
            key={condition.id}
            className="!bg-[#f6f6f6] border border-solid border-primary-500 rounded-[6px] cursor-pointer p-2 flex items-center relative"
            onClick={() => onConditionSelect(groupId, condition.id)}
        >
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <p className="text-sm leading-5 font-normal text-text-primary whitespace-nowrap m-0 p-0">
                        {condition.condition_label || condition.description}
                    </p>
                    <div className="bg-[#507FFF1A] rounded-full hidden md:flex items-center justify-center">
                        <p className="text-xs leading-4 font-normal text-blue-500 whitespace-nowrap m-0 p-0 px-2 py-1">
                            {condition.group_label || condition.group_name}
                        </p>
                    </div>
                </div>
                {isValid ? (
                    <div className="flex gap-1.5 items-center">
                        <div className="border border-solid border-green-500 rounded-full flex items-center justify-center p-0.5">
                            <img src={CheckIconSvg} alt="Configured" className="w-2 h-2" />
                        </div>
                        <p className="text-xs leading-4 font-normal text-green-600 whitespace-nowrap m-0 p-0">
                            {t('Marketing.Configured')}
                        </p>
                    </div>
                ) : (
                    <div className="flex gap-1.5 items-center">
                        <img src={WarningIconSvg} alt="Warning" className="w-3.5 h-3.5 text-warning-500" />
                        <p className="text-xs leading-4 font-normal text-[#e18618] whitespace-nowrap m-0 p-0">
                            {t('Marketing.ClickToConfigure')}
                        </p>
                    </div>
                )}
            </div>
            <RadixButton
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onRemoveCondition(condition.id);
                }}
                className="absolute top-1 right-1 text-text-primary hover:text-text-secondary transition-colors p-0.5 bg-transparent border-none outline-none focus:outline-none focus:ring-0"
                iconOnly
                title={t('Marketing.RemoveCondition')}
            >
                <img src={CloseIconSvg} alt="Close" />
            </RadixButton>
        </RadixCard>
    );
}

function DroppableGroup({ group, onConditionSelect }: DroppableGroupProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `group-${group.id}`,
    });

    const dispatch = useDispatch();

    const handleRemoveCondition = (conditionId: string) => {
        dispatch(removeConditionFromGroup({ groupId: group.id, conditionId }));
    };

    const handleRemoveGroup = () => {
        dispatch(removeTriggerGroup(group.id));
    };

    return (
        <div ref={setNodeRef} className="my-3 px-2">
            <div
                className={`bg-background-paper border border-border-default rounded-md p-2.5 sm:min-h-0 md:min-h-[150px] h-full w-full ${
                    isOver ? 'border-2 border-primary-500 bg-[#fff4e9]' : ''
                }`}
            >
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1 m-0 p-0 mt-2">
                            <h2 className="text-lg leading-5 font-medium text-text-primary m-0 p-0">{group.name}</h2>
                            <p className="text-xs text-text-secondary font-normal m-0 p-0">
                                {group.conditions.length} {t('Marketing.Trigger')}{' '}
                                {group.conditions.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        {group.id !== 'g0' && (
                            <div className="flex items-center gap-1.5">
                                <RadixButton
                                    onClick={handleRemoveGroup}
                                    className="text-text-primary hover:text-text-secondary transition-colors p-0.5 bg-transparent border-none outline-none focus:outline-none focus:ring-0"
                                    iconOnly
                                    title={t('Marketing.RemoveGroup')}
                                >
                                    <img src={CloseIconSvg} alt="Close" className="w-3 h-3 text-text-primary" />
                                </RadixButton>
                            </div>
                        )}
                    </div>

                    {group.conditions.length === 0 ? (
                        <div className="text-xs text-text-secondary hidden md:block text-center py-4 border-2 border-dashed border-border-default rounded-md">
                            {t('Marketing.DropTriggersHere')}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {group.conditions
                                .filter((condition) => condition != null)
                                .map((condition, index) => (
                                    <div key={index}>
                                        {index > 0 && (
                                            <div className="text-center py-1 px-8 border-[1px] border-solid border-border-default rounded-md my-2 w-fit  mx-auto">
                                                And
                                            </div>
                                        )}
                                        <ConditionChip
                                            condition={condition}
                                            groupId={group.id}
                                            onConditionSelect={onConditionSelect}
                                            onRemoveCondition={handleRemoveCondition}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}
                    {group.conditions.length > 0 && (
                        <div className="text-xs text-text-secondary font-normal text-center py-4 border-2 border-dashed border-border-default rounded-md mt-4">
                            {t('Marketing.DropTriggersHere')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TriggerPlayground({
    onConditionSelect,
    conditionRef,
    persistBeforeSelectionChange,
}: TriggerPlaygroundProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isDesktop = useMediaQuery('(min-width: 960px)');
    const triggerFlowData = useSelector((state: any) => state.triggerFlow?.triggerFlowData);
    const triggerGroups = useMemo(
        () => triggerFlowData?.triggerGroups || [defaultTriggerGroup],
        [triggerFlowData?.triggerGroups],
    );

    const { validateEachPlaygroundForm } = usePlaygroundFormRegistry();
    const [conditionValidMap, setConditionValidMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (triggerGroups.length === 0) {
            dispatch(addTriggerGroup({ groupId: 'g0', name: 'Trigger' }));
        }
    }, [triggerGroups, dispatch]);

    // Run each condition's form validator so chips show check icon only when actually valid
    useEffect(() => {
        let cancelled = false;
        validateEachPlaygroundForm().then((map) => {
            if (!cancelled) setConditionValidMap(map);
        });
        return () => {
            cancelled = true;
        };
    }, [triggerGroups, validateEachPlaygroundForm, triggerFlowData?.selectedTriggerConditionId]);

    const [groupNameInput, setGroupNameInput] = useState('');
    const [showAddGroup, setShowAddGroup] = useState(false);

    const content = triggerFlowData?.content || null;

    const setContentBoxValue = (value: any) => {
        dispatch(
            setContent({
                ...(content || {}),
                sender: value?.sender ?? content?.sender ?? null,
                replyTo: content?.replyTo ?? '',
                subject: value?.subject ?? content?.subject ?? '',
                content: value?.content ?? content?.content ?? '',
            }),
        );
    };

    const triggerSetting = triggerFlowData?.triggerSetting;
    const triggerType = triggerSetting?.triggerType || 'EMAIL';
    const consentValue = triggerFlowData?.consent?.value ?? null;

    // Validation status for each button (configured icon only when valid)
    const hasConsentValid = consentValue !== null && consentValue !== undefined && typeof consentValue === 'boolean';
    const hasSettings = triggerSetting && triggerSetting.name && triggerSetting.triggerType;
    const hasSettingsValid = hasSettings && (triggerSetting?.name?.trim() ?? '').length > 0;
    const hasContent =
        content &&
        content.content &&
        content.content.trim() !== '' &&
        content.content !== '<p><br></p>' &&
        (triggerType === 'SMS' || (content.sender && content.sender.trim() !== ''));
    const hasContentValid = hasContent && (triggerType === 'SMS' || (content?.subject?.trim() ?? '').length > 0);

    const isContentBoxMode = searchParams.get('c') === 'content-box';

    const handleAddGroup = () => {
        if (groupNameInput.trim()) {
            const existingGroupIds = triggerGroups.map((g: TriggerGroup) => {
                const match = g.id.match(/^g(\d+)$/);
                return match ? parseInt(match[1], 10) : -1;
            });
            const maxId = existingGroupIds.length > 0 ? Math.max(...existingGroupIds) : -1;
            const groupId = `g${maxId + 1}`;
            dispatch(addTriggerGroup({ groupId, name: groupNameInput.trim() }));
            setGroupNameInput('');
            setShowAddGroup(false);
        }
    };

    const handleConsentClick = async () => {
        await persistBeforeSelectionChange?.();
        dispatch(setSelectedTriggerCondition('consent'));
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set('c', 'consent');
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    };

    const handleTriggerSettingClick = async () => {
        await persistBeforeSelectionChange?.();
        dispatch(setSelectedTriggerCondition('trigger-setting'));
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set('c', 'trigger-setting');
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    };

    const handleContentBoxClick = async () => {
        await persistBeforeSelectionChange?.();
        dispatch(setSelectedTriggerCondition('content-box'));
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set('c', 'content-box');
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    };

    const handleContentBoxSave = () => {
        // Validate using the mounted ContentBoxForm (marks fields as touched to show inline errors)
        if (conditionRef?.current) {
            conditionRef.current.validate().then((isValid) => {
                if (!isValid) return;

                // Content is already saved in Redux via ContentBoxForm onChange
                // Just close the content box mode
                dispatch(setSelectedTriggerCondition(null));
                const newSearchParams = new URLSearchParams(location.search);
                newSearchParams.delete('c');
                navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
            });
            return;
        }

        toast.error(t('Marketing.PleaseFixValidationErrors'));
        return;
    };

    return (
        <ConditionValidationContext.Provider value={conditionValidMap}>
            <div className="flex-1">
                {!isDesktop && (
                    <RadixButton
                        onClick={() => navigate(-1)}
                        iconOnly
                        className="bg-transparent border-none gap-2 ml-2"
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
                <div className="flex flex-col items-center mt-2 w-full">
                    <RadixButton
                        variant="outline"
                        size="base"
                        className="bg-background-paper border-none font-regular flex items-center gap-2"
                        onClick={handleConsentClick}
                    >
                        {t('Marketing.SendToCustomersWithConsentOnly')}
                        {hasConsentValid ? (
                            <div className="border border-solid border-green-500 rounded-full flex items-center justify-center p-0.5">
                                <img src={CheckIconSvg} alt="Configured" className="w-2 h-2" />
                            </div>
                        ) : (
                            <img src={WarningIconSvg} alt="Warning" className="w-4 h-4" />
                        )}
                    </RadixButton>

                    <div className="h-6 w-0 border-l border-solid border-border-default border-[1px]" />

                    <RadixButton
                        variant="outline"
                        size="base"
                        className="bg-background-paper border-none font-regular flex items-center gap-2"
                        onClick={handleTriggerSettingClick}
                    >
                        {t('Marketing.TriggerSetting')}
                        {hasSettingsValid ? (
                            <div className="border border-solid border-green-500 rounded-full flex items-center justify-center p-0.5">
                                <img src={CheckIconSvg} alt="Configured" className="w-2 h-2" />
                            </div>
                        ) : (
                            <img src={WarningIconSvg} alt="Warning" className="w-4 h-4" />
                        )}
                    </RadixButton>

                    <div className="h-6 w-0 border-l border-border-default border-solid border-[1px]" />

                    {!isContentBoxMode ? (
                        <RadixButton
                            variant="outline"
                            size="base"
                            className="bg-background-paper border-none font-regular flex items-center gap-2"
                            onClick={handleContentBoxClick}
                        >
                            {t('Marketing.ContentBox')}
                            {hasContentValid ? (
                                <div className="border border-solid border-green-500 rounded-full flex items-center justify-center p-0.5">
                                    <img src={CheckIconSvg} alt="Configured" className="w-2 h-2" />
                                </div>
                            ) : (
                                <img src={WarningIconSvg} alt="Warning" className="w-4 h-4" />
                            )}
                        </RadixButton>
                    ) : (
                        <div className="bg-background-paper rounded-[6px] max-w-[90dvw] md:max-w-[40dvw] p-3 border-2 border-primary-500 ">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm leading-5 font-medium text-primary-500 whitespace-nowrap">
                                    {t('Marketing.ContentBox')}
                                </p>
                            </div>
                            <ContentBoxForm
                                value={content}
                                onChange={setContentBoxValue}
                                triggerGroups={triggerGroups}
                                triggerType={triggerType}
                                conditionRef={conditionRef}
                            />
                            {!isDesktop && (
                                <div className="mt-4 pt-4 border-t border-border-default">
                                    <RadixButton
                                        variant="primary"
                                        size="lg"
                                        onClick={handleContentBoxSave}
                                        className="w-full bg-primary-500 text-white hover:bg-primary-600"
                                    >
                                        {t('Common.Save')}
                                    </RadixButton>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {triggerGroups.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                        <p className="text-sm">{t('Marketing.NoGroupsYet')}</p>
                    </div>
                ) : (
                    triggerGroups.map((group: TriggerGroup, index: number) => (
                        <DroppableGroup key={index} group={group} onConditionSelect={onConditionSelect} />
                    ))
                )}

                {/* Add Group Button */}
                <div className="flex flex-col items-center mt-2">
                    <RadixButton
                        variant="outline"
                        onClick={() => setShowAddGroup(true)}
                        className="bg-background-paper border border-dashed h-[48px] px-2 py-2 rounded-[6px] w-[160px] flex items-center justify-center font-regular"
                    >
                        + {t('Marketing.AddOrGroup')}
                    </RadixButton>

                    {showAddGroup && (
                        <RadixCard className="mt-2 flex flex-col items-center gap-1.5 p-4">
                            <RadixInput
                                type="text"
                                value={groupNameInput}
                                onChange={(e) => setGroupNameInput(e.target.value)}
                                placeholder={t('Marketing.GroupName')}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddGroup()}
                                autoFocus
                            />
                            <div className="flex items-center gap-1.5">
                                <RadixButton variant="primary" size="sm" onClick={handleAddGroup}>
                                    {t('Common.Add')}
                                </RadixButton>
                                <RadixButton variant="ghost" size="sm" onClick={() => setShowAddGroup(false)}>
                                    {t('Calendar.Cancel')}
                                </RadixButton>
                            </div>
                        </RadixCard>
                    )}
                </div>
            </div>
        </ConditionValidationContext.Provider>
    );
}
