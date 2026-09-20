import React, { useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, StatusBar } from 'react-native';
import { EyeDisplay } from './components/EyeDisplay';
import { StandbyClock } from './components/StandbyClock';
import { AgentToast } from './components/AgentToast';
import { ModelDownloadCard } from './components/ModelDownloadCard';
import { AgentSocketServer } from './services/AgentSocketServer';

export const App: React.FC = () => {
  useEffect(() => {
    // Initialize Agent Socket Server listener
    const server = AgentSocketServer.getInstance();
    server.startListener(8080);

    return () => {
      server.stopListener();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        {/* Animated Procedural Eye Interface */}
        <EyeDisplay />

        {/* OLED Standby Clock & Task Counter */}
        <StandbyClock />

        {/* In-App Offline LLM Model Download Card */}
        <ModelDownloadCard />

        {/* Agent Toast Notification Overlay */}
        <AgentToast />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
});

export default App;
