import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { EmoEmotion, useEmoStore } from '../state/useEmoStore';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const EyeDisplay: React.FC = () => {
  const emotion = useEmoStore((state) => state.emotion);

  // Shared Animation Values
  const eyeHeight = useSharedValue(50);
  const eyeWidth = useSharedValue(35);
  const eyeGlowColor = useSharedValue('#00E5FF'); // Default Cyan

  useEffect(() => {
    // Emotion State Machine Effects
    switch (emotion) {
      case 'idle':
        eyeHeight.value = withTiming(50, { duration: 300 });
        eyeWidth.value = withTiming(35, { duration: 300 });
        eyeGlowColor.value = '#00E5FF';
        
        // Procedural periodic blink
        const interval = setInterval(() => {
          eyeHeight.value = withSequence(
            withTiming(2, { duration: 100 }),
            withTiming(50, { duration: 150 })
          );
        }, 4000);
        return () => clearInterval(interval);

      case 'thinking':
        eyeHeight.value = withTiming(30, { duration: 300 });
        eyeWidth.value = withTiming(40, { duration: 300 });
        eyeGlowColor.value = '#00E5FF';
        break;

      case 'alert':
        eyeHeight.value = withTiming(65, { duration: 200 });
        eyeWidth.value = withTiming(45, { duration: 200 });
        eyeGlowColor.value = '#FFAB00'; // Amber warning glow
        break;

      case 'happy':
        eyeHeight.value = withTiming(40, { duration: 300 });
        eyeWidth.value = withTiming(40, { duration: 300 });
        eyeGlowColor.value = '#00E676'; // Happy green
        break;

      case 'error':
        eyeHeight.value = withTiming(25, { duration: 200 });
        eyeWidth.value = withTiming(45, { duration: 200 });
        eyeGlowColor.value = '#FF5252'; // Red error glow
        break;
    }
  }, [emotion]);

  const leftEyeProps = useAnimatedProps(() => ({
    ry: eyeHeight.value,
    rx: eyeWidth.value,
    fill: eyeGlowColor.value,
  }));

  const rightEyeProps = useAnimatedProps(() => ({
    ry: eyeHeight.value,
    rx: eyeWidth.value,
    fill: eyeGlowColor.value,
  }));

  return (
    <View style={styles.container}>
      <Svg height="160" width="300" viewBox="0 0 300 160">
        {/* Left Eye */}
        <AnimatedEllipse cx="90" cy="80" animatedProps={leftEyeProps} />

        {/* Right Eye */}
        <AnimatedEllipse cx="210" cy="80" animatedProps={rightEyeProps} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});
