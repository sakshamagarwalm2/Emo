import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LocalLLMService, ModelDownloadProgress } from '../services/LocalLLMService';

export const ModelDownloadCard: React.FC = () => {
  const [progress, setProgress] = useState<ModelDownloadProgress | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const handleDownload = async () => {
    const service = LocalLLMService.getInstance();
    const success = await service.downloadModelInApp('smolLM', (p) => {
      setProgress(p);
    });
    if (success) {
      setIsLoaded(true);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.titleText}>Offline AI Model Engine</Text>

      {isLoaded ? (
        <View style={styles.statusRow}>
          <Text style={styles.successText}>✓ SmolLM-360M Model Loaded & Ready</Text>
        </View>
      ) : progress?.isDownloading ? (
        <View style={styles.progressContainer}>
          <ActivityIndicator color="#00E5FF" size="small" />
          <Text style={styles.progressText}>
            Downloading GGUF Model ({progress.percent}%)...
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Text style={styles.buttonText}>Download SmolLM-360M (Offline AI)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0A0A0A',
    borderColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  titleText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: '#00E5FF',
    fontSize: 12,
    marginLeft: 8,
  },
  downloadButton: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
