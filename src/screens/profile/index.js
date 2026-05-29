import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MainView from '../../components/mainView';
import LogoutModal from '../../components/modal';
import LanguageModal from '../../components/modal/LanguageModal';
import CustomSearch from '../../components/search';
import { COLORS, icons } from '../../constants';
import styles from './styles';
import { useDispatch, useSelector } from 'react-redux';
import { logoutApi } from '../../redux/actions/authAction';
import CustomHeader from '../../components/header/CustomHeader';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { transliterateToHindi } from '../../utils/transliterate';

const Profile = ({ navigation }) => {
  const { token, user } = useSelector(state => state.auth);
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name);
  // console.log(user);

  const [showFailModal, setShowFailModal] = useState(false);

  useEffect(() => {
    const handleName = async () => {
      if (i18n.language === 'hi' && user?.name) {
        const translated = await transliterateToHindi(user.name);
        setDisplayName(translated);
      } else {
        setDisplayName(user?.name);
      }
    };
    handleName();
  }, [i18n.language, user?.name]);

  const List = ({ title, icon, onPress, titleStyle }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.box}
        onPress={onPress}
      >
        <View style={styles.row}>
          <Image source={icon} style={[styles.icon, titleStyle && { tintColor: COLORS.red }]} />
          <Text style={[styles.title, titleStyle]}>{title} </Text>
        </View>
        <Image source={icons.rightArrow} style={styles.arrow} />
      </TouchableOpacity>
    );
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setShowLanguageModal(false);
  };

  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logoutApi());
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.profile') || 'Profile'} />

      <View style={styles.center}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileView}>
            <Image
              style={styles.profileImg}
              source={
                user?.image
                  ? { uri: user?.image }
                  : {
                      uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                    }
              }
            />

            <View>
              <Text style={styles.name}>{displayName || user?.name}</Text>
              <View style={styles.row}>
                <Image source={icons.crown} style={styles.crown} />
                <Text style={styles.premium}>
                  {user?.planDetails?.planName ?? (t('common.no_active_plan') || 'No active plan')}
                </Text>
              </View>
            </View>
          </View>

          {/* Content & rewards */}
          <Text style={styles.heading}>{t('common.content_rewards') || 'My Content & Rewards'}</Text>
          <View style={styles.screen}>
            <List
              icon={icons.editProfile}
              title={t('common.edit_profile') || 'Edit Profile'}
              onPress={() => navigation.navigate('EditProfile')}
            />
            <View style={styles.seprate} />

            <List
              icon={icons.watchHistory}
              title={t('common.watch_history') || 'Watch History'}
              onPress={() => navigation.navigate('WatchHistory')}
            />
            <View style={styles.seprate} />

            <List
              icon={icons.wallet}
              title={t('common.wallet') || 'Wallet'}
              onPress={() => navigation.navigate('Wallet')}
            />
            <View style={styles.seprate} />
            <List
              icon={icons.bankProfile}
              title={t('common.add_payment') || 'Add Payment Method'}
              onPress={() => navigation.navigate('AddPayment')}
            />
            <View style={styles.seprate} />
            <List
              icon={icons.rewardReferral}
              title={t('common.reward_referral') || 'Rewards & Referral'}
              onPress={() => navigation.navigate('Rewards')}
            />
          </View>

          {/* Account Settings*/}
          <Text style={styles.heading}>{t('common.settings') || 'Account Settings'}</Text>
          <View style={styles.screen}>
            {/* <List
              icon={icons.subscripation}
              title={'Subscription plan'}
              onPress={() => navigation.navigate('Subscription')}
            />
            <View style={styles.seprate} /> */}

            <List
              icon={icons.fqa}
              title={t('common.faqs') || 'FQAs'}
              onPress={() => navigation.navigate('Faqs')}
            />
            <View style={styles.seprate} />

            <List
              icon={icons.tearms}
              title={t('common.terms_conditions') || 'Terms & Conditions'}
              onPress={() => navigation.navigate('Terms')}
            />
            <View style={styles.seprate} />

            <List
              icon={icons.tearms}
              title={t('common.privacy_policy') || 'Privacy Policy'}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
            <View style={styles.seprate} />

            <List
              icon={icons.tearms}
              title={t('common.about_us') || 'About Us'}
              onPress={() => navigation.navigate('AboutUs')}
            />
            <View style={styles.seprate} />

            <List
              icon={icons.tearms} // You can change this to a language icon if available
              title={t('common.change_language') || 'Change Language'}
              onPress={() => setShowLanguageModal(true)}
            />
            <View style={styles.seprate} />

            <List
              icon={icons.logout}
              title={t('common.logout') || 'Logout'}
              onPress={() => setShowFailModal(true)}
              titleStyle={{ color: COLORS.red }}
            />
          </View>
        </ScrollView>
      </View>
      <LogoutModal
        visible={showFailModal}
        onClose={() => setShowFailModal(false)}
        onConfirm={handleLogout}
      />

      <LanguageModal
        visible={showLanguageModal}
        title={t('common.select_language') || 'Select Language'}
        onClose={() => setShowLanguageModal(false)}
        onSelect={handleLanguageChange}
      />
    </MainView>
  );
};

export default Profile;
