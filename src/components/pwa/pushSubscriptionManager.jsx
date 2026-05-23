import crypto from 'crypto';

// Generate stable ID for subscription endpoint
export const subId = (endpoint) => {
  return crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 24);
};

// Rate limiting for noisy push notifications
const debounce = new Map();
export function shouldSend(key, ms = 8000) {
  const now = Date.now();
  const lastSent = debounce.get(key) || 0;
  if (now < lastSent) return false;
  debounce.set(key, now + ms);
  return true;
}

// Push error handling with proper cleanup
export const handlePushError = async (error, subscriptionId, base44) => {
  const statusCode = error.statusCode || error.status;
  
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
    return 'rate_limited';
  } else if (statusCode >= 500) {
    // Server error: retry later
    console.warn(`[PUSH] Server error for subscription ${subscriptionId}: ${error.message}`);
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

// Subscription deduplication logic
export const upsertPushSubscription = async (base44, userId, subscription) => {
  const id = subId(subscription.endpoint);
  
  const existingSubscriptions = await base44.entities.PushSubscription.filter({
    user_id: userId,
    endpoint: subscription.endpoint
  });

  const subscriptionData = {
    user_id: userId,
    endpoint: subscription.endpoint,
    p256dh_key: subscription.keys.p256dh,
    auth_key: subscription.keys.auth,
    is_active: true,
    last_updated: new Date().toISOString()
  };

  if (existingSubscriptions.length > 0) {
    // Update existing subscription
    await base44.entities.PushSubscription.update(existingSubscriptions[0].id, subscriptionData);
    console.log(`[PUSH] Updated existing subscription for user ${userId}`);
    return existingSubscriptions[0].id;
  } else {
    // Create new subscription
    const newSub = await base44.entities.PushSubscription.create({
      ...subscriptionData,
      created_at: new Date().toISOString()
    });
    console.log(`[PUSH] Created new subscription for user ${userId}`);
    return newSub.id;
  }
};