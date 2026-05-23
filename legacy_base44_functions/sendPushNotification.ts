import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  // Helper functions (inlined)
  const json = (obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });
  const err = (msg, code = 400) => json({ ok: false, error: msg }, code);

  // Rate limiting helper (in-memory, simple implementation)
  const debounce = new Map();
  const shouldSend = (key, ms = 8000) => {
    const now = Date.now();
    const lastSent = debounce.get(key) || 0;
    if (now < lastSent) return false;
    debounce.set(key, now + ms);
    return true;
  };

  // Push error taxonomy
  const handlePushError = async (error, subscriptionId, base44) => {
    const statusCode = error.statusCode || error.status || 0;
    
    if (statusCode === 410 || statusCode === 404) {
      // Gone/Not Found: subscription is dead, remove it
      console.log(`[PUSH] Removing dead subscription ${subscriptionId}: ${statusCode}`);
      await base44.entities.PushSubscription.update(subscriptionId, { 
        is_active: false,
        last_error: `${statusCode}: ${error.message}`,
        unsubscribed_at: new Date().toISOString()
      });
      return 'removed';
    } else if (statusCode === 429) {
      // Rate limited: back off
      console.warn(`[PUSH] Rate limited for subscription ${subscriptionId}: ${error.message}`);
      await base44.entities.PushSubscription.update(subscriptionId, { 
        last_error: `${statusCode}: Rate limited`
      });
      return 'rate_limited';
    } else if (statusCode >= 500) {
      // Server error: retry later
      console.warn(`[PUSH] Server error for subscription ${subscriptionId}: ${error.message}`);
      await base44.entities.PushSubscription.update(subscriptionId, { 
        last_error: `${statusCode}: Server error`
      });
      return 'server_error';
    } else {
      // Other error: log but don't remove subscription yet
      console.error(`[PUSH] Unknown error for subscription ${subscriptionId}: ${error.message}`);
      await base44.entities.PushSubscription.update(subscriptionId, { 
        last_error: `${statusCode}: ${error.message}`
      });
      return 'unknown_error';
    }
  };

  try {
    // Configure web-push with VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      return err('VAPID keys not configured', 500);
    }

    webpush.setVapidDetails(
      'mailto:notifications@divinehinge.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return err('Unauthorized', 401);
    }

    const { 
      targetUserId, 
      title, 
      message, 
      icon, 
      badge,
      data = {},
      actions = [],
      requireInteraction = false,
      silent = false,
      tag,
      debounceKey
    } = await req.json();

    if (!targetUserId || !title || !message) {
      return err('Missing required fields: targetUserId, title, message');
    }

    // Rate limiting check
    if (debounceKey && !shouldSend(debounceKey)) {
      return json({ 
        success: true, 
        sent: 0, 
        message: 'Rate limited - notification debounced' 
      });
    }

    // Get target user's push subscriptions
    const subscriptions = await base44.entities.PushSubscription.filter({ 
      user_id: targetUserId,
      is_active: true
    });

    if (subscriptions.length === 0) {
      return json({ 
        success: true,
        sent: 0,
        message: 'No active push subscriptions found for user'
      });
    }

    // Check notification preferences
    const notificationSettings = await base44.entities.NotificationSettings.filter({ 
      user_id: targetUserId 
    });
    
    const settings = notificationSettings[0] || { push: true };
    
    if (!settings.push) {
      return json({ 
        success: true,
        sent: 0,
        message: 'User has disabled push notifications'
      });
    }

    // Check Do Not Disturb
    if (settings.dnd_enabled && settings.dnd_start && settings.dnd_end && !data.urgent) {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const dndStart = parseInt(settings.dnd_start.replace(':', ''));
      const dndEnd = parseInt(settings.dnd_end.replace(':', ''));
      
      const isInDND = dndStart <= dndEnd 
        ? (currentTime >= dndStart && currentTime <= dndEnd)
        : (currentTime >= dndStart || currentTime <= dndEnd);
      
      if (isInDND) {
        return json({ 
          success: true,
          sent: 0,
          message: 'User is in Do Not Disturb mode',
          queued: true
        });
      }
    }

    // Prepare notification payload
    const payload = {
      title,
      body: message,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/badge-72x72.png',
      data: {
        url: data.url || '/',
        timestamp: Date.now(),
        ...data
      },
      actions,
      requireInteraction,
      silent,
      tag: tag || 'default',
      vibrate: data.vibrate || [200, 100, 200]
    };

    // Send notifications to all active subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh_key,
              auth: sub.auth_key
            }
          };

          await webpush.sendNotification(subscription, JSON.stringify(payload));
          return { success: true, subscriptionId: sub.id };
        } catch (error) {
          console.error(`[PUSH] Failed to send to subscription ${sub.id}:`, error);
          
          const errorType = await handlePushError(error, sub.id, base44);
          
          return { 
            success: false, 
            error: error.message, 
            subscriptionId: sub.id,
            errorType 
          };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Log notification for analytics
    await base44.entities.NotificationLog.create({
      target_user_id: targetUserId,
      sender_user_id: user.id,
      type: 'push',
      title,
      message,
      successful_sends: successful,
      failed_sends: failed,
      data: JSON.stringify(data)
    });

    return json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length,
      message: `Notification sent to ${successful} device(s)`
    });

  } catch (error) {
    console.error('[PUSH] Notification error:', error);
    return err(error.message, 500);
  }
});