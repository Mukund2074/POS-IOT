import { useState, useEffect, useCallback, useRef } from 'react';
import { useSalesList } from './useSales';
import { GetApiSalesListParams, GetApiSalesList200, GetApiSalesList200SalesItem } from '@/shared/api/models';

interface UseSalesPaginationParams {
    params?: Omit<GetApiSalesListParams, 'page'>;
    pageSize?: number;
    enabled?: boolean;
    autoLoadOnScroll?: boolean;
    scrollThreshold?: number; // Distance from bottom to trigger load more
}

/**
 * Pagination hook with optional scroll detection for infinite scroll
 * Loads data in pages and provides load more functionality
 */
export function useSalesPagination({
    params,
    pageSize = 20,
    enabled = true,
    autoLoadOnScroll = false,
    scrollThreshold = 100,
}: UseSalesPaginationParams = {}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [allSales, setAllSales] = useState<GetApiSalesList200SalesItem[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const scrollContainerRef = useRef<HTMLElement | null>(null);

    // Build params for current page
    const currentParams = {
        ...params,
        page: currentPage,
        limit: pageSize,
    };

    const {
        data: salesResponse,
        isLoading,
        error,
    } = useSalesList({
        params: currentParams,
        enabled,
    });

    // Extract sales data from response
    const salesData = salesResponse?.sales || [];

    // Update all sales when new data comes in
    useEffect(() => {
        if (salesData.length > 0) {
            if (currentPage === 1) {
                // First page - replace all data
                setAllSales(salesData);
            } else {
                // Subsequent pages - append data
                setAllSales((prev) => [...prev, ...salesData]);
            }

            // Check if we have more data based on response metadata
            const hasMoreData = salesResponse?.totalPages
                ? currentPage < salesResponse.totalPages
                : salesData.length === pageSize;
            setHasMore(hasMoreData);

            // Reset loading state when data comes in
            if (isLoadingMore) {
                setIsLoadingMore(false);
            }
        } else if (currentPage === 1) {
            // No data on first page
            setAllSales([]);
            setHasMore(false);
        }
    }, [salesData, salesResponse, currentPage, pageSize, isLoadingMore]);

    // Load next page
    const loadMore = useCallback(() => {
        if (!isLoading && !isLoadingMore && hasMore) {
            setIsLoadingMore(true);
            setCurrentPage((prev) => prev + 1);
        }
    }, [isLoading, isLoadingMore, hasMore]);

    // Scroll detection function
    const handleScroll = useCallback(() => {
        if (!autoLoadOnScroll || !scrollContainerRef.current || !hasMore || isLoadingMore) {
            return;
        }

        const container = scrollContainerRef.current;
        const { scrollTop, scrollHeight, clientHeight } = container;

        // Check if user is near the bottom (more aggressive threshold)
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        if (distanceFromBottom < scrollThreshold * 2) {
            // Double the threshold for earlier loading
            loadMore();
        }
    }, [autoLoadOnScroll, hasMore, isLoadingMore, loadMore, scrollThreshold]);

    // Set up scroll listener
    useEffect(() => {
        if (!autoLoadOnScroll || !scrollContainerRef.current) {
            return;
        }

        const container = scrollContainerRef.current;
        container.addEventListener('scroll', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [autoLoadOnScroll, handleScroll]);

    // Reset pagination (e.g., when filters change)
    const reset = useCallback(() => {
        setCurrentPage(1);
        setAllSales([]);
        setHasMore(true);
    }, []);

    // Reset when params change
    useEffect(() => {
        reset();
    }, [JSON.stringify(params), pageSize, reset]);

    return {
        sales: allSales,
        isLoading: isLoading && currentPage === 1,
        isLoadingMore,
        hasMore,
        loadMore,
        reset,
        currentPage,
        totalItems: salesResponse?.total || allSales.length,
        error,
        scrollContainerRef, // Expose ref for the component to use
    };
}
