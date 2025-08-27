import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

// Simple wrapper to standardize fetch JSON
export async function fetchJSON<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export function useRQ<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  key: QueryKey,
  queryFn: () => Promise<TQueryFnData>,
  opts?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  // Sensible defaults to keep table pages feeling snappy
  return useQuery({
    queryKey: key,
    queryFn,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...opts,
  });
}
