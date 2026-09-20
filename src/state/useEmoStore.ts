import { create } from 'zustand';

export type EmoEmotion = 'idle' | 'thinking' | 'alert' | 'happy' | 'error';
export type EmoMode = 'standby' | 'active';

export interface AgentNotification {
  agentId: string;
  status: 'idle' | 'working' | 'waiting_for_input' | 'done' | 'error';
  message: string;
  requiresUserAction?: boolean;
  timestamp: string;
}

interface EmoStoreState {
  mode: EmoMode;
  emotion: EmoEmotion;
  activeNotifications: AgentNotification[];
  lastLLMResponse: string | null;
  isLLMBusy: boolean;
  
  // Actions
  setMode: (mode: EmoMode) => void;
  setEmotion: (emotion: EmoEmotion) => void;
  addNotification: (notification: AgentNotification) => void;
  clearNotification: (agentId: string) => void;
  setLLMBusy: (busy: boolean) => void;
  setLLMResponse: (response: string | null) => void;
}

export const useEmoStore = create<EmoStoreState>((set) => ({
  mode: 'standby',
  emotion: 'idle',
  activeNotifications: [],
  lastLLMResponse: null,
  isLLMBusy: false,

  setMode: (mode) => set({ mode }),
  setEmotion: (emotion) => set({ emotion }),
  
  addNotification: (notification) =>
    set((state) => {
      // Map notification status to visual emotion state
      let nextEmotion: EmoEmotion = 'idle';
      if (notification.status === 'working') nextEmotion = 'thinking';
      else if (notification.status === 'waiting_for_input' || notification.requiresUserAction) nextEmotion = 'alert';
      else if (notification.status === 'done') nextEmotion = 'happy';
      else if (notification.status === 'error') nextEmotion = 'error';

      const existingFiltered = state.activeNotifications.filter(
        (n) => n.agentId !== notification.agentId
      );

      return {
        emotion: nextEmotion,
        mode: 'active',
        activeNotifications: [notification, ...existingFiltered],
      };
    }),

  clearNotification: (agentId) =>
    set((state) => {
      const remaining = state.activeNotifications.filter((n) => n.agentId !== agentId);
      return {
        activeNotifications: remaining,
        emotion: remaining.length === 0 ? 'idle' : state.emotion,
      };
    }),

  setLLMBusy: (isLLMBusy) =>
    set({
      isLLMBusy,
      emotion: isLLMBusy ? 'thinking' : 'idle',
    }),

  setLLMResponse: (lastLLMResponse) => set({ lastLLMResponse }),
}));
