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
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.standbyContainer}>
      {/* iOS Standby-Inspired Dual Horizontal Layout */}
      <View style={styles.horizontalRow}>
        
        {/* Left Column: Massive Horizontal Time Readout */}
        <View style={styles.timeColumn}>
          <Text style={styles.giantClockText}>{timeStr}</Text>
          <Text style={styles.dateBadgeText}>{dateStr.toUpperCase()}</Text>
        </View>

        {/* Vertical Divider Line */}
        <View style={styles.verticalDivider} />

        {/* Right Column: Status Cards & Agent Counter */}
        <View style={styles.widgetColumn}>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>⚡ 98% • CONNECTED TO POWER</Text>
          </View>

          <View style={styles.agentCard}>
            <Text style={styles.agentCardHeader}>EMO AGENT MONITOR</Text>
            <Text style={styles.agentCardBody}>
              {activeNotifications.length > 0
                ? `${activeNotifications.length} Active Event${activeNotifications.length > 1 ? 's' : ''}`
                : 'All Systems Nominal • Standby'}
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  standbyContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 680,
  },
  timeColumn: {
    flex: 1.2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  giantClockText: {
    color: '#FFFFFF',
    fontSize: 82,
    fontWeight: '200',
    letterSpacing: -2,
    lineHeight: 90,
  },
  dateBadgeText: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 6,
  },
  verticalDivider: {
    width: 1,
    height: 100,
    backgroundColor: '#222222',
    marginHorizontal: 24,
  },
  widgetColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  statusPill: {
    backgroundColor: '#121212',
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusPillText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  agentCard: {
    backgroundColor: '#121212',
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  agentCardHeader: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  agentCardBody: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
