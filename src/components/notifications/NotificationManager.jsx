import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  BellOff, 
  Smartphone, 
  Settings,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { managePushSubscription } from "@/functions/managePushSubscription";
import { getVapidPublicKey } from "@/functions/getVapidPublicKey";

// Utility function to convert VAPID key
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationManager({ user }) {
  const [permissionState, setPermissionState] = useState(Notification.permission);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [vapidPublicKey, setVapidPublicKey] = useState(null);

  useEffect(() => {
    loadVapidKey();
    loadSubscriptions();
    checkCurrentSubscription();
  }, []);

  const loadVapidKey = async () => {
    try {
      const response = await getVapidPublicKey();
      if (response.data?.vapidPublicKey) {
        setVapidPublicKey(response.data.vapidPublicKey);
      }
    } catch (error) {
      console.error('Failed to load VAPID key:', error);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await managePushSubscription();
      if (response.data?.subscriptions) {
        setSubscriptions(response.data.subscriptions);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  };

  const checkCurrentSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const pushSubscription = await registration.pushManager.getSubscription();
        setSubscription(pushSubscription);
        setIsSubscribed(!!pushSubscription);
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    }
  };

  const subscribeToPush = async () => {
    if (permissionState !== 'granted') {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission !== 'granted') {
        return;
      }
    }

    if (!vapidPublicKey) {
      console.error('VAPID public key not available');
      return;
    }

    setIsSubscribing(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to server
      await managePushSubscription({
        subscription: pushSubscription.toJSON()
      });

      setSubscription(pushSubscription);
      setIsSubscribed(true);
      await loadSubscriptions();
      
      console.log('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      
      // Remove from server
      await managePushSubscription({
        method: 'DELETE',
        endpoint: subscription.endpoint
      });

      setSubscription(null);
      setIsSubscribed(false);
      await loadSubscriptions();
      
      console.log('Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Browser Permission</p>
            <p className="text-sm text-gray-400">
              {permissionState === 'granted' ? 'Notifications allowed' :
               permissionState === 'denied' ? 'Notifications blocked' :
               'Permission not requested'}
            </p>
          </div>
          <Badge variant={permissionState === 'granted' ? 'default' : 'destructive'}>
            {permissionState === 'granted' ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {permissionState}
          </Badge>
        </div>

        {/* Subscription Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Push Subscription</p>
            <p className="text-sm text-gray-400">
              {isSubscribed ? 'This device is subscribed' : 'Not subscribed to push notifications'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSubscribing && <Loader2 className="w-4 h-4 animate-spin" />}
            <Switch
              checked={isSubscribed}
              onCheckedChange={isSubscribed ? unsubscribeFromPush : subscribeToPush}
              disabled={isSubscribing || permissionState === 'denied' || !vapidPublicKey}
            />
          </div>
        </div>

        {/* Active Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="space-y-3">
            <p className="font-medium">Active Devices ({subscriptions.length})</p>
            {subscriptions.map((sub, index) => (
              <div key={sub.id} className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {sub.userAgent?.includes('Mobile') ? 'Mobile Device' : 'Desktop'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Added {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error States */}
        {permissionState === 'denied' && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
            <p className="text-red-300 text-sm">
              Notifications are blocked. Please enable them in your browser settings to receive push notifications.
            </p>
          </div>
        )}

        {!vapidPublicKey && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
            <p className="text-yellow-300 text-sm">
              Push notifications are not configured. Please contact support.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}