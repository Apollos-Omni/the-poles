import { DoorStates, DoorEvents } from "../types";

// Mock MQTT adapters for development (replace with real MQTT when ready)
export function makeMockTelemetryStream() {
  return {
    subscribe(device_id, onMessage) {
      // Simulate live telemetry updates
      const interval = setInterval(() => {
        const mockTelemetry = {
          ts: new Date().toISOString(),
          device_id,
          door_state: Math.random() > 0.7 ? DoorStates.OPEN : DoorStates.CLOSED,
          last_motion: Math.random() > 0.5 ? new Date().toISOString() : null,
          event: Math.random() > 0.8 ? DoorEvents.MOTION : undefined,
        };
        onMessage(mockTelemetry);
      }, 3000 + Math.random() * 5000);

      return () => clearInterval(interval);
    }
  };
}

export function makeMockCommandSender() {
  return {
    async send({ device_id, signedTicket }) {
      console.log(`[MOCK] Sending command to ${device_id}:`, signedTicket);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Simulate occasional failures
      if (Math.random() < 0.05) {
        throw new Error("Command failed - device offline");
      }
      
      console.log(`[MOCK] Command sent successfully to ${device_id}`);
    }
  };
}