import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useEmoStore } from '../state/useEmoStore';

export const StandbyClock: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const activeNotifications = useEmoStore((state) => state.activeNotifications);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.clockText}>{timeStr}</Text>
      <Text style={styles.dateText}>{dateStr}</Text>

      {activeNotifications.length > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            ● {activeNotifications.length} Active Agent Event{activeNotifications.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  clockText: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '300',
    letterSpacing: 2,
  },
  dateText: {
    color: '#888888',
    fontSize: 16,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  badgeContainer: {
    marginTop: 12,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  badgeText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '600',
  },
});
