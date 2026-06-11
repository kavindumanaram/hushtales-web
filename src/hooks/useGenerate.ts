import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  generateStory,
  submitJob,
  type GenerateStoryRequest,
  type SubmitJobRequest,
} from '@/lib/api';
import { useStore } from '@/lib/store';
import { JOBS_QUERY_KEY } from './useJobs';

/** Step 1: generate a story script. Result is stashed in the store for review. */
export function useGenerateStory() {
  const setGenerateResult = useStore((s) => s.setGenerateResult);
  return useMutation({
    mutationFn: (req: GenerateStoryRequest) => generateStory(req),
    onSuccess: (data) => setGenerateResult(data),
  });
}

/** Step 2: submit the reviewed script, kicking off the video pipeline. */
export function useSubmitJob() {
  const qc = useQueryClient();
  const setGenerateResult = useStore((s) => s.setGenerateResult);
  return useMutation({
    mutationFn: (req: SubmitJobRequest) => submitJob(req),
    onSuccess: () => {
      setGenerateResult(null);
      qc.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
}
