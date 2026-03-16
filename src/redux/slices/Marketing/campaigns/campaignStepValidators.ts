import * as Yup from 'yup';
import { t } from 'i18next';
import type { CampaignData } from './campaignsSlice';
import type { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';

export const BOOKING_VALIDATION_SCHEMA = Yup.object().shape({
    fromDate: Yup.string().required(t('Marketing.EmailCampaignsFromDateRequired')),
    toDate: Yup.string()
        .required(t('Marketing.EmailCampaignsToDateRequired'))
        .test('is-after-from', t('Marketing.EmailCampaignsToDateMustBeAfterFromDate'), function (value) {
            const { fromDate } = this.parent;
            if (!fromDate || !value) return true;
            return new Date(value) >= new Date(fromDate);
        }),
    employee: Yup.string().required(t('Marketing.EmailCampaignsEmployeeRequired')),
    treatments: Yup.array()
        .of(Yup.string())
        .min(1, t('Marketing.EmailCampaignsAtLeastOneTreatmentRequired'))
        .required(t('Marketing.EmailCampaignsAtLeastOneTreatmentRequired')),
});

export function isStep1Valid(step1: CampaignData['step1']): boolean {
    return !!step1?.campaignName?.trim();
}

export function isStep2Valid(step2: CampaignData['step2']): boolean {
    const hasGroup1 =
        step2?.selectedGroups?.includes('ALL_WITH_CONSENT') || step2?.selectedGroups?.includes('WITHOUT_CONSENT');
    if (!hasGroup1) return false;

    if (step2?.group2Value === 'CUSTOMER_GROUP') {
        if (!step2?.customerGroupName?.trim()) return false;
    }

    if (step2?.group2Value === 'BOOKING') {
        try {
            BOOKING_VALIDATION_SCHEMA.validateSync({
                fromDate: step2?.filters?.fromDate || '',
                toDate: step2?.filters?.toDate || '',
                employee: step2?.filters?.employee || '',
                treatments: step2?.filters?.treatments || [],
            });
        } catch {
            return false;
        }
    }

    return true;
}

export function isStep3Valid(
    step3: CampaignData['step3'],
    campaignType: PostApiCampaignsBodyCampaignType,
): boolean {
    const contentStripped = step3?.content?.replace(/<[^>]*>/g, '')?.trim();
    const isSMS = campaignType === 'SMS';
    if (isSMS) return !!contentStripped;
    const subject = step3?.subject?.trim() ?? '';
    return !!(subject && contentStripped);
}

export function isStep4Valid(step4: CampaignData['step4']): boolean {
    return step4?.isManualTrigger === true || !!step4?.sendDateTime?.trim();
}

export interface StepValidationStatus {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
}

export function getStepValidationStatus(
    campaignData: CampaignData,
    campaignType: PostApiCampaignsBodyCampaignType,
): StepValidationStatus {
    return {
        step1: isStep1Valid(campaignData.step1),
        step2: isStep2Valid(campaignData.step2),
        step3: isStep3Valid(campaignData.step3, campaignType),
        step4: isStep4Valid(campaignData.step4),
    };
}
