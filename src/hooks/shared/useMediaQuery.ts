import { useEffect, useState } from 'react';

/**
 * Hook for checking media query matches
 *
 * @param query - Media query string (e.g., '(min-width: 768px)')
 * @returns Boolean indicating if the media query matches
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 *
 * return (
 *   <>
 *     {isDesktop ? <DesktopView /> : <MobileView />}
 *   </>
 * );
 * ```
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Create event listener
        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add listener (modern browsers support addEventListener)
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
            return () => {
                mediaQuery.removeEventListener('change', handler);
            };
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handler);
            return () => {
                mediaQuery.removeListener(handler);
            };
        }
    }, [query]);

    return matches;
}
