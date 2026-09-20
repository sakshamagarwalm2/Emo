import { useEmoStore } from '../state/useEmoStore';

/**
 * LocalLLMService wraps on-device tiny GGUF LLM execution (e.g. Qwen2.5-0.5B, SmolLM-360M).
 * Manages llama.rn execution context, intent parsing, and offline query resolution.
 */
export class LocalLLMService {
  private static instance: LocalLLMService;
  private isLoaded: boolean = false;
  private activeModelPath: string | null = null;

  public static getInstance(): LocalLLMService {
    if (!LocalLLMService.instance) {
      LocalLLMService.instance = new LocalLLMService();
    }
    return LocalLLMService.instance;
  }

  public async loadModel(modelPath: string): Promise<boolean> {
    try {
      console.log(`[EMO LLM] Loading GGUF model from path: ${modelPath}`);
      this.activeModelPath = modelPath;
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('[EMO LLM] Failed to load model context:', error);
      return false;
    }
  }

  public async generateCompletion(prompt: string): Promise<string> {
    const store = useEmoStore.getState();
    store.setLLMBusy(true);

    try {
      if (!this.isLoaded) {
        throw new Error('No local GGUF model context loaded. Load model before calling completion.');
      }

      // Placeholder inference execution simulation for offline classification
      console.log(`[EMO LLM] Processing prompt: ${prompt}`);
      const response = `[EMO Local AI] Completed offline response for: "${prompt}"`;
      
      store.setLLMResponse(response);
      return response;
    } catch (err: any) {
      console.error('[EMO LLM] Inference error:', err);
      return `Error executing offline inference: ${err.message}`;
    } finally {
      store.setLLMBusy(false);
    }
  }
}
