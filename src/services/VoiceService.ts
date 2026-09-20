import { Linking, Platform } from 'react-native';

/**
 * VoiceService handles native Android voice dictation triggers
 * and deep-linking to Google Assistant / Gemini voice commands.
 */
export class VoiceService {
  private static instance: VoiceService;

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * Triggers native Android Voice Command Intent (android.intent.action.VOICE_COMMAND)
   * or Google App Voice Search URL scheme.
   */
  public async triggerNativeVoiceAssistant(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const googleVoiceUrl = 'googleapp://voice-search';
        const supported = await Linking.canOpenURL(googleVoiceUrl);

        if (supported) {
          await Linking.openURL(googleVoiceUrl);
          return true;
        } else {
          // Fallback to general web search voice intent or intent scheme
          await Linking.openURL('https://www.google.com');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn('[EMO Voice] Failed to trigger voice intent:', error);
      return false;
    }
  }
}
