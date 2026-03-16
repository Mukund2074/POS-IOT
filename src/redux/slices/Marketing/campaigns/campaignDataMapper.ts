import type { GetApiCampaignsId200 } from '@/shared/api/models';
import type { CampaignData, SelectedGroup } from './campaignsSlice';
import moment from 'moment';

/**
 * Maps API GET response to Redux CampaignData format.
 * Group 1 (required): ALL_WITH_CONSENT or WITHOUT_CONSENT. Group 2 (optional): BOOKING, customer group name.
 */
export function mapApiResponseToCampaignData(apiData: GetApiCampaignsId200): CampaignData {
    const selectedGroups: string[] = [];
    const filters: CampaignData['step2']['filters'] = {};
    let customerGroupName: string = '';

    if (apiData.conditions && apiData.conditions.length > 0) {
        // Group 1: consent. Condition 8 present → WITHOUT_CONSENT; absent → ALL_WITH_CONSENT.
        const consentCondition = apiData.conditions.find((c) => c.conditionId === 8);
        selectedGroups.push(consentCondition ? 'WITHOUT_CONSENT' : 'ALL_WITH_CONSENT');

        // Check for booking condition (conditionId: 4, 6, or entity === 'bookings')
        const hasBookingCondition = apiData.conditions.some(
            (c) => c.conditionId === 4 || c.conditionId === 6 || c.entity === 'bookings',
        );
        if (hasBookingCondition) {
            selectedGroups.push('BOOKING');

            // Extract date range from condition_id 4
            const dateRangeCondition = apiData.conditions.find((c) => c.conditionId === 4);
            if (dateRangeCondition?.fieldValue) {
                // Handle both array and string formats
                if (Array.isArray(dateRangeCondition.fieldValue)) {
                    if (dateRangeCondition.fieldValue.length === 2) {
                        filters.fromDate = String(dateRangeCondition.fieldValue[0]).trim();
                        filters.toDate = String(dateRangeCondition.fieldValue[1]).trim();
                    }
                } else {
                    // Fallback for string format (backward compatibility)
                    const dateRange = String(dateRangeCondition.fieldValue).split(',');
                    if (dateRange.length === 2) {
                        filters.fromDate = dateRange[0].trim();
                        filters.toDate = dateRange[1].trim();
                    }
                }
            }

            // Extract employee from custom condition
            const employeeCondition = apiData.conditions.find(
                (c) => c.entity === 'bookings' && c.field === 'employee_id',
            );
            if (employeeCondition?.fieldValue) {
                filters.employee = String(employeeCondition.fieldValue);
            }

            // Extract treatments from condition_id 6
            const treatmentsCondition = apiData.conditions.find((c) => c.conditionId === 6);
            if (treatmentsCondition?.fieldValue) {
                const treatments = Array.isArray(treatmentsCondition.fieldValue)
                    ? treatmentsCondition.fieldValue.map(String)
                    : [String(treatmentsCondition.fieldValue)];
                filters.treatments = treatments;
            }
        }

        // Check for active condition (conditionId: 2)
        const hasActiveCondition = apiData.conditions.some((c) => c.conditionId === 2);
        if (hasActiveCondition) {
            selectedGroups.push('ACTIVE');
        }

        // Check for customer group (conditions with entity 'outlet_customers' and field 'customer_group_id')
        // OR conditionId 17 with entity 'customer_group' and field 'group'
        const customerGroupConditions = apiData.conditions.filter(
            (c) =>
                (c.entity === 'outlet_customers' &&
                    c.field === 'customer_group_id' &&
                    c.fieldValue &&
                    !c.conditionId) ||
                (c.conditionId === 17 && c.entity === 'customer_group' && c.field === 'group' && c.fieldValue),
        );
        // Extract customer group name and add to selectedGroups for UI/payload
        customerGroupConditions.forEach((condition) => {
            const fieldValue = condition.fieldValue;
            if (!fieldValue) return;
            customerGroupName = String(fieldValue);
        });
        if (customerGroupName) {
            selectedGroups.push(customerGroupName);
        }
    } else {
        selectedGroups.push('ALL_WITH_CONSENT');
    }

    const group2Value: 'CUSTOMER_GROUP' | 'BOOKING' | null = selectedGroups.includes('BOOKING')
        ? 'BOOKING'
        : customerGroupName
          ? 'CUSTOMER_GROUP'
          : null;

    // For backward compatibility, set selectedGroup to the first selected group or null
    const selectedGroup = selectedGroups.length > 0 ? selectedGroups[0] : null;

    // Format sendDateTime from schedule
    let sendDateTime = '';
    if (apiData.schedule?.sendDateTime) {
        sendDateTime = moment(apiData.schedule.sendDateTime).format('YYYY-MM-DD HH:mm:ss');
    }

    const campaignData: CampaignData = {
        step1: {
            campaignName: apiData.name || '',
            isExpanded: true,
        },
        step2: {
            selectedGroup: selectedGroup as SelectedGroup | null,
            selectedGroups,
            group2Value,
            customerGroupName,
            filters,
            isExpanded: false,
            serviceGroups: [], // Will be loaded separately if needed
        },
        step3: {
            subject: apiData.content?.subject || '',
            sender: apiData.content?.sender || '',
            replyTo: apiData.content?.contentCC || '',
            content: apiData.content?.content || '',
            isExpanded: false,
        },
        step4: {
            sendDateTime: sendDateTime,
            isManualTrigger: apiData.schedule?.isManualTrigger || false,
            isExpanded: false,
        },
        step5: {
            recipientCount: apiData.totalRecipients ?? 0,
            isExpanded: false,
        },
    };

    console.log('\n\n\n\n\n[CAMPAIGN DATA MAPPER] campaignData', JSON.stringify(campaignData, null, 2));

    return campaignData;
}
