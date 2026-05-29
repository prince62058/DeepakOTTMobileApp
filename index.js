/**
 * @format
 */
import 'react-native-reanimated';
import { backgroundMessageHandler } from './src/services/firebase/notification';
import { setupNotificationListeners } from './src/services/notifee/notifee';
// setUnreadBadge(1)
// updateBadgeCount()
// getDisplayedNotifications()
setupNotificationListeners()
backgroundMessageHandler()

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App';


AppRegistry.registerComponent(appName, () => App);
