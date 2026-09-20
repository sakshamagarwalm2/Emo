import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Ellipse, Path, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { EmoEmotion, useEmoStore } from '../state/useEmoStore';
import { StandbyClock } from './StandbyClock';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedG = Animated.createAnimatedComponent(G);

// Spring physics config for Pixar/EVE character fluid movement
const SPRING_CONFIG = {
  damping: 14,
  stiffness: 110,
  mass: 0.8,
};

export const EyeDisplay: React.FC = () => {
  const emotion = useEmoStore((state) => state.emotion);
  const setEmotion = useEmoStore((state) => state.setEmotion);
  const [showStandbyClock, setShowStandbyClock] = useState<boolean>(false);

  // Shared Animation Values using Reanimated Physics
  const eyeRy = useSharedValue(42);         // Vertical radius
  const eyeRx = useSharedValue(70);         // Horizontal radius
  const eyeTranslateX = useSharedValue(0);  // Horizontal glance offset
  const eyeTranslateY = useSharedValue(0);  // Vertical glance offset
  const leftAngle = useSharedValue(14);     // Inward slant angle (deg)
  const rightAngle = useSharedValue(-14);   // Inward slant angle (deg)
  
  // Color stops
  const coreColor = useSharedValue('#29B6F6'); // EVE Electric Cyan
  const auraColor = useSharedValue('#0288D1');

  useEffect(() => {
    switch (emotion) {
      case 'idle':
        eyeRy.value = withSpring(42, SPRING_CONFIG);
        eyeRx.value = withSpring(70, SPRING_CONFIG);
        eyeTranslateX.value = withSpring(0, SPRING_CONFIG);
        eyeTranslateY.value = withSpring(0, SPRING_CONFIG);
        leftAngle.value = withSpring(14, SPRING_CONFIG);
        rightAngle.value = withSpring(-14, SPRING_CONFIG);
        coreColor.value = '#29B6F6';
        auraColor.value = '#0288D1';

        // Organic Spring Blink Loop
        const blinkInterval = setInterval(() => {
          eyeRy.value = withSequence(
            withTiming(2, { duration: 80, easing: Easing.quad }),
            withSpring(42, SPRING_CONFIG)
          );

          if (Math.random() > 0.4) {
            const randomX = (Math.random() - 0.5) * 26;
            const randomY = (Math.random() - 0.5) * 12;
            eyeTranslateX.value = withSpring(randomX, SPRING_CONFIG);
            eyeTranslateY.value = withSpring(randomY, SPRING_CONFIG);
          }
        }, 3500);

        return () => clearInterval(blinkInterval);

      case 'happy':
        // EVE Happy: Upward curved crescent eyes with spring bounce
        eyeRy.value = withSpring(34, SPRING_CONFIG);
        eyeRx.value = withSpring(64, SPRING_CONFIG);
        eyeTranslateX.value = withSpring(0, SPRING_CONFIG);
        eyeTranslateY.value = withSpring(-4, SPRING_CONFIG);
        leftAngle.value = withSpring(0, SPRING_CONFIG);
        rightAngle.value = withSpring(0, SPRING_CONFIG);
        coreColor.value = '#00E5FF'; // EVE Glowing Cyan
        auraColor.value = '#00838F';
        break;

      case 'thinking':
        eyeRy.value = withSpring(22, SPRING_CONFIG);
        eyeRx.value = withSpring(76, SPRING_CONFIG);
        leftAngle.value = withSpring(4, SPRING_CONFIG);
        rightAngle.value = withSpring(-4, SPRING_CONFIG);
        coreColor.value = '#00E5FF';
        auraColor.value = '#00838F';

        eyeRy.value = withRepeat(
          withSequence(
            withTiming(28, { duration: 550 }),
            withTiming(18, { duration: 550 })
          ),
          -1,
          true
        );
        break;

      case 'alert':
        eyeRy.value = withSpring(58, SPRING_CONFIG);
        eyeRx.value = withSpring(74, SPRING_CONFIG);
        leftAngle.value = withSpring(18, SPRING_CONFIG);
        rightAngle.value = withSpring(-18, SPRING_CONFIG);
        coreColor.value = '#FFC107'; // Amber Alert
        auraColor.value = '#FF8F00';
        break;

      case 'stressed':
        eyeRy.value = withSpring(16, SPRING_CONFIG);
        eyeRx.value = withSpring(82, SPRING_CONFIG);
        leftAngle.value = withSpring(15, SPRING_CONFIG);
        rightAngle.value = withSpring(-15, SPRING_CONFIG);
        coreColor.value = '#FF9800'; // Panicked Orange
        auraColor.value = '#E65100';

        // Fast micro tremble shake
        eyeTranslateX.value = withRepeat(
          withSequence(
            withTiming(5, { duration: 45 }),
            withTiming(-5, { duration: 45 })
          ),
          -1,
          true
        );
        break;

      case 'irritated':
        eyeRy.value = withSpring(20, SPRING_CONFIG);
        eyeRx.value = withSpring(72, SPRING_CONFIG);
        leftAngle.value = withSpring(24, SPRING_CONFIG);
        rightAngle.value = withSpring(24, SPRING_CONFIG); // Annoyed parallel slant
        coreColor.value = '#FF3D00'; // Deep Red-Orange
        auraColor.value = '#BF360C';
        break;

      case 'ignoring':
        eyeRy.value = withSpring(32, SPRING_CONFIG);
        eyeRx.value = withSpring(56, SPRING_CONFIG);
        eyeTranslateX.value = withSpring(44, SPRING_CONFIG);  // Looking away
        eyeTranslateY.value = withSpring(-24, SPRING_CONFIG); // Looking up
        leftAngle.value = withSpring(-6, SPRING_CONFIG);
        rightAngle.value = withSpring(6, SPRING_CONFIG);
        coreColor.value = '#B0BEC5'; // Silver-blue
        auraColor.value = '#546E7A';
        break;

      case 'error':
        eyeRy.value = withSpring(26, SPRING_CONFIG);
        eyeRx.value = withSpring(80, SPRING_CONFIG);
        leftAngle.value = withSpring(28, SPRING_CONFIG);
        rightAngle.value = withSpring(-28, SPRING_CONFIG);
        coreColor.value = '#FF5252'; // Crimson
        auraColor.value = '#C62828';
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

  const leftGroupProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 100 + eyeTranslateX.value },
      { translateY: 90 + eyeTranslateY.value },
      { rotate: `${leftAngle.value}deg` },
    ] as any,
  }));

  const rightGroupProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 260 + eyeTranslateX.value },
      { translateY: 90 + eyeTranslateY.value },
      { rotate: `${rightAngle.value}deg` },
    ] as any,
  }));

  const handleTapEye = () => {
    const states: EmoEmotion[] = [
      'idle',
      'happy',
      'thinking',
      'alert',
      'stressed',
      'irritated',
      'ignoring',
      'error',
    ];
    const nextIdx = (states.indexOf(emotion) + 1) % states.length;
    setEmotion(states[nextIdx]);
  };

  return (
    <View style={styles.fullScreenContainer}>
      {/* Standby Desk Clock View OR EVE Glowing Eye View */}
      {showStandbyClock ? (
        <StandbyClock />
      ) : (
        <TouchableOpacity activeOpacity={0.95} onPress={handleTapEye} style={styles.eyeTouchContainer}>
          <Svg height="220" width="380" viewBox="0 0 380 220">
            <Defs>
              <RadialGradient id="eveGlowLeft" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#80D8FF" stopOpacity="1" />
                <Stop offset="45%" stopColor={coreColor.value} stopOpacity="0.95" />
                <Stop offset="85%" stopColor={auraColor.value} stopOpacity="0.6" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="eveGlowRight" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#80D8FF" stopOpacity="1" />
                <Stop offset="45%" stopColor={coreColor.value} stopOpacity="0.95" />
                <Stop offset="85%" stopColor={auraColor.value} stopOpacity="0.6" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Left Eye */}
            <AnimatedG animatedProps={leftGroupProps}>
              <AnimatedEllipse cx="0" cy="0" rx="82" ry="54" fill="url(#eveGlowLeft)" opacity={0.35} />
              {emotion === 'happy' ? (
                // EVE Iconic Happy Crescent Path (^ ^)
                <Path
                  d="M -48,15 Q 0,-38 48,15 Q 0,-15 -48,15 Z"
                  fill="url(#eveGlowLeft)"
                />
              ) : (
                <AnimatedEllipse cx="0" cy="0" animatedProps={leftEyeProps} fill="url(#eveGlowLeft)" />
              )}
            </AnimatedG>

            {/* Right Eye */}
            <AnimatedG animatedProps={rightGroupProps}>
              <AnimatedEllipse cx="0" cy="0" rx="82" ry="54" fill="url(#eveGlowRight)" opacity={0.35} />
              {emotion === 'happy' ? (
                // EVE Iconic Happy Crescent Path (^ ^)
                <Path
                  d="M -48,15 Q 0,-38 48,15 Q 0,-15 -48,15 Z"
                  fill="url(#eveGlowRight)"
                />
              ) : (
                <AnimatedEllipse cx="0" cy="0" animatedProps={rightEyeProps} fill="url(#eveGlowRight)" />
              )}
            </AnimatedG>
          </Svg>
        </TouchableOpacity>
      )}

      {/* Bottom Right Corner Small Dot Mode Switch Button */}
      <TouchableOpacity
        style={styles.bottomRightDotButton}
        onPress={() => setShowStandbyClock((prev) => !prev)}
        activeOpacity={0.6}
      >
        <View style={[styles.dotIndicator, showStandbyClock && styles.dotActive]} />
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
  bottomRightDotButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 12,
    zIndex: 99,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  dotActive: {
    backgroundColor: '#00E5FF',
  },
});
