
/**
 * Returns true when prices should be blurred for the current user.
 * - Admins always see prices (never blurred).
 * - For other roles, respect the per-employee blur_price permission.
 */
export const shouldBlurPrices = (user: any): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return false;

    return Boolean(user.settings?.blur_price);
};
