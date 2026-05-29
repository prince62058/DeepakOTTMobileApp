import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import WithdrawSheet from '../../components/bottomSheet';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../components/header/CustomHeader';
import MainView from '../../components/mainView';
import Nodata from '../../components/nodata/Nodata';
import { COLORS, FONTS, icons, images, SIZES } from '../../constants';
import { getAllBankApi } from '../../redux/actions/bankAction';
import { getProfileApi } from '../../redux/actions/authAction';
import { getTransactionApi } from '../../redux/actions/transactionAction';
import { dateFormate, timeFormate } from '../../utils/date';
import { showToast } from '../../utils/ToastAndroid';
import styles from './styles';

const Wallet = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { transaction } = useSelector(state => state.transaction);

  const sheetRef = useRef(null);

  const [loading, setLoading] = useState({
    loading: false,
    refresh: false,
    pagination: false,
    delete: false,
  });
  const handleLoading = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // Initial fetch with loading state
    dispatch(
      getTransactionApi({ cb: value => handleLoading('loading', value) }),
    );
    dispatch(getAllBankApi({}));
    dispatch(getProfileApi({}));

    // Polling for real-time updates without loading triggers
    const interval = setInterval(() => {
      dispatch(getTransactionApi({}));
      dispatch(getProfileApi({}));
    }, 5000); // 5 seconds interval

    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    dispatch(
      getTransactionApi({ cb: value => handleLoading('refresh', value) }),
    );
    dispatch(getAllBankApi({}));
  }, []);

  const handlePagination = () => {
    if (loading?.pagination) return;
    if (transaction?.currentPage < transaction?.page) {
      dispatch(
        getTransactionApi({
          page: Number(transaction?.currentPage) + 1,
          cb: value => handleLoading('pagination', value),
        }),
      );
    }
  };

  const handleWithdraw = () => {
    if (user?.wallet < 500) {
      showToast(t('common.min_withdraw_amount', { amount: 500 }));
      return;
    }
    sheetRef.current?.present();
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.wallet')} />
      <View style={styles.mainStyle}>
        <View style={styles.card}>
          <Text style={styles.text}>{t('common.wallet_balance')}</Text>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.textBold}>💰{t('common.inr_balance')}</Text>
            <Text style={[styles.textBold, { color: COLORS.green }]}>
              ₹{Number(user?.wallet || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <Pressable style={styles.cardView} onPress={handleWithdraw}>
          <View style={[styles.row, { marginTop: SIZES.height * 0.01 }]}>
            <Image source={icons.withdrow} style={styles.icon} />
            <Text style={styles.boldText}>{t('common.withdraw_request')}</Text>
          </View>
        </Pressable>
        <FlatList
          data={transaction?.data || []}
          keyExtractor={item => item?._id}
          ListHeaderComponent={
            <View>
              {user && (
                <View style={styles.greenCard}>
                  {/* Header */}
                  <View style={styles.rewardHeader}>
                    <Image
                      source={icons.play02}
                      style={[
                        styles.icon,
                        { tintColor: COLORS.green, marginBottom: 0 },
                      ]}
                    />
                    <Text style={styles.rewardHeaderText}>
                      {t('common.watch_earn_status')}
                    </Text>
                  </View>

                  {/* Stats Grid */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>
                        {t('common.watched_month')}
                      </Text>
                      <Text style={styles.statValue}>
                        {(transaction?.earnings?.minutesWatched || 0) < 60
                          ? `${Number(
                              transaction?.earnings?.minutesWatched || 0,
                            ).toFixed(1)} min`
                          : `${(
                              (transaction?.earnings?.minutesWatched || 0) / 60
                            ).toFixed(1)} hrs`}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { textAlign: 'center' }]}>
                        {t('common.reward_rate')}
                      </Text>
                      <Text style={[styles.statValue, { textAlign: 'center' }]}>
                        ₹
                        {Number(
                          transaction?.earnings?.rewardRate || 0.1,
                        ).toFixed(2)}
                        /min
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { textAlign: 'right' }]}>
                        {t('common.cashback_earned')}
                      </Text>
                      <Text
                        style={[styles.statValueGreen, { textAlign: 'right' }]}
                      >
                        ₹
                        {Number(
                          transaction?.earnings?.totalRewardAmount || 0,
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Section */}
                  <View
                    style={{ width: '100%', marginTop: SIZES.height * 0.005 }}
                  >
                    <Text
                      style={{
                        color: COLORS.gray300,
                        fontFamily: FONTS.semiBold,
                        fontSize: SIZES.w3,
                        textTransform: 'uppercase',
                      }}
                    >
                      {t('common.progress_next_reward')}
                    </Text>
                    <View
                      style={{
                        height: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        marginVertical: SIZES.height * 0.01,
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${Math.min(
                            100,
                            transaction?.earnings?.progress || 0,
                          )}%`,
                          backgroundColor: COLORS.primary,
                        }}
                      />
                    </View>

                    <Text
                      style={{
                        color:
                          transaction?.earnings?.progress >= 100
                            ? COLORS.green
                            : COLORS.gray400,
                        fontFamily: FONTS.regular,
                        fontSize: SIZES.w3,
                      }}
                    >
                      {transaction?.earnings?.progress >= 100
                        ? t('common.watch_goal_reached')
                        : (() => {
                            const watchedMin =
                              transaction?.earnings?.minutesWatched ||
                              (transaction?.earnings?.hoursWatched || 0) * 60;
                            const targetMin =
                              (transaction?.earnings?.targetHours || 0) * 60;
                            const remainingMin = targetMin - watchedMin;

                            return remainingMin < 60
                              ? t('common.watch_more_min', {
                                  minutes: remainingMin.toFixed(1),
                                })
                              : t('common.watch_more_hours', {
                                  hours: (remainingMin / 60).toFixed(1),
                                });
                          })()}
                    </Text>
                  </View>
                </View>
              )}
              <Text style={styles.heading}>{t('common.transaction_history')}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const debit = item?.Type === 'DEBIT';
            
            // Localize status
            const statusLower = item?.status?.toLowerCase();
            const localizedStatus = 
              statusLower === 'pending' ? t('common.status_pending') :
              statusLower === 'approved' ? t('common.status_approved') :
              statusLower === 'rejected' ? t('common.status_rejected') :
              item?.status;

            // Localize common messages (simple keyword replacement for now)
            let localizedMessage = item?.message || '';
            const msgLower = localizedMessage.toLowerCase();

            if (msgLower.includes('debited from wallet')) {
              localizedMessage = localizedMessage.replace(/debited from wallet/gi, t('common.debited_from_wallet'));
            } else if (msgLower.includes('credited to wallet')) {
              localizedMessage = localizedMessage.replace(/credited to wallet/gi, t('common.credited_to_wallet'));
            } else if (msgLower.includes('subscribed to')) {
              localizedMessage = localizedMessage.replace(/subscribed to/gi, t('common.subscribed_to'));
              localizedMessage = localizedMessage.replace(/monthly premium/gi, t('common.movie')); // or just leave it
            } else if (msgLower.includes('approved by admin')) {
              localizedMessage = localizedMessage.replace(/approved by admin/gi, t('common.approved_by_admin'));
            } else if (msgLower.includes('refund: withdrawal rejected by admin')) {
              localizedMessage = localizedMessage.replace(/refund: withdrawal rejected by admin/gi, t('common.refund_rejected'));
            } else if (msgLower.includes('reject request')) {
              localizedMessage = localizedMessage.replace(/reject request/gi, t('common.reject_request'));
            }

            return (
              <View key={item?._id} style={styles.historyRow}>
                <View style={styles.leftRow}>
                  <Image source={images.transation02} style={styles.image} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{localizedMessage}</Text>
                    <Text style={[styles.historyTitle, { color: debit ? COLORS.red : COLORS.green, fontSize: SIZES.w3 }]}>
                      {localizedStatus}
                    </Text>
                    <Text style={styles.historyTime}>
                      {dateFormate(item?.createdAt)}{' '}
                      {timeFormate(item?.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.amount,
                    { color: !debit ? COLORS.green : COLORS.red },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {!debit ? '+' : '-'} ₹{Number(item?.amount || 0).toFixed(2)}
                </Text>
              </View>
            );
          }}
          ItemSeparatorComponent={
            <View style={{ height: SIZES.height * 0.005 }} />
          }
          contentContainerStyle={
            transaction?.data?.length > 0
              ? { paddingVertical: SIZES.height * 0.02 }
              : { flexGrow: 1 }
          }
          refreshControl={
            <RefreshControl
              refreshing={loading.refresh}
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => <Nodata title="No transaction found" />}
          onEndReached={handlePagination}
          onEndReachedThreshold={0.9}
        />

        <WithdrawSheet ref={sheetRef} />
      </View>
    </MainView>
  );
};

export default Wallet;
