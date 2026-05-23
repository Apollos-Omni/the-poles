import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  const json = (obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });
  const err = (msg, code = 400) => json({ ok: false, error: msg }, code);

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return err('Unauthorized', 401);
    }
    
    // VAPID keys must be configured
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!vapidPublicKey || !vapidPrivateKey) {
      return err('VAPID keys not configured on server', 500);
    }

    webpush.setVapidDetails(
      'mailto:notifications@divinehinge.com',
      vapidPublicKey,
      vapidPrivateKey
    );
    
    // Get user's active subscriptions
    const subscriptions = await base44.entities.PushSubscription.filter({
      user_id: user.id,
      is_active: true
    });

    if (subscriptions.length === 0) {
      return err('No active push subscriptions found for this user.', 404);
    }
    
    const { title, message, url } = await req.json();
    const payload = JSON.stringify({
      title: title || "DivineHinge Test Ping",
      body: message || `This is a test notification sent at ${new Date().toLocaleTimeString()}`,
      data: { url: url || '/' },
      tag: `test-${Date.now()}`
    });

    const sendPromises = subscriptions.map(sub => 
      webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh_key, auth: sub.auth_key }
      }, payload)
    );

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    if (successful === 0) {
      return err(`Failed to send notification to any of the ${subscriptions.length} devices.`, 500);
    }

    return json({ 
      success: true, 
      message: `Test push sent to ${successful} of ${subscriptions.length} devices.` 
    });

  } catch (error) {
    console.error('[TEST_PUSH] Error:', error);
    return err(error.message, 500);
  }
});