import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  // Helper functions (inlined for Base44 compatibility)
  const ok = (body, headers = {}) => new Response(body, { status: 200, headers });
  const json = (obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });
  const err = (msg, code = 400, extra = {}) => json({ ok: false, error: msg }, code, extra);

  // CORS headers
  const CORS = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return err('Unauthorized', 401, CORS);
    }

    // Generate subscription ID from endpoint hash
    const subId = async (endpoint) => {
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 24);
    };

    if (req.method === 'POST') {
      const payload = await req.json().catch(() => ({}));
      const { action, subscription } = payload;

      if (!action) {
        return err('Missing action', 400, CORS);
      }

      switch (action) {
        case 'subscribe': {
          if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return err('Invalid subscription data', 400, CORS);
          }

          const id = await subId(subscription.endpoint);
          
          // Check for existing subscription
          const existing = await base44.entities.PushSubscription.filter({
            user_id: user.id,
            endpoint: subscription.endpoint
          });

          const subscriptionData = {
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh_key: subscription.keys.p256dh,
            auth_key: subscription.keys.auth,
            is_active: true,
            user_agent: req.headers.get('user-agent') || 'unknown',
            last_updated: new Date().toISOString()
          };

          if (existing.length > 0) {
            // Update existing subscription
            await base44.entities.PushSubscription.update(existing[0].id, subscriptionData);
            console.log(`[PUSH] Updated subscription ${id} for user ${user.id}`);
          } else {
            // Create new subscription
            await base44.entities.PushSubscription.create(subscriptionData);
            console.log(`[PUSH] Created subscription ${id} for user ${user.id}`);
          }

          return json({ ok: true, id }, 200, CORS);
        }

        case 'unsubscribe': {
          if (!subscription?.endpoint) {
            return err('Missing endpoint', 400, CORS);
          }

          const id = await subId(subscription.endpoint);
          const subscriptions = await base44.entities.PushSubscription.filter({
            user_id: user.id,
            endpoint: subscription.endpoint
          });

          for (const sub of subscriptions) {
            await base44.entities.PushSubscription.update(sub.id, {
              is_active: false,
              unsubscribed_at: new Date().toISOString()
            });
          }

          console.log(`[PUSH] Unsubscribed ${id} for user ${user.id}`);
          return json({ ok: true, id }, 200, CORS);
        }

        default:
          return err('Unknown action', 400, CORS);
      }
    }

    if (req.method === 'GET') {
      // List active subscriptions for user
      const subscriptions = await base44.entities.PushSubscription.filter({
        user_id: user.id,
        is_active: true
      });

      return json({
        subscriptions: subscriptions.map(sub => ({
          id: sub.id,
          endpoint: sub.endpoint.slice(0, 50) + '...', // Truncated for security
          userAgent: sub.user_agent,
          createdAt: sub.created_date,
          lastUpdated: sub.last_updated
        }))
      }, 200, CORS);
    }

    if (req.method === 'DELETE') {
      // Unsubscribe by endpoint
      const { endpoint } = await req.json().catch(() => ({}));
      
      if (!endpoint) {
        return err('Missing endpoint', 400, CORS);
      }

      const subscriptions = await base44.entities.PushSubscription.filter({
        user_id: user.id,
        endpoint
      });

      for (const sub of subscriptions) {
        await base44.entities.PushSubscription.update(sub.id, {
          is_active: false,
          unsubscribed_at: new Date().toISOString()
        });
      }

      return json({ ok: true, removed: subscriptions.length }, 200, CORS);
    }

    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: { ...CORS, 'Allow': 'GET,POST,DELETE,OPTIONS' } 
    });

  } catch (error) {
    console.error('[PUSH] Subscription error:', error);
    return err(error.message, 500, CORS);
  }
});