import type { TriggerGroup } from '@/redux/slices/Marketing/campaigns';
import type { TriggerFlowData } from '@/redux/slices/Marketing/triggerFlow';

/**
 * Redux state shape used by TriggerBuilder components and hooks.
 * Use this type for useSelector in TriggerConfiguration and usePlaygroundFormRegistry.
 */
export interface TriggerBuilderRootState {
    campaigns: {
        editingCampaignId: string | null;
        createdCampaign: { id: string; recipientCount?: number } | null;
    };
    triggerFlow: {
        triggerFlowData?: {
            triggerGroups: TriggerGroup[];
            selectedTriggerConditionId: string | null;
            consent?: { value: boolean | null | undefined };
            triggerSetting?: TriggerFlowData['triggerSetting'];
            content?: TriggerFlowData['content'];
        };
        isSaving?: boolean;
        isActivating?: boolean;
    };
}
