import type { PostApiCampaignsBody, PostApiCampaignsBodyTestPhoneNumber } from '@/shared/api/models';
import type { TriggerFlowState } from './triggerFlowSlice';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import { PostApiCampaignsBodyScheduleTriggerDaysAnyOfItem } from '@/shared/api/models/postApiCampaignsBodyScheduleTriggerDaysAnyOfItem';
import { marketingConditions, getConditionByRenderId } from '@/data/Marketing/MarketingCondition';
import { TriggerCondition } from '../campaigns/campaignsSlice';

function convertConditionToPayload(
    condition: TriggerCondition,
    seq_id: number,
    parentRenderId?: number,
): NonNullable<PostApiCampaignsBody['conditions']>[0] | null {
    const payload: any = {
        seq_id: seq_id,
    };

    // Common handler for conditions that use AGGREGATE operators (GT, LT, EQ)
    if (condition.conditionId === 16 || condition.conditionId === 5 || condition.conditionId === 21) {
        // Try to get operator from various sources
        const operatorSource =
            condition.compositeValues?.threshold?.type ||
            condition.compositeValues?.balanceOperator ||
            condition.compositeValues?.type ||
            condition.operator;

        // Map common operator formats to AGGREGATE format
        if (operatorSource === '>' || operatorSource === 'AGGREGATE_GT') {
            payload.operator = 'AGGREGATE_GT';
        } else if (operatorSource === '<' || operatorSource === 'AGGREGATE_LT') {
            payload.operator = 'AGGREGATE_LT';
        } else if (operatorSource === '=' || operatorSource === 'AGGREGATE_EQ') {
            payload.operator = 'AGGREGATE_EQ';
        } else if (operatorSource && operatorSource.startsWith('AGGREGATE_')) {
            payload.operator = operatorSource;
        } else {
            payload.operator = operatorSource || 'AGGREGATE_GT';
        }
    } else if (condition.compositeValues?.balanceOperator) {
        payload.operator = condition.compositeValues.balanceOperator;
    } else {
        payload.operator = condition.operator;
    }

    // Add condition_id, triggerId, render_id, and field (if provided)
    payload.condition_id = condition.conditionId;
    payload.triggerId = condition.triggerId;
    payload.render_id = String(parentRenderId ?? condition.condition_render_id);
    // Include field property if provided (e.g., for conditionId 26 with interactionField)
    if (condition.field) {
        payload.field = condition.field;
    }

    // Special handling for renderId 14 (Revenue - simple): get threshold from compositeValues
    if (condition.condition_render_id === 14 && condition.conditionId === 5) {
        const threshold = condition.compositeValues?.threshold;
        if (threshold) {
            payload.operator = threshold.type;
            payload.field_value = threshold.amount;
        }
    } else if (condition.aggregate_fn && condition.compositeValues) {
        if (condition.compositeValues.threshold) {
            const threshold = condition.compositeValues.threshold;
            if (threshold.type === 'range' && threshold.minAmount !== null && threshold.maxAmount !== null) {
                payload.field_value = [threshold.minAmount, threshold.maxAmount];
            } else if (threshold.amount !== null && threshold.amount !== undefined) {
                payload.field_value = threshold.amount;
            }
        } else if (condition.compositeValues.type !== undefined || condition.compositeValues.amount !== undefined) {
            const threshold = condition.compositeValues;
            if (threshold.type === 'range' && threshold.minAmount !== null && threshold.maxAmount !== null) {
                payload.field_value = [threshold.minAmount, threshold.maxAmount];
            } else if (threshold.amount !== null && threshold.amount !== undefined) {
                payload.field_value = threshold.amount;
            }
        }
    } else if (
        condition.compositeValues?.balanceAmount !== undefined &&
        condition.compositeValues?.balanceAmount !== null
    ) {
        payload.field_value = condition.compositeValues.balanceAmount;
    } else if (condition.fieldValue !== undefined && condition.fieldValue !== null) {
        if (
            (condition.conditionId === 2 || condition.conditionId === 23) &&
            Array.isArray(condition.fieldValue) &&
            condition.fieldValue.length > 0
        ) {
            payload.field_value = condition.fieldValue[0];
        } else {
            payload.field_value = condition.fieldValue;
        }
    } else if (condition.compositeValues) {
        const firstValue = Object.values(condition.compositeValues)[0];
        if (firstValue !== undefined && firstValue !== null) {
            if (Array.isArray(firstValue) && firstValue.length === 1) {
                payload.field_value = firstValue[0];
            } else {
                payload.field_value = firstValue;
            }
        }
    }

    return payload;
}

//   Prepares trigger flow data from Redux state to match API POST structure
//   This is separate from prepareCampaignPayload and doesn't touch campaign steps
export function prepareTriggerFlowPayload(
    triggerFlowState: TriggerFlowState,
    bypassValidation: boolean = false,
): PostApiCampaignsBody {
    const { triggerFlowData } = triggerFlowState;

    const conditions: NonNullable<PostApiCampaignsBody['conditions']> = [];

    // Process trigger groups
    if (triggerFlowData.triggerGroups && triggerFlowData.triggerGroups.length > 0) {
        for (const triggerGroup of triggerFlowData.triggerGroups) {
            const processedConditionIds = new Set<string>();

            for (const condition of triggerGroup.conditions) {
                if (processedConditionIds.has(condition.id)) {
                    continue;
                }

                if (condition.conditionId === 8) {
                    continue;
                }

                const parentRenderId = condition.condition_render_id;

                // Find condition definition by renderId first (renderId is unique for all conditions)
                const conditionDef = getConditionByRenderId(condition.condition_render_id ?? 0);

                if (conditionDef?.subconditions && conditionDef.subconditions.length > 0) {
                    // Handle renderId 11 (Purchase by item number – period) - create 2 conditions from compositeValues
                    // 1. Sales date range (conditionId 21) with days
                    // 2. Product IDs (conditionId 20) with productIds array
                    if (condition.condition_render_id === 11 && condition.compositeValues) {
                        const productValues = condition.compositeValues as {
                            productIds?: string[] | number[];
                            days?: [number | null, number | null] | number[];
                        };

                        // Create condition for sales date range - use conditionId 21 from schema
                        if (
                            productValues.days &&
                            Array.isArray(productValues.days) &&
                            productValues.days[0] !== null &&
                            productValues.days[0] !== undefined
                        ) {
                            const daysValue = Array.isArray(productValues.days)
                                ? productValues.days[0]
                                : productValues.days;
                            const salesDateCondition = marketingConditions.find((c) => c.conditionId === 21);
                            if (salesDateCondition) {
                                // Use parent condition's seq_id for the first generated condition
                                const currentSeqId = condition.seq_id ?? 1;
                                const salesDatePayload = convertConditionToPayload(
                                    {
                                        conditionId: salesDateCondition.conditionId,
                                        condition_render_id: salesDateCondition.condition_render_id,
                                        description: salesDateCondition.description,
                                        triggerId: salesDateCondition.triggerId,
                                        group_id: salesDateCondition.group_id,
                                        group_name: salesDateCondition.group_name,
                                        group_label: salesDateCondition.group_label,
                                        group_sequence: salesDateCondition.group_sequence,
                                        operator: salesDateCondition.operator,
                                        id: `c${salesDateCondition.conditionId}-${currentSeqId}`,
                                        fieldValue: daysValue,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (salesDatePayload) {
                                    conditions.push(salesDatePayload);
                                }
                            }
                        }

                        // Create condition for product IDs (conditionId 20)
                        if (
                            productValues.productIds &&
                            Array.isArray(productValues.productIds) &&
                            productValues.productIds.length > 0
                        ) {
                            const productSubcondition = conditionDef.subconditions.find((sc) => sc.conditionId === 10);
                            if (productSubcondition?.conditionDefinition) {
                                // Keep productIds as strings (UUIDs) - don't convert to numbers
                                const productIdsArray = productValues.productIds.filter(
                                    (id) => id !== null && id !== undefined,
                                );
                                // Use parent condition's seq_id + 1 for the second generated condition
                                const currentSeqId = condition.seq_id ? condition.seq_id + 1 : 2;
                                const productPayload = convertConditionToPayload(
                                    {
                                        ...productSubcondition.conditionDefinition,
                                        conditionId: 20, // Override to use correct conditionId 20 (not 10 from conditionDefinition)
                                        id: `c20-${currentSeqId}`,
                                        fieldValue: productIdsArray,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (productPayload) {
                                    conditions.push(productPayload);
                                }
                            }
                        }

                        // Mark root condition as processed
                        processedConditionIds.add(condition.id);
                        continue;
                    }

                    // Handle renderId 13 (Purchase by product group – period) - create 2 conditions from compositeValues
                    // 1. Sales date range (conditionId 21) with days
                    // 2. Category IDs (conditionId 24) with categoryIds array (uses parent render_id 13)
                    if (condition.condition_render_id === 13 && condition.compositeValues) {
                        const categoryValues = condition.compositeValues as {
                            categoryIds?: string[] | number[];
                            days?: [number | null, number | null] | number[];
                        };

                        // Create condition for sales date range - use conditionId 21 from schema
                        if (
                            categoryValues.days &&
                            Array.isArray(categoryValues.days) &&
                            categoryValues.days[0] !== null &&
                            categoryValues.days[0] !== undefined
                        ) {
                            const daysValue = Array.isArray(categoryValues.days)
                                ? categoryValues.days[0]
                                : categoryValues.days;
                            const salesDateCondition = marketingConditions.find((c) => c.conditionId === 21);
                            if (salesDateCondition) {
                                // Use parent condition's seq_id for the first generated condition
                                const currentSeqId = condition.seq_id ?? 1;
                                const salesDatePayload = convertConditionToPayload(
                                    {
                                        conditionId: salesDateCondition.conditionId,
                                        condition_render_id: salesDateCondition.condition_render_id,
                                        description: salesDateCondition.description,
                                        triggerId: salesDateCondition.triggerId,
                                        group_id: salesDateCondition.group_id,
                                        group_name: salesDateCondition.group_name,
                                        group_label: salesDateCondition.group_label,
                                        group_sequence: salesDateCondition.group_sequence,
                                        operator: salesDateCondition.operator,
                                        id: `c${salesDateCondition.conditionId}-${currentSeqId}`,
                                        fieldValue: daysValue,
                                    } as unknown as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (salesDatePayload) {
                                    conditions.push(salesDatePayload);
                                }
                            }
                        }

                        // Create condition for category IDs (conditionId 24 with parent render_id 13)
                        if (
                            categoryValues.categoryIds &&
                            Array.isArray(categoryValues.categoryIds) &&
                            categoryValues.categoryIds.length > 0
                        ) {
                            const categorySubcondition = conditionDef.subconditions.find((sc) => sc.conditionId === 24);
                            if (categorySubcondition?.conditionDefinition) {
                                // Keep categoryIds as strings/numbers - filter out null/undefined
                                const categoryIdsArray = categoryValues.categoryIds.filter(
                                    (id) => id !== null && id !== undefined,
                                );
                                // Use parent condition's seq_id + 1 for the second generated condition
                                const currentSeqId = condition.seq_id ? condition.seq_id + 1 : 2;
                                const categoryPayload = convertConditionToPayload(
                                    {
                                        ...categorySubcondition.conditionDefinition,
                                        id: `c${categorySubcondition.conditionDefinition.conditionId}-${currentSeqId}`,
                                        fieldValue: categoryIdsArray,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (categoryPayload) {
                                    conditions.push(categoryPayload);
                                }
                            }
                        }

                        // Mark root condition as processed
                        processedConditionIds.add(condition.id);
                        continue;
                    }

                    // Handle renderId 15 (Revenue – period, conditionId 5) - create 2 conditions from compositeValues
                    // 1. Sales date range (conditionId 21) with days
                    // 2. Revenue threshold (conditionId 5) with threshold type and amount
                    if (condition.condition_render_id === 15 && condition.compositeValues) {
                        const revenueValues = condition.compositeValues as {
                            threshold?: {
                                type?: 'above' | 'below' | 'range';
                                amount?: number | null;
                                minAmount?: number | null;
                                maxAmount?: number | null;
                            };
                            days?: [number | null, number | null] | number[];
                        };

                        // Create condition for sales date range - use conditionId 21 from schema
                        if (
                            revenueValues.days &&
                            Array.isArray(revenueValues.days) &&
                            revenueValues.days[0] !== null &&
                            revenueValues.days[0] !== undefined
                        ) {
                            const daysValue = Array.isArray(revenueValues.days)
                                ? revenueValues.days[0]
                                : revenueValues.days;
                            const salesDateCondition = marketingConditions.find((c) => c.conditionId === 21);
                            if (salesDateCondition) {
                                // Use parent condition's seq_id for the first generated condition
                                const currentSeqId = condition.seq_id ?? 1;
                                const salesDatePayload = convertConditionToPayload(
                                    {
                                        conditionId: salesDateCondition.conditionId,
                                        condition_render_id: salesDateCondition.condition_render_id,
                                        description: salesDateCondition.description,
                                        triggerId: salesDateCondition.triggerId,
                                        group_id: salesDateCondition.group_id,
                                        group_name: salesDateCondition.group_name,
                                        group_label: salesDateCondition.group_label,
                                        group_sequence: salesDateCondition.group_sequence,
                                        operator: salesDateCondition.operator,
                                        id: `c${salesDateCondition.conditionId}-${currentSeqId}`,
                                        fieldValue: daysValue,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (salesDatePayload) {
                                    conditions.push(salesDatePayload);
                                }
                            }
                        }

                        // Create condition for revenue threshold (conditionId 21)
                        if (revenueValues.threshold) {
                            const threshold = revenueValues.threshold;
                            let thresholdFieldValue: number | number[] | null = null;

                            if (
                                threshold.type === 'range' &&
                                threshold.minAmount !== null &&
                                threshold.minAmount !== undefined &&
                                threshold.maxAmount !== null &&
                                threshold.maxAmount !== undefined
                            ) {
                                // For range, use array [minAmount, maxAmount] for AGGREGATE_BETWEEN
                                thresholdFieldValue = [threshold.minAmount, threshold.maxAmount];
                            } else if (threshold.amount !== null && threshold.amount !== undefined) {
                                // For above/below, use the actual amount value
                                thresholdFieldValue = threshold.amount;
                            }

                            if (thresholdFieldValue !== null) {
                                // Determine operator based on threshold type
                                let thresholdOperator = 'AGGREGATE_GT'; // default
                                if (threshold.type === 'below') {
                                    thresholdOperator = 'AGGREGATE_LT';
                                } else if (threshold.type === 'above') {
                                    thresholdOperator = 'AGGREGATE_GT';
                                } else if (threshold.type === 'range') {
                                    thresholdOperator = 'AGGREGATE_BETWEEN';
                                }

                                // Use parent condition's seq_id + 1 for the second generated condition
                                const currentSeqId = condition.seq_id ? condition.seq_id + 1 : 2;
                                const thresholdPayload = convertConditionToPayload(
                                    {
                                        conditionId: 5, // Revenue condition uses conditionId 5
                                        operator: thresholdOperator,
                                        entity: 'sales',
                                        field: 'net_total',
                                        id: `c5-${currentSeqId}`,
                                        fieldValue: thresholdFieldValue,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (thresholdPayload) {
                                    conditions.push(thresholdPayload);
                                }
                            }
                        }

                        // Mark root condition as processed
                        processedConditionIds.add(condition.id);
                        continue;
                    }

                    // Handle conditionId 16 (Gift Card Balance) - create 2 conditions from compositeValues
                    // 1. Expiration days (conditionId 10) with expirationPeriod
                    // 2. Balance condition (conditionId 16) with balanceAmount and balanceOperator
                    if (condition.conditionId === 16 && condition.compositeValues) {
                        const giftCardValues = condition.compositeValues as {
                            balanceOperator?: '>' | '<' | '=' | 'AGGREGATE_GT' | 'AGGREGATE_LT' | 'AGGREGATE_EQ';
                            balanceAmount?: number | null;
                            expirationPeriod?: [number | null, number | null] | number[];
                        };

                        // Create condition for expiration days (conditionId 9)
                        if (
                            giftCardValues.expirationPeriod &&
                            Array.isArray(giftCardValues.expirationPeriod) &&
                            giftCardValues.expirationPeriod[0] !== null &&
                            giftCardValues.expirationPeriod[0] !== undefined
                        ) {
                            const expirationDaysValue = Array.isArray(giftCardValues.expirationPeriod)
                                ? giftCardValues.expirationPeriod[0]
                                : giftCardValues.expirationPeriod;
                            const expirationSubcondition = conditionDef.subconditions.find(
                                (sc) => sc.conditionId === 9,
                            );
                            if (expirationSubcondition?.conditionDefinition) {
                                // Use parent condition's seq_id for the first generated condition
                                const currentSeqId = condition.seq_id ?? 1;
                                const expirationPayload = convertConditionToPayload(
                                    {
                                        ...expirationSubcondition.conditionDefinition,
                                        id: `c${expirationSubcondition.conditionDefinition.conditionId}-${currentSeqId}`,
                                        fieldValue: expirationDaysValue,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (expirationPayload) {
                                    conditions.push(expirationPayload);
                                }
                            }
                        }

                        // Create condition for balance (conditionId 16)
                        if (giftCardValues.balanceAmount !== null && giftCardValues.balanceAmount !== undefined) {
                            // Determine operator based on balanceOperator
                            let balanceOperator = 'AGGREGATE_GT'; // default
                            const operatorToMap = giftCardValues.balanceOperator || '>';
                            if (operatorToMap === '>' || operatorToMap === 'AGGREGATE_GT') {
                                balanceOperator = 'AGGREGATE_GT';
                            } else if (operatorToMap === '<' || operatorToMap === 'AGGREGATE_LT') {
                                balanceOperator = 'AGGREGATE_LT';
                            } else if (operatorToMap === '=' || operatorToMap === 'AGGREGATE_EQ') {
                                balanceOperator = 'AGGREGATE_EQ';
                            }

                            // Use parent condition's seq_id + 1 for the second generated condition
                            const currentSeqId = condition.seq_id ? condition.seq_id + 1 : 2;
                            const balancePayload = convertConditionToPayload(
                                {
                                    conditionId: 16,
                                    operator: balanceOperator,
                                    entity: 'gift_cards_new',
                                    field: 'residue_value',
                                    id: `c16-${currentSeqId}`,
                                    fieldValue: giftCardValues.balanceAmount,
                                } as TriggerCondition,
                                currentSeqId,
                                parentRenderId, // Pass parent render_id
                            );
                            if (balancePayload) {
                                conditions.push(balancePayload);
                            }
                        }

                        // Mark root condition as processed
                        processedConditionIds.add(condition.id);
                        continue;
                    }

                    // Handle conditionId 6 with renderId 9 (Cancelled Booking) - create 3 conditions from compositeValues
                    // Status is always ["CANCELLED"] for this condition
                    if (
                        condition.conditionId === 6 &&
                        condition.condition_render_id === 9 &&
                        condition.compositeValues
                    ) {
                        const bookingValues = condition.compositeValues as {
                            serviceIds?: number[];
                            days?: [number | null, number | null] | number[];
                        };

                        // Create condition for days range (conditionId 2)
                        if (
                            bookingValues.days &&
                            Array.isArray(bookingValues.days) &&
                            bookingValues.days[0] !== null &&
                            bookingValues.days[0] !== undefined
                        ) {
                            const daysSubcondition = conditionDef.subconditions.find((sc) => sc.conditionId === 2);
                            if (daysSubcondition?.conditionDefinition) {
                                const daysValue = Array.isArray(bookingValues.days)
                                    ? bookingValues.days[0]
                                    : bookingValues.days;
                                // Use parent condition's seq_id for the first generated condition
                                const currentSeqId = condition.seq_id ?? 1;
                                const daysPayload = convertConditionToPayload(
                                    {
                                        ...daysSubcondition.conditionDefinition,
                                        id: `c${daysSubcondition.conditionDefinition.conditionId}-${currentSeqId}`,
                                        fieldValue: daysValue,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (daysPayload) {
                                    conditions.push(daysPayload);
                                }
                            }
                        }

                        // Create condition for service IDs (conditionId 6)
                        if (
                            bookingValues.serviceIds &&
                            Array.isArray(bookingValues.serviceIds) &&
                            bookingValues.serviceIds.length > 0
                        ) {
                            const serviceSubcondition = conditionDef.subconditions.find((sc) => sc.conditionId === 6);
                            if (serviceSubcondition?.conditionDefinition) {
                                // Use parent condition's seq_id + 1 for the second generated condition
                                const currentSeqId = condition.seq_id ? condition.seq_id + 1 : 2;
                                const servicePayload = convertConditionToPayload(
                                    {
                                        ...serviceSubcondition.conditionDefinition,
                                        id: `c${serviceSubcondition.conditionDefinition.conditionId}-${currentSeqId}`,
                                        fieldValue: bookingValues.serviceIds,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (servicePayload) {
                                    conditions.push(servicePayload);
                                }
                            }
                        }

                        // Create condition for status (conditionId 25) - always ["CANCELLED"] for cancelled booking
                        // Use parent condition's seq_id + 2 for the third generated condition
                        const currentSeqId = condition.seq_id ? condition.seq_id + 2 : 3;
                        const statusPayload = convertConditionToPayload(
                            {
                                conditionId: 25,
                                operator: 'IN',
                                id: `c25-${currentSeqId}`,
                                fieldValue: ['CANCELLED'],
                            } as TriggerCondition,
                            currentSeqId,
                            parentRenderId, // Pass parent render_id
                        );
                        if (statusPayload) {
                            conditions.push(statusPayload);
                        }

                        // Mark root condition as processed
                        processedConditionIds.add(condition.id);
                        continue;
                    }

                    // Handle conditionId 6 with renderId 8 (ActiveBookingServiceInput) - create 3 conditions from compositeValues
                    // Make sure we don't process renderId 9 (Cancelled Booking) here - it's handled above
                    if (
                        condition.conditionId === 6 &&
                        condition.condition_render_id === 8 &&
                        condition.compositeValues
                    ) {
                        const bookingValues = condition.compositeValues as {
                            serviceIds?: number[];
                            days?: [number | null, number | null] | number[];
                            operator?: string; // Operator for days condition
                            status?: string[];
                        };

                        // Create condition for days range - use conditionId 6 for BEFORE_DAYS, conditionId 30 for WITHIN_LAST_DAYS
                        if (
                            bookingValues.days &&
                            Array.isArray(bookingValues.days) &&
                            bookingValues.days[0] !== null &&
                            bookingValues.days[0] !== undefined
                        ) {
                            const daysValue = Array.isArray(bookingValues.days)
                                ? bookingValues.days[0]
                                : bookingValues.days;
                            // Determine operator and conditionId based on operator
                            const daysOperator =
                                bookingValues.operator ||
                                conditionDef.subconditions.find((sc) => sc.conditionId === 2)?.conditionDefinition
                                    ?.operator ||
                                'BEFORE_DAYS';

                            // Use conditionId 6 for BEFORE_DAYS, conditionId 30 for WITHIN_LAST_DAYS
                            const targetConditionId = daysOperator === 'BEFORE_DAYS' ? 6 : 30;

                            // Find subcondition or use base definition
                            const daysSubcondition = conditionDef.subconditions.find((sc) => sc.conditionId === 2);
                            const baseDefinition = daysSubcondition?.conditionDefinition || {
                                conditionId: targetConditionId,
                                condition_render_id: parentRenderId,
                                field: 'booking_datetime_start',
                                operator: daysOperator,
                                description: 'Customer Has Any Booking',
                                triggerId: 1,
                                group_id: 2,
                                group_name: 'BookingBehavior',
                                group_label: 'Booking Behavior',
                                group_sequence: 2,
                                condition_label: 'Active Booking',
                            };

                            // Use parent condition's seq_id for the first generated condition
                            const currentSeqId = condition.seq_id ?? 1;
                            const daysPayload = convertConditionToPayload(
                                {
                                    ...baseDefinition,
                                    conditionId: targetConditionId, // Override conditionId based on operator
                                    id: `c${targetConditionId}-${currentSeqId}`,
                                    fieldValue: daysValue,
                                    operator: daysOperator,
                                } as TriggerCondition,
                                currentSeqId,
                                parentRenderId, // Pass parent render_id
                            );
                            if (daysPayload) {
                                conditions.push(daysPayload);
                            }
                        }

                        // Create condition for service IDs (conditionId 6)
                        if (
                            bookingValues.serviceIds &&
                            Array.isArray(bookingValues.serviceIds) &&
                            bookingValues.serviceIds.length > 0
                        ) {
                            const serviceSubcondition = conditionDef.subconditions.find((sc) => sc.conditionId === 6);
                            if (serviceSubcondition?.conditionDefinition) {
                                // Use parent condition's seq_id + 1 for the second generated condition
                                const currentSeqId = condition.seq_id ? condition.seq_id + 1 : 2;
                                const servicePayload = convertConditionToPayload(
                                    {
                                        ...serviceSubcondition.conditionDefinition,
                                        id: `c${serviceSubcondition.conditionDefinition.conditionId}-${currentSeqId}`,
                                        fieldValue: bookingValues.serviceIds,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (servicePayload) {
                                    conditions.push(servicePayload);
                                }
                            }
                        }

                        // Create condition for status (conditionId 25)
                        if (
                            bookingValues.status &&
                            Array.isArray(bookingValues.status) &&
                            bookingValues.status.length > 0
                        ) {
                            const statusSubcondition = conditionDef.subconditions.find((sc) => sc.conditionId === 25);
                            if (statusSubcondition?.conditionDefinition) {
                                // Use parent condition's seq_id + 2 for the third generated condition
                                const currentSeqId = condition.seq_id ? condition.seq_id + 2 : 3;
                                const statusPayload = convertConditionToPayload(
                                    {
                                        ...statusSubcondition.conditionDefinition,
                                        conditionId: 25, // Override to use correct conditionId 25 (not 7 from conditionDefinition)
                                        id: `c25-${currentSeqId}`,
                                        fieldValue: bookingValues.status,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (statusPayload) {
                                    conditions.push(statusPayload);
                                }
                            }
                        }

                        // Mark root condition as processed
                        processedConditionIds.add(condition.id);
                        continue;
                    }

                    if (condition.conditionId === 18) {
                        const fieldValue = condition.fieldValue;
                        let apiFieldValue: any = null;

                        if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
                            if (
                                typeof fieldValue.milestone === 'boolean' &&
                                fieldValue.milestone === false &&
                                typeof fieldValue.last === 'number' &&
                                typeof fieldValue.next === 'number'
                            ) {
                                apiFieldValue = {
                                    milestone: fieldValue.milestone,
                                    last: fieldValue.last,
                                    next: fieldValue.next,
                                };
                            } else if (typeof fieldValue.milestone === 'boolean') {
                                apiFieldValue = {
                                    milestone: fieldValue.milestone,
                                };
                            }
                        }

                        if (!apiFieldValue) {
                            if (Array.isArray(fieldValue) && fieldValue.length === 2) {
                                apiFieldValue = {
                                    milestone: false,
                                    last: typeof fieldValue[0] === 'number' ? fieldValue[0] : null,
                                    next: typeof fieldValue[1] === 'number' ? fieldValue[1] : null,
                                };
                            } else {
                                apiFieldValue = { milestone: false };
                            }
                        }

                        if (apiFieldValue && conditionDef) {
                            // Use condition's seq_id if available
                            const currentSeqId = condition.seq_id ?? 1;
                            const birthdayPayload = convertConditionToPayload(
                                {
                                    ...conditionDef,
                                    conditionId: 18,
                                    id: `c18-${currentSeqId}`,
                                    fieldValue: apiFieldValue,
                                    operator: conditionDef.operator,
                                    entity: conditionDef.field,
                                    field: conditionDef.field,
                                    subconditions: conditionDef.subconditions,
                                } as unknown as TriggerCondition,
                                currentSeqId,
                                parentRenderId,
                            );
                            if (birthdayPayload) {
                                conditions.push(birthdayPayload);
                            }
                        }

                        // Mark root condition as processed
                        processedConditionIds.add(condition.id);
                        continue;
                    }

                    // Handle renderId 19 (Previous campaign / Communication) - create 3 conditions from compositeValues
                    // 1. Campaign ID (conditionId 29) with operator "=" or "IN"
                    // 2. Interaction status (conditionId 26) with operator "IN"
                    // 3. Days (conditionId 27) with operator "BEFORE_DAYS"
                    if (condition.condition_render_id === 19 && condition.compositeValues) {
                        const communicationValues = condition.compositeValues as {
                            campaignId?: string;
                            interactionStatus?: string[]; // Only array format
                            interactionField?: string; // Field name
                            days?: [number | null, number | null] | number[];
                        };

                        // Create condition for campaign ID (conditionId 29)
                        if (communicationValues.campaignId) {
                            const campaignSubcondition = conditionDef.subconditions.find((sc) => sc.conditionId === 29);
                            if (campaignSubcondition?.conditionDefinition) {
                                // Use operator "=" for single campaign selection
                                // Use parent condition's seq_id for the first generated condition
                                const currentSeqId = condition.seq_id ?? 1;
                                const campaignPayload = convertConditionToPayload(
                                    {
                                        ...campaignSubcondition.conditionDefinition,
                                        conditionId: 29,
                                        operator: '=', // API expects = for single value
                                        id: `c29-${currentSeqId}`,
                                        fieldValue: communicationValues.campaignId,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (campaignPayload) {
                                    conditions.push(campaignPayload);
                                }
                            }
                        }

                        // Create condition for interaction status (conditionId 26)
                        if (
                            communicationValues.interactionStatus &&
                            Array.isArray(communicationValues.interactionStatus) &&
                            communicationValues.interactionStatus.length > 0
                        ) {
                            // Use parent condition's seq_id + 1 for the second generated condition
                            const currentSeqId = condition.seq_id ? condition.seq_id + 1 : 2;
                            const statusPayload = convertConditionToPayload(
                                {
                                    conditionId: 26,
                                    operator: 'IN',
                                    id: `c26-${currentSeqId}`,
                                    fieldValue: communicationValues.interactionStatus,
                                    // Set field property if interactionField is provided
                                    field: communicationValues.interactionField || '',
                                } as TriggerCondition,
                                currentSeqId,
                                parentRenderId, // Pass parent render_id
                            );
                            if (statusPayload) {
                                conditions.push(statusPayload);
                            }
                        }

                        // Create condition for days (conditionId 27)
                        if (
                            communicationValues.days &&
                            Array.isArray(communicationValues.days) &&
                            communicationValues.days[0] !== null &&
                            communicationValues.days[0] !== undefined
                        ) {
                            const daysSubcondition = conditionDef.subconditions.find((sc) => sc.conditionId === 27);
                            if (daysSubcondition?.conditionDefinition) {
                                const daysValue = Array.isArray(communicationValues.days)
                                    ? communicationValues.days[0]
                                    : communicationValues.days;
                                // Use parent condition's seq_id + 2 for the third generated condition
                                const currentSeqId = condition.seq_id ? condition.seq_id + 2 : 3;
                                const daysPayload = convertConditionToPayload(
                                    {
                                        ...daysSubcondition.conditionDefinition,
                                        conditionId: 27,
                                        operator: 'BEFORE_DAYS',
                                        id: `c27-${currentSeqId}`,
                                        fieldValue: daysValue,
                                    } as TriggerCondition,
                                    currentSeqId,
                                    parentRenderId, // Pass parent render_id
                                );
                                if (daysPayload) {
                                    conditions.push(daysPayload);
                                }
                            }
                        }

                        // Mark root condition as processed
                        processedConditionIds.add(condition.id);
                        continue;
                    }

                    // Handle dualCondition case (ClipCardBalanceInput) - create conditions from compositeValues
                    if (condition.compositeValues?.dualCondition === true) {
                        const dualValues = condition.compositeValues as {
                            dualCondition: boolean;
                            expirationCondition?: { conditionId: number; value: number | null };
                            clipsCondition?: { conditionId: number; minClips: number | null; maxClips: number | null };
                        };

                        // Process expiration condition (conditionId 13) - this is the root condition itself
                        if (
                            dualValues.expirationCondition?.value !== null &&
                            dualValues.expirationCondition?.value !== undefined
                        ) {
                            // Create expiration condition directly using conditionId 13 schema
                            // Use parent condition's seq_id for the first generated condition
                            const currentSeqId = condition.seq_id ?? 1;
                            const expirationPayload = convertConditionToPayload(
                                {
                                    conditionId: 13,
                                    operator: 'WITHIN_NEXT_DAYS',
                                    entity: 'sold_bundle_offers',
                                    field: 'expiry_date',
                                    id: `c13-${currentSeqId}`,
                                    fieldValue: dualValues.expirationCondition.value,
                                } as TriggerCondition,
                                currentSeqId,
                                parentRenderId, // Pass parent render_id
                            );
                            if (expirationPayload) {
                                conditions.push(expirationPayload);
                            }
                        }

                        // Process clips condition - create condition with appropriate operator based on min/max
                        if (dualValues.clipsCondition) {
                            const clipsSubcondition = conditionDef.subconditions.find(
                                (sc) => sc.conditionId === dualValues.clipsCondition!.conditionId,
                            );

                            if (clipsSubcondition?.conditionDefinition) {
                                const clipsData = dualValues.clipsCondition;

                                // Handle min clips (> operator)
                                if (clipsData.minClips !== null && clipsData.minClips !== undefined) {
                                    const currentSeqId = condition.seq_id ? condition.seq_id + 1 : 2;
                                    const minClipsPayload = convertConditionToPayload(
                                        {
                                            ...clipsSubcondition.conditionDefinition,
                                            operator: '>', // Use > for min
                                            id: `c${clipsSubcondition.conditionDefinition.conditionId}-${currentSeqId}`,
                                            fieldValue: clipsData.minClips, // Number, not array
                                        } as TriggerCondition,
                                        currentSeqId,
                                        parentRenderId,
                                    );
                                    if (minClipsPayload) {
                                        conditions.push(minClipsPayload);
                                    }
                                }

                                // Handle max clips (< operator)
                                if (clipsData.maxClips !== null && clipsData.maxClips !== undefined) {
                                    // Use seq_id + 2 if min was also present, otherwise seq_id + 1
                                    const currentSeqId = condition.seq_id
                                        ? clipsData.minClips !== null && clipsData.minClips !== undefined
                                            ? condition.seq_id + 2
                                            : condition.seq_id + 1
                                        : clipsData.minClips !== null && clipsData.minClips !== undefined
                                          ? 3
                                          : 2;
                                    const maxClipsPayload = convertConditionToPayload(
                                        {
                                            ...clipsSubcondition.conditionDefinition,
                                            operator: '<', // Use < for max
                                            id: `c${clipsSubcondition.conditionDefinition.conditionId}-${currentSeqId}`,
                                            fieldValue: clipsData.maxClips,
                                        } as TriggerCondition,
                                        currentSeqId,
                                        parentRenderId,
                                    );
                                    if (maxClipsPayload) {
                                        conditions.push(maxClipsPayload);
                                    }
                                }
                            }
                        }
                    } else {
                        // Standard subconditions processing - find existing subconditions in group
                        const subconditions = triggerGroup.conditions.filter((c) =>
                            conditionDef.subconditions?.some((sc) => sc.conditionId === c.conditionId),
                        );

                        // Process each subcondition
                        for (let i = 0; i < subconditions.length; i++) {
                            const subcondition = subconditions[i];
                            // Use subcondition's seq_id if available, otherwise use parent's seq_id + index
                            const currentSeqId =
                                subcondition.seq_id ?? (condition.seq_id ? condition.seq_id + i : i + 1);
                            const subPayload = convertConditionToPayload(
                                subcondition,
                                currentSeqId,
                                parentRenderId, // Pass parent render_id for subconditions
                            );
                            if (subPayload) {
                                conditions.push(subPayload);
                            }
                            processedConditionIds.add(subcondition.id);
                        }

                        // Also process the root condition if it has a value or compositeValues
                        // This handles cases where values are stored in compositeValues (e.g., balanceOperator, balanceAmount)
                        const hasValue = condition.fieldValue !== undefined && condition.fieldValue !== null;
                        const hasCompositeValues =
                            condition.compositeValues && Object.keys(condition.compositeValues).length > 0;

                        if (hasValue || hasCompositeValues) {
                            // Use condition's seq_id if available
                            const currentSeqId = condition.seq_id ?? 1;
                            const rootPayload = convertConditionToPayload(condition, currentSeqId);
                            if (rootPayload) {
                                conditions.push(rootPayload);
                            }
                        }
                    }
                } else {
                    // Standard condition - process normally
                    // Use condition's seq_id if available
                    const currentSeqId = condition.seq_id ?? 1;
                    const conditionPayload = convertConditionToPayload(condition, currentSeqId);
                    if (conditionPayload) {
                        conditions.push(conditionPayload);
                    }
                }
            }
        }
    }

    // Add consent condition if consent is true
    if (triggerFlowData.consent.value === true) {
        // Get render_id for consent condition (conditionId 8)
        const consentCondition = marketingConditions.find((c) => c.conditionId === 8);
        const consentRenderId = consentCondition?.condition_render_id;

        // For consent, find max seq_id from all conditions and add 1, or use stored seq_id
        const maxSeqId = conditions.length > 0 ? Math.max(...conditions.map((c) => c.seq_id ?? 0)) : 0;
        const consentSeqId = triggerFlowData.consent.seq_id ?? maxSeqId + 1;
        conditions.push({
            condition_id: 8, // Consent condition
            operator: '=',
            field_value: true,
            seq_id: consentSeqId,
            ...(consentRenderId !== undefined && { render_id: String(consentRenderId) }),
        });
    }

    // Get message type and content type from trigger setting
    const triggerType: 'EMAIL' | 'SMS' = triggerFlowData.triggerSetting?.triggerType || 'EMAIL';
    const messageType = triggerType;
    const contentType = triggerType;

    // Convert weekdays to triggerDays array
    const triggerDays: PostApiCampaignsBodyScheduleTriggerDaysAnyOfItem[] = [];
    if (triggerFlowData.triggerSetting?.weekdays) {
        const weekdayMap: Record<string, PostApiCampaignsBodyScheduleTriggerDaysAnyOfItem> = {
            Sun: 'sunday',
            Mon: 'monday',
            Tue: 'tuesday',
            Wed: 'wednesday',
            Thu: 'thursday',
            Fri: 'friday',
            Sat: 'saturday',
        };
        Object.entries(triggerFlowData.triggerSetting.weekdays).forEach(([key, value]) => {
            if (value && weekdayMap[key]) {
                triggerDays.push(weekdayMap[key]);
            }
        });
    }

    let triggerTime: number | null = null;
    if (
        triggerFlowData.triggerSetting?.triggerTime !== undefined &&
        triggerFlowData.triggerSetting?.triggerTime !== null
    ) {
        triggerTime = Number(triggerFlowData.triggerSetting.triggerTime);
    }

    // Convert waitingPeriod and spamPeriod from string to number
    let waitingPeriod: number | null = null;
    if (triggerFlowData.triggerSetting?.waitingPeriod && triggerFlowData.triggerSetting.waitingPeriod.trim()) {
        const parsed = parseInt(triggerFlowData.triggerSetting.waitingPeriod, 10);
        const hoursOfDays = parsed * 24;
        waitingPeriod = isNaN(hoursOfDays) ? null : hoursOfDays;
    }

    let spamPeriod: number | null = null;
    if (triggerFlowData.triggerSetting?.spamPeriod && triggerFlowData.triggerSetting.spamPeriod.trim()) {
        const parsed = parseInt(triggerFlowData.triggerSetting.spamPeriod, 10);
        const hoursOfDays = parsed * 24;
        spamPeriod = isNaN(hoursOfDays) ? null : hoursOfDays;
    }

    // Validate required fields
    const campaignName = triggerFlowData.triggerSetting?.name || '';
    if (!campaignName && !bypassValidation) {
        throw new Error('Campaign name is required. Please fill in Trigger Setting.');
    }

    const payload: PostApiCampaignsBody = {
        name: campaignName,
        description: triggerFlowData.triggerSetting?.description || '',
        messageType: messageType,
        campaignType: PostApiCampaignsBodyCampaignType.TRIGGER,
        testPhoneNumber:
            `${(triggerFlowData.triggerSetting?.testPhoneNumber as { country_code?: string } | undefined)?.country_code ?? '+45'}${(triggerFlowData.triggerSetting?.testPhoneNumber as { phone?: string } | undefined)?.phone ?? ''}` as unknown as PostApiCampaignsBodyTestPhoneNumber,
        testEmail: triggerFlowData.triggerSetting?.testEmail || '',
        bccEmail: triggerFlowData.triggerSetting?.bccEmail || '',
        conditions: conditions.length > 0 ? conditions : [],
        content: {
            subject: triggerFlowData.content?.subject || null,
            content: triggerFlowData.content?.content || '',
            contentType: contentType,
            contentCC: triggerFlowData.content?.replyTo || null,
            sender: triggerFlowData.content?.sender || null,
            templateId: null,
        },
        schedule: {
            // sendDateTime: sendDateTime,
            isManualTrigger: false,
            triggerDays: triggerDays.length > 0 ? triggerDays : null,
            triggerTime: triggerTime,
            waitingPeriod: waitingPeriod,
            spamPeriod: spamPeriod,
        },
    };

    return payload;
}
