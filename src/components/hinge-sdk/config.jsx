
// Configuration for the Hinge SDK
export const CONFIG = {
  // Base URL for HTTP API calls (Supabase or custom backend)
  baseUrl: "https://<your-project-ref>.supabase.co",
  
  // MQTT WebSocket URL for real-time communication
  mqttWsUrl: "wss://<your-mqtt-broker-url>",
  
  // MQTT credentials (optional)
  mqttUser: undefined,
  mqttPass: undefined,
  
  // Development mode flag
  isDevelopment: true,
};
