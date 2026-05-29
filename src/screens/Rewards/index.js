import {
  View,
  Text,
  Image,
  ScrollView,
  Clipboard,
  TouchableOpacity,
} from 'react-native';
import MainView from '../../components/mainView';
import styles from './styles';
import { COLORS, icons, images, SIZES } from '../../constants';
import CustomButton from '../../components/customButton';
import { useDispatch, useSelector } from 'react-redux';
import { shareFile } from '../../services/share/ShareFile';
import { showToast } from '../../utils/ToastAndroid';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../components/header/CustomHeader';

const Rewards = () => {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const { company } = useSelector(state => state.company);
  const [shareLoading, setShareLoading] = React.useState(false);

  const DATA = [
    {
      id: '1',
      title: t('common.refer_step_1') || 'Share your referral code with friends.',
      poster: icons.referal01,
    },
    {
      id: '2',
      title: t('common.refer_step_2') || 'They download the app and purchase any plan.',
      poster: icons.referal02,
    },
    {
      id: '3',
      title: t('common.refer_step_3') || 'You unlock rewards wallet credits.',
      poster: icons.referal03,
    },
  ];

  const handleShare = () => {
    const shareMessage = `${t('common.share_msg_1') || '🎬 Join me on Deepak OTT and get unlimited entertainment!'}\n\n🎁 ${t('common.share_msg_2') || 'Use my referral code'}: ${user?.referralCode}\n\n💰 ${t('common.share_msg_3') || 'When you purchase any premium plan, I get'} ₹${referralAmount} ${t('common.share_msg_4') || 'rewards!'}\n\n${t('common.download_now') || 'Download now'}: https://play.google.com/store/apps/details?id=com.deepakott`;

    shareFile({
      loading: setShareLoading,
      title: t('common.join_title') || 'Join Deepak OTT',
      message: shareMessage,
    });
  };

  const handleCopyCode = () => {
    if (user?.referralCode) {
      Clipboard.setString(user.referralCode);
      showToast(t('common.code_copied') || 'Referral code copied to clipboard! 📋');
    }
  };

  // Get referral earning amount from company settings, default to 0 if not available
  const referralAmount = company?.referralEarning || 0;

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.reward_referral') || 'Reward & Referral'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
      >
        <View style={styles.card}>
          <View style={styles.row}>
            <Image source={images.referImage} style={styles.referImage} />
            <View>
              <Text style={styles.text}>{t('common.referral_code') || 'Referral Code'}</Text>
              <TouchableOpacity
                style={styles.dashedBorder}
                onPress={handleCopyCode}
                activeOpacity={0.7}
              >
                <View style={styles.innerBox}>
                  <Text style={styles.referViewText}>{user?.referralCode}</Text>
                  <Text style={styles.copyIcon}>📋</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.text}>
            {' '}
            {t('common.refer_description') || 'Invite your friends to join Deepak OTT. Once they purchase any premium plan, you get rewards instantly'}
          </Text>
        </View>

        <View style={styles.view}>
          <Text style={styles.viewText}>{t('common.friend_purchased') || 'Your friend has Purchased 1 plan.'}</Text>
          <View>
            <Text style={[styles.viewText, { color: COLORS.green }]}>
              {t('common.you_earn') || 'You earn'}
            </Text>
            <View style={styles.textRow}>
              <Text style={styles.text}>₹{referralAmount}</Text>
              <Image source={icons.coin} style={styles.coin} />
            </View>
          </View>
        </View>

        <Text style={styles.heading}>{t('common.how_it_works') || 'HOW DOES IT WORK?'}</Text>

        {DATA.map(item => {
          return (
            <View
              style={[styles.textRow, { marginTop: SIZES.height * 0.012 }]}
              key={item.id}
            >
              <View style={styles.imageView}>
                <Image source={item.poster} style={styles.steps} />
              </View>
              <Text style={styles.subText}>{item.title}</Text>
            </View>
          );
        })}
        <CustomButton
          title={t('common.refer_now') || 'Refer Now'}
          mainStyle={styles.mainStyle}
          onPress={handleShare}
          disabled={shareLoading}
        />
      </ScrollView>
    </MainView>
  );
};

export default Rewards;
