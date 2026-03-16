/**
 * Shared permission map: sidebar/route key -> backend permission key.
 * Used by Sidebar (nav visibility) and ProtectedRoute (route access).
 */
export const PERMISSION_MAP: Record<string, string> = {
    history: 'view_history',
    customers: 'view_customers',
    services: 'view_service_list',
    specialoffers: 'view_special_offers',
    insights: 'view_insights',
    statistics: 'view_statistics',
    doctors: 'view_doctors',
    pos: 'view_pos',
    giftCard: 'view_pos',
    punchCard: 'view_pos',
    marketing: 'view_marketing',
    settings: 'view_settings',
};

/**
 * Path segment (first segment of pathname) -> permission key.
 * Calendar has no entry (always allowed).
 * POS, GiftCard and PunchCard all require view_pos (one permission controls all three).
 */
const PATH_TO_PERMISSION: Record<string, string> = {
    history: 'view_history',
    customers: 'view_customers',
    services: 'view_service_list',
    specialOffers: 'view_special_offers',
    insights: 'view_insights',
    statistics: 'view_statistics',
    doctors: 'view_doctors',
    pos: 'view_pos',
    'gift-card': 'view_pos',
    'punch-card': 'view_pos',
    marketing: 'view_marketing',
    settings: 'view_settings',
};

/**
 * Returns the permission key required for a pathname, or null if no permission required (e.g. calendar).
 */
export function getRequiredPermissionForPath(pathname: string): string | null {
    const segment = pathname.replace(/^\//, '').split('/')[0] || '';
    return PATH_TO_PERMISSION[segment] ?? null;
}
