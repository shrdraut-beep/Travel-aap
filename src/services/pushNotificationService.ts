import { PushNotifications, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Interactive Push Notification Manager with Native Action Buttons
 * Supports Zero-Cost FCM Categories: [Accept] & [Ignore]
 */
export async function setupInteractivePushNotifications(
  onAcceptLead: (leadId: string) => void
) {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications running in web simulator mode.');
    return;
  }

  try {
    // 1. Request permission
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive !== 'granted') {
      console.warn('Push notification permission not granted.');
      return;
    }

    // 2. Register Interactive Action Categories (ZERO-COST native action channels)
    const pushPlugin = PushNotifications as any;
    if (typeof pushPlugin.registerActionTypes === 'function') {
      await pushPlugin.registerActionTypes({
        types: [
          {
            id: 'VENDOR_LEAD_ACTIONS',
            actions: [
              {
                id: 'accept',
                title: '⚡ Accept & Bid',
                foreground: true // Launches app directly into Chat/Bidding screen
              },
              {
                id: 'ignore',
                title: '✕ Ignore',
                destructive: true,
                foreground: false // Silently dismisses the notification from tray
              }
            ]
          }
        ]
      });
    }

    // 3. Register Action Performed Listener
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      const { actionId, notification: rawPush } = notification;
      const leadId = rawPush.data?.leadId || rawPush.data?.tripRequestId;

      if (actionId === 'accept' && leadId) {
        onAcceptLead(leadId); // Deep link directly to live bidding room
      }
      // 'ignore' dismisses notification without waking UI
    });

    await PushNotifications.register();
  } catch (error) {
    console.error('Failed to register interactive push notifications:', error);
  }
}

