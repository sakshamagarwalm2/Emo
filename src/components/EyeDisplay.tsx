import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Ellipse, Path, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { EmoEmotion, useEmoStore } from '../state/useEmoStore';
import { StandbyClock } from './StandbyClock';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const EyeDisplay: React.FC = () => {
  const emotion = useEmoStore((state) => state.emotion);
  const setEmotion = useEmoStore((state) => state.setEmotion);
  const [showStandbyClock, setShowStandbyClock] = useState<boolean>(false);

  // Shared Values for EVE WALL-E Eye Animations
  const eyeRy = useSharedValue(42);         // Vertical radius
  const eyeRx = useSharedValue(70);         // Horizontal radius
  const eyeTranslateX = useSharedValue(0);  // Horizontal glance offset
  const eyeTranslateY = useSharedValue(0);  // Vertical glance offset
  const leftAngle = useSharedValue(14);     // Inward slant angle (deg)
  const rightAngle = useSharedValue(-14);   // Inward slant angle (deg)
  const isHappyShape = useSharedValue(0);   // 1 for EVE happy crescent path, 0 for ellipse
  
  // Color stops
  const coreColor = useSharedValue('#29B6F6'); // EVE Electric Cyan
  const auraColor = useSharedValue('#0288D1');

  useEffect(() => {
    switch (emotion) {
      case 'idle':
        isHappyShape.value = withTiming(0, { duration: 250 });
        eyeRy.value = withTiming(42, { duration: 300 });
        eyeRx.value = withTiming(70, { duration: 300 });
        eyeTranslateX.value = withTiming(0, { duration: 300 });
        eyeTranslateY.value = withTiming(0, { duration: 300 });
        leftAngle.value = withTiming(14, { duration: 300 });
        rightAngle.value = withTiming(-14, { duration: 300 });
        coreColor.value = '#29B6F6';
        auraColor.value = '#0288D1';

        // EVE periodic blink & glance
        const blinkInterval = setInterval(() => {
          eyeRy.value = withSequence(
            withTiming(2, { duration: 90 }),
            withTiming(42, { duration: 120 })
          );

          if (Math.random() > 0.45) {
            const randomX = (Math.random() - 0.5) * 24;
            const randomY = (Math.random() - 0.5) * 12;
            eyeTranslateX.value = withTiming(randomX, { duration: 350 });
            eyeTranslateY.value = withTiming(randomY, { duration: 350 });
          }
        }, 3600);

        return () => clearInterval(blinkInterval);

      case 'happy':
        // EVE Happy: Upward curved crescent eyes (^ ^)
        isHappyShape.value = withTiming(1, { duration: 250 });
        eyeTranslateX.value = withTiming(0, { duration: 250 });
        eyeTranslateY.value = withTiming(0, { duration: 250 });
        leftAngle.value = withTiming(0, { duration: 250 });
        rightAngle.value = withTiming(0, { duration: 250 });
        coreColor.value = '#00E5FF'; // EVE Glowing Cyan
        auraColor.value = '#00838F';
        break;

      case 'thinking':
        isHappyShape.value = withTiming(0, { duration: 250 });
        eyeRy.value = withTiming(24, { duration: 250 });
        eyeRx.value = withTiming(76, { duration: 250 });
        leftAngle.value = withTiming(4, { duration: 250 });
        rightAngle.value = withTiming(-4, { duration: 250 });
        coreColor.value = '#00E5FF';
        auraColor.value = '#00838F';

        eyeRy.value = withRepeat(
          withSequence(
            withTiming(30, { duration: 550 }),
            withTiming(20, { duration: 550 })
          ),
          -1,
          true
        );
        break;

      case 'alert':
        isHappyShape.value = withTiming(0, { duration: 200 });
        eyeRy.value = withTiming(58, { duration: 200 });
        eyeRx.value = withTiming(74, { duration: 200 });
        leftAngle.value = withTiming(18, { duration: 200 });
        rightAngle.value = withTiming(-18, { duration: 200 });
        coreColor.value = '#FFC107'; // Amber Alert
        auraColor.value = '#FF8F00';
        break;

      case 'stressed':
        isHappyShape.value = withTiming(0, { duration: 200 });
        eyeRy.value = withTiming(18, { duration: 200 });
        eyeRx.value = withTiming(82, { duration: 200 });
        leftAngle.value = withTiming(15, { duration: 200 });
        rightAngle.value = withTiming(-15, { duration: 200 });
        coreColor.value = '#FF9800'; // Panicked Orange
        auraColor.value = '#E65100';

        // Fast micro tremble shake
        eyeTranslateX.value = withRepeat(
          withSequence(
            withTiming(5, { duration: 50 }),
            withTiming(-5, { duration: 50 })
          ),
          -1,
          true
        );
        break;

      case 'irritated':
        isHappyShape.value = withTiming(0, { duration: 250 });
        eyeRy.value = withTiming(22, { duration: 250 });
        eyeRx.value = withTiming(72, { duration: 250 });
        leftAngle.value = withTiming(24, { duration: 250 });
        rightAngle.value = withTiming(24, { duration: 250 }); // Annoyed parallel slant
        coreColor.value = '#FF3D00'; // Deep Red-Orange
        auraColor.value = '#BF360C';
        break;

      case 'ignoring':
        isHappyShape.value = withTiming(0, { duration: 300 });
        eyeRy.value = withTiming(34, { duration: 300 });
        eyeRx.value = withTiming(58, { duration: 300 });
        eyeTranslateX.value = withTiming(44, { duration: 350 });  // Looking away
        eyeTranslateY.value = withTiming(-24, { duration: 350 }); // Looking up
        leftAngle.value = withTiming(-6, { duration: 300 });
        rightAngle.value = withTiming(6, { duration: 300 });
        coreColor.value = '#B0BEC5'; // Silver-blue
        auraColor.value = '#546E7A';
        break;

      case 'error':
        isHappyShape.value = withTiming(0, { duration: 200 });
        eyeRy.value = withTiming(28, { duration: 200 });
        eyeRx.value = withTiming(80, { duration: 200 });
        leftAngle.value = withTiming(28, { duration: 200 });
        rightAngle.value = withTiming(-28, { duration: 200 });
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
