import type { GetApiCampaignsId200 } from '@/shared/api/models';
import type { TriggerFlowData } from './triggerFlowSlice';
import type { TriggerGroup, TriggerCondition } from '../campaigns/campaignsSlice';
import { getConditionByRenderId } from '@/data/Marketing/MarketingCondition';
// import moment from 'moment';

/**
 * Maps API GET response to TriggerFlowData format
 * This is separate from CampaignData and doesn't touch campaign steps
 */
export function mapApiResponseToTriggerFlowData(apiData: GetApiCampaignsId200): TriggerFlowData {
    // Group conditions by logical_group or create a single default group
    const triggerGroups: TriggerGroup[] = [];

    if (apiData.conditions && apiData.conditions.length > 0) {
        // Sort conditions by seqId to maintain order
        const sortedConditions = [...apiData.conditions].sort((a, b) => {
            const seqIdA = a?.seqId ?? 0;
            const seqIdB = b?.seqId ?? 0;
            return seqIdA - seqIdB;
        });

        // Extract all render IDs, filter out 0 and make unique
        const allConditionRenderIds = Array.from(
            new Set(
                sortedConditions
                    .map((c) => c?.renderId)
                    .filter((id): id is number => id !== null && id !== undefined && id !== 0),
            ),
        );

        // Collect all conditions by renderId (excluding consent condition 8)
        const conditionsByRenderId = new Map<number, typeof apiData.conditions>();

        sortedConditions.forEach((condition) => {
            // Skip invalid conditions
            if (!condition) {
                return;
            }

            // Skip consent condition (conditionId 8) - it's handled separately
            if (condition.conditionId === 8) {
                return;
            }

            // Skip conditions without conditionId
            if (!condition.conditionId) {
                return;
            }

            // Only process conditions whose renderId is in allConditionRenderIds
            const conditionRenderId = condition.renderId ?? 0;
            if (!allConditionRenderIds.includes(conditionRenderId)) {
                return;
            }

            // Collect all conditions with the same renderId
            if (!conditionsByRenderId.has(conditionRenderId)) {
                conditionsByRenderId.set(conditionRenderId, []);
            }
            conditionsByRenderId.get(conditionRenderId)!.push(condition);
        });

        // Create one condition per unique renderId with all API data in compositeValues
        let currentGroupId = 0;
        let currentGroup: TriggerGroup | null = null;

        // Process each unique renderId
        for (const [renderId, conditions] of conditionsByRenderId) {
            if (conditions.length === 0) continue;

            // Get condition_label from our marketing conditions data using renderId (always unique)
            const conditionSchema = getConditionByRenderId(renderId);
            const conditionLabel = conditionSchema?.condition_label || '';

            // Use the first condition as the base (or find the one matching the schema's conditionId)
            const baseCondition =
                conditions.find((condition) => condition.conditionId === conditionSchema?.conditionId) || conditions[0];

            // For renderId 15, we need access to all API conditions to find both conditionId 5 and conditionId 21
            // Store reference to all API conditions for composite condition extraction
            const allApiConditionsForLookup = apiData.conditions || [];

            // Create a new group if this is the first condition
            if (!currentGroup) {
                currentGroupId++;
                currentGroup = {
                    id: `g${currentGroupId - 1}`,
                    name: `Trigger${currentGroupId}`,
                    conditions: [],
                    logicalOperator: baseCondition.logical_group as 'AND' | 'OR',
                };
                triggerGroups.push(currentGroup);
            }

            const conditionId = `c${renderId}-${currentGroup.conditions.length}`;

            // Store all API conditions data in compositeValues (only essential fields)
            const allApiConditions = conditions.map((condition) => ({
                id: condition.id,
                conditionId: condition.conditionId,
                renderId: condition.renderId,
                operator: condition.operator,
                fieldValue: condition.fieldValue,
                field: condition.field, // Include field property for conditions like conditionId 26
                seqId: condition.seqId,
            }));

            // Extract composite values based on condition type
            // For renderId 8 (Active booking – selected service), extract days, serviceIds, and status
            let extractedCompositeValues: Record<string, any> = {
                allApiConditions: allApiConditions, // Store all API condition data
            };

            // renderId 8 (conditionId 6) - Active booking – selected service
            // renderId 9 (conditionId 6) - Cancelled Booking
            if ((renderId === 8 || renderId === 9) && conditionSchema?.conditionId === 6) {
                // Extract days from conditionId 6 (BEFORE_DAYS operator) or conditionId 30 (WITHIN_LAST_DAYS)
                // Also check conditionId 2 for backward compatibility
                const daysConditionBefore = conditions.find(
                    (condition) => condition.conditionId === 6 && condition.operator === 'BEFORE_DAYS',
                );
                const daysConditionWithin = conditions.find(
                    (condition) => condition.conditionId === 30 && condition.operator === 'WITHIN_LAST_DAYS',
                );
                const daysConditionLegacy = conditions.find((condition) => condition.conditionId === 2);
                const serviceIdsCondition = conditions.find(
                    (condition) => condition.conditionId === 6 && condition.operator === 'IN',
                );
                const statusCondition = conditions.find((condition) => condition.conditionId === 25);

                // Prefer conditionId 6 (BEFORE_DAYS) or 30 (WITHIN_LAST), fallback to conditionId 2 for backward compatibility
                const daysCondition = daysConditionBefore || daysConditionWithin || daysConditionLegacy;

                if (daysCondition?.fieldValue) {
                    const daysValue = Array.isArray(daysCondition.fieldValue)
                        ? daysCondition.fieldValue[0]
                        : daysCondition.fieldValue;
                    extractedCompositeValues.days = [daysValue, null];
                    // Extract operator from daysCondition if available
                    if (daysCondition.operator) {
                        extractedCompositeValues.operator = daysCondition.operator;
                    }
                }

                if (serviceIdsCondition?.fieldValue) {
                    extractedCompositeValues.serviceIds = Array.isArray(serviceIdsCondition.fieldValue)
                        ? serviceIdsCondition.fieldValue
                        : [serviceIdsCondition.fieldValue];
                }

                if (statusCondition?.fieldValue && renderId === 8) {
                    extractedCompositeValues.status = Array.isArray(statusCondition.fieldValue)
                        ? statusCondition.fieldValue
                        : [statusCondition.fieldValue];
                }
            }
            // renderId 11 (conditionId 21) - Purchase by item number – period
            else if (renderId === 11 && conditionSchema?.conditionId === 21) {
                // Extract productIds (conditionId 20) and days (conditionId 21 with BEFORE_DAYS)
                const productIdsCondition = conditions.find((condition) => condition.conditionId === 20);
                const daysCondition = conditions.find((condition) => condition.conditionId === 21);

                if (productIdsCondition?.fieldValue) {
                    extractedCompositeValues.productIds = Array.isArray(productIdsCondition.fieldValue)
                        ? productIdsCondition.fieldValue
                        : [productIdsCondition.fieldValue];
                }

                if (daysCondition?.fieldValue) {
                    const daysValue = Array.isArray(daysCondition.fieldValue)
                        ? daysCondition.fieldValue[0]
                        : daysCondition.fieldValue;
                    extractedCompositeValues.days = [typeof daysValue === 'number' ? daysValue : null, null];
                }
            }
            // renderId 13 (conditionId 21) - Purchase by product group – period
            else if (renderId === 13 && conditionSchema?.conditionId === 21) {
                // Extract categoryIds (conditionId 24) and days (conditionId 21 with BEFORE_DAYS)
                const categoryIdsCondition = conditions.find((condition) => condition.conditionId === 24);
                const daysCondition = conditions.find(
                    (condition) => condition.conditionId === 21 && condition.field === 'sales_date',
                );

                if (categoryIdsCondition?.fieldValue) {
                    extractedCompositeValues.categoryIds = Array.isArray(categoryIdsCondition.fieldValue)
                        ? categoryIdsCondition.fieldValue
                        : [categoryIdsCondition.fieldValue];
                }

                if (daysCondition?.fieldValue) {
                    const daysValue = Array.isArray(daysCondition.fieldValue)
                        ? daysCondition.fieldValue[0]
                        : daysCondition.fieldValue;
                    extractedCompositeValues.days = [typeof daysValue === 'number' ? daysValue : null, null];
                }
            }
            // renderId 15 (conditionId 5) - Revenue – period
            else if (renderId === 15 && conditionSchema?.conditionId === 5) {
                // Extract threshold from conditionId 5 (Revenue) and days from conditionId 21 (BEFORE_DAYS)
                // Both conditions have renderId 15, so they're in the same conditions array
                // Search in conditions array first (already filtered by renderId 15), then fallback to allApiConditionsForLookup
                const revenueCondition =
                    conditions.find((condition) => condition.conditionId === 5 && condition.renderId === 15) ||
                    allApiConditionsForLookup.find(
                        (condition) => condition.conditionId === 5 && condition.renderId === 15,
                    );
                const daysCondition =
                    conditions.find(
                        (condition) =>
                            condition.conditionId === 21 &&
                            condition.operator === 'BEFORE_DAYS' &&
                            condition.renderId === 15,
                    ) ||
                    allApiConditionsForLookup.find(
                        (condition) =>
                            condition.conditionId === 21 &&
                            condition.operator === 'BEFORE_DAYS' &&
                            condition.renderId === 15,
                    );

                if (revenueCondition) {
                    // Use operator directly (AGGREGATE_GT, AGGREGATE_LT, AGGREGATE_EQ)
                    const operator = revenueCondition.operator;
                    const fieldValue = revenueCondition.fieldValue;

                    if (fieldValue !== null && fieldValue !== undefined) {
                        const amount = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
                        if (
                            typeof amount === 'number' &&
                            (operator === 'AGGREGATE_GT' || operator === 'AGGREGATE_LT' || operator === 'AGGREGATE_EQ')
                        ) {
                            extractedCompositeValues.threshold = {
                                type: operator,
                                amount: amount,
                            };
                        }
                    }
                }

                if (daysCondition?.fieldValue) {
                    const daysValue = Array.isArray(daysCondition.fieldValue)
                        ? daysCondition.fieldValue[0]
                        : daysCondition.fieldValue;
                    extractedCompositeValues.days = [typeof daysValue === 'number' ? daysValue : null, null];
                }
            }
            // renderId 14 (conditionId 5) - Revenue (simple, no period)
            else if (renderId === 14 && conditionSchema?.conditionId === 5) {
                // Extract threshold from operator and fieldValue
                // API sends: operator (AGGREGATE_GT, AGGREGATE_LT, AGGREGATE_EQ) and fieldValue (number)
                const revenueCondition = baseCondition;

                if (revenueCondition) {
                    // Use operator directly (AGGREGATE_GT, AGGREGATE_LT, AGGREGATE_EQ)
                    const operator = revenueCondition.operator;
                    const fieldValue = revenueCondition.fieldValue;

                    if (fieldValue !== null && fieldValue !== undefined) {
                        const amount = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
                        if (
                            typeof amount === 'number' &&
                            (operator === 'AGGREGATE_GT' || operator === 'AGGREGATE_LT' || operator === 'AGGREGATE_EQ')
                        ) {
                            extractedCompositeValues.threshold = {
                                type: operator,
                                amount: amount,
                            };
                        }
                    }
                }
            }
            // renderId 17 (conditionId 16) - Gift card balance
            else if (renderId === 17 && conditionSchema?.conditionId === 16) {
                // Extract balanceOperator, balanceAmount (conditionId 16) and expirationPeriod (conditionId 9)
                const balanceCondition = conditions.find((condition) => condition.conditionId === 16);
                const expirationCondition = conditions.find((condition) => condition.conditionId === 9);

                if (balanceCondition) {
                    // Map operator to balanceOperator
                    let balanceOperator: '>' | '<' | '=' = '>';
                    if (balanceCondition.operator === 'AGGREGATE_LT') {
                        balanceOperator = '<';
                    } else if (balanceCondition.operator === 'AGGREGATE_EQ') {
                        balanceOperator = '=';
                    }

                    extractedCompositeValues.balanceOperator = balanceOperator;

                    if (balanceCondition.fieldValue !== null && balanceCondition.fieldValue !== undefined) {
                        extractedCompositeValues.balanceAmount = Array.isArray(balanceCondition.fieldValue)
                            ? balanceCondition.fieldValue[0]
                            : balanceCondition.fieldValue;
                    }
                }

                if (expirationCondition?.fieldValue) {
                    const expirationValue = Array.isArray(expirationCondition.fieldValue)
                        ? expirationCondition.fieldValue[0]
                        : expirationCondition.fieldValue;
                    extractedCompositeValues.expirationPeriod = [expirationValue, null];
                }
            }
            // renderId 18 (conditionId 13) - Clip card balance
            else if (renderId === 18 && conditionSchema?.conditionId === 13) {
                // Extract expirationPeriod (conditionId 13) and clips (conditionId 14 with min/max)
                const expirationCondition = conditions.find((condition) => condition.conditionId === 13);
                const clipsConditions = conditions.filter((c) => c.conditionId === 14);

                if (expirationCondition?.fieldValue) {
                    const expirationValue = Array.isArray(expirationCondition.fieldValue)
                        ? expirationCondition.fieldValue[0]
                        : expirationCondition.fieldValue;
                    extractedCompositeValues.expirationPeriod = [expirationValue, null];
                }

                // Find min and max clips from conditionId 14
                let minClips: number | null = null;
                let maxClips: number | null = null;
                let clipType: 'min' | 'max' | null = null;

                clipsConditions.forEach((clipCondition) => {
                    const fieldValue = clipCondition.fieldValue;
                    if (fieldValue !== null && fieldValue !== undefined) {
                        // fieldValue is now a number, not an array
                        const clipValue = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
                        if (typeof clipValue === 'number') {
                            if (clipCondition.operator === 'AGGREGATE_GT' || clipCondition.operator === '>') {
                                minClips = clipValue;
                                clipType = 'min';
                            } else if (clipCondition.operator === 'AGGREGATE_LT' || clipCondition.operator === '<') {
                                maxClips = clipValue;
                                if (clipType === null) {
                                    clipType = 'max';
                                }
                            }
                        }
                    }
                });

                // Determine clipType based on which value exists
                if (minClips !== null && maxClips === null) {
                    clipType = 'min';
                } else if (maxClips !== null && minClips === null) {
                    clipType = 'max';
                } else if (minClips !== null) {
                    // If both exist, default to 'min' (though this shouldn't happen with new logic)
                    clipType = 'min';
                }

                if (minClips !== null || maxClips !== null) {
                    extractedCompositeValues.minClips = minClips;
                    extractedCompositeValues.maxClips = maxClips;
                    if (clipType) {
                        extractedCompositeValues.clipType = clipType;
                    }
                }
            }
            // renderId 1 (conditionId 18) - Birthday
            else if (renderId === 1 && conditionSchema?.conditionId === 18) {
                const birthdayCondition =
                    allApiConditions.find((condition) => condition.conditionId === 18) || baseCondition;
                const birthdayFieldValue = birthdayCondition?.fieldValue;

                if (
                    birthdayFieldValue &&
                    typeof birthdayFieldValue === 'object' &&
                    !Array.isArray(birthdayFieldValue) &&
                    typeof birthdayFieldValue.milestone === 'boolean'
                ) {
                    if (
                        birthdayFieldValue.milestone === false &&
                        typeof birthdayFieldValue.last === 'number' &&
                        typeof birthdayFieldValue.next === 'number'
                    ) {
                        extractedCompositeValues.fieldValue = {
                            milestone: false,
                            last: birthdayFieldValue.last,
                            next: birthdayFieldValue.next,
                        };
                    } else {
                        extractedCompositeValues.fieldValue = {
                            milestone: birthdayFieldValue.milestone,
                        };
                    }
                } else if (Array.isArray(birthdayFieldValue) && birthdayFieldValue.length === 2) {
                    extractedCompositeValues.fieldValue = {
                        milestone: false,
                        last: typeof birthdayFieldValue[0] === 'number' ? birthdayFieldValue[0] : null,
                        next: typeof birthdayFieldValue[1] === 'number' ? birthdayFieldValue[1] : null,
                    };
                } else {
                    // Check for exact day condition (conditionId 19 - BIRTHDAY_ON_DATES)
                    // If conditionId 19 exists, it's exact day (milestone: false)
                    // Otherwise, default to milestone: true
                    const exactDayCondition = allApiConditions.find((condition) => condition.conditionId === 19);
                    extractedCompositeValues.fieldValue = {
                        milestone: exactDayCondition ? false : true,
                    };
                }
            }

            // renderId 19 (conditionId 26) - Previous campaign / Communication
            else if (renderId === 19 && conditionSchema?.conditionId === 26) {
                // Extract campaignId (conditionId 29), interactionStatus (conditionId 26), and days (conditionId 27)
                // All conditions have renderId 19, so they're in the same conditions array
                // Search in conditions array first (already filtered by renderId 19), then fallback to allApiConditionsForLookup
                const campaignCondition =
                    conditions.find((condition) => condition.conditionId === 29 && condition.renderId === 19) ||
                    allApiConditionsForLookup.find(
                        (condition) => condition.conditionId === 29 && condition.renderId === 19,
                    );
                const interactionStatusCondition =
                    conditions.find((condition) => condition.conditionId === 26 && condition.renderId === 19) ||
                    allApiConditionsForLookup.find(
                        (condition) => condition.conditionId === 26 && condition.renderId === 19,
                    );
                const daysCondition =
                    conditions.find(
                        (condition) =>
                            condition.conditionId === 27 &&
                            condition.operator === 'BEFORE_DAYS' &&
                            condition.renderId === 19,
                    ) ||
                    allApiConditionsForLookup.find(
                        (condition) =>
                            condition.conditionId === 27 &&
                            condition.operator === 'BEFORE_DAYS' &&
                            condition.renderId === 19,
                    );

                // Extract campaign ID
                if (campaignCondition?.fieldValue) {
                    const campaignValue = Array.isArray(campaignCondition.fieldValue)
                        ? campaignCondition.fieldValue[0]
                        : campaignCondition.fieldValue;
                    if (campaignValue) {
                        extractedCompositeValues.campaignId = String(campaignValue);
                    }
                }

                // Extract interaction status - only array format
                if (interactionStatusCondition?.fieldValue) {
                    extractedCompositeValues.interactionStatus = Array.isArray(interactionStatusCondition.fieldValue)
                        ? interactionStatusCondition.fieldValue.map(String)
                        : [String(interactionStatusCondition.fieldValue)];

                    // Extract field name if available
                    if (interactionStatusCondition.field) {
                        extractedCompositeValues.interactionField = interactionStatusCondition.field;
                    }
                }

                // Extract days
                if (daysCondition?.fieldValue) {
                    const daysValue = Array.isArray(daysCondition.fieldValue)
                        ? daysCondition.fieldValue[0]
                        : daysCondition.fieldValue;
                    extractedCompositeValues.days = [typeof daysValue === 'number' ? daysValue : null, null];
                }
            }

            // Determine fieldValue based on condition type
            // For conditions with composite values, set fieldValue from the appropriate composite value
            let fieldValue: any = baseCondition.fieldValue;

            if (renderId === 10) {
                // Purchase by item number (simple): use fieldValue directly from baseCondition
                fieldValue = baseCondition.fieldValue;
            } else if (renderId === 11 && extractedCompositeValues.productIds) {
                // Purchase by item number – period: use productIds as fieldValue
                fieldValue = extractedCompositeValues.productIds;
            } else if (renderId === 13 && extractedCompositeValues.categoryIds) {
                // Purchase by product group – period: use categoryIds as fieldValue
                fieldValue = extractedCompositeValues.categoryIds;
            } else if (renderId === 14 || renderId === 15) {
                // Revenue conditions: use threshold object as fieldValue
                if (extractedCompositeValues.threshold) {
                    fieldValue = extractedCompositeValues.threshold;
                }
            } else if (renderId === 17 && extractedCompositeValues.balanceAmount !== undefined) {
                // Gift card balance: use balanceAmount as fieldValue
                fieldValue = extractedCompositeValues.balanceAmount;
            } else if (renderId === 18) {
                // Clip card balance: use null or a placeholder (the component uses compositeValues)
                fieldValue = null;
            } else if (renderId === 1) {
                if (extractedCompositeValues.fieldValue !== undefined) {
                    fieldValue = extractedCompositeValues.fieldValue;
                } else {
                    fieldValue = baseCondition.fieldValue;
                }
            }

            // Map condition to TriggerCondition format (only essential fields: conditionId, operator, fieldValue, render_id, condition_label)
            const triggerCondition: TriggerCondition = {
                id: conditionId,
                conditionId: baseCondition.conditionId ?? 0,
                condition_render_id: renderId,
                operator: baseCondition.operator || '',
                fieldValue: fieldValue,
                condition_label: conditionLabel,
                entity: '',
                field: '',
                description: '',
                parentEntity: null,
                jsonPath: [],
                aggregate_fn: null,
                aggregate_group: null,
                logical_group: 'OR',
                triggerId: 0,
                group_id: currentGroupId - 1,
                group_name: conditionSchema?.group_name || '',
                group_label: conditionSchema?.group_label || '',
                group_sequence: baseCondition.seqId || 0,
                seq_id: baseCondition.seqId ?? undefined, // Store seq_id from API response
                ...(Object.keys(extractedCompositeValues).filter((key) => key !== 'fieldValue').length > 0 && {
                    compositeValues: extractedCompositeValues,
                }),
            };

            currentGroup.conditions.push(triggerCondition);
        }
    }

    // Extract trigger setting from campaign name and other fields
    const triggerType = apiData?.messageType as 'SMS' | 'EMAIL';

    // Extract triggerDays and convert to weekdays object
    const weekdays = {
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: false,
    };
    if (apiData.schedule?.triggerDays && Array.isArray(apiData.schedule.triggerDays)) {
        const dayMap: Record<string, keyof typeof weekdays> = {
            monday: 'Mon',
            tuesday: 'Tue',
            wednesday: 'Wed',
            thursday: 'Thu',
            friday: 'Fri',
            saturday: 'Sat',
            sunday: 'Sun',
        };
        apiData.schedule.triggerDays.forEach((day) => {
            const dayKey = dayMap[day.toLowerCase()];
            if (dayKey) {
                weekdays[dayKey] = true;
            }
        });
    }

    // Extract waitingPeriod and spamPeriod from schedule (convert number to string with converted hours to days)
    const waitingPeriod =
        apiData.schedule?.waitingPeriod !== null && apiData.schedule?.waitingPeriod !== undefined
            ? String(apiData.schedule.waitingPeriod / 24)
            : 'UNSET';
    const spamPeriod =
        apiData.schedule?.spamPeriod !== null && apiData.schedule?.spamPeriod !== undefined
            ? String(apiData.schedule.spamPeriod / 24)
            : 'UNSET';

    const triggerSetting: TriggerFlowData['triggerSetting'] = apiData.name
        ? {
              name: apiData.name,
              triggerType,
              testPhoneNumber: apiData.testPhoneNumber || '+45',
              description: apiData.description || '',
              testEmail: apiData.testEmail || '',
              bccEmail: apiData.bccEmail || '',
              triggerTime: apiData.schedule?.triggerTime || null,
              weekdays: weekdays,
              waitingPeriod: waitingPeriod,
              spamPeriod: spamPeriod,
          }
        : null;

    const content = apiData.content
        ? {
              // Preserve null/undefined from API so UI can apply outlet default sender name.
              // Using `|| ''` would convert null -> '' and block `?? defaultSenderName` in ContentBoxForm.
              sender: apiData.content.sender ?? null,
              replyTo: apiData.content.contentCC || '',
              subject: apiData.content.subject || '',
              content: apiData.content.content || '',
          }
        : null;

    const hasConsentCondition: boolean = apiData.conditions?.some((c) => c.conditionId === 8) ?? false;
    const consent = {
        // In edit mode, absence of the consent condition means "No" (send to all),
        // so map it to explicit `false` to keep the radio group selected.
        value: hasConsentCondition,
    };

    const triggerFlowData: TriggerFlowData = {
        triggerSetting,
        consent,
        content,
        triggerGroups: triggerGroups.length > 0 ? triggerGroups : [],
        selectedTriggerConditionId: null,
    };

    return triggerFlowData;
}
