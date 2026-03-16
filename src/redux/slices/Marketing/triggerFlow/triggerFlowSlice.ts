import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TriggerGroup, TriggerCondition } from '../campaigns/campaignsSlice';

/**
 * Separate data structure for Trigger Flows
 * This is completely independent from CampaignData steps
 */
export interface TriggerFlowData {
    // Trigger Settings (name, type, test emails, etc.)
    triggerSetting: {
        seq_id?: number;
        name: string;
        triggerType: 'EMAIL' | 'SMS';
        testPhoneNumber:
            | {
                  phone: string;
                  country_code?: string;
                  countryISOCode?: string;
              }
            | string;
        description: string;
        testEmail: string;
        bccEmail: string;
        // postDate: string | null; // ISO string format for Redux serialization
        // time: string | null; // ISO string format for Redux serialization
        triggerTime: number | null;
        weekdays: {
            Mon: boolean;
            Tue: boolean;
            Wed: boolean;
            Thu: boolean;
            Fri: boolean;
            Sat: boolean;
            Sun: boolean;
        };
        waitingPeriod: string | null;
        spamPeriod: string | null;
    } | null;
    // Consent settings
    consent: {
        seq_id?: number;
        value: boolean | null | undefined;
    };
    // Content box (subject, content, sender, etc.)
    content: {
        sender: string | null;
        replyTo: string;
        subject: string;
        content: string;
    } | null;
    // Trigger groups and conditions
    triggerGroups: TriggerGroup[];
    selectedTriggerConditionId: string | null;
}

export interface TriggerFlowState {
    triggerFlowData: TriggerFlowData;
    isSaving: boolean;
    isActivating: boolean;
}

const initialTriggerFlowData: TriggerFlowData = {
    triggerSetting: null,
    consent: {
        value: null,
    },
    content: null,
    triggerGroups: [],
    selectedTriggerConditionId: null,
};

const initialState: TriggerFlowState = {
    triggerFlowData: initialTriggerFlowData,
    isSaving: false,
    isActivating: false,
};

const triggerFlowSlice = createSlice({
    name: 'triggerFlow',
    initialState,
    reducers: {
        setTriggerSetting: (state, action: PayloadAction<TriggerFlowData['triggerSetting']>) => {
            state.triggerFlowData.triggerSetting = action.payload;
        },
        setConsent: (state, action: PayloadAction<boolean | null | undefined>) => {
            state.triggerFlowData.consent.value = action.payload;
        },
        setContent: (state, action: PayloadAction<TriggerFlowData['content']>) => {
            state.triggerFlowData.content = action.payload;
        },
        setTriggerGroups: (state, action: PayloadAction<TriggerGroup[]>) => {
            state.triggerFlowData.triggerGroups = action.payload;
        },
        addTriggerGroup: (state, action: PayloadAction<{ groupId: string; name: string }>) => {
            if (!state.triggerFlowData.triggerGroups) {
                state.triggerFlowData.triggerGroups = [];
            }
            state.triggerFlowData.triggerGroups.push({
                id: action.payload.groupId,
                name: action.payload.name,
                conditions: [],
                logicalOperator: 'AND',
            });
        },
        removeTriggerGroup: (state, action: PayloadAction<string>) => {
            if (state.triggerFlowData.triggerGroups) {
                state.triggerFlowData.triggerGroups = state.triggerFlowData.triggerGroups.filter(
                    (g) => g.id !== action.payload,
                );
            }
        },
        addConditionToGroup: (state, action: PayloadAction<{ groupId: string; condition: TriggerCondition }>) => {
            if (state.triggerFlowData.triggerGroups) {
                const group = state.triggerFlowData.triggerGroups.find((g) => g.id === action.payload.groupId);
                if (group) {
                    group.conditions.push(action.payload.condition);
                }
            }
        },
        removeConditionFromGroup: (state, action: PayloadAction<{ groupId: string; conditionId: string }>) => {
            if (state.triggerFlowData.triggerGroups) {
                const group = state.triggerFlowData.triggerGroups.find((g) => g.id === action.payload.groupId);
                if (group) {
                    group.conditions = group.conditions.filter((c) => c.id !== action.payload.conditionId);
                }
            }
        },
        updateConditionValue: (state, action: PayloadAction<{ groupId: string; conditionId: string; value: any }>) => {
            if (state.triggerFlowData.triggerGroups) {
                const group = state.triggerFlowData.triggerGroups.find((g) => g.id === action.payload.groupId);
                if (group) {
                    const condition = group.conditions.find((c) => c.id === action.payload.conditionId);
                    if (condition) {
                        condition.fieldValue = action.payload.value;
                    }
                }
            }
        },
        updateCompositeConditionValue: (
            state,
            action: PayloadAction<{ groupId: string; conditionId: string; key: string; value: any }>,
        ) => {
            if (state.triggerFlowData.triggerGroups) {
                const group = state.triggerFlowData.triggerGroups.find((g) => g.id === action.payload.groupId);
                if (group) {
                    const condition = group.conditions.find((c) => c.id === action.payload.conditionId);
                    if (condition) {
                        if (!condition.compositeValues) {
                            condition.compositeValues = {};
                        }
                        condition.compositeValues[action.payload.key] = action.payload.value;
                    }
                }
            }
        },
        updateConditionSeqId: (
            state,
            action: PayloadAction<{ groupId: string; conditionId: string; seqId: number }>,
        ) => {
            if (state.triggerFlowData.triggerGroups) {
                const group = state.triggerFlowData.triggerGroups.find((g) => g.id === action.payload.groupId);
                if (group) {
                    const condition = group.conditions.find((c) => c.id === action.payload.conditionId);
                    if (condition) {
                        condition.seq_id = action.payload.seqId;
                    }
                }
            }
        },
        setSelectedTriggerCondition: (state, action: PayloadAction<string | null>) => {
            state.triggerFlowData.selectedTriggerConditionId = action.payload;
        },
        updateGroupLogicalOperator: (state, action: PayloadAction<{ groupId: string; operator: 'AND' | 'OR' }>) => {
            if (state.triggerFlowData.triggerGroups) {
                const group = state.triggerFlowData.triggerGroups.find((g) => g.id === action.payload.groupId);
                if (group) {
                    group.logicalOperator = action.payload.operator;
                }
            }
        },
        loadTriggerFlowData: (state, action: PayloadAction<TriggerFlowData>) => {
            state.triggerFlowData = action.payload;
        },
        resetTriggerFlow: (state) => {
            state.triggerFlowData = initialTriggerFlowData;
            state.isSaving = false;
            state.isActivating = false;
        },
        setIsSaving: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload;
        },
        setIsActivating: (state, action: PayloadAction<boolean>) => {
            state.isActivating = action.payload;
        },
    },
});

export const {
    setTriggerSetting,
    setConsent,
    setContent,
    setTriggerGroups,
    addTriggerGroup,
    removeTriggerGroup,
    addConditionToGroup,
    removeConditionFromGroup,
    updateConditionValue,
    updateCompositeConditionValue,
    updateConditionSeqId,
    setSelectedTriggerCondition,
    updateGroupLogicalOperator,
    loadTriggerFlowData,
    resetTriggerFlow,
    setIsSaving,
    setIsActivating,
} = triggerFlowSlice.actions;

export default triggerFlowSlice.reducer;
