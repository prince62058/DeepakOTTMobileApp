// src/services/location/backgroundLocationTask.js
import Geolocation from 'react-native-geolocation-service';
import { postLocationApi } from '../axios/api';
import { getItem } from '../storage/asyncStorage';
import { NativeModules } from 'react-native';

const { KioskModule } = NativeModules;

export const backgroundLocationTask = async taskData => {
  console.log('Headless JS Task: Background Location Started', taskData);

  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        console.log('[Background] Location:', latitude, longitude);

        try {
          // 1. Get Device ID (IMEI)
          let deviceId = await getItem('vlocker_loan_imei');

          if (!deviceId && KioskModule && KioskModule.getDeviceImei) {
            try {
              deviceId = await KioskModule.getDeviceImei();
            } catch (e) {
              console.log('[Background] Native IMEI fetch failed:', e);
            }
          }

          if (deviceId) {
            await postLocationApi({ deviceId, latitude, longitude });
            console.log('[Background] Location sent successfully');
          } else {
            console.log('[Background] No Device ID found');
          }
        } catch (error) {
          console.error('[Background] Error sending location:', error);
        }
        resolve();
      },
      error => {
        console.log('[Background] Error:', error.code, error.message);
        resolve();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
};
