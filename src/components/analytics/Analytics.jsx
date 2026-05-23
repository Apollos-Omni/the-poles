import { useEffect } from 'react';

// Privacy-safe analytics
class Analytics {
  constructor() {
    this.events = [];
    this.sessionId = crypto.randomUUID();
    this.sessionStart = Date.now();
  }

  track(eventName, properties = {}) {
    const event = {
      event: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer,
        // No PII - just anonymous usage patterns
      }
    };

    this.events.push(event);
    console.log('[ANALYTICS]', event);

    // Batch send events periodically
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  flush() {
    if (this.events.length === 0) return;

    // In production, send to analytics service
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(this.events)
    // }).catch(() => {});

    this.events = [];
  }

  // Core app events
  appOpen() { this.track('app_open'); }
  loginSuccess() { this.track('login_success'); }
  devicePair(deviceType) { this.track('device_pair', { deviceType }); }
  lockToggle(action, deviceId) { this.track('lock_toggle', { action, deviceId }); }
  notificationOpen(type) { this.track('notification_open', { type }); }
  visionCreated() { this.track('vision_created'); }
  visionCompleted() { this.track('vision_completed'); }
  pageView(page) { this.track('page_view', { page }); }
}

export const analytics = new Analytics();

export const useAnalytics = () => {
  useEffect(() => {
    // Track page view
    analytics.pageView(window.location.pathname);
    
    // Track session duration on unload
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - analytics.sessionStart;
      analytics.track('session_end', { duration: sessionDuration });
      analytics.flush();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return analytics;
};

export const AnalyticsProvider = ({ children }) => {
  useAnalytics();
  return children;
};