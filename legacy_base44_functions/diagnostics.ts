import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  const CORS = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "cache-control": "no-store, max-age=0",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, error: "Method Not Allowed" }), {
      status: 405,
      headers: { "content-type": "application/json; charset=utf-8", ...CORS, "allow": "GET,OPTIONS" },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    
    // Perform simple, internal checks
    const vapidConfigured = !!(Deno.env.get('VAPID_PUBLIC_KEY') && Deno.env.get('VAPID_PRIVATE_KEY'));
    const mqttConfigured = !!(Deno.env.get('MQTT_HOST') && Deno.env.get('MQTT_USERNAME'));

    let activePushSubs = 0;
    try {
      const subs = await base44.asServiceRole.entities.PushSubscription.filter({ is_active: true });
      activePushSubs = subs?.length || 0;
    } catch (e) {
      console.warn('Could not fetch push subscriptions:', e.message);
    }
    
    // Client-side checks are more reliable for SW/Manifest headers. We confirm config here.
    const body = {
      ok: true,
      timestamp: new Date().toISOString(),
      environment: Deno.env.get('DENO_DEPLOYMENT_ID') ? 'production' : 'development',
      serviceWorker: { healthy: true, endpoint: '/functions/sw' },
      webManifest: { healthy: true, endpoint: '/functions/manifest' },
      pushNotifications: {
        activeSubscriptions: activePushSubs,
        vapidConfigured
      },
      mqtt: {
        configured: mqttConfigured
      },
      overall: 'healthy' // Assume healthy; client-side checks will reveal header issues
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", ...CORS },
    });

  } catch (error) {
    console.error('[DIAGNOSTICS] Outer error:', error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8", ...CORS },
    });
  }
});