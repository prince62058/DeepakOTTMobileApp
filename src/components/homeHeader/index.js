import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, icons, SIZES } from '../../constants';
import { notificationCountApi } from '../../redux/actions/NotificationAction';

const HomeHeader = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { notificationCount } = useSelector(state => state.notification);

  useEffect(() => {
    if (user?._id) {
      dispatch(notificationCountApi({}));
    }
  }, [user?._id]);

  return (
    <View style={[styles.box, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <MaskedView
          maskElement={
            <Text style={[styles.title, { backgroundColor: 'transparent' }]}>
              {t('common.app_logo_part1') || 'Deep'}
            </Text>
          }
        >
          <LinearGradient
            colors={[COLORS.p1, COLORS.p2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {/* The transparent text lets the gradient show through */}
            <Text style={[styles.title, { opacity: 0 }]}>
              {t('common.app_logo_part1') || 'Deep'}
            </Text>
          </LinearGradient>
        </MaskedView>

        {/* Normal white text */}
        <Text style={styles.title}>{t('common.app_logo_part2') || 'ak'}</Text>
      </View>

      <View style={[styles.row, { gap: SIZES.w0 }]}>
        <Pressable onPress={() => navigation.navigate('Search')}>
          <Image source={icons.homeSearch} style={styles.icon} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Notification')}>
          <View>
            <Image source={icons.bellIcon} style={styles.icon} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  box: {
    // height: SIZES.width * 0.145,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.black,
    paddingHorizontal: SIZES.w8,
  },
  title: {
    fontFamily: FONTS.Bold,
    fontSize: SIZES.w18,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: SIZES.w14,
    height: SIZES.w14,
    resizeMode: 'contain',
  },
  badge: {
    position: 'absolute',
    top: -SIZES.w2,
    right: -SIZES.w2,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.w10,
    minWidth: SIZES.w6,
    height: SIZES.w6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.black,
    paddingHorizontal: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: SIZES.w2, // Smaller font
    fontFamily: FONTS.Bold,
    textAlign: 'center',
    lineHeight: SIZES.w6, // Center vertically
    marginTop: -2, // Adjust existing baseline
  },
});
