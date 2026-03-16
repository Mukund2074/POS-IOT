// ============================================================================
// CANONICAL MARKETING CONDITION DEFINITIONS
// ============================================================================
// This file is the SINGLE SOURCE OF TRUTH for all marketing condition metadata.
// All other files should import from here, not redefine condition data.
// ============================================================================

export interface SubConditionDefinition {
    belongsToConditionId: number;
    conditionId: number;
    description?: string;
    conditionDefinition?: Partial<MarketingConditionSchema>;
    field?: string;
    operator?: string;
    valueMapping?: {
        from: string;
        to: string;
        transform?: (value: any) => any;
    };
    compositeValues?: Record<string, any>;
    fieldValueExample?: any;
}

export const commonTemplateKeywords = [
    'customer_name',
    'customer_email',
    'customer_phone_number',
    'customer_birthday',
    'customer_address',
    'customer_city',
    'customer_zip_code',
    'booking_link',
    'outlet_name',
    'outlet_address',
    'outlet_city',
    'outlet_zip_code',
    'outlet_phone_number',
    'outlet_email',
    'outlet_website',
    'outlet_facebook',
    'outlet_tiktok',
    'outlet_instagram',
];

export interface MarketingConditionSchema {
    conditionId: number;
    condition_render_id: number;
    operator: string;
    description: string;
    triggerId: number;
    group_id: number;
    group_name: string;
    group_label: string;
    condition_label: string;
    group_sequence: number;
    settingsDescription?: string;
    render_sequence?: number;
    subconditions?: SubConditionDefinition[];
    fieldValueExample?: any;
    field?: string;
}

export const marketingConditions: MarketingConditionSchema[] = [
    // ============================================================================
    // CUSTOMER PROFILE CONDITIONS
    // ============================================================================
    {
        conditionId: 18,
        condition_render_id: 1,
        field: 'birthday',
        operator: 'BIRTHDAY_BETWEEN',
        description: 'Birthday within intervel',
        triggerId: 10,
        group_id: 1,
        group_name: 'CustomerProfile',
        group_label: 'Customer Profile',
        group_sequence: 1,
        condition_label: 'Birthday',
        settingsDescription: 'Trigger when a customer’s birthday falls within the selected interval.',
        fieldValueExample: [1, 30],
        subconditions: [
            {
                belongsToConditionId: 18,
                conditionId: 18,
                description: 'Birthday exact day (if exact day mode selected)',
                conditionDefinition: {
                    conditionId: 18,
                    condition_render_id: 0,
                    operator: 'BIRTHDAY_ON_DATES',
                    description: 'customer birth date on exact dates',
                    triggerId: 10,
                    group_id: 1,
                    group_name: 'CustomerProfile',
                    group_label: 'Customer Profile',
                    group_sequence: 1,
                    condition_label: 'Birthday on dates',
                    fieldValueExample: null,
                },
            },
            {
                belongsToConditionId: 18,
                conditionId: 18,
                description: 'Birthday milestone age (if milestone mode selected)',
                conditionDefinition: {
                    conditionId: 18,
                    condition_render_id: 0,
                    field: 'birthday',
                    operator: 'BIRTHDAY_BETWEEN',
                    description: 'customer birthday milestone age',
                    triggerId: 10,
                    group_id: 1,
                    group_name: 'CustomerProfile',
                    group_label: 'Customer Profile',
                    group_sequence: 1,
                    condition_label: 'Birthday milestone age',
                    fieldValueExample: 30,
                },
            },
        ],
    },
    {
        conditionId: 23,
        condition_render_id: 2,
        field: 'created_at',
        operator: 'WITHIN_LAST_DAYS',
        description: 'Created within interval',
        triggerId: 11,
        group_id: 1,
        group_name: 'CustomerProfile',
        group_label: 'Customer Profile',
        group_sequence: 1,
        condition_label: 'New customer',
        settingsDescription: 'Segment customers who have been created in the system within a defined period.',
        subconditions: [],
    },
    {
        conditionId: 7,
        condition_render_id: 4,
        field: 'birthday',
        operator: 'AGE_BETWEEN',
        description: 'Age range',
        triggerId: 6,
        group_id: 1,
        group_name: 'CustomerProfile',
        group_label: 'Customer Profile',
        group_sequence: 1,
        condition_label: 'Age Between',
        settingsDescription: 'Segment customers based on their age',
        subconditions: [],
    },
    {
        conditionId: 1,
        condition_render_id: 6,
        field: 'zip_code',
        operator: 'BETWEEN',
        description: 'Geographic area',
        triggerId: 1,
        group_id: 1,
        group_name: 'CustomerProfile',
        group_label: 'Customer Profile',
        group_sequence: 1,
        condition_label: 'Postal code',
        settingsDescription:
            'Segment customers based on their geographic area by defining postal codes. You can select either a range of postal codes or a list of specific postal codes.',
        subconditions: [],
    },

    // ============================================================================
    // BOOKING BEHAVIOR CONDITIONS
    // ============================================================================
    {
        conditionId: 2,
        condition_render_id: 7,
        field: 'booking_datetime_start',
        operator: 'BEFORE_DAYS',
        description: 'Booking Within period',
        triggerId: 1,
        group_id: 2,
        group_name: 'BookingBehavior',
        group_label: 'Booking Behavior',
        group_sequence: 2,
        condition_label: 'Active Booking',
        settingsDescription: 'Trigger if a customer has a booking within the selected period',
        subconditions: [],
        fieldValueExample: ['30'],
    },
    {
        conditionId: 6,
        condition_render_id: 8,
        field: 'service_id',
        operator: 'IN',
        description: 'Booking for specific services',
        triggerId: 5,
        group_id: 2,
        group_name: 'BookingBehavior',
        group_label: 'Booking Behavior',
        group_sequence: 2,
        condition_label: 'Active booking – selected service',
        settingsDescription: 'Trigger if a customer has a booking for a specific service within the selected period.',
        subconditions: [
            {
                belongsToConditionId: 6,
                conditionId: 2,
                description: 'Days range condition with [daysRange, e.g., 60]',
                conditionDefinition: {
                    conditionId: 2,
                    condition_render_id: 8,
                    field: 'booking_datetime_start',
                    operator: 'WITHIN_LAST_DAYS',
                    description: 'Customer Has Any Booking in last X days',
                    triggerId: 1,
                    group_id: 2,
                    group_name: 'BookingBehavior',
                    group_label: 'Booking Behavior',
                    group_sequence: 2,
                    condition_label: 'Active Booking',
                },
            },
            {
                belongsToConditionId: 6,
                conditionId: 6,
                description: 'Service IDs condition with [serviceIds]',
                conditionDefinition: {
                    conditionId: 6,
                    condition_render_id: 8,
                    field: 'service_id',
                    operator: 'IN',
                    description: 'Customer has a booking within period for selected service',
                    triggerId: 5,
                    group_id: 2,
                    group_name: 'BookingBehavior',
                    group_label: 'Booking Behavior',
                    group_sequence: 2,
                    condition_label: 'Active booking – selected service',
                },
            },
            {
                belongsToConditionId: 6,
                conditionId: 25,
                description: 'Status condition with [status]',
                conditionDefinition: {
                    conditionId: 7,
                    condition_render_id: 9,
                    field: 'status',
                    operator: 'IN',
                    description: 'Customer has a booking within period for selected service',
                    triggerId: 6,
                    group_id: 2,
                    group_name: 'BookingBehavior',
                    group_label: 'Booking Behavior',
                    group_sequence: 2,
                    condition_label: 'Active booking – selected service',
                },
            },
        ],
    },
    {
        conditionId: 6,
        condition_render_id: 9,
        field: 'status',
        operator: 'IN',
        description: 'Customer has a cancelled booking within period for selected service',
        triggerId: 10,
        group_id: 2,
        group_name: 'BookingBehavior',
        group_label: 'Booking Behavior',
        group_sequence: 2,
        condition_label: 'Cancelled Booking',
        settingsDescription: 'Trigger if a customer has cancelled a booking for a specific service within the period.',
        subconditions: [
            {
                belongsToConditionId: 6,
                conditionId: 25,
                description: 'Service IDs condition with [serviceIds]',
                conditionDefinition: {
                    conditionId: 25,
                    condition_render_id: 9,
                    field: 'service_id',
                    operator: 'IN',
                    description: 'Customer has a booking within period for selected service',
                    triggerId: 5,
                    group_id: 2,
                    group_name: 'BookingBehavior',
                    group_label: 'Booking Behavior',
                    group_sequence: 2,
                    condition_label: 'Active booking – selected service',
                },
            },
            {
                belongsToConditionId: 6,
                conditionId: 2,
                description: 'Days range condition with [daysRange, e.g., 60]',
                conditionDefinition: {
                    conditionId: 2,
                    condition_render_id: 9,
                    field: 'booking_datetime_start',
                    operator: 'WITHIN_LAST_DAYS',
                    description: 'Customer Has Any Booking in last X days',
                    triggerId: 1,
                    group_id: 2,
                    group_name: 'BookingBehavior',
                    group_label: 'Booking Behavior',
                    group_sequence: 2,
                    condition_label: 'Active Booking',
                },
            },
        ],
    },

    // ============================================================================
    // PURCHASES BEHAVIOR CONDITIONS
    // ============================================================================
    {
        conditionId: 20,
        condition_render_id: 10,
        field: 'product_id',
        operator: 'IN',
        description: 'Specific item purchased',
        triggerId: 12,
        group_id: 3,
        group_name: 'PurchasesBehavior',
        group_label: 'Purchases Behavior',
        group_sequence: 3,
        render_sequence: 1,
        condition_label: 'Purchase by item number',
        settingsDescription: 'Trigger if a customer has purchased a specific item number.',
        subconditions: [],
        fieldValueExample: ['09575f05-1381-4080-b008-cdf6cb8737f6'],
    },
    {
        conditionId: 21,
        field: 'sales_date',
        operator: 'BEFORE_DAYS',
        description: 'Item purchased within period',
        triggerId: 2,
        condition_render_id: 11,
        group_id: 3,
        group_name: 'PurchasesBehavior',
        group_label: 'Purchases Behavior',
        group_sequence: 3,
        render_sequence: 2,
        condition_label: 'Purchase by item number – period',
        settingsDescription: 'Trigger if a customer has purchased an item number within a defined period.',
        subconditions: [
            {
                belongsToConditionId: 21,
                conditionId: 10,
                description: 'Product IDs condition with [productIds]',
                conditionDefinition: {
                    conditionId: 10,
                    condition_render_id: 0,
                    field: 'product_id',
                    operator: 'IN',
                    description: 'customer has purchased a specific item number',
                    triggerId: 12,
                    group_id: 3,
                    group_name: 'PurchasesBehavior',
                    group_label: 'Purchases Behavior',
                    group_sequence: 3,
                    condition_label: 'Purchase by item number',
                },
            },
        ],
    },
    {
        conditionId: 24,
        condition_render_id: 12,
        field: 'product_category_id',
        operator: 'IN',
        description: 'Product group purchased',
        triggerId: 13,
        group_id: 3,
        group_name: 'PurchasesBehavior',
        group_label: 'Purchases Behavior',
        group_sequence: 3,
        render_sequence: 3,
        condition_label: 'Purchase by product group',
        settingsDescription: 'Trigger if a customer has purchased from a specific product group.',
        subconditions: [],
    },
    {
        conditionId: 21,
        condition_render_id: 13,
        field: 'sales_date',
        operator: 'BEFORE_DAYS',
        description: 'Product group purchased',
        triggerId: 14,
        group_id: 3,
        group_name: 'PurchasesBehavior',
        group_label: 'Purchases Behavior',
        group_sequence: 3,
        render_sequence: 4,
        condition_label: 'Purchase by product group – period',
        settingsDescription: 'Trigger if a customer has purchased from a product group within a defined period.',
        subconditions: [
            {
                belongsToConditionId: 21,
                conditionId: 24,
                description: 'Category IDs condition with [categoryIds]',
                conditionDefinition: {
                    conditionId: 24,
                    condition_render_id: 0,
                    field: 'product_category_id',
                    operator: 'IN',
                    description: 'customer has purchased from a product group',
                    triggerId: 13,
                    group_id: 3,
                    group_name: 'PurchasesBehavior',
                    group_label: 'Purchases Behavior',
                    group_sequence: 3,
                    condition_label: 'Purchase by product group',
                },
            },
        ],
    },
    {
        conditionId: 5,
        condition_render_id: 14,
        field: 'net_total',
        operator: 'AGGREGATE_GT',
        description: 'Total revenue threshold',
        triggerId: 4,
        group_id: 3,
        group_name: 'PurchasesBehavior',
        group_label: 'Purchases Behavior',
        group_sequence: 3,
        render_sequence: 5,
        condition_label: 'Revenue',
        settingsDescription: 'Trigger if the customer’s total revenue exceeds or falls below a threshold',
        subconditions: [],
    },
    {
        conditionId: 5,
        condition_render_id: 15,
        field: 'net_total',
        operator: 'AGGREGATE_GT',
        description: 'Revenue Within period',
        triggerId: 15,
        group_id: 3,
        group_name: 'PurchasesBehavior',
        group_label: 'Purchases Behavior',
        group_sequence: 3,
        render_sequence: 6,
        condition_label: 'Revenue – period',
        settingsDescription:
            'Trigger if the customer’s total revenue exceeds or falls below a threshold within a defined period.',
        subconditions: [
            {
                belongsToConditionId: 5,
                conditionId: 21,
                description: 'Days period condition with [daysValue]',
                conditionDefinition: {
                    conditionId: 21,
                    condition_render_id: 0,
                    field: 'sales_date',
                    operator: 'BEFORE_DAYS',
                    description: 'Revenue Within period',
                    triggerId: 14,
                    group_id: 3,
                    group_name: 'PurchasesBehavior',
                    group_label: 'Purchases Behavior',
                    group_sequence: 3,
                    condition_label: 'Purchase by product group – period',
                },
            },
        ],
    },

    // ============================================================================
    // COMMUNICATION
    // ============================================================================

    {
        conditionId: 26,
        condition_render_id: 19,
        operator: 'IN',
        description: 'Previous campaign',
        triggerId: 15,
        group_id: 6,
        group_name: 'Communication',
        group_label: 'Communication',
        group_sequence: 3,
        render_sequence: 1,
        condition_label: 'Previous campaign',
        settingsDescription:
            'Segment based on whether a customer has previously received/opened/not opened a campaign.',
        fieldValueExample: ['CLICKED', 'OPENED', 'NOT_OPENED'],
        subconditions: [
            {
                belongsToConditionId: 26,
                conditionId: 27,
                description: 'Before days condition with [daysValue]',
                conditionDefinition: {
                    conditionId: 27,
                    condition_render_id: 0,
                    field: 'email_clicked_at',
                    operator: 'BEFORE_DAYS',
                    description: 'customer has previously received/opened/not opened a campaign',
                    triggerId: 15,
                    group_id: 6,
                    group_name: 'Communication',
                    group_label: 'Communication',
                    group_sequence: 6,
                    condition_label: 'Previous campaign – days',
                },
            },
            {
                belongsToConditionId: 26,
                conditionId: 29,
                description: 'Selected campaign',
                conditionDefinition: {
                    conditionId: 29,
                    condition_render_id: 0,
                    field: 'campaign_id',
                    operator: 'IN',
                    description: 'customer has selected campaign',
                    triggerId: 15,
                    group_id: 6,
                    group_name: 'Communication',
                    group_label: 'Communication',
                    group_sequence: 6,
                    condition_label: 'Selected campaign status',
                    fieldValueExample: ['612f7d51-1ae1-442c-931d-b143e31b7844'],
                },
            },
        ],
    },

    // ============================================================================
    // GIFT CARD AND CLIP CARD CONDITIONS
    // ============================================================================
    {
        conditionId: 16,
        condition_render_id: 17,
        field: 'residue_value',
        operator: '>',
        description: 'gift card has unused value',
        triggerId: 10,
        group_id: 5,
        group_name: 'GiftCardAndClipCard',
        group_label: 'Gift Card and Clip Card',
        group_sequence: 5,
        condition_label: 'Gift card balance',
        settingsDescription: 'Trigger if a gift card has unused value or is about to expire.',
        subconditions: [
            {
                belongsToConditionId: 16,
                conditionId: 9,
                description: 'Expiration days condition with [days]',
                conditionDefinition: {
                    conditionId: 9,
                    condition_render_id: 0,
                    field: 'expiry_date',
                    operator: 'AFTER_DAYS',
                    description: 'gift card has unused value or is about to expire within date range',
                    triggerId: 9,
                    group_id: 5,
                    group_name: 'GiftCardAndClipCard',
                    group_label: 'Gift Card and Clip Card',
                    group_sequence: 5,
                    condition_label: 'Gift card expiry – range',
                },
            },
        ],
    },
    {
        conditionId: 13,
        condition_render_id: 18,
        field: 'expiry_date',
        operator: 'AFTER_DAYS',
        description: 'Clips remaining',
        triggerId: 10,
        group_id: 4,
        group_name: 'GiftCardAndClipCard',
        group_label: 'Gift Card and Clip Card',
        group_sequence: 4,
        condition_label: 'Clip card balance',
        settingsDescription: 'Trigger if a clip card has a certain number of clips remaining.',
        fieldValueExample: ['2'],
        subconditions: [
            {
                belongsToConditionId: 13,
                conditionId: 14,
                description: 'Max clips condition with maxValue and < operator',
                conditionDefinition: {
                    conditionId: 14,
                    condition_render_id: 0,
                    field: 'residue_punches',
                    operator: '<',
                    description: 'clip card has a certain number of clips remaining.',
                    triggerId: 10,
                    group_id: 4,
                    group_name: 'GiftCardAndClipCard',
                    group_label: 'Gift Card and Clip Card',
                    group_sequence: 4,
                    condition_label: 'Clip card punches',
                },
            },
        ],
    },

    // ============================================================================
    // UNRENDERED CONDITIONS (WHICH ARE NOT RENDERED IN THE UI BUT HAVE USE FOR TEMPLATES KEYWORDS)
    // ============================================================================
    {
        conditionId: 8,
        condition_render_id: 0,
        field: 'marketing_permission',
        operator: '=',
        description: 'Customers who has given marketing permissions',
        triggerId: 7,
        group_id: 1,
        group_name: 'CustomerProfile',
        group_label: 'Customer Profile',
        group_sequence: 1,
        condition_label: 'Newsletter subscription',
        settingsDescription: 'Segment customers who have given marketing permissions.',
    },
    {
        conditionId: 17,
        condition_render_id: 0,
        field: 'customer_group',
        operator: 'IN',
        description: 'customer group from group names',
        triggerId: 7,
        group_id: 1,
        group_name: 'CustomerProfile',
        group_label: 'Customer Profile',
        group_sequence: 1,
        condition_label: 'Customer group',
        settingsDescription: 'Segment customers based on their assigned customer group.',
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find a condition by conditionId
 */
export function getConditionById(conditionId: number): MarketingConditionSchema | undefined {
    return marketingConditions.find((c) => c.conditionId === conditionId);
}

/**
 * Find a condition by condition_render_id
 */
export function getConditionByRenderId(renderId: number): MarketingConditionSchema | null {
    const condition = marketingConditions.find((c) => c.condition_render_id === renderId);
    return condition || null;
}
/**
 * Grouped condition structure used for filtering and display
 */
export interface GroupedCondition {
    groupName: string;
    groupLabel: string;
    groupSequence: number;
    conditions: MarketingConditionSchema[];
}

/**
 * Group marketing conditions by group_name and sort them
 * Filters out conditions with condition_render_id: 0 (no renderer)
 * Sorts conditions within each group by render_sequence, condition_render_id, then conditionId
 * Sorts groups by group_sequence
 */
export function groupMarketingConditions(): GroupedCondition[] {
    const groups = new Map<string, MarketingConditionSchema[]>();

    marketingConditions.forEach((condition) => {
        // Skip conditions with condition_render_id: 0 (no renderer)
        if (condition.condition_render_id === 0) {
            return;
        }
        const groupName = condition.group_name;
        if (!groups.has(groupName)) {
            groups.set(groupName, []);
        }
        groups.get(groupName)!.push(condition);
    });

    // Convert to array and sort by group_sequence
    return Array.from(groups.entries())
        .map(([groupName, conditions]) => ({
            groupName,
            groupLabel: conditions[0]?.group_label || groupName,
            groupSequence: conditions[0]?.group_sequence || 0,
            conditions: conditions.sort((a, b) => {
                // First sort by render_sequence if available
                const aSeq = a.render_sequence ?? 999;
                const bSeq = b.render_sequence ?? 999;
                if (aSeq !== bSeq) {
                    return aSeq - bSeq;
                }
                // Fall back to condition_render_id if render_sequence is not set
                if (a.condition_render_id !== b.condition_render_id) {
                    return a.condition_render_id - b.condition_render_id;
                }
                // Finally sort by conditionId
                return a.conditionId - b.conditionId;
            }),
        }))
        .sort((a, b) => a.groupSequence - b.groupSequence);
}

/**
 * Filter grouped conditions based on search query
 * Searches in condition_label, description, and field
 */
export function filterGroupedConditions(
    groupedConditions: GroupedCondition[],
    searchQuery: string,
): GroupedCondition[] {
    if (!searchQuery.trim()) return groupedConditions;

    return groupedConditions
        .map((group) => ({
            ...group,
            conditions: group.conditions.filter(
                (condition) =>
                    condition.condition_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    condition.description.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        }))
        .filter((group) => group.conditions.length > 0);
}
