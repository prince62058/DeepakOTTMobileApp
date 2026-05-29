import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';

/**
 * Create and display a custom local notification.
 */
export async function createDefaultChannel() {
  return await notifee.createChannel({
    id: 'default',
    name: 'General Notifications',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  });
}

/**
 * Create and display a custom local notification.
 */
export async function createNotification(message) {
  try {
    await notifee.requestPermission({ alert: true, badge: true, sound: true });

    const channelId = await createDefaultChannel();

    const id = message?.messageId || `msg_${Date.now()}`;
    const title = message?.notification?.title || 'New Notification';
    const body = message?.notification?.body || 'You have a new message';

    await notifee.displayNotification({
      id,
      title,
      body,
      badge: 5,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
      ios: { categoryId: 'default' },
    });
  } catch (error) {
    console.log('Error showing notification:', error);
  }
}

/**
 * Cancel a specific notification by ID
 */
export async function cancelNotification(id) {
  try {
    await notifee.cancelNotification(id);
  } catch (error) {
    console.log('Error canceling notification:', error);
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications() {
  try {
    await notifee.cancelAllNotifications();
  } catch (error) {
    console.log('Error canceling all notifications:', error);
  }
}

/**
 * Get list of all displayed notifications
 */
export async function getDisplayedNotifications() {
  try {
    const notifications = await notifee.getDisplayedNotifications();
    console.log('Currently displayed notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.log('Error getting notifications:', error);
    return [];
  }
}

/**
 * Setup both foreground and background notification listeners
 * Call this once in index.js
 */
export async function setupNotificationListeners() {
  // Foreground events
  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('Foreground notification pressed:', detail.notification);
      // Optional: reset badge if message is opened
      await clearBadge();
    } else if (type === EventType.DISMISSED) {
      console.log('Foreground notification dismissed:', detail.notification);
    } else {
      // For new notifications
      await updateBadgeCount();
    }
  });

  // Background events
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('Background notification pressed:', detail.notification?.id);
      await clearBadge(); // User opened notification, reset badge
    } else if (type === EventType.DISMISSED) {
      console.log(
        'Background notification dismissed:',
        detail.notification?.id,
      );
    } else {
      await updateBadgeCount(); // New notification received
    }
  });
}

// Set badge count
export async function updateBadgeCount() {
  try {
    const notifications = await notifee.getDisplayedNotifications();
    const count = notifications.length; // Or any custom unread count logic
    await notifee.setBadgeCount(count);
  } catch (error) {
    console.log('Error updating badge count:', error);
  }
}

export async function setUnreadBadge(count) {
  try {
    await notifee.setBadgeCount(count); // count can be any number
    console.log('Badge updated:', count);
  } catch (err) {
    console.log('Error setting badge:', err);
  }
}

// Clear badge count when opening the app or reading messages
async function clearBadge() {
  try {
    await notifee.setBadgeCount(0);
  } catch (error) {
    console.log('Error clearing badge count:', error);
  }
}
