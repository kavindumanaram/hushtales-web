import { useQuery } from '@tanstack/react-query';
import { getJobById, getJobs } from '@/lib/api';

export const JOBS_QUERY_KEY = ['jobs'] as const;

const TERMINAL_STATUSES = new Set(['complete', 'failed']);

/** All of the current user's jobs, optionally filtered. */
export function useJobs(filters?: { theme?: string; age_group?: string; status?: string }) {
  return useQuery({
    queryKey: [...JOBS_QUERY_KEY, filters ?? {}],
    queryFn: () =>
      getJobs(filters).then((r) =>
        // Tolerate both { jobs: [...] } and a bare array response.
        Array.isArray(r) ? r : r?.jobs ?? []
      ),
    staleTime: 30_000,
  });
}

/** A single job by id (no polling). */
export function useJob(jobId: string) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId),
    enabled: !!jobId,
  });
}

/** A single job, polled every 5s until it reaches a terminal status. */
export function useJobPolling(jobId: string | null) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId!),
    enabled: !!jobId,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || TERMINAL_STATUSES.has(status)) return false;
      return 5_000;
    },
  });
}
