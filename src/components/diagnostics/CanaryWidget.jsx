
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, PauseCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { functionUrl } from '@/api/apiClient';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'ok': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warn': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'skip': return <PauseCircle className="w-5 h-5 text-gray-500" />;
    default: return null;
  }
};

export default function CanaryWidget() {
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);

  const runCheck = useCallback(async (check) => {
    try {
      const { ok, info } = await check.run();
      return { id: check.id, label: check.label, status: ok ? "ok" : "fail", info };
    } catch (e) {
      return { id: check.id, label: check.label, status: "fail", info: String(e?.message || e) };
    }
  }, []);

  const checks = useMemo(() => [
    {
      id: "sw-header",
      label: "Service Worker Header",
      run: async () => {
        const r = await fetch(`${functionUrl('sw')}?v=${Date.now()}`, { cache: "no-store" });
        const ct = (r.headers.get("content-type") || "").toLowerCase();
        const ok = r.ok && ct.startsWith("application/javascript");
        return { ok, info: `Status ${r.status}, Content-Type: ${ct || "(none)"}` };
      },
    },
    {
      id: "manifest-header",
      label: "Manifest Header",
      run: async () => {
        const r = await fetch(`${functionUrl('manifest')}?v=${Date.now()}`, { cache: "no-store" });
        const ct = (r.headers.get("content-type") || "").toLowerCase();
        const ok = r.ok && ct.startsWith("application/manifest+json");
        return { ok, info: `Status ${r.status}, Content-Type: ${ct || "(none)"}` };
      },
    },
    {
      id: "sw-register",
      label: "SW Registration",
      run: async () => {
        return { ok: false, status: 'skip', info: "Service worker registration is temporarily disabled." };
      },
    },
    {
      id: "notif-permission",
      label: "Notification Permission",
      run: async () => {
        if (!("Notification" in window)) return { ok: false, info: "Notification API not supported." };
        const p = Notification.permission;
        return { ok: p === "granted", info: `Permission status: ${p}` };
      },
    },
    {
      id: "vapid-public",
      label: "VAPID Public Key",
      run: async () => {
        const r = await fetch(functionUrl('getVapidPublicKey'));
        if (!r.ok) return { ok: false, info: `HTTP ${r.status}` };
        const j = await r.json().catch(() => ({}));
        const key = j?.vapidPublicKey;
        const ok = typeof key === "string" && key.length > 40;
        return { ok, info: ok ? `Key found (length: ${key.length})` : "VAPID key missing or invalid." };
      },
    },
    {
      id: "push-subscribe",
      label: "Push Subscription API",
      run: async () => {
        if (!("serviceWorker" in navigator && "PushManager" in window)) return { ok: false, info: "Push unsupported." };
        if (Notification.permission !== "granted") return { ok: false, info: "Permission not granted." };
        
        const reg = await navigator.serviceWorker.ready;
        const kRes = await fetch(functionUrl('getVapidPublicKey'));
        if (!kRes.ok) return { ok: false, info: `VAPID fetch failed: HTTP ${kRes.status}` };
        const { vapidPublicKey } = await kRes.json();
        if (!vapidPublicKey) return { ok: false, info: "No public key from API." };

        const b64 = (s) => {
          const pad = "=".repeat((4 - (s.length % 4)) % 4);
          const b = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
          const raw = atob(b);
          const out = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
          return out;
        };

        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(vapidPublicKey) });
        const res = await fetch(functionUrl('managePushSubscription'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: 'subscribe', subscription: sub }),
        });
        return { ok: res.ok, info: res.ok ? "Subscription successful." : `Subscription failed: HTTP ${res.status}` };
      },
    },
    {
      id: "push-test",
      label: "Test Push Delivery",
      run: async () => {
        const r = await fetch(functionUrl('testPush'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Canary Test", message: "Hello from Canary Widget!", url: "/Diagnostics" }),
        });
        const resJson = await r.json().catch(() => ({}));
        return { ok: r.ok, info: r.ok ? "Test push triggered." : `Failed: HTTP ${r.status} - ${resJson.error || 'Unknown error'}` };
      },
    },
  ], []);

  const runAll = useCallback(async () => {
    if (running) return;
    setRunning(true);
    const out = [];
    for (const c of checks) {
      const row = await runCheck(c);
      out.push(row);
      setRows([...out]);
    }
    setRunning(false);
  }, [checks, runCheck, running]);

  useEffect(() => {
    runAll();
  }, [runAll]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                PWA & Push Canary
            </CardTitle>
            <Button onClick={runAll} disabled={running} size="sm" variant="outline" className="text-purple-300 border-purple-500/50 hover:bg-purple-900/30">
                <RefreshCw className={`w-4 h-4 mr-2 ${running ? 'animate-spin' : ''}`} />
                {running ? "Running..." : "Re-run"}
            </Button>
        </div>
        <CardContent className="text-gray-400 text-sm">
            At-a-glance readiness for service worker, manifest, notifications, and push.
        </CardContent>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900/50 rounded-lg p-2 space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-start gap-4 p-3 border-b border-gray-700/50 last:border-b-0">
              <div className="mt-1"><StatusIcon status={r.status} /></div>
              <div className="flex-1">
                <div className="font-medium text-white">{r.label}</div>
                {r.info && <div className="text-xs text-gray-400">{r.info}</div>}
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="p-4 text-center text-gray-500">Initializing checks...</div>}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Tip: “SW Registration” will be skipped until the platform routes <code>/functions/sw</code> correctly with the proper <code>Content-Type</code> header.
        </div>
      </CardContent>
    </Card>
  );
}
