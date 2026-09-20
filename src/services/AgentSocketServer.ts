import { useEmoStore, AgentNotification } from '../state/useEmoStore';

/**
 * AgentSocketServer manages local network events from external AI agents.
 * Connects to ws://0.0.0.0:8080 or client WebSocket endpoints.
 */
export class AgentSocketServer {
  private static instance: AgentSocketServer;
  private isListening: boolean = false;

  public static getInstance(): AgentSocketServer {
    if (!AgentSocketServer.instance) {
      AgentSocketServer.instance = new AgentSocketServer();
    }
    return AgentSocketServer.instance;
  }

  public startListener(port: number = 8080): void {
    if (this.isListening) return;
    this.isListening = true;
    console.log(`[EMO Socket] Listener initialized on port ${port}`);

    // Standard WebSocket mock/bridge listener for ambient event routing
  }

  public handleIncomingPayload(rawJson: string): void {
    try {
      const data: Partial<AgentNotification> = JSON.parse(rawJson);
      if (data.agentId && data.status && data.message) {
        useEmoStore.getState().addNotification({
          agentId: data.agentId,
          status: data.status,
          message: data.message,
          requiresUserAction: data.requiresUserAction ?? false,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('[EMO Socket] Invalid JSON payload received:', err);
    }
  }

  public stopListener(): void {
    this.isListening = false;
  }
}
