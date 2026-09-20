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

interface EmoStoreState {
  mode: EmoMode;
  emotion: EmoEmotion;
  activeNotifications: AgentNotification[];
  chatMessages: ChatMessage[];
  isLLMBusy: boolean;
  eyeScale: number; // Dynamic eye size scaling (0.8x to 1.3x)

  // Actions
  setMode: (mode: EmoMode) => void;
  setEmotion: (emotion: EmoEmotion) => void;
  setEyeScale: (scale: number) => void;
  addNotification: (notification: AgentNotification) => void;
  clearNotification: (agentId: string) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  setLLMBusy: (busy: boolean) => void;
}

export const useEmoStore = create<EmoStoreState>((set) => ({
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
  setEmotion: (emotion) => set({ emotion }),
  setEyeScale: (eyeScale) => set({ eyeScale }),

  addNotification: (notification) =>
    set((state) => {
      let nextEmotion: EmoEmotion = 'idle';
      if (notification.status === 'working') nextEmotion = 'thinking';
      else if (notification.status === 'waiting_for_input' || notification.requiresUserAction)
        nextEmotion = 'alert';
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

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          ...msg,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      emotion: msg.emotion || state.emotion,
      mode: 'chat',
    })),

  clearChat: () => set({ chatMessages: [] }),

  setLLMBusy: (isLLMBusy) =>
    set({
      isLLMBusy,
      emotion: isLLMBusy ? 'thinking' : 'idle',
    }),
}));
