import { getApp } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import notificationPermission from '../permissions/notificationPermission';
import { createNotification } from '../notifee/notifee';

const app = getApp();
const messagingInstance = getMessaging(app);

export async function getFcmToken() {
  try {
    const hasPermission = await notificationPermission();
    if (!hasPermission) return null;
    return await getToken(messagingInstance);
  } catch (error) {
    console.log('FCM getToken Error (Expected with placeholders):', error);
    return null;
  }
}

export const foregroundMessage = () => {
  onMessage(messagingInstance, async message => {
    console.log('Foreground Message', message);
    if (message) {
      await createNotification(message);
    }
  });
};

export const onNotificationOpened = () => {
  onNotificationOpenedApp(messagingInstance, remoteMessage => {
    console.log('Notification opened from background:', remoteMessage);
  });
};

export const onAppLaunchedFromQuit = async () => {
  const remoteMessage = await getInitialNotification(messagingInstance);
  console.log('Notification onAppOpenedFromQuit:', remoteMessage);
};

export const backgroundMessageHandler = () => {
  setBackgroundMessageHandler(messagingInstance, async message => {
    console.log('Background Message', message);
    if (message?.messageId) {
      await createNotification(message);
    }
  });
};
