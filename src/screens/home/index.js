import { useCallback, useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import ContinueCard from '../../components/continueCard';
import HorizontalList from '../../components/horizontalList';
import MainView from '../../components/mainView';
import Slider from '../../components/slider';
import { SIZES } from '../../constants';
import {
  getProfileApi,
  updateProfileApi,
} from '../../redux/actions/authAction';
import { homeApi } from '../../redux/actions/homeAction';
import styles from './styles';
import { getFcmToken } from '../../services/firebase/notification';
import { notificationCountApi } from '../../redux/actions/NotificationAction';
import { getLastWatchedEpisode } from '../../utils/lastWatched';

// if (
//   Platform.OS === 'android' &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { token, user } = useSelector(state => state.auth);
  const { home, trending, recommand, newrelease, category } = useSelector(
    state => state.home,
  );
  console.log('User data ---> ', user);
  console.log('📊 Home watch history data ---> ', home?.watchHistoryData);
  console.log(
    '📊 Watch history count ---> ',
    home?.watchHistoryData?.length || 0,
  );

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCardPress = async item => {
    const movieOrSeriesId = item?.movieOrSeriesId?._id || item?.movieOrSeriesId;
    const lastEpisodeId = await getLastWatchedEpisode(movieOrSeriesId);

    navigation.navigate('ContinueWatch', {
      data: lastEpisodeId
        ? {
            _id: lastEpisodeId,
            mainType: 'EPISODE',
            parentsSeries: movieOrSeriesId,
          }
        : item?.movieOrSeriesId,
      timeStamp: item?.playTimeStamps,
    });
  };

  const fetchAllData = async loader => {
    loader(true);
    try {
      await Promise.all([
        dispatch(getProfileApi({})),
        dispatch(homeApi({})),
        dispatch(notificationCountApi({})),
      ]);
    } catch (error) {
      console.log('Error in parallel APIs:', error);
    } finally {
      loader(false);
    }
  };

  const handlePermission = async () => {
    const fcmToken = await getFcmToken();
    console.log('FCM Token:', fcmToken);

    if (!fcmToken) {
      console.log('FCM Token is null - Check Play Services'); // DEBUG LOG
    }

    if (fcmToken && user?._id) {
      dispatch(
        updateProfileApi({
          data: { userId: user._id, fcmToken },
          cb: () => {},
        }),
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        fetchAllData(setLoading);
      }
    }, [user?._id]),
  );

  useEffect(() => {
    handlePermission();
  }, []);

  const onRefresh = useCallback(() => {
    fetchAllData(setRefreshing);
  }, []);

  const handleMoviewClick = async (item, timeStamp) => {
    const movieOrSeriesId = item?.movieOrSeriesId?._id || item?.movieOrSeriesId;
    const lastEpisodeId = await getLastWatchedEpisode(movieOrSeriesId);

    navigation.navigate('ContinueWatch', {
      data: lastEpisodeId
        ? {
            _id: lastEpisodeId,
            mainType: 'EPISODE',
            parentsSeries: movieOrSeriesId,
          }
        : item?.movieOrSeriesId,
      timeStamp,
    });
  };

  return (
    <MainView transparent bottomSafe={false}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Slider />
        {/* Continue Watching*/}
        {home?.watchHistoryData && home.watchHistoryData.length > 0 && (
          <>
            <Text style={styles.heading}>{t('common.continue_watching') || 'Continue Watching'}</Text>
            <View
              style={[styles.View, { marginVertical: SIZES.height * 0.015 }]}
            >
              <FlatList
                data={home?.watchHistoryData}
                keyExtractor={item => item?._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.seperator} />}
                contentContainerStyle={{ paddingHorizontal: SIZES.w4 }}
                removeClippedSubviews={true}
                initialNumToRender={4}
                maxToRenderPerBatch={6}
                windowSize={3}
                renderItem={({ item }) => (
                  <ContinueCard
                    item={item}
                    cardPress={() => handleCardPress(item)}
                    addPress={() => console.log('Add')}
                    resumePress={timeStamp =>
                      handleMoviewClick(item, timeStamp)
                    }
                  />
                )}
              />
            </View>
          </>
        )}

        {/* Trending Now */}
        <HorizontalList
          data={home?.trendingData}
          heading={t('common.trending_now') || 'Trending Now'}
          isTrending={true}
          onPress={() => navigation.navigate('Trending')}
        />

        {/* Recommended for You */}
        {home?.recommandedData?.length > 0 && (
          <HorizontalList
            data={home?.recommandedData}
            heading={t('common.recommended') || 'Recommended for You'}
            onPress={() => navigation.navigate('Recommend')}
          />
        )}
      </ScrollView>
    </MainView>
  );
};

export default Home;
