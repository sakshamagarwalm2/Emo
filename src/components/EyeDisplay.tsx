import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Ellipse, Defs, RadialGradient, Stop, G, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useEmoStore } from '../state/useEmoStore';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const EyeDisplay: React.FC = () => {
  const emotion = useEmoStore((state) => state.emotion);
  const setEmotion = useEmoStore((state) => state.setEmotion);

  // Reanimated Shared Values matching reference image aesthetics
  const eyeRy = useSharedValue(42);         // Vertical radius
  const eyeRx = useSharedValue(70);         // Horizontal radius
  const eyeTranslateX = useSharedValue(0);  // Horizontal glance shift
  const eyeTranslateY = useSharedValue(0);  // Vertical glance shift
  const leftAngle = useSharedValue(12);     // Inward slant angle for left eye (deg)
  const rightAngle = useSharedValue(-12);   // Inward slant angle for right eye (deg)
  
  // Dynamic Color Stops
  const coreColor = useSharedValue('#29B6F6'); // Electric Blue Core
  const auraColor = useSharedValue('#0288D1'); // Glowing Blue Aura

  useEffect(() => {
    switch (emotion) {
      case 'idle':
        eyeRy.value = withTiming(42, { duration: 300 });
        eyeRx.value = withTiming(70, { duration: 300 });
        leftAngle.value = withTiming(12, { duration: 300 });
        rightAngle.value = withTiming(-12, { duration: 300 });
        coreColor.value = '#29B6F6';
        auraColor.value = '#0288D1';

        // Organic blink & lookaround loop
        const blinkInterval = setInterval(() => {
          // Blink
          eyeRy.value = withSequence(
            withTiming(3, { duration: 90 }),
            withTiming(42, { duration: 120 })
          );

          // Random subtle glance offset
          if (Math.random() > 0.4) {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 10;
            eyeTranslateX.value = withTiming(randomX, { duration: 400 });
            eyeTranslateY.value = withTiming(randomY, { duration: 400 });
          }
        }, 3800);

        return () => clearInterval(blinkInterval);

      case 'thinking':
        eyeRy.value = withTiming(28, { duration: 250 });
        eyeRx.value = withTiming(75, { duration: 250 });
        leftAngle.value = withTiming(5, { duration: 250 });
        rightAngle.value = withTiming(-5, { duration: 250 });
        coreColor.value = '#00E5FF';
        auraColor.value = '#00838F';

        // Pulsing scale effect for thinking state
        eyeRy.value = withRepeat(
          withSequence(
            withTiming(32, { duration: 600 }),
            withTiming(24, { duration: 600 })
          ),
          -1,
          true
        );
        break;

      case 'alert':
        eyeRy.value = withTiming(52, { duration: 150 });
        eyeRx.value = withTiming(75, { duration: 150 });
        leftAngle.value = withTiming(18, { duration: 150 });
        rightAngle.value = withTiming(-18, { duration: 150 });
        coreColor.value = '#FFC107'; // Electric Amber Glow
        auraColor.value = '#FF8F00';
        break;

      case 'happy':
        eyeRy.value = withTiming(38, { duration: 250 });
        eyeRx.value = withTiming(65, { duration: 250 });
        leftAngle.value = withTiming(0, { duration: 250 });
        rightAngle.value = withTiming(0, { duration: 250 });
        coreColor.value = '#66BB6A'; // Happy Green Glow
        auraColor.value = '#2E7D32';
        break;

      case 'error':
        eyeRy.value = withTiming(30, { duration: 200 });
        eyeRx.value = withTiming(78, { duration: 200 });
        leftAngle.value = withTiming(25, { duration: 200 });
        rightAngle.value = withTiming(-25, { duration: 200 });
        coreColor.value = '#FF5252'; // Crimson Error Glow
        auraColor.value = '#C62828';
        break;
    }
  }, [emotion]);

  // Animated SVG Props
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

  // Tap to cycle emotional states for manual testing
  const handleTap = () => {
    const states: ('idle' | 'thinking' | 'alert' | 'happy' | 'error')[] = [
      'idle',
      'thinking',
      'alert',
      'happy',
      'error',
    ];
    const nextIdx = (states.indexOf(emotion) + 1) % states.length;
    setEmotion(states[nextIdx]);
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleTap} style={styles.touchContainer}>
      <Svg height="180" width="360" viewBox="0 0 360 180">
        <Defs>
          {/* Radial Gradient creating the soft glowing electric eye effect */}
          <RadialGradient id="eyeGlowLeft" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#80D8FF" stopOpacity="1" />
            <Stop offset="45%" stopColor={coreColor.value} stopOpacity="0.95" />
            <Stop offset="85%" stopColor={auraColor.value} stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id="eyeGlowRight" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#80D8FF" stopOpacity="1" />
            <Stop offset="45%" stopColor={coreColor.value} stopOpacity="0.95" />
            <Stop offset="85%" stopColor={auraColor.value} stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Left Glowing Eye Group */}
        <AnimatedG animatedProps={leftGroupProps}>
          {/* Outer Blur Aura */}
          <AnimatedEllipse cx="0" cy="0" rx="82" ry="54" fill="url(#eyeGlowLeft)" opacity={0.4} />
          {/* Main Slanted Oval Eye */}
          <AnimatedEllipse cx="0" cy="0" animatedProps={leftEyeProps} fill="url(#eyeGlowLeft)" />
        </AnimatedG>

        {/* Right Glowing Eye Group */}
        <AnimatedG animatedProps={rightGroupProps}>
          {/* Outer Blur Aura */}
          <AnimatedEllipse cx="0" cy="0" rx="82" ry="54" fill="url(#eyeGlowRight)" opacity={0.4} />
          {/* Main Slanted Oval Eye */}
          <AnimatedEllipse cx="0" cy="0" animatedProps={rightEyeProps} fill="url(#eyeGlowRight)" />
        </AnimatedG>
      </Svg>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
