import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setQueryParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValue = params.get(key);

    // Check if value actually changed (handle null/undefined vs empty string if needed)
    if (currentValue === value) return; // No change

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Also compare full string to be extra safe
    if (params.toString() === searchParams.toString()) return;

    // Use router.replace to avoid clogging history stack for simple tab changes, 
    // and include pathname to ensure we don't drop it (though ? works relatively).
    // Using scroll: false to prevent scrolling to top.
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const setOnlyQueryParams = useCallback((entries: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(entries).forEach(([k, v]) => {
      if (v) {
        params.set(k, v);
      } else {
        params.delete(k);
      }
    });
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "?");
  }, [router, searchParams]);

  const getQueryParam = useCallback((key: string) => {
    return searchParams.get(key);
  }, [searchParams]);

  return { setQueryParam, setOnlyQueryParams, getQueryParam };
}