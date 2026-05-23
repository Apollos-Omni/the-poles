import { useEffect, useState, useCallback } from "react";

export function useDoor(device_id, stream) {
  const [telemetry, setTelemetry] = useState(null);
  
  useEffect(() => {
    if (!stream || !device_id) return;

    const onMessage = (m) => {
      // Ensure the message is for this specific device
      if (m.device_id === device_id) {
        setTelemetry(m);
      }
    };
    
    const unsubscribe = stream.subscribe(device_id, onMessage);
    
    // Cleanup subscription on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [device_id, stream]);
  
  return telemetry;
}

export function useDoorActions(cfg) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (action) => {
    setIsLoading(true);
    setError(null);
    try {
      const phone_location = cfg.getPhoneLocation ? (await cfg.getPhoneLocation()) : undefined;
      const signedTicket = await cfg.issuer.issue({
        door_id: cfg.door.id,
        action,
        token: cfg.supabaseToken,
        phone_location
      });
      await cfg.sender.send({ device_id: cfg.door.device_id, signedTicket });
    } catch (e) {
      setError(e.message || String(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [cfg]);

  return {
    open: () => run("open"),
    close: () => run("close"),
    lock: () => run("lock"),
    unlock: () => run("unlock"),
    isLoading,
    error
  };
}