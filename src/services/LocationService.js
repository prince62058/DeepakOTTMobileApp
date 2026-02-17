import Geolocation from 'react-native-geolocation-service';
import BackgroundFetch from 'react-native-background-fetch';
import { postApi } from './axios/api';
import { getSecureItem } from './storage/keychain';
import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import { getItem } from './storage/asyncStorage';

const { KioskModule } = NativeModules;

class LocationService {
  constructor() {
    this.isConfigured = false;
  }

  async init() {
    if (this.isConfigured) return;

    // 1. Configure Background Fetch
    try {
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: 15, // minutes
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: true,
          forceAlarmManager: false, // Android
          requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
        },
        async taskId => {
          console.log('[BackgroundFetch] taskId:', taskId);
          await this.syncLocation('BACKGROUND');
          BackgroundFetch.finish(taskId);
        },
        error => {
          console.log('[BackgroundFetch] configure error:', error);
        },
      );
      console.log('[BackgroundFetch] configured, status:', status);
      this.isConfigured = true;
    } catch (err) {
      console.log('BackgroundFetch init error', err);
    }

    // 2. Immediate Sync on App Start
    this.syncLocation('FOREGROUND');
  }

  async syncLocation(source = 'FOREGROUND') {
    console.log(`[LocationService] Syncing location from ${source}...`);

    // Force Location ON if Device Owner (ONLY if not controlled remotely by DeviceLockScreen)
    // We removed the unconditional force-on here because DeviceLockScreen now handles the policy.
    // However, if we want to ensure it stays ON when policy says so, we can leave it or rely on the loop.
    // For now, removing the unconditional force-on to allow remote disable.

    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      console.log('[LocationService] No permission');
      return;
    }

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        console.log(
          `[LocationService] Got coordinates from ${source}: ${latitude}, ${longitude}`,
        );
        await this.sendToBackend(latitude, longitude);
      },
      error => {
        console.log(
          `[LocationService] Error getting location (${source}):`,
          error.code,
          error.message,
        );
        if (error.code === 5 || error.code === 2) {
          console.log(
            '[LocationService] Location settings not satisfied. Opening settings...',
          );
          if (KioskModule && KioskModule.openLocationSettings) {
            KioskModule.openLocationSettings();
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: source === 'COMMAND' ? 45000 : 15000,
        maximumAge: source === 'COMMAND' ? 0 : 5000,
      },
    );
  }

  async checkPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Check background permission for Android 10+
          if (Platform.Version >= 29) {
            const bgGranted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
              {
                title: 'Background Location Permission',
                message: 'App needs background location access.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            return bgGranted === PermissionsAndroid.RESULTS.GRANTED;
          }
          return true;
        } else {
          console.log('Location permission denied');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return false;
  }

  async sendToBackend(latitude, longitude) {
    try {
      // 1. Get Device ID (IMEI) for Identification
      let deviceId = await getItem('vlocker_loan_imei');

      if (!deviceId && KioskModule && KioskModule.getDeviceImei) {
        try {
          deviceId = await KioskModule.getDeviceImei();
        } catch (e) {
          console.log('[LocationService] Native IMEI fetch failed:', e);
        }
      }

      if (!deviceId) {
        console.log(
          '[LocationService] No Device ID found, cannot sync location.',
        );
        return;
      }

      const response = await postApi('/customerLoan/location', {
        deviceId,
        latitude,
        longitude,
      });

      console.log(
        '[LocationService] Location sent successfully:',
        response.data,
      );
    } catch (error) {
      console.error('[LocationService] Failed to send location:', error);
    }
  }
}

export default new LocationService();
