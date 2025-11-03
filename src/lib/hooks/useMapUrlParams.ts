'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface MapUrlParams {
  parish: string;
  showHeatmap: boolean;
  showParishOverlay: boolean;
}

/**
 * Hook to sync map filter state with URL parameters
 * Supports parish filtering and layer toggles
 */
export function useMapUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL params
  const getParamsFromUrl = useCallback((): MapUrlParams => {
    return {
      parish: searchParams.get('parish') || 'all',
      showHeatmap: searchParams.get('heatmap') === 'true',
      showParishOverlay: searchParams.get('overlay') !== 'false', // default true
    };
  }, [searchParams]);

  // Update URL when params change
  const updateUrl = useCallback(
    (newParams: Partial<MapUrlParams>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      // Update each parameter
      if (newParams.parish !== undefined) {
        if (newParams.parish === 'all') {
          current.delete('parish');
        } else {
          current.set('parish', newParams.parish);
        }
      }

      if (newParams.showHeatmap !== undefined) {
        if (newParams.showHeatmap) {
          current.set('heatmap', 'true');
        } else {
          current.delete('heatmap');
        }
      }

      if (newParams.showParishOverlay !== undefined) {
        if (newParams.showParishOverlay) {
          current.delete('overlay'); // default is true
        } else {
          current.set('overlay', 'false');
        }
      }

      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Update local state and URL when params change
  const updateParams = useCallback(
    (newParams: Partial<MapUrlParams>) => {
      updateUrl(newParams);
    },
    [updateUrl]
  );

  return {
    params: getParamsFromUrl(),
    updateParams,
  };
}
