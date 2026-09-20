import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { VoiceService } from '../services/VoiceService';
import { LocalLLMService } from '../services/LocalLLMService';
import { useEmoStore } from '../state/useEmoStore';

export const VoiceControlPanel: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const setEmotion = useEmoStore((state) => state.setEmotion);

  const handleVoiceTrigger = async () => {
    setEmotion('thinking');
    const voiceService = VoiceService.getInstance();
    await voiceService.triggerNativeVoiceAssistant();
    setTimeout(() => setEmotion('idle'), 2000);
  };

  const handleLocalQuery = async () => {
    if (!inputText.trim()) return;
    setEmotion('thinking');

    const llmService = LocalLLMService.getInstance();
    const result = await llmService.parseAgenticIntent(inputText);
    setAiOutput(`${result.summary}`);

    if (result.intent === 'task_approval') setEmotion('happy');
    else if (result.intent === 'cancel') setEmotion('error');
    else setEmotion('idle');
  };

  return (
    <View style={styles.panelContainer}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceTrigger}>
          <Text style={styles.voiceButtonText}>🎙 VOICE ASSISTANT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoTrigger} onPress={() => setEmotion('alert')}>
          <Text style={styles.demoTriggerText}>⚡ TRIGGER ALERT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Offline query / intent test..."
          placeholderTextColor="#666666"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleLocalQuery}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleLocalQuery}>
          <Text style={styles.sendButtonText}>RUN</Text>
        </TouchableOpacity>
      </View>

      {aiOutput && (
        <Text style={styles.aiOutputText}>{aiOutput}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    marginVertical: 8,
    width: '90%',
    maxWidth: 440,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  voiceButton: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  voiceButtonText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  demoTrigger: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  demoTriggerText: {
    color: '#FFAB00',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#121212',
    borderColor: '#222222',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  aiOutputText: {
    color: '#00E676',
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
