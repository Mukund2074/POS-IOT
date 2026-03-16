import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import { PostApiCampaignsBodyCampaignType as CampaignTypeEnum } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import type { PhoneValue } from '@/components/radix';

export interface TriggerGroup {
    seq_id?: number;
    id: string;
    name: string;
    conditions: TriggerCondition[];
    logicalOperator: 'AND' | 'OR';
}

export interface TriggerCondition {
    seq_id?: number;
    id: string;
    conditionId: number;
    condition_render_id?: number; // Render ID - always unique, used to find correct condition schema
    uniqueId?: string; // Unique 8-digit zero-padded ID (e.g., "00000001")
    entity: string;
    field: string;
    operator: string;
    description: string;
    condition_label?: string; // Display label for the condition
    parentEntity: string | null;
    jsonPath: string[];
    aggregate_fn: string | null;
    aggregate_group: string | null;
    logical_group: 'AND' | 'OR';
    triggerId: number;
    group_id: number;
    group_name: string;
    group_label: string; // Display name with spaces
    group_sequence: number;
    fieldValue?: any; // Dynamic value based on uiConfig
    compositeValues?: Record<string, any>; // For composite conditions like birthday
}

export type SelectedGroup = 'ALL_WITH_CONSENT' | 'WITHOUT_CONSENT' | 'BOOKING' | 'CUSTOMER_GROUP' | 'ACTIVE';

export interface CampaignData {
    step1: {
        campaignName: string;
        isExpanded: boolean;
    };
    step2: {
        selectedGroup: SelectedGroup | null; // For backward compatibility
        selectedGroups?: string[]; // Array of all selected groups
        group2Value?: 'CUSTOMER_GROUP' | 'BOOKING' | null; // Which optional segment is selected (for validation)
        customerGroupName?: string; // Single group name (when group2Value === 'CUSTOMER_GROUP')
        filters: {
            fromDate?: string;
            toDate?: string;
            employee?: string;
            treatments?: string[];
        };
        isExpanded: boolean;
        serviceGroups?: any[];
        // Trigger builder specific
        triggerGroups?: TriggerGroup[];
        selectedTriggerConditionId?: string | null;
        // Validation errors for Formik sync
        validationErrors?: Record<string, string>;
        triggerSettingValue?: TriggerSettingValue | null;
        contentBoxValue?: {
            sender?: string | undefined;
            replyTo?: string;
            subject?: string;
            content?: string;
        } | null;
        consentValue?: string;
    };
    step3: {
        subject: string;
        sender: string | undefined;
        replyTo: string;
        content: string;
        isExpanded: boolean;
    };
    step4: {
        sendDateTime: string;
        isManualTrigger: boolean;
        isExpanded: boolean;
    };
    step5: {
        recipientCount: number;
        isExpanded: boolean;
    };
}

export interface CreatedCampaign {
    id: string;
    outletId?: number;
    name: string;
    description: string | null;
    messageType: string;
    campaignType: string;
    campaignStatus: string;
    createdAt: string;
    updatedAt: string;
    recipientCount: number;
}

export interface TriggerSettingValue {
    name: string;
    triggerType: string;
    testPhoneNumber: string;
    description: string;
    testEmail: string;
    bccEmail: string;
}

export interface TestCampaignState {
    testDialogOpen: boolean;
    testEmail: string;
    testPhone: PhoneValue;
    testEmailSubject: string;
    isSendingTest: boolean;
}

export interface CampaignState {
    currentStep: number;
    stepsCompleted: boolean[];
    campaignData: CampaignData;
    isCreating: boolean;
    editingCampaignId: string | null;
    createdCampaign: CreatedCampaign | null;
    campaignType: PostApiCampaignsBodyCampaignType; // EMAIL, SMS, TRIGGER, etc.
    testCampaign: TestCampaignState;
}

// ID of "All customers" group - excluded from dropdown (handled by radio option)
export const ALL_CUSTOMERS_GROUP_ID = 'f2decae4-9b05-4e17-8ae9-9f6c45680fc6';

const initialState: CampaignState = {
    currentStep: 0,
    stepsCompleted: [false, false, false, false],
    isCreating: false,
    editingCampaignId: null,
    createdCampaign: null,
    campaignType: CampaignTypeEnum.EMAIL, // Default to EMAIL for backward compatibility
    campaignData: {
        step1: {
            campaignName: '',
            isExpanded: true,
        },
        step2: {
            selectedGroup: null,
            selectedGroups: [],
            customerGroupName: '',
            filters: {},
            isExpanded: false,
            serviceGroups: [],
            triggerGroups: [],
            selectedTriggerConditionId: null,
            triggerSettingValue: null,
        },
        step3: {
            subject: '',
            sender: undefined,
            replyTo: '',
            content: '',
            isExpanded: false,
        },
        step4: {
            sendDateTime: '',
            isManualTrigger: true,
            isExpanded: false,
        },
        step5: {
            recipientCount: 0,
            isExpanded: true,
        },
    },
    testCampaign: {
        testDialogOpen: false,
        testEmail: '',
        testPhone: {
            country_code: '+45',
            phone: '',
            countryISOCode: 'DK',
        },
        testEmailSubject: '',
        isSendingTest: false,
    },
};

const campaignsSlice = createSlice({
    name: 'campaigns',
    initialState,
    reducers: {
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
            // For step 6 (summary), keep all steps expanded (readonly mode)
            if (action.payload === 6) {
                state.campaignData.step1.isExpanded = true;
                state.campaignData.step2.isExpanded = true;
                state.campaignData.step3.isExpanded = true;
                state.campaignData.step4.isExpanded = true;
            } else {
                // Close all accordions first
                state.campaignData.step1.isExpanded = false;
                state.campaignData.step2.isExpanded = false;
                state.campaignData.step3.isExpanded = false;
                state.campaignData.step4.isExpanded = false;
                // Auto-expand the accordion for the current step
                if (action.payload >= 1 && action.payload <= 4) {
                    const stepKey = `step${action.payload}` as keyof CampaignData;
                    state.campaignData[stepKey].isExpanded = true;
                }
            }
        },
        updateStepData: (
            state,
            action: PayloadAction<{
                step: keyof CampaignData;
                data: any;
            }>,
        ) => {
            (state.campaignData[action.payload.step] as any) = {
                ...state.campaignData[action.payload.step],
                ...action.payload.data,
            };
            // Prevents clearing when viewing summary after creating/editing
            // Also preserve createdCampaign in edit mode (when editingCampaignId is set)
            if (
                action.payload.step === 'step2' &&
                state.createdCampaign &&
                state.currentStep !== 6 &&
                !state.editingCampaignId
            ) {
                state.createdCampaign = null;
            }
        },
        toggleStepExpansion: (state, action: PayloadAction<number>) => {
            const stepKey = `step${action.payload}` as keyof CampaignData;
            state.campaignData[stepKey].isExpanded = !state.campaignData[stepKey].isExpanded;
        },
        setStepCompleted: (state, action: PayloadAction<{ step: number; completed: boolean }>) => {
            state.stepsCompleted[action.payload.step - 1] = action.payload.completed;
        },
        resetCampaignForm: (state) => {
            state.currentStep = 0;
            state.stepsCompleted = [false, false, false, false];
            state.campaignData = initialState.campaignData;
            state.isCreating = false;
            state.editingCampaignId = null;
            state.createdCampaign = null;
            state.campaignType = CampaignTypeEnum.EMAIL; // Reset to default
            state.testCampaign = initialState.testCampaign;
        },
        setCreatedCampaign: (state, action: PayloadAction<CreatedCampaign | null>) => {
            state.createdCampaign = action.payload;
        },
        setEditingCampaignId: (state, action: PayloadAction<string | null>) => {
            state.editingCampaignId = action.payload;
        },
        loadCampaignData: (state, action: PayloadAction<CampaignData>) => {
            state.campaignData = action.payload;
        },
        setIsCreating: (state, action: PayloadAction<boolean>) => {
            state.isCreating = action.payload;
        },
        setCampaignType: (state, action: PayloadAction<PostApiCampaignsBodyCampaignType>) => {
            state.campaignType = action.payload;
        },
        // Trigger builder actions
        addTriggerGroup: (state, action: PayloadAction<{ groupId: string; name: string }>) => {
            if (!state.campaignData.step2.triggerGroups) {
                state.campaignData.step2.triggerGroups = [];
            }
            state.campaignData.step2.triggerGroups.push({
                id: action.payload.groupId,
                name: action.payload.name,
                conditions: [],
                logicalOperator: 'AND',
            });
        },
        removeTriggerGroup: (state, action: PayloadAction<string>) => {
            if (state.campaignData.step2.triggerGroups) {
                state.campaignData.step2.triggerGroups = state.campaignData.step2.triggerGroups.filter(
                    (g) => g.id !== action.payload,
                );
            }
        },
        addConditionToGroup: (state, action: PayloadAction<{ groupId: string; condition: TriggerCondition }>) => {
            if (state.campaignData.step2.triggerGroups) {
                const group = state.campaignData.step2.triggerGroups.find((g) => g.id === action.payload.groupId);
                if (group) {
                    group.conditions.push(action.payload.condition);
                }
            }
        },
        removeConditionFromGroup: (state, action: PayloadAction<{ groupId: string; conditionId: string }>) => {
            if (state.campaignData.step2.triggerGroups) {
                const group = state.campaignData.step2.triggerGroups.find((g) => g.id === action.payload.groupId);
                if (group) {
                    group.conditions = group.conditions.filter((c) => c.id !== action.payload.conditionId);
                }
            }
        },
        updateConditionValue: (state, action: PayloadAction<{ groupId: string; conditionId: string; value: any }>) => {
            if (state.campaignData.step2.triggerGroups) {
                const group = state.campaignData.step2.triggerGroups.find((g) => g.id === action.payload.groupId);
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
            if (state.campaignData.step2.triggerGroups) {
                const group = state.campaignData.step2.triggerGroups.find((g) => g.id === action.payload.groupId);
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
        setSelectedTriggerCondition: (state, action: PayloadAction<string | null>) => {
            state.campaignData.step2.selectedTriggerConditionId = action.payload;
        },
        updateGroupLogicalOperator: (state, action: PayloadAction<{ groupId: string; operator: 'AND' | 'OR' }>) => {
            if (state.campaignData.step2.triggerGroups) {
                const group = state.campaignData.step2.triggerGroups.find((g) => g.id === action.payload.groupId);
                if (group) {
                    group.logicalOperator = action.payload.operator;
                }
            }
        },
        setTriggerSettingValue: (state, action: PayloadAction<TriggerSettingValue | null>) => {
            state.campaignData.step2.triggerSettingValue = action.payload;
        },
        setStep2ValidationErrors: (state, action: PayloadAction<Record<string, string> | null>) => {
            state.campaignData.step2.validationErrors = action.payload || undefined;
        },
        // Test Campaign Actions
        setTestDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.testCampaign.testDialogOpen = action.payload;
            // Sync email subject when opening dialog (for email campaigns)
            if (action.payload && state.campaignType !== CampaignTypeEnum.SMS && state.campaignData.step3.subject) {
                state.testCampaign.testEmailSubject = state.campaignData.step3.subject;
            }
        },
        setTestEmail: (state, action: PayloadAction<string>) => {
            state.testCampaign.testEmail = action.payload;
        },
        setTestPhone: (state, action: PayloadAction<PhoneValue>) => {
            state.testCampaign.testPhone = action.payload;
        },
        setTestEmailSubject: (state, action: PayloadAction<string>) => {
            state.testCampaign.testEmailSubject = action.payload;
        },
        setIsSendingTest: (state, action: PayloadAction<boolean>) => {
            state.testCampaign.isSendingTest = action.payload;
        },
        resetTestCampaign: (state) => {
            state.testCampaign = initialState.testCampaign;
        },
        setRecipientCount: (state, action: PayloadAction<number>) => {
            state.campaignData.step5.recipientCount = action.payload;
        },
    },
});

export const {
    setCurrentStep,
    updateStepData,
    toggleStepExpansion,
    setStepCompleted,
    resetCampaignForm,
    setIsCreating,
    setEditingCampaignId,
    loadCampaignData,
    setCreatedCampaign,
    setCampaignType,
    addTriggerGroup,
    removeTriggerGroup,
    addConditionToGroup,
    removeConditionFromGroup,
    updateConditionValue,
    updateCompositeConditionValue,
    setSelectedTriggerCondition,
    updateGroupLogicalOperator,
    setStep2ValidationErrors,
    setTriggerSettingValue,
    setTestDialogOpen,
    setTestEmail,
    setTestPhone,
    setTestEmailSubject,
    setIsSendingTest,
    resetTestCampaign,
    setRecipientCount,
} = campaignsSlice.actions;

export default campaignsSlice.reducer;
