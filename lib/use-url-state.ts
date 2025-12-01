import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setQueryParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const setOnlyQueryParams = useCallback((entries: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(entries).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "?");
  }, [router]);

  const getQueryParam = useCallback((key: string) => {
    return searchParams.get(key);
  }, [searchParams]);

  return { setQueryParam, setOnlyQueryParams, getQueryParam };
}