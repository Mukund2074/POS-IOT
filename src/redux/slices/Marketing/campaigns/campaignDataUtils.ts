import type { PostApiCampaignsBody, PutApiCampaignsIdBody } from '@/shared/api/models';
import type { CampaignState } from './campaignsSlice';
import { PostApiCampaignsBodyMessageType } from '@/shared/api/models/postApiCampaignsBodyMessageType';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import { PostApiCampaignsBodyContentContentType } from '@/shared/api/models/postApiCampaignsBodyContentContentType';
import moment from 'moment';

/**
 * Maps campaign type to message type
 */
function getMessageTypeFromCampaignType(
    campaignType: PostApiCampaignsBodyCampaignType,
): PostApiCampaignsBodyMessageType {
    switch (campaignType) {
        case PostApiCampaignsBodyCampaignType.EMAIL:
            return PostApiCampaignsBodyMessageType.EMAIL;
        case PostApiCampaignsBodyCampaignType.SMS:
            return PostApiCampaignsBodyMessageType.SMS;
        case PostApiCampaignsBodyCampaignType.TRIGGER:
            // TRIGGER campaigns can be either EMAIL or SMS, defaulting to EMAIL
            // This can be made configurable in the future if needed
            return PostApiCampaignsBodyMessageType.EMAIL;
        default:
            return PostApiCampaignsBodyMessageType.EMAIL;
    }
}

/**
 * Maps campaign type to content type
 */
function getContentTypeFromCampaignType(
    campaignType: PostApiCampaignsBodyCampaignType,
): PostApiCampaignsBodyContentContentType {
    switch (campaignType) {
        case PostApiCampaignsBodyCampaignType.EMAIL:
            return PostApiCampaignsBodyContentContentType.EMAIL;
        case PostApiCampaignsBodyCampaignType.SMS:
            return PostApiCampaignsBodyContentContentType.SMS;
        case PostApiCampaignsBodyCampaignType.TRIGGER:
            // TRIGGER campaigns can be either EMAIL or SMS, defaulting to EMAIL
            // This can be made configurable in the future if needed
            return PostApiCampaignsBodyContentContentType.EMAIL;
        default:
            return PostApiCampaignsBodyContentContentType.EMAIL;
    }
}
/**
 * Prepares campaign data from Redux state to match API POST structure
 */
export function prepareCampaignPayload(state: CampaignState): PostApiCampaignsBody {
    const { campaignData } = state;
    // console.log('[0] - Campaign data:', campaignData);

    const conditions: PostApiCampaignsBody['conditions'] = [];
    let seq_id = 1;

    // Note: Trigger campaigns are handled separately by prepareTriggerFlowPayload
    // This function only handles regular EMAIL/SMS campaigns

    const groupsToProcess =
        campaignData.step2.selectedGroups && campaignData.step2.selectedGroups.length > 0
            ? campaignData.step2.selectedGroups
            : campaignData.step2.selectedGroup
              ? [campaignData.step2.selectedGroup]
              : [];
    // console.log('[1] - Groups to process:', groupsToProcess);

    for (const group of groupsToProcess) {
        if (group === 'BOOKING') {
            const filters = campaignData.step2.filters || {};
            // console.log('[2] - Filters:', filters);
            if (filters.fromDate && filters.toDate) {
                // console.log('[3] - Adding booking condition');
                conditions.push({
                    condition_id: 4,
                    field_value: [filters.fromDate, filters.toDate],
                    operator: 'BETWEEN',
                    seq_id: seq_id++,
                });
            }

            if (filters.employee) {
                // console.log('[4] - Adding employee condition', filters.employee);
                conditions.push({
                    condition_id: 28,
                    field_value: [Number(filters.employee)],
                    operator: 'IN',
                    seq_id: seq_id++,
                });
            }

            if (filters.treatments && filters.treatments.length > 0) {
                // console.log('[5] - Adding treatments condition', filters.treatments);
                conditions.push({
                    condition_id: 6,
                    field_value: filters.treatments?.map((treatment) => Number(treatment)).filter(Boolean),
                    operator: 'IN',
                    seq_id: seq_id++,
                });
            }
        } else if (group === 'ACTIVE') {
            // console.log('[7] - Adding active condition', group);
            conditions.push({
                condition_id: 2,
                field_value: 365,
                operator: 'WITHIN_LAST_DAYS',
                seq_id: seq_id++,
            });
        } else if (
            group &&
            group !== 'WITHOUT_CONSENT' &&
            group !== 'BOOKING' &&
            group !== 'ACTIVE' &&
            group !== 'ALL_WITH_CONSENT'
        ) {
            // console.log('[8] - Adding customer group condition', group);
            // Use customer group name instead of UUID
            conditions.push({
                condition_id: 17,
                field_value: [group],
                operator: '=',
                seq_id: seq_id++,
            });
        }
    }

    // Without consent selected → push consent condition with null value
    const hasAllCustomers = groupsToProcess.includes('WITHOUT_CONSENT');
    if (hasAllCustomers) {
        // console.log('[6] - Adding consent condition with null value if its without consent');
        conditions.push({
            condition_id: 8,
            field_value: null,
            operator: '=',
            seq_id: seq_id++,
        });
    }

    // Format sendDateTime using moment.js
    let sendDateTime: string;

    if (campaignData.step4.isManualTrigger) {
        // console.log('[9] - Manual trigger', campaignData.step4.isManualTrigger);
        sendDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    } else {
        //  console.log('[10] - Scheduled trigger', campaignData.step4.sendDateTime);
        sendDateTime = campaignData.step4.sendDateTime
            ? moment(campaignData.step4.sendDateTime).format('YYYY-MM-DD HH:mm:ss')
            : moment().format('YYYY-MM-DD HH:mm:ss');
    }

    // Get campaign type from state (defaults to EMAIL if not set)
    const campaignType = state.campaignType || PostApiCampaignsBodyCampaignType.EMAIL;
    const messageType = getMessageTypeFromCampaignType(campaignType);
    const contentType = getContentTypeFromCampaignType(campaignType);

    // Validate required fields
    const campaignName = campaignData.step1?.campaignName?.trim() || '';
    if (!campaignName) {
        throw new Error('Campaign name is required. Please fill in Step 1.');
    }

    const rawSender = campaignData.step3.sender || null;
    const sender =
        campaignType === PostApiCampaignsBodyCampaignType.SMS && rawSender
            ? rawSender.slice(0, 11)
            : rawSender;

    const payload: PostApiCampaignsBody = {
        name: campaignName,
        description: null,
        messageType: messageType,
        campaignType: campaignType,
        conditions: conditions.length > 0 ? conditions : [], // Always include conditions array (empty if no conditions)
        content: {
            subject: campaignData.step3.subject || null,
            content: campaignData.step3.content || '',
            contentType: contentType,
            contentCC: campaignData.step3.replyTo || null,
            sender,
            templateId: null,
        },
        schedule: {
            sendDateTime: sendDateTime,
            isManualTrigger: campaignData.step4.isManualTrigger,
        },
    };

    return payload;
}

/**
 * Prepares campaign data for PUT (update) - same structure as POST
 */
export function prepareCampaignUpdatePayload(state: CampaignState): PutApiCampaignsIdBody {
    const postPayload = prepareCampaignPayload(state);

    return {
        name: postPayload.name,
        description: postPayload.description,
        messageType: postPayload.messageType,
        conditions: postPayload.conditions,
        content: postPayload.content,
        schedule: postPayload.schedule,
    };
}
