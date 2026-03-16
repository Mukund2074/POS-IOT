// Utility functions for managing TanStack Query cache

/**
 * Utility function to clear all TanStack Query cache
 * This ensures no old store data persists when switching between stores
 */
export const clearQueryCache = async (queryClient) => {
    try {
        if (!queryClient) {
            console.warn('QueryClient not provided to clearQueryCache');
            return;
        }

        // Cancel all ongoing queries
        await queryClient.cancelQueries();

        // Clear all cached data
        await queryClient.clear();

        // Invalidate all queries to ensure fresh data on next fetch
        await queryClient.invalidateQueries();

        console.log('Query cache cleared successfully');
    } catch (error) {
        console.error('Error clearing query cache:', error);
    }
};

/**
 * Utility function to clear cache and localStorage for complete logout
 */
export const performCompleteLogout = async (queryClient, navigate, shouldRedirect = true) => {
    try {
        // Clear query cache first
        await clearQueryCache(queryClient);

        // Clear localStorage
        localStorage.clear();

        // Force hard navigation to ensure complete cleanup
        if (shouldRedirect) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error during complete logout:', error);
        // Fallback: clear localStorage and navigate
        localStorage.clear();
        if (navigate) {
            navigate('/');
        } else {
            window.location.href = '/';
        }
    }
};

/**
 * Utility function to clear cache before login to new store
 */
export const clearCacheBeforeLogin = async (queryClient) => {
    try {
        await clearQueryCache(queryClient);
        console.log('Cache cleared before login to new store');
    } catch (error) {
        console.error('Error clearing cache before login:', error);
    }
};
