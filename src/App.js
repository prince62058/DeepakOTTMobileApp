import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from './redux/store';
import Root from './root';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import Splash from './screens/Splash';
import { Linking } from 'react-native';
import ContinueWatch from './screens/continueWatch';
import { getApi } from './services/axios/api';
import { getMovieDetailsEndpoint } from './redux/api/apiEndpoint';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  foregroundMessage,
  getFcmToken,
} from './services/firebase/notification';
import { createDefaultChannel } from './services/notifee/notifee';
import './i18n';

const navRef = React.createRef();

const linking = {
  prefixes: ['deepakott://', 'https://deepakott.com'],
  config: {
    screens: {
      Home: 'open',
      ContinueWatch: {
        path: 'movie/:id',
        alias: ['watch/:id'],
        parse: {
          id: id => `${id}`,
        },
      },
    },
  },
};

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isMinTimeComplete, setIsMinTimeComplete] = useState(false);

  useEffect(() => {
    const minTimer = setTimeout(() => {
      setIsMinTimeComplete(true);
    }, 2000);
    const maxTimer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 2500);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    getFcmToken();
    foregroundMessage();
    createDefaultChannel();
  }, []);

  const handleAnimationComplete = () => {
    setIsAnimationComplete(true);
  };

  const showSplash = !isAppReady || !isAnimationComplete || !isMinTimeComplete;

  useEffect(() => {
    const handleUrl = async url => {
      console.log('incoming url:', url);
      try {
        // Handle deepakott://watch/ID, https://deepakott.com/watch/ID, or deepakott://open?id=ID
        let id = null;

        if (url.includes('/watch/')) {
          const parts = url.split('/watch/');
          id = parts[1]?.split('/')[0]?.split('?')[0];
        } else if (url.includes('watch/')) {
          const parts = url.split('watch/');
          id = parts[1]?.split('/')[0]?.split('?')[0];
        } else if (url.includes('/movie/')) {
          const parts = url.split('/movie/');
          id = parts[1]?.split('/')[0]?.split('?')[0];
        } else if (url.includes('movie/')) {
          const parts = url.split('movie/');
          id = parts[1]?.split('/')[0]?.split('?')[0];
        } else if (url.includes('id=')) {
          const match = url.match(/[?&]id=([^&]+)/);
          if (match) id = match[1];
        }

        // Handle deepakott://invite/CODE or https://deepakott.com/invite/CODE
        if (url.includes('invite/')) {
          const parts = url.split('invite/');
          const code = parts[1]?.split('/')[0]?.split('?')[0];
          if (code) {
            console.log('Referral Code Detected:', code);
            await AsyncStorage.setItem('pending_referral_code', code);
          }
        }

        if (id) {
          console.log('Deep Link ID detected:', id);
          const state = store.getState();
          const userId = state.auth?.user?._id;

          // Fetch Data
          const params = { userId, movieOrSeriesId: id };
          const res = await getApi(getMovieDetailsEndpoint, params);

          if (res?.status === 200 || res?.status === 201) {
            const movieData = res?.data?.data;
            if (movieData) {
              navRef.current?.navigate('ContinueWatch', { data: movieData });
            }
          }
        } else {
          // Fallback / Existing logic
          if (url.includes('open')) {
            navRef.current?.navigate('Home');
          }
        }
      } catch (e) {
        console.log('Deep link parse error:', e);
      }
    };

    const onEvent = e => handleUrl(e.url);
    Linking.addEventListener?.('url', onEvent);
    Linking.getInitialURL().then(url => {
      if (url) handleUrl(url);
    });

    return () => {
      try {
        Linking.removeEventListener('url', onEvent);
      } catch {}
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate
        loading={<Splash onAnimationComplete={handleAnimationComplete} />}
        persistor={persistor}
        onBeforeLift={() => {
          setIsAppReady(true);
        }}
      >
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer linking={linking} ref={navRef}>
              <BottomSheetModalProvider>
                {showSplash ? (
                  <Splash onAnimationComplete={handleAnimationComplete} />
                ) : (
                  <Root />
                )}
              </BottomSheetModalProvider>
            </NavigationContainer>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
