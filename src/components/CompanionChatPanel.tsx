import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useEmoStore, EmoEmotion } from '../state/useEmoStore';
import { LocalLLMService } from '../services/LocalLLMService';
import { VoiceService } from '../services/VoiceService';

export const CompanionChatPanel: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const emotion = useEmoStore((state) => state.emotion);
  const setEmotion = useEmoStore((state) => state.setEmotion);
  const chatMessages = useEmoStore((state) => state.chatMessages);

  const latestEmoMsg = [...chatMessages].reverse().find((m) => m.sender === 'emo');

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userText = inputText;
    setInputText('');

    const llmService = LocalLLMService.getInstance();
    await llmService.processCompanionChat(userText);
  };

  const handleVoice = async () => {
    setEmotion('thinking');
    const voiceService = VoiceService.getInstance();
    await voiceService.triggerNativeVoiceAssistant();
    setTimeout(() => setEmotion('idle'), 2000);
  };

  const setExpression = (e: EmoEmotion) => {
    setEmotion(e);
  };

  return (
    <View style={styles.container}>
      {/* Latest EMO Response Speech Bubble */}
      {latestEmoMsg && (
        <View style={styles.speechBubble}>
          <Text style={styles.bubbleSender}>EMO</Text>
          <Text style={styles.bubbleText}>{latestEmoMsg.text}</Text>
        </View>
      )}

      {/* Cute Quick Emotion Test Badges */}
      <View style={styles.emotionRow}>
        <TouchableOpacity style={[styles.emoChip, emotion === 'happy' && styles.activeChip]} onPress={() => setExpression('happy')}>
          <Text style={styles.chipText}>😊 HAPPY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.emoChip, emotion === 'stressed' && styles.activeChip]} onPress={() => setExpression('stressed')}>
          <Text style={styles.chipText}>⚡ STRESSED</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.emoChip, emotion === 'irritated' && styles.activeChip]} onPress={() => setExpression('irritated')}>
          <Text style={styles.chipText}>😤 IRRITATED</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.emoChip, emotion === 'ignoring' && styles.activeChip]} onPress={() => setExpression('ignoring')}>
          <Text style={styles.chipText}>🙄 IGNORING</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Input Row */}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.micButton} onPress={handleVoice}>
          <Text style={styles.micText}>🎙</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Talk to EMO..."
          placeholderTextColor="#666666"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>TALK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '92%',
    maxWidth: 460,
    alignItems: 'center',
    marginVertical: 6,
  },
  speechBubble: {
    backgroundColor: '#121212',
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
    width: '100%',
  },
  bubbleSender: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  bubbleText: {
    color: '#F5F5F5',
    fontSize: 13,
    lineHeight: 18,
  },
  emotionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoChip: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  activeChip: {
    backgroundColor: '#262626',
    borderColor: '#00E5FF',
  },
  chipText: {
    color: '#D4D4D4',
    fontSize: 10,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
    alignItems: 'center',
  },
  micButton: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  micText: {
    fontSize: 14,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#121212',
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 13,
  },
  sendButton: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
});
