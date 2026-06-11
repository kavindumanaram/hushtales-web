import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkVoice,
  deleteVoice,
  getVoiceUploadUrl,
  listVoices,
  setActiveVoice,
  uploadAudioToS3,
} from '@/lib/api';
import { useStore } from '@/lib/store';

export const VOICES_QUERY_KEY = ['voices'] as const;

const TERMINAL_VOICE_STATUSES = new Set(['active', 'failed']);

export function useVoices() {
  const setActiveVoiceId = useStore((s) => s.setActiveVoiceId);
  return useQuery({
    queryKey: VOICES_QUERY_KEY,
    queryFn: async () => {
      const result = await listVoices();
      setActiveVoiceId(result.active_voice_id);
      return result;
    },
    staleTime: 60_000,
  });
}

/** Get a presigned URL, upload the recording to S3, return the new voice_id. */
export function useUploadVoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (audio: { blob: Blob; contentType?: string }) => {
      const { upload_url, voice_id } = await getVoiceUploadUrl();
      await uploadAudioToS3(upload_url, audio.blob, audio.contentType);
      return voice_id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VOICES_QUERY_KEY });
    },
  });
}

/** Poll a voice's cloning status every 3s until active or failed. */
export function useVoiceStatusPolling(voiceId: string | null) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['voice-status', voiceId],
    queryFn: () => checkVoice(voiceId!),
    enabled: !!voiceId,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || TERMINAL_VOICE_STATUSES.has(status)) {
        // Refresh the voices list once cloning settles.
        qc.invalidateQueries({ queryKey: VOICES_QUERY_KEY });
        return false;
      }
      return 3_000;
    },
  });
}

export function useDeleteVoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (voiceId: string) => deleteVoice(voiceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: VOICES_QUERY_KEY }),
  });
}

export function useSetActiveVoice() {
  const qc = useQueryClient();
  const setActiveVoiceId = useStore((s) => s.setActiveVoiceId);
  return useMutation({
    mutationFn: (voiceId: string) => setActiveVoice(voiceId),
    onSuccess: (data) => {
      setActiveVoiceId(data.active_voice_id);
      qc.invalidateQueries({ queryKey: VOICES_QUERY_KEY });
    },
  });
}
