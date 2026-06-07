import { create } from 'zustand';
import { ACTIVE_USER_ID } from './constants';
import type { StoryJob, VoiceProfile } from './api';

interface HushTalesStore {
  activeUserId: string;
  activeVoiceProfile: VoiceProfile | null;
  currentJob: StoryJob | null;

  setActiveUserId: (id: string) => void;
  setActiveVoiceProfile: (profile: VoiceProfile | null) => void;
  setCurrentJob: (job: StoryJob | null) => void;
}

export const useStore = create<HushTalesStore>((set) => ({
  activeUserId: ACTIVE_USER_ID,
  activeVoiceProfile: null,
  currentJob: null,

  setActiveUserId: (id) => set({ activeUserId: id }),
  setActiveVoiceProfile: (profile) => set({ activeVoiceProfile: profile }),
  setCurrentJob: (job) => set({ currentJob: job }),
}));
