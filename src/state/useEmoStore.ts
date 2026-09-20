import { create } from 'zustand';
import { HapticService } from '../services/HapticService';
import { TTSService } from '../services/TTSService';

export type EmoEmotion =
  | 'idle'
  | 'thinking'
  | 'alert'
  | 'happy'
  | 'error'
  | 'stressed'
  | 'irritated'
  | 'ignoring'
  | 'concerned';

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
let feelIgnoredTimer: ReturnType<typeof setTimeout> | null = null;
const IDLE_RESET_DELAY_MS = 4500;
const IGNORED_SPONTANEOUS_MS = 14000; // 14s silence -> feel ignored reaction

const EMOTION_SPOKEN_PHRASES: Record<EmoEmotion, string> = {
  idle: '',
  thinking: '',
  happy: 'Yay! I am so happy!',
  concerned: 'Is everything alright with you?',
  ignoring: 'Hey... are you ignoring me?',
  stressed: 'Whew... so much going on!',
  irritated: 'Grr... that is so annoying!',
  alert: 'Attention! Event detected!',
  error: 'Oops! Something went wrong!',
};

interface EmoStoreState {
  mode: EmoMode;
  emotion: EmoEmotion;
  activeNotifications: AgentNotification[];
  chatMessages: ChatMessage[];
  isLLMBusy: boolean;
  eyeScale: number;
  currentCaption: string | null;

  // Actions
  setMode: (mode: EmoMode) => void;
  setEmotion: (emotion: EmoEmotion, autoReset?: boolean, customPhrase?: string) => void;
  setCaption: (caption: string | null) => void;
  setEyeScale: (scale: number) => void;
  addNotification: (notification: AgentNotification) => void;
  clearNotification: (agentId: string) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  setLLMBusy: (busy: boolean) => void;
  resetIgnoredTimer: () => void;
}

export const useEmoStore = create<EmoStoreState>((set, get) => ({
  mode: 'standby',
  emotion: 'idle',
  activeNotifications: [],
  currentCaption: null,
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

  setCaption: (currentCaption) => set({ currentCaption }),

  setEmotion: (emotion: EmoEmotion, autoReset: boolean = true, customPhrase?: string) => {
    // Trigger native haptic vibration signature for emotion
    HapticService.getInstance().triggerEmotionHaptics(emotion);

    if (autoResetTimer) {
      clearTimeout(autoResetTimer);
      autoResetTimer = null;
    }

    set({ emotion });

    // Speak phrase and stream line-by-line captions ONLY when emotion phrase exists
    const spokenText = customPhrase !== undefined ? customPhrase : EMOTION_SPOKEN_PHRASES[emotion];
    
    if (spokenText) {
      TTSService.getInstance().speakWithCaptions(
        spokenText,
        (chunk) => {
          set({ currentCaption: chunk });
        },
        3
      );
    } else {
      TTSService.getInstance().stop();
      set({ currentCaption: null });
    }

    // Reset spontaneous ignored timer
    get().resetIgnoredTimer();

    // Automatically return to 'idle' after IDLE_RESET_DELAY_MS if not idle
    if (autoReset && emotion !== 'idle') {
      autoResetTimer = setTimeout(() => {
        set({ emotion: 'idle', currentCaption: null });
      }, IDLE_RESET_DELAY_MS);
    }
  },

  resetIgnoredTimer: () => {
    if (feelIgnoredTimer) {
      clearTimeout(feelIgnoredTimer);
      feelIgnoredTimer = null;
    }

    feelIgnoredTimer = setTimeout(() => {
      const state = get();
      if (state.emotion === 'idle') {
        const spontaneousEmotions: EmoEmotion[] = ['ignoring', 'concerned', 'stressed'];
        const randomEm = spontaneousEmotions[Math.floor(Math.random() * spontaneousEmotions.length)];
        get().setEmotion(randomEm, true);
      }
    }, IGNORED_SPONTANEOUS_MS);
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

    get().setEmotion(nextEmotion, true, notification.message);
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
      get().setEmotion(msg.emotion, true, msg.text);
    }
  },

  clearChat: () => set({ chatMessages: [] }),

  setLLMBusy: (isLLMBusy) => {
    set({ isLLMBusy });
    if (isLLMBusy) {
      get().setEmotion('thinking', true);
    }
  },
}));
