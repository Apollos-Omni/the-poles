import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';

export function HealthIndicator() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const response = await fetch('/functions/pwaStatus', { method: 'GET' });
        if (!mounted) return;
        setStatus(response.ok ? 'ok' : 'degraded');
      } catch (_) {
        if (mounted) setStatus('offline');
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  const healthy = status === 'ok';
  const label = healthy ? 'System online' : status === 'checking' ? 'Checking system' : 'Limited backend';
  const Icon = healthy ? Activity : AlertTriangle;

  return (
    <div
      title={label}
      aria-label={label}
      className={`fixed right-3 bottom-20 lg:bottom-3 z-50 flex items-center gap-2 rounded-full border px-3 py-2 text-xs shadow-lg backdrop-blur ${
        healthy
          ? 'border-emerald-500/30 bg-emerald-950/50 text-emerald-200'
          : 'border-yellow-500/30 bg-yellow-950/50 text-yellow-200'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

export default HealthIndicator;
