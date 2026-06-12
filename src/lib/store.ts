import { create } from 'zustand';
import type { GenerateStoryResponse, StoryJob } from './api';

// localStorage key for the currently selected viewing profile (e.g. 'mom', 'emma').
const ACTIVE_PROFILE_KEY = 'ht_active_profile';

interface HushTalesStore {
  // Currently selected voice for story generation (mirrors backend active_voice_id).
  activeVoiceId: string | null;
  // The profile that is currently watching (set on the /profiles screen).
  activeProfileId: string | null;
  // The job a user is currently viewing/creating.
  currentJob: StoryJob | null;
  // Holds the generated script between the generate → submit steps.
  generateResult: GenerateStoryResponse | null;

  setActiveVoiceId: (id: string | null) => void;
  setActiveProfileId: (id: string | null) => void;
  hydrateActiveProfile: () => void;
  setCurrentJob: (job: StoryJob | null) => void;
  setGenerateResult: (result: GenerateStoryResponse | null) => void;
}

export const useStore = create<HushTalesStore>((set) => ({
  activeVoiceId: null,
  activeProfileId: null,
  currentJob: null,
  generateResult: null,

  setActiveVoiceId: (id) => set({ activeVoiceId: id }),
  setActiveProfileId: (id) => {
    if (typeof window !== 'undefined') {
      if (id) window.localStorage.setItem(ACTIVE_PROFILE_KEY, id);
      else window.localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
    set({ activeProfileId: id });
  },
  hydrateActiveProfile: () => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (stored) set({ activeProfileId: stored });
  },
  setCurrentJob: (job) => set({ currentJob: job }),
  setGenerateResult: (result) => set({ generateResult: result }),
}));
