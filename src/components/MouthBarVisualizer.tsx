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
  micAmplitude?: number; // Live audio amplitude (0.0 = silence/below noise gate, > 0.0 = active speech)
}

/**
 * MouthBarVisualizer: ElevenLabs UI Bar Visualizer adapted for Project EMO.
 * Dynamically scales to active speech levels, ignoring background noise below noise gate.
 */
export const MouthBarVisualizer: React.FC<MouthBarVisualizerProps> = ({
  state = 'idle',
  barCount = 15,
  color = '#00E5FF',
  minHeight = 5,
  maxHeight = 52,
  isAudioReactive = false,
  micAmplitude = 0,
}) => {
  const animatedValues = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(minHeight))
  ).current;

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;

    const animateBars = () => {
      const animations = animatedValues.map((anim, i) => {
        const center = (barCount - 1) / 2;
        const distFromCenter = Math.abs(i - center);
        const centerFactor = Math.max(0.25, 1 - (distFromCenter / center) * 0.65);

        let targetVal = minHeight;

        // If active speech is detected above noise gate threshold (micAmplitude > 0)
        if ((state === 'speaking' || isAudioReactive) && micAmplitude > 0) {
          const speechPower = micAmplitude * (maxHeight - minHeight);
          const randVariation = (Math.random() * 0.4 + 0.8);
          targetVal = minHeight + speechPower * centerFactor * randVariation;
        } else if (state === 'speaking') {
          const randVal = Math.random() * (maxHeight - minHeight) + minHeight;
          targetVal = minHeight + (randVal - minHeight) * centerFactor;
        } else if (state === 'thinking') {
          const wave = Math.sin(Date.now() / 150 - i * 0.6) * 0.5 + 0.5;
          targetVal = minHeight + (maxHeight * 0.65 - minHeight) * wave;
        } else {
          // Below noise gate / quiet state: flat resting line
          targetVal = minHeight;
        }

        return Animated.timing(anim, {
          toValue: targetVal,
          duration: micAmplitude > 0 ? 80 : 150,
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
  }, [state, barCount, minHeight, maxHeight, isAudioReactive, micAmplitude]);

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
    width: 6,
    marginHorizontal: 3.5,
    borderRadius: 3,
  },
});
