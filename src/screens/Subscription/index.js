import { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import CustomButton from '../../components/customButton';
import MainView from '../../components/mainView';
import { COLORS, SIZES } from '../../constants';
import {
  movieOnrentApi,
  subscriptionApi,
  takeSubscriptionApi,
} from '../../redux/actions/subscriptionAction';
import styles from './styles';
import { initiatePayment } from '../../services/razorpay/razorpay';
import CustomHeader from '../../components/header/CustomHeader';

const Subscription = ({ route, navigation }) => {
  const { t } = useTranslation();
  const movieId = route?.params?.movieId ?? null;

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { subscription } = useSelector(state => state.subscription);

  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const loadSubscriptions = useCallback(() => {
    dispatch(subscriptionApi({ cb: setLoading }));
  }, [dispatch]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handlePurchase = async item => {
    const payload = {
      userId: user?._id,
      planId: item?._id,
    };
    if (item?.planType === 'PAY_PER_MOVIE_PLAN') {
      // const response = await initiatePayment({ user, amount: item.planPrice })
      // if (response?.success) {
      dispatch(
        movieOnrentApi({
          cb: setPurchasing,
          data: { userId: user?._id, movieId },
        }),
      );
      // }
    } else {
      const response = await initiatePayment({ user, amount: item.planPrice });
      if (response?.success) {
        dispatch(
          takeSubscriptionApi({
            cb: setPurchasing,
            data: payload,
            onSuccess: () =>
              navigation.navigate('BottomTab', { screen: 'Profile' }),
          }),
        );
      }
    }
  };

  const isItemActive = item => {
    const userPlanDetails =
      user?.planDetails?.planType === item?.planType ?? false;
    return userPlanDetails;
  };

  const renderItem = ({ item }) => {
    const isFree = item.planPrice === 0;
    const isActivePlan = isItemActive(item);

    const Content = (
      <View style={[styles.contentBox, { marginHorizontal: 0 }]}>
        {isActivePlan && (
          <View style={styles.activePlan}>
            <Text style={styles.activeText}>{t('common.active_plan') || 'Active Plan'}</Text>
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.leftColumn}>
            <Text style={styles.title}>{item.planName}</Text>
            <Text style={styles.greenText}>
              ₹{item.planPrice} /{' '}
              {item.planDuration === 0
                ? (t('common.lifetime') || 'lifetime')
                : `${item.planDuration} ${t('common.days') || 'days'}`}
            </Text>

            <View
              style={{
                marginTop: 5,
                gap: 5,
                width: isActivePlan ? SIZES.width * 0.9 : SIZES.width * 0.5,
              }}
            >
              <Text style={styles.text}>{item.planDescription}</Text>
              {item.fullAccess && (
                <Text style={styles.text}>✅ Full access</Text>
              )}
            </View>
          </View>

          {!isFree && !isActivePlan && (
            <CustomButton
              title={t('common.subscribe_now') || 'Subscribe Now'}
              buttonStyle={styles.buttonStyle}
              buttonText={styles.buttonText}
              onPress={() => handlePurchase(item)}
              disabled={purchasing}
            />
          )}
        </View>
      </View>
    );

    return isActivePlan ? (
      <LinearGradient
        colors={[COLORS.p1, COLORS.p2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBorder}
      >
        {Content}
      </LinearGradient>
    ) : (
      Content
    );
  };

  // skeleton / placeholder when there's no data
  const renderEmpty = () => {
    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: SIZES.height * 0.08,
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: SIZES.height * 0.08,
        }}
      >
        <Text style={[styles.title, { fontSize: 16, marginBottom: 12 }]}>
          {t('common.no_subscription') || 'No subscription plans available'}
        </Text>
        <Text style={styles.text}>
          {t('common.pull_refresh') || 'Please pull to refresh or check back later.'}
        </Text>
      </View>
    );
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.subscribe_now') || 'Subscription Plan'} />
      <FlatList
        data={subscription || []}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={
          subscription && subscription?.length === 0
            ? { flex: 1 }
            : { paddingVertical: SIZES.height * 0.01 }
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={{ height: SIZES.height * 0.01 }} />
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={loadSubscriptions}
            tintColor={COLORS.primary}
          />
        }
      />
    </MainView>
  );
};

export default Subscription;
