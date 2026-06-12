import { create } from 'zustand';
import type { GenerateStoryResponse, StoryJob } from './api';

// Which "Who's watching?" profile is active. Persisted so parent-only zones
// (e.g. the Voice Studio) survive a page reload. 'mom' is the parent profile.
const PROFILE_STORAGE_KEY = 'ht_active_profile';

interface HushTalesStore {
  // Currently selected voice for story generation (mirrors backend active_voice_id).
  activeVoiceId: string | null;
  // The active viewer profile id (e.g. 'mom', 'emma'). null until chosen.
  activeProfileId: string | null;
  // The job a user is currently viewing/creating.
  currentJob: StoryJob | null;
  // Holds the generated script between the generate → submit steps.
  generateResult: GenerateStoryResponse | null;

  setActiveVoiceId: (id: string | null) => void;
  setActiveProfileId: (id: string | null) => void;
  /** Load the persisted profile from localStorage (call once on mount). */
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
      if (id) localStorage.setItem(PROFILE_STORAGE_KEY, id);
      else localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
    set({ activeProfileId: id });
  },
  hydrateActiveProfile: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) set({ activeProfileId: saved });
  },
  setCurrentJob: (job) => set({ currentJob: job }),
  setGenerateResult: (result) => set({ generateResult: result }),
}));
