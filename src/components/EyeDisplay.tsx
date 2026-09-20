import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Ellipse, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { EmoEmotion, useEmoStore } from '../state/useEmoStore';
import { StandbyClock } from './StandbyClock';
import { MouthBarVisualizer, AgentState } from './MouthBarVisualizer';
import { VoiceService } from '../services/VoiceService';
import { LocalLLMService } from '../services/LocalLLMService';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const SPRING_CONFIG = {
  damping: 14,
  stiffness: 110,
  mass: 0.8,
};

// Pure SVG Spotify Logo Component
const SpotifyLogo = ({ color = '#1DB954', size = 26 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3.102zM18.84 14.1c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.44-.48.12-.96-.18-1.08-.66-.12-.48.18-.96.66-1.08 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.12 1.26zm.12-3.36C15.06 8.46 8.52 8.22 4.74 9.36c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.38-1.32 11.58-1.08 16.02 1.56.54.3.72 1.02.42 1.56-.3.42-1.02.66-1.56.36z" />
  </Svg>
);

// Pure SVG Sci-Fi Tech Spark Icon Component
const SciFiIcon = ({ color = '#444444', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={color} />
  </Svg>
);

// Derived emotion colors
const getEmotionColors = (emotion: EmoEmotion) => {
  switch (emotion) {
    case 'happy':
    case 'ignoring':
    case 'thinking':
      return { core: '#00E5FF', aura: '#00838F', stop: '#80D8FF' };
    case 'concerned':
      return { core: '#9FA8DA', aura: '#3F51B5', stop: '#C5CAE9' };
    case 'stressed':
    case 'irritated':
      return { core: '#FF9800', aura: '#E65100', stop: '#FFE0B2' };
    case 'alert':
      return { core: '#FFC107', aura: '#FF8F00', stop: '#FFECB3' };
    case 'error':
      return { core: '#FF5252', aura: '#C62828', stop: '#FF8A80' };
    case 'idle':
    default:
      return { core: '#29B6F6', aura: '#0288D1', stop: '#80D8FF' };
  }
};

export const EyeDisplay: React.FC = () => {
  const emotion = useEmoStore((state) => state.emotion);
  const currentCaption = useEmoStore((state) => state.currentCaption);
  const [showStandbyClock, setShowStandbyClock] = useState<boolean>(false);
  const [isPassiveMicActive, setIsPassiveMicActive] = useState<boolean>(true);
  const [micAmplitude, setMicAmplitude] = useState<number>(0);

  // Auto-request permissions and start passive mic listening with noise gate filtering
  useEffect(() => {
    const voice = VoiceService.getInstance();
    voice.requestMobilePermissions();

    const stopListening = voice.startPassiveListening((amp) => {
      setMicAmplitude(amp);
    });

    return () => {
      stopListening();
    };
  }, []);

  // Shared Animation Values (2.25x Enlarged Visor Size)
  const eyeRy = useSharedValue(90);         // Vertical radius
  const eyeRx = useSharedValue(145);        // Horizontal radius
  const eyeTranslateX = useSharedValue(0);  // Horizontal glance offset
  const eyeTranslateY = useSharedValue(0);  // Vertical glance offset
  const leftAngle = useSharedValue(14);     // Inward slant angle (deg)
  const rightAngle = useSharedValue(-14);   // Inward slant angle (deg)

  useEffect(() => {
    switch (emotion) {
      case 'idle':
        eyeRy.value = withSpring(90, SPRING_CONFIG);
        eyeRx.value = withSpring(145, SPRING_CONFIG);
        eyeTranslateX.value = withSpring(0, SPRING_CONFIG);
        eyeTranslateY.value = withSpring(0, SPRING_CONFIG);
        leftAngle.value = withSpring(14, SPRING_CONFIG);
        rightAngle.value = withSpring(-14, SPRING_CONFIG);

        const blinkInterval = setInterval(() => {
          const isDoubleBlink = Math.random() > 0.75;
          if (isDoubleBlink) {
            eyeRy.value = withSequence(
              withTiming(4, { duration: 70, easing: Easing.quad }),
              withSpring(90, SPRING_CONFIG),
              withTiming(4, { duration: 60, easing: Easing.quad }),
              withSpring(90, SPRING_CONFIG)
            );
          } else {
            eyeRy.value = withSequence(
              withTiming(4, { duration: 80, easing: Easing.quad }),
              withSpring(90, SPRING_CONFIG)
            );
          }

          if (Math.random() > 0.4) {
            const suddenGlance = Math.random() > 0.7;
            const randomX = suddenGlance ? (Math.random() > 0.5 ? 32 : -32) : (Math.random() - 0.5) * 32;
            const randomY = suddenGlance ? -18 : (Math.random() - 0.5) * 16;
            eyeTranslateX.value = withSpring(randomX, SPRING_CONFIG);
            eyeTranslateY.value = withSpring(randomY, SPRING_CONFIG);
          }
        }, 3400);

        return () => clearInterval(blinkInterval);

      case 'happy':
        eyeRy.value = withSpring(75, SPRING_CONFIG);
        eyeRx.value = withSpring(135, SPRING_CONFIG);
        leftAngle.value = withSpring(0, SPRING_CONFIG);
        rightAngle.value = withSpring(0, SPRING_CONFIG);
        eyeTranslateY.value = withSequence(
          withTiming(-24, { duration: 180 }),
          withTiming(24, { duration: 180 }),
          withTiming(-16, { duration: 160 }),
          withTiming(0, { duration: 160 })
        );
        break;

      case 'concerned':
        eyeRy.value = withSpring(100, SPRING_CONFIG);
        eyeRx.value = withSpring(140, SPRING_CONFIG);
        eyeTranslateX.value = withSpring(0, SPRING_CONFIG);
        eyeTranslateY.value = withSpring(8, SPRING_CONFIG);
        leftAngle.value = withSpring(-16, SPRING_CONFIG);
        rightAngle.value = withSpring(16, SPRING_CONFIG);
        break;

      case 'ignoring':
        eyeRy.value = withSpring(84, SPRING_CONFIG);
        eyeRx.value = withSpring(135, SPRING_CONFIG);
        eyeTranslateX.value = withSpring(24, SPRING_CONFIG);
        eyeTranslateY.value = withSpring(-8, SPRING_CONFIG);
        leftAngle.value = withSpring(0, SPRING_CONFIG);
        rightAngle.value = withSpring(-8, SPRING_CONFIG);
        break;

      case 'stressed':
      case 'irritated':
        eyeRy.value = withSpring(115, SPRING_CONFIG);
        eyeRx.value = withSpring(115, SPRING_CONFIG);
        leftAngle.value = withSpring(0, SPRING_CONFIG);
        rightAngle.value = withSpring(0, SPRING_CONFIG);
        eyeTranslateX.value = withSequence(
          withTiming(-28, { duration: 140 }),
          withTiming(28, { duration: 140 }),
          withTiming(-20, { duration: 140 }),
          withTiming(20, { duration: 140 }),
          withTiming(0, { duration: 140 })
        );
        break;

      case 'thinking':
        eyeRy.value = withSpring(48, SPRING_CONFIG);
        eyeRx.value = withSpring(160, SPRING_CONFIG);
        eyeTranslateX.value = withSpring(0, SPRING_CONFIG);
        eyeTranslateY.value = withSpring(0, SPRING_CONFIG);
        leftAngle.value = withSpring(4, SPRING_CONFIG);
        rightAngle.value = withSpring(-4, SPRING_CONFIG);
        eyeRy.value = withRepeat(
          withSequence(
            withTiming(58, { duration: 550 }),
            withTiming(38, { duration: 550 })
          ),
          -1,
          true
        );
        break;

      case 'alert':
        eyeRy.value = withSpring(125, SPRING_CONFIG);
        eyeRx.value = withSpring(155, SPRING_CONFIG);
        eyeTranslateX.value = withSpring(0, SPRING_CONFIG);
        eyeTranslateY.value = withSpring(0, SPRING_CONFIG);
        leftAngle.value = withSpring(18, SPRING_CONFIG);
        rightAngle.value = withSpring(-18, SPRING_CONFIG);
        break;

      case 'error':
        eyeRy.value = withSpring(58, SPRING_CONFIG);
        eyeRx.value = withSpring(168, SPRING_CONFIG);
        eyeTranslateX.value = withSpring(0, SPRING_CONFIG);
        eyeTranslateY.value = withSpring(0, SPRING_CONFIG);
        leftAngle.value = withSpring(28, SPRING_CONFIG);
        rightAngle.value = withSpring(-28, SPRING_CONFIG);
        break;
    }
  }, [emotion]);

  const leftEyeProps = useAnimatedProps(() => ({
    ry: eyeRy.value,
    rx: eyeRx.value,
  }));

  const rightEyeProps = useAnimatedProps(() => ({
    ry: eyeRy.value,
    rx: eyeRx.value,
  }));

  const leftEyeAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: eyeTranslateX.value },
      { translateY: eyeTranslateY.value },
      { rotate: `${leftAngle.value}deg` },
    ],
  }));

  const rightEyeAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: eyeTranslateX.value },
      { translateY: eyeTranslateY.value },
      { rotate: `${rightAngle.value}deg` },
    ],
  }));

  // Tap EMO's eyes to trigger an AI Voice Companion query!
  const handleTapEye = async () => {
    const testQueries = [
      "Hello EMO status check",
      "Do you want to do this task",
      "What are you thinking",
      "Hey EMO I am talking to you",
      "Cancel current operation",
    ];
    const query = testQueries[Math.floor(Math.random() * testQueries.length)];
    console.log(`[EMO Eye Tapped] Invoking Local LLM Service for: "${query}"`);
    await LocalLLMService.getInstance().parseAgenticIntent(query);
  };

  const colors = getEmotionColors(emotion);

  let mouthState: AgentState = 'idle';
  if (emotion === 'thinking') mouthState = 'thinking';
  else if (emotion === 'happy') mouthState = 'speaking';
  else if (isPassiveMicActive) mouthState = micAmplitude > 0 ? 'speaking' : 'idle';

  return (
    <View style={styles.fullScreenContainer}>
      {showStandbyClock ? (
        <StandbyClock />
      ) : (
        <TouchableOpacity activeOpacity={0.95} onPress={handleTapEye} style={styles.eyeTouchContainer}>
          <View style={styles.eyesStage}>
            {/* Left Eye */}
            <Animated.View style={[styles.singleEyeBox, leftEyeAnimStyle]}>
              <Svg height="260" width="330" viewBox="-165 -130 330 260">
                <Defs>
                  <RadialGradient id="eveGlowLeft" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={colors.stop} stopOpacity="1" />
                    <Stop offset="45%" stopColor={colors.core} stopOpacity="0.95" />
                    <Stop offset="85%" stopColor={colors.aura} stopOpacity="0.6" />
                    <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Ellipse cx="0" cy="0" rx="160" ry="110" fill="url(#eveGlowLeft)" opacity={0.35} />
                {emotion === 'happy' || emotion === 'ignoring' ? (
                  <Path d="M -85,25 Q 0,-70 85,25 Q 0,-25 -85,25 Z" fill="url(#eveGlowLeft)" />
                ) : emotion === 'stressed' || emotion === 'irritated' ? (
                  <Path d="M -55,-55 L 55,55 M 55,-55 L -55,55" stroke={colors.core} strokeWidth="24" strokeLinecap="round" />
                ) : (
                  <AnimatedEllipse cx="0" cy="0" animatedProps={leftEyeProps} fill="url(#eveGlowLeft)" />
                )}
              </Svg>
            </Animated.View>

            {/* Right Eye */}
            <Animated.View style={[styles.singleEyeBox, rightEyeAnimStyle]}>
              <Svg height="260" width="330" viewBox="-165 -130 330 260">
                <Defs>
                  <RadialGradient id="eveGlowRight" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={colors.stop} stopOpacity="1" />
                    <Stop offset="45%" stopColor={colors.core} stopOpacity="0.95" />
                    <Stop offset="85%" stopColor={colors.aura} stopOpacity="0.6" />
                    <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Ellipse cx="0" cy="0" rx="160" ry="110" fill="url(#eveGlowRight)" opacity={0.35} />
                {emotion === 'happy' ? (
                  <Path d="M -85,25 Q 0,-70 85,25 Q 0,-25 -85,25 Z" fill="url(#eveGlowRight)" />
                ) : emotion === 'stressed' || emotion === 'irritated' ? (
                  <Ellipse cx="0" cy="0" rx="65" ry="65" fill="none" stroke={colors.core} strokeWidth="24" />
                ) : (
                  <AnimatedEllipse cx="0" cy="0" animatedProps={rightEyeProps} fill="url(#eveGlowRight)" />
                )}
              </Svg>
            </Animated.View>
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom Centered ElevenLabs Digital Mouth & Active Speech Captions Pill */}
      {!showStandbyClock && (
        <View style={styles.bottomMouthCaptionRow}>
          <MouthBarVisualizer
            state={mouthState}
            color={colors.core}
            isAudioReactive={isPassiveMicActive}
            micAmplitude={micAmplitude}
            barCount={15}
            minHeight={5}
            maxHeight={48}
          />

          {/* Caption Pill ONLY appears when EMO is actively speaking or responding */}
          {currentCaption ? (
            <View style={styles.captionBubblePill}>
              <Text style={styles.captionText}>{currentCaption}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Bottom Left Corner Spotify Passive Mic React Button */}
      <TouchableOpacity
        style={styles.bottomLeftSpotifyButton}
        onPress={() => setIsPassiveMicActive((prev) => !prev)}
        activeOpacity={0.7}
      >
        <SpotifyLogo color={isPassiveMicActive ? '#1ED760' : '#1DB954'} size={26} />
      </TouchableOpacity>

      {/* Bottom Right Corner Sci-Fi Standby Switch Button */}
      <TouchableOpacity
        style={styles.bottomRightSciFiButton}
        onPress={() => setShowStandbyClock((prev) => !prev)}
        activeOpacity={0.7}
      >
        <SciFiIcon color={showStandbyClock ? '#00E5FF' : '#555555'} size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  eyeTouchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyesStage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    width: 720,
    height: 280,
  },
  singleEyeBox: {
    width: 330,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLeftSpotifyButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    padding: 10,
    zIndex: 99,
  },
  bottomRightSciFiButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#101010',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  bottomMouthCaptionRow: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    gap: 12,
  },
  captionBubblePill: {
    backgroundColor: 'rgba(24, 24, 24, 0.92)',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    maxWidth: 260,
  },
  captionText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
