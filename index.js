import 'react-native-reanimated';

import { setupNotificationListeners } from './src/services/notifee/notifee';
import {
  backgroundMessageHandler,
  foregroundMessage,
} from './src/services/firebase/notification';

setupNotificationListeners();
backgroundMessageHandler();
foregroundMessage();

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

import { backgroundLocationTask } from './src/services/location/backgroundLocationTask';
AppRegistry.registerHeadlessTask(
  'BackgroundLocationTask',
  () => backgroundLocationTask,
);
AppRegistry.registerComponent(appName, () => App);
