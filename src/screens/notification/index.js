import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import MainView from '../../components/mainView';
import { COLORS, SIZES, images } from '../../constants';
import {
  notificationApi,
  markSeenApi,
  clearAllNotificationsApi,
} from '../../redux/actions/NotificationAction';
import styles from './styles';
import { RefreshControl } from 'react-native';
import Nodata from '../../components/nodata/Nodata';
import { ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import CustomHeader from '../../components/header/CustomHeader';
import { icons } from '../../constants';

const Notification = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { notifications } = useSelector(state => state.notification);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  // console.log('Notification data ---> ', notifications)

  const fetchData = loader => {
    dispatch(notificationApi({ cb: value => loader(value) }));
  };

  const handleClearAll = () => {
    dispatch(
      clearAllNotificationsApi({
        cb: success => {
          if (success) {
            fetchData(setLoading);
          }
        },
      }),
    );
  };

  useEffect(() => {
    fetchData(setLoading);
  }, []);

  useEffect(() => {
    if (route.params?.clearAll) {
      handleClearAll();
    }
  }, [route.params?.clearAll]);

  const onRefresh = useCallback(() => {
    fetchData(setRefreshing);
  }, []);

  const filterData = useMemo(() => {
    if (!notifications) return [];
    switch (activeTab) {
      case 'read':
        return notifications.filter(item => item?.seen === true);
      case 'unread':
        return notifications.filter(item => item?.seen !== true);
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const tabs = [
    { key: 'all', label: t('common.all') || 'All' },
    { key: 'read', label: t('common.read') || 'Read' },
    { key: 'unread', label: t('common.unread') || 'Unread' },
  ];

  const handleMarkSeen = item => {
    if (!item.seen) {
      dispatch(
        markSeenApi({
          id: item._id || item.id,
          cb: () => fetchData(setLoading), // Refresh after marking seen
        }),
      );
    }
  };

  const timeAgo = date => {
    const now = new Date();
    const past = new Date(date);
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = now - past;

    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + (t('common.s_ago') || 's ago');
    } else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + (t('common.m_ago') || 'm ago');
    } else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + (t('common.h_ago') || 'h ago');
    } else if (elapsed < msPerMonth) {
      return Math.round(elapsed / msPerDay) + (t('common.d_ago') || 'd ago');
    } else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + (t('common.mo_ago') || 'mo ago');
    } else {
      return Math.round(elapsed / msPerYear) + (t('common.y_ago') || 'y ago');
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.seen;

    // Fallback for older notifications without a type field
    let itemType = item.type;
    if (!itemType && item.title?.toLowerCase().includes('referral')) {
      itemType = 'referral';
    } else if (
      !itemType &&
      item.title?.toLowerCase().includes('subscription')
    ) {
      itemType = 'subscription';
    } else if (!itemType) {
      itemType = 'general';
    }

    // Handle image logic
    let imageSource = item?.image ? { uri: item.image } : null;
    if (!imageSource) {
      if (itemType === 'referral') imageSource = images.referImage;
      else if (itemType === 'subscription') imageSource = images.gift;
      else imageSource = images.Container; // default fallback
    }

    const imageStyle =
      itemType === 'subscription' ? styles.gift : styles.poster;

    return (
      <Pressable
        onPress={() => handleMarkSeen(item)}
        style={[styles.row, isUnread && { backgroundColor: COLORS.lightBlack }]}
      >
        <Image source={imageSource} style={imageStyle} />
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{t(`notifications.${item.title}`) || item.title}</Text>
          <Text style={styles.message}>{t(`notifications.${item.message}`) || item.message}</Text>
          <Text style={styles.subTitle}>
            {item.subTitle ||
              `${t(`common.type_${itemType}`) || itemType} · ${timeAgo(item.createdAt)}`}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader
        title={t('common.notification') || 'Notification'}
        rightComponent={
          <Pressable onPress={handleClearAll} style={{ padding: 10 }}>
            <Image
              source={icons.trash}
              style={{
                width: SIZES.w6,
                height: SIZES.w6,
                tintColor: COLORS.white,
              }}
            />
          </Pressable>
        }
      />
      <View style={styles.toggle}>
        {tabs.map(item => {
          const isActive = activeTab === item.key;
          return (
            <Pressable
              key={item.key}
              style={[
                styles.flexRow,
                isActive && { backgroundColor: COLORS.white },
              ]}
              onPress={() => setActiveTab(item.key)}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: isActive ? COLORS.black : COLORS.white },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.heading}>{t('common.today') || 'Today'}</Text>

      {loading && filterData?.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size={'large'} color={COLORS.white} />
        </View>
      ) : (
        <FlatList
          data={filterData}
          renderItem={renderItem}
          keyExtractor={item =>
            (item._id || item.id || Math.random()).toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filterData?.length !== 0
              ? { paddingBottom: SIZES.height * 0.1 }
              : { flexGrow: 1 }
          }
          ItemSeparatorComponent={() => (
            <View style={{ height: SIZES.height * 0.01 }} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => <Nodata title={t('common.no_notification') || 'No notification found'} />}
        />
      )}
    </MainView>
  );
};

export default Notification;
