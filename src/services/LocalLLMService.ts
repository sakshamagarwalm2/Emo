import { EmoEmotion, useEmoStore } from '../state/useEmoStore';
import { TTSService } from './TTSService';

export interface LocalAgentIntentResult {
  intent: 'greeting' | 'task_approval' | 'cancel' | 'status_check' | 'companion_chat' | 'unknown';
  summary: string;
  emotion: EmoEmotion;
}

/**
 * LocalLLMService: Companion AI Intent Engine & Voice TTS Speech Dispatcher.
 */
export class LocalLLMService {
  private static instance: LocalLLMService;

  public static getInstance(): LocalLLMService {
    if (!LocalLLMService.instance) {
      LocalLLMService.instance = new LocalLLMService();
    }
    return LocalLLMService.instance;
  }

  /**
   * Parses user spoken speech or query, triggers TTS speech,
   * streams fixed-word-count line captions, and sets EMO's emotion.
   */
  public async parseAgenticIntent(text: string): Promise<LocalAgentIntentResult> {
    const store = useEmoStore.getState();
    store.setLLMBusy(true);

    // Simulate fast local LLM response delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const lower = text.toLowerCase();
    let intent: LocalAgentIntentResult['intent'] = 'companion_chat';
    let summary = "I'm right here with you!";
    let emotion: EmoEmotion = 'happy';

    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      intent = 'greeting';
      summary = "Hey there! I'm listening!";
      emotion = 'happy';
    } else if (lower.includes('yes') || lower.includes('do it') || lower.includes('approve') || lower.includes('good')) {
      intent = 'task_approval';
      summary = "Awesome! On it right now!";
      emotion = 'happy';
    } else if (lower.includes('no') || lower.includes('stop') || lower.includes('cancel') || lower.includes('dont')) {
      intent = 'cancel';
      summary = "Got it, stopping that task.";
      emotion = 'concerned';
    } else if (lower.includes('status') || lower.includes('what are you doing') || lower.includes('report')) {
      intent = 'status_check';
      summary = "All systems operational! 100% nominal.";
      emotion = 'alert';
    } else if (lower.includes('sad') || lower.includes('bad') || lower.includes('error') || lower.includes('wrong')) {
      intent = 'companion_chat';
      summary = "Oh no, let me check what happened...";
      emotion = 'stressed';
    } else {
      intent = 'companion_chat';
      summary = `Processed: "${text}". Standing by!`;
      emotion = 'happy';
    }

    store.setLLMBusy(false);
    store.setEmotion(emotion, true, summary);

    return { intent, summary, emotion };
  }
}
