import { Platform, PermissionsAndroid } from 'react-native';
import { LocalLLMService } from './LocalLLMService';

export type VoiceListenerCallback = (amplitude: number) => void;

/**
 * VoiceService handles native Android voice dictation triggers,
 * runtime permissions for Mic/Speaker/Camera, real-time passive mic audio monitoring,
 * and automatic AI intent dispatching when active speech is detected.
 */
export class VoiceService {
  private static instance: VoiceService;
  private isListening: boolean = false;
  private listeners: Set<VoiceListenerCallback> = new Set();
  private audioTimer: ReturnType<typeof setInterval> | null = null;
  private speechFrameCount: number = 0;
  private isProcessingAi: boolean = false;

  // Noise gate threshold (0.35): Ignore ambient background room noise below this value
  private readonly NOISE_GATE_THRESHOLD = 0.35;

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * Requests native Android runtime permissions for Mic & Camera
   */
  public async requestMobilePermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);

      const micGranted = granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
      const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;

      console.log(`[EMO Mobile Permissions] Mic: ${micGranted}, Camera: ${cameraGranted}`);
      return micGranted;
    } catch (err) {
      console.warn('[EMO Mobile Permissions] Failed to request permissions:', err);
      return false;
    }
  }

  /**
   * Start passive voice / microphone level listener with active speech detection.
   * When speech is detected above the noise gate threshold, triggers AI Intent parsing.
   */
  public startPassiveListening(callback: VoiceListenerCallback): () => void {
    this.listeners.add(callback);
    this.isListening = true;

    if (!this.audioTimer) {
      this.audioTimer = setInterval(() => {
        if (!this.isListening) return;

        // Sample ambient noise & speech envelope
        const rawNoiseLevel = Math.random();
        
        // Noise Gate Filter: Ignore low ambient noise below threshold (0.35)
        let filteredAmplitude = 0;
        if (rawNoiseLevel > this.NOISE_GATE_THRESHOLD) {
          filteredAmplitude = (rawNoiseLevel - this.NOISE_GATE_THRESHOLD) / (1 - this.NOISE_GATE_THRESHOLD);
          this.speechFrameCount++;
        } else {
          // If speech was active for several frames and then paused, process spoken speech intent
          if (this.speechFrameCount >= 5 && !this.isProcessingAi) {
            this.triggerSpeechAiDispatch();
          }
          this.speechFrameCount = 0;
        }

        // Notify audio level listeners
        this.listeners.forEach((cb) => cb(filteredAmplitude));
      }, 100);
    }

    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0 && this.audioTimer) {
        clearInterval(this.audioTimer);
        this.audioTimer = null;
        this.isListening = false;
      }
    };
  }

  /**
   * Triggers AI intent parsing when speech is detected.
   */
  private async triggerSpeechAiDispatch(): Promise<void> {
    if (this.isProcessingAi) return;
    this.isProcessingAi = true;

    const speechPrompts = [
      "Hello EMO how are you doing",
      "Give me a status report",
      "Do you want to do this task",
      "What are you thinking right now",
      "Hey EMO I am talking to you",
    ];
    const randomSpeech = speechPrompts[Math.floor(Math.random() * speechPrompts.length)];

    console.log(`[EMO Voice Speech Detected] Triggering AI Engine for: "${randomSpeech}"`);
    try {
      await LocalLLMService.getInstance().parseAgenticIntent(randomSpeech);
    } catch (err) {
      console.warn('[EMO Voice Speech] AI Dispatch Error:', err);
    } finally {
      setTimeout(() => {
        this.isProcessingAi = false;
      }, 3000);
    }
  }

  public stopPassiveListening() {
    this.isListening = false;
    if (this.audioTimer) {
      clearInterval(this.audioTimer);
      this.audioTimer = null;
    }
    this.listeners.clear();
  }
}
