import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEmoStore, AgentNotification } from '../state/useEmoStore';

export const AgentToast: React.FC = () => {
  const notifications = useEmoStore((state) => state.activeNotifications);
  const clearNotification = useEmoStore((state) => state.clearNotification);

  if (notifications.length === 0) return null;

  const current = notifications[0];

  const getStatusColor = (status: AgentNotification['status']) => {
    switch (status) {
      case 'working':
        return '#00E5FF';
      case 'waiting_for_input':
        return '#FFAB00';
      case 'done':
        return '#00E676';
      case 'error':
        return '#FF5252';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <View style={styles.toastCard}>
      <View style={styles.headerRow}>
        <Text style={[styles.agentId, { color: getStatusColor(current.status) }]}>
          {current.agentId}
        </Text>
        <Text style={styles.statusBadge}>{current.status.toUpperCase()}</Text>
      </View>

      <Text style={styles.messageText}>{current.message}</Text>

      <TouchableOpacity
        style={styles.dismissButton}
        onPress={() => clearNotification(current.agentId)}
      >
        <Text style={styles.dismissText}>DISMISS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toastCard: {
    backgroundColor: '#121212',
    borderColor: '#2A2A2A',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 10,
    maxWidth: 450,
    width: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  agentId: {
    fontWeight: '700',
    fontSize: 14,
  },
  statusBadge: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  messageText: {
    color: '#E0E0E0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#1E1E1E',
    borderRadius: 4,
  },
  dismissText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
  },
});
