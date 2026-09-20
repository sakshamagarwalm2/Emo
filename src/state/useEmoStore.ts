import { create } from 'zustand';

export type EmoEmotion =
  | 'idle'
  | 'thinking'
  | 'alert'
  | 'happy'
  | 'error'
  | 'stressed'
  | 'irritated'
  | 'ignoring';

export type EmoMode = 'standby' | 'active' | 'chat';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'emo';
  text: string;
  emotion?: EmoEmotion;
  timestamp: string;
}

export interface AgentNotification {
  agentId: string;
  status: 'idle' | 'working' | 'waiting_for_input' | 'done' | 'error';
  message: string;
  requiresUserAction?: boolean;
  timestamp: string;
}

let autoResetTimer: ReturnType<typeof setTimeout> | null = null;
const IDLE_RESET_DELAY_MS = 4500; // 4.5 seconds auto-return to idle

interface EmoStoreState {
  mode: EmoMode;
  emotion: EmoEmotion;
  activeNotifications: AgentNotification[];
  chatMessages: ChatMessage[];
  isLLMBusy: boolean;
  eyeScale: number;

  // Actions
  setMode: (mode: EmoMode) => void;
  setEmotion: (emotion: EmoEmotion, autoReset?: boolean) => void;
  setEyeScale: (scale: number) => void;
  addNotification: (notification: AgentNotification) => void;
  clearNotification: (agentId: string) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  setLLMBusy: (busy: boolean) => void;
}

export const useEmoStore = create<EmoStoreState>((set, get) => ({
  mode: 'standby',
  emotion: 'idle',
  activeNotifications: [],
  chatMessages: [
    {
      id: 'welcome-0',
      sender: 'emo',
      text: "Hi! I'm EMO, your desk companion. Talk to me anytime!",
      emotion: 'happy',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  isLLMBusy: false,
  eyeScale: 1.0,

  setMode: (mode) => set({ mode }),

  setEmotion: (emotion: EmoEmotion, autoReset: boolean = true) => {
    // Clear any existing reset timer
    if (autoResetTimer) {
      clearTimeout(autoResetTimer);
      autoResetTimer = null;
    }

    set({ emotion });

    // Automatically return to 'idle' after 4.5 seconds if emotion is not idle
    if (autoReset && emotion !== 'idle') {
      autoResetTimer = setTimeout(() => {
        set({ emotion: 'idle' });
        autoResetTimer = null;
      }, IDLE_RESET_DELAY_MS);
    }
  },

  setEyeScale: (eyeScale) => set({ eyeScale }),

  addNotification: (notification) => {
    let nextEmotion: EmoEmotion = 'idle';
    if (notification.status === 'working') nextEmotion = 'thinking';
    else if (notification.status === 'waiting_for_input' || notification.requiresUserAction)
      nextEmotion = 'alert';
    else if (notification.status === 'done') nextEmotion = 'happy';
    else if (notification.status === 'error') nextEmotion = 'error';

    const state = get();
    const existingFiltered = state.activeNotifications.filter(
      (n) => n.agentId !== notification.agentId
    );

    set({
      mode: 'active',
      activeNotifications: [notification, ...existingFiltered],
    });

    // Set emotion with auto-return to idle
    get().setEmotion(nextEmotion, true);
  },

  clearNotification: (agentId) =>
    set((state) => {
      const remaining = state.activeNotifications.filter((n) => n.agentId !== agentId);
      return {
        activeNotifications: remaining,
        emotion: remaining.length === 0 ? 'idle' : state.emotion,
      };
    }),

  addChatMessage: (msg) => {
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          ...msg,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      mode: 'chat',
    }));

    if (msg.emotion) {
      get().setEmotion(msg.emotion, true);
    }
  },

  clearChat: () => set({ chatMessages: [] }),

  setLLMBusy: (isLLMBusy) => {
    set({ isLLMBusy });
    get().setEmotion(isLLMBusy ? 'thinking' : 'idle', !isLLMBusy);
  },
}));
