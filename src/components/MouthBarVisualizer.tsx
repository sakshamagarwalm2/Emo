import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export type AgentState = 'connecting' | 'initializing' | 'listening' | 'speaking' | 'thinking' | 'idle';

export interface MouthBarVisualizerProps {
  state?: AgentState;
  barCount?: number;
  color?: string;
  centerAlign?: boolean;
  minHeight?: number;
  maxHeight?: number;
  isAudioReactive?: boolean;
}

/**
 * MouthBarVisualizer: ElevenLabs UI Bar Visualizer adapted for Project EMO.
 * Positioned centered at the bottom between Spotify logo and Sci-Fi button.
 * Acts as EMO's glowing digital mouth, dynamically matching eye color and voice reactivity states!
 */
export const MouthBarVisualizer: React.FC<MouthBarVisualizerProps> = ({
  state = 'idle',
  barCount = 15,
  color = '#00E5FF',
  centerAlign = true,
  minHeight = 6,
  maxHeight = 52,
  isAudioReactive = false,
}) => {
  const animatedValues = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(minHeight))
  ).current;

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;

    const animateBars = () => {
      const animations = animatedValues.map((anim, i) => {
        // Compute center weight (bell curve shape like a mouth)
        const center = (barCount - 1) / 2;
        const distFromCenter = Math.abs(i - center);
        const centerFactor = Math.max(0.2, 1 - (distFromCenter / center) * 0.7);

        let targetVal = minHeight;

        if (state === 'speaking' || isAudioReactive) {
          const randVal = Math.random() * (maxHeight - minHeight) + minHeight;
          targetVal = minHeight + (randVal - minHeight) * centerFactor;
        } else if (state === 'listening') {
          const pulse = Math.sin(Date.now() / 200 + i * 0.5) * 0.5 + 0.5;
          targetVal = minHeight + (maxHeight * 0.45 - minHeight) * pulse * centerFactor;
        } else if (state === 'thinking') {
          const wave = Math.sin(Date.now() / 150 - i * 0.6) * 0.5 + 0.5;
          targetVal = minHeight + (maxHeight * 0.65 - minHeight) * wave;
        } else {
          // Idle state: subtle quiet resting mouth
          const quietPulse = Math.sin(Date.now() / 600 + i) * 0.2 + 0.2;
          targetVal = minHeight + quietPulse * 4;
        }

        return Animated.timing(anim, {
          toValue: targetVal,
          duration: state === 'speaking' || isAudioReactive ? 90 : 180,
          useNativeDriver: false,
        });
      });

      animLoop = Animated.parallel(animations);
      animLoop.start(({ finished }) => {
        if (finished) {
          animateBars();
        }
      });
    };

    animateBars();

    return () => {
      if (animLoop) {
        animLoop.stop();
      }
    };
  }, [state, barCount, minHeight, maxHeight, isAudioReactive]);

  return (
    <View style={styles.container}>
      {animatedValues.map((anim, index) => {
        return (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height: anim,
                backgroundColor: color,
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9,
                shadowRadius: 10,
                elevation: 6,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 12,
  },
  bar: {
    width: 5.5,
    marginHorizontal: 3,
    borderRadius: 3,
  },
});
