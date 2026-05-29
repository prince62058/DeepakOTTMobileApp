import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import LinearGradient from 'react-native-linear-gradient';
import CustomInput from '../../components/customInput';
import HeadingText from '../../components/headingText';
import MainView from '../../components/mainView';
import { COLORS, icons, SIZES, FONTS } from '../../constants';
import styles from './styles';
import { useDispatch, useSelector } from 'react-redux';
import { getLanguageApi, registerApi } from '../../redux/actions/authAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const CompleteProfile = ({ navigation }) => {
  const { user, languages } = useSelector(state => state.auth);
  const [isFocus, setIsFocus] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current; // 🔑 animation value

  // animate on focus/blur
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isFocus ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [isFocus]);

  // interpolate rotation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    language: '',
    number: user?.number,
    referralCode: '',
  });
  const { t } = useTranslation();
  const [errorData, setErrorData] = useState(null);
  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrorData(prev => ({ ...prev, [key]: null }));

    // Update App Language if supported
    if (key === 'language') {
      const selectedLang = languages?.find(l => l._id === value);
      if (selectedLang) {
        const langName = selectedLang.name.toLowerCase();
        if (langName.includes('hindi')) {
          i18n.changeLanguage('hi');
        } else if (langName.includes('english')) {
          i18n.changeLanguage('en');
        }
      }
    }
  };

  const validation = () => {
    let error = {};
    if (!formData?.name) error.name = t('common.name_required') || 'Name is required';
    if (!formData.email.trim()) {
      error.email = t('common.email_required') || 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email.trim())) {
      error.email =
        t('common.email_invalid') || 'Please enter a valid Gmail address (must end with @gmail.com)';
    }
    setErrorData(error);
    return Object.keys(error).length === 0;
  };

  const handleSubmit = () => {
    if (!validation()) return;
    const { language, ...restData } = formData;
    const payload = {
      ...restData,
      language: [language],
    };
    console.log(payload);
    navigation.navigate('Preferences', payload);
  };

  useEffect(() => {
    dispatch(getLanguageApi({}));

    // Auto-fill referral code if available
    const checkReferral = async () => {
      try {
        const code = await AsyncStorage.getItem('pending_referral_code');
        if (code) {
          setFormData(prev => ({ ...prev, referralCode: code }));
        }
      } catch (e) {
        console.log('Error fetching referral code', e);
      }
    };
    checkReferral();
  }, []);

  return (
    <MainView
      transparent
      keyboardBehavior={'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 100}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.inputViewContent, { flexGrow: 1 }]}
        >
          <HeadingText
            heading={t('common.complete_profile') || 'Complete your profile'}
            para={t('common.fill_profile_para') || 'Fill your personal information here'}
          />
          <View style={styles.inputView}>
            <CustomInput
              label={t('common.full_name') || 'Full Name'}
              placeholder={t('common.enter_name') || 'Enter Your Name'}
              leftIcon={icons.profile}
              value={formData?.name}
              onChangeText={value => handleChange('name', value)}
              error={errorData?.name}
            />

            <CustomInput
              label={t('common.your_email') || 'Your Email'}
              placeholder={t('common.enter_email') || 'Enter Your Email'}
              email
              leftIcon={icons.email}
              value={formData?.email}
              onChangeText={value => handleChange('email', value)}
              error={errorData?.email}
            />

            <View style={{ marginVertical: 10 }}>
              <Text style={styles.dropText}>{t('common.your_language') || 'Your Language'}</Text>

              <Dropdown
                data={
                  languages?.map(lang => ({
                    label: lang.name,
                    value: lang._id,
                  })) || []
                }
                labelField="label"
                valueField="value"
                placeholder={t('common.select_language') || "Select Your Language"}
                value={formData.language || null}
                onChange={item => handleChange('language', item.value)}
                style={styles.dropdownContainer}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.selectTextStyle}
                containerStyle={styles.dropdownOption}
                itemTextStyle={styles.itemTextStyle}
                activeColor={COLORS.lightBlack}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                maxHeight={SIZES.height * 0.3}
                renderRightIcon={() => (
                  <Animated.View style={{ transform: [{ rotate }] }}>
                    <Image source={icons.downArrow} style={styles.iconStyle} />
                  </Animated.View>
                )}
                renderItem={item => {
                  const isSelected = item.value === formData.language;
                  return (
                    <Text
                      style={[
                        styles.activeText,
                        {
                          color: isSelected ? COLORS.primary : COLORS.separator,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  );
                }}
              />
            </View>

            <CustomInput
              label={t('common.referral_code') || 'Referral Code'}
              placeholder={t('common.enter_referral') || 'Enter your referral code'}
              leftIcon={icons.profile}
              value={formData?.referralCode}
              onChangeText={value => handleChange('referralCode', value)}
              error={errorData?.referralCode}
            />
          </View>
        </ScrollView>
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.7}
          style={{
            width: SIZES.width * 0.92,
            alignSelf: 'center',
            marginBottom: SIZES.h5,
          }}
        >
          <LinearGradient
            colors={[COLORS.p1, COLORS.p2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              height: SIZES.height * 0.068,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: SIZES.w11,
                fontFamily: FONTS.semiBold,
              }}
            >
              {t('common.update') || 'Update'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </MainView>
  );
};

export default CompleteProfile;
