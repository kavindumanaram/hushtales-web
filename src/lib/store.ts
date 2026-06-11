import { create } from 'zustand';
import type { GenerateStoryResponse, StoryJob } from './api';

interface HushTalesStore {
  // Currently selected voice for story generation (mirrors backend active_voice_id).
  activeVoiceId: string | null;
  // The job a user is currently viewing/creating.
  currentJob: StoryJob | null;
  // Holds the generated script between the generate → submit steps.
  generateResult: GenerateStoryResponse | null;

  setActiveVoiceId: (id: string | null) => void;
  setCurrentJob: (job: StoryJob | null) => void;
  setGenerateResult: (result: GenerateStoryResponse | null) => void;
}

export const useStore = create<HushTalesStore>((set) => ({
  activeVoiceId: null,
  currentJob: null,
  generateResult: null,

  setActiveVoiceId: (id) => set({ activeVoiceId: id }),
  setCurrentJob: (job) => set({ currentJob: job }),
  setGenerateResult: (result) => set({ generateResult: result }),
}));
