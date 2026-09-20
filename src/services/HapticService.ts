import { Vibration, Platform } from 'react-native';
import { EmoEmotion } from '../state/useEmoStore';

/**
 * HapticService: Provides distinct native Android vibration signatures
 * synchronized with EMO's emotional state changes and agent events.
 */
export class HapticService {
  private static instance: HapticService;

  public static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService();
    }
    return HapticService.instance;
  }

  /**
   * Triggers emotion-specific vibration patterns.
   */
  public triggerEmotionHaptics(emotion: EmoEmotion): void {
    if (Platform.OS === 'web') return;

    try {
      switch (emotion) {
        case 'happy':
          // Upbeat double-pulse
          Vibration.vibrate([0, 50, 40, 60]);
          break;

        case 'thinking':
          // Soft subtle single pulse
          Vibration.vibrate([0, 30, 100, 30]);
          break;

        case 'alert':
          // Sharp triple warning pulse
          Vibration.vibrate([0, 80, 50, 80, 50, 80]);
          break;

        case 'error':
        case 'stressed':
        case 'irritated':
          // Strong double buzz
          Vibration.vibrate([0, 180, 80, 180]);
          break;

        case 'ignoring':
        case 'concerned':
          // Subtle soft double nudge
          Vibration.vibrate([0, 60, 60, 60]);
          break;

        case 'idle':
        default:
          // Subtle micro tick
          Vibration.vibrate(20);
          break;
      }
    } catch (err) {
      console.warn('[EMO Haptics] Vibration error:', err);
    }
  }

  /**
   * Stop all ongoing vibrations.
   */
  public cancelHaptics(): void {
    try {
      Vibration.cancel();
    } catch (err) {
      console.warn('[EMO Haptics] Cancel error:', err);
    }
  }
}
