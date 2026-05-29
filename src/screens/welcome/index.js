import { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  Text,
  View,
  Keyboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/customButton';
import CustomInput from '../../components/customInput';
import HeadingText from '../../components/headingText';
import MainView from '../../components/mainView';
import { icons, images, SIZES } from '../../constants';
import { sendOtpApi } from '../../redux/actions/authAction';
import styles from './styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../../utils/ToastAndroid';

const WelcomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insent = useSafeAreaInsets();

  const { banks } = useSelector(state => state.banks);
  const { company } = useSelector(state => state.company);
  // console.log('banks', banks)
  // console.log('company', company)

  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ mobile: '' });
  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  const [errorData, setErrorData] = useState(null);
  const [loading, setLoading] = useState(false);

  const validation = () => {
    let error = {};
    if (!formData?.mobile) {
      error.mobile = t('common.mobile_required') || 'Mobile number is required';
    } else if (formData.mobile.length < 10) {
      console.log('else if run');
      error.mobile = t('common.mobile_10_digits') || 'Mobile number must be 10 digits';
      showToast(t('common.enter_10_digits') || 'Please enter 10 digit number');
    }
    setErrorData(error);
    return Object.keys(error).length === 0;
  };

  const handleSubmit = () => {
    if (!validation()) return;
    Keyboard.dismiss();
    const payload = { number: Number(formData?.mobile) };
    dispatch(sendOtpApi({ payload, cb: setLoading, navigation }));
  };

  return (
    <MainView
      transparent
      keyboardBehavior={'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: SIZES.h5,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={images.Container}
            style={styles.Container}
            resizeMode="cover"
          />
          <View style={styles.secondHalf}>
            <HeadingText
              heading={t('common.welcome_back') || 'Welcome Back!'}
              customHeading={styles.customHeading}
              para={
                t('common.login_para') || 'Please enter your phone number to log in to your Deepak account.'
              }
            />

            <Text style={styles.label}>{t('common.phone_number') || 'Phone Number'}</Text>
            <CustomInput
              placeholder={t('common.enter_number') || 'Enter your number'}
              mobile
              leftIcon={icons.profile}
              value={formData.mobile}
              onChangeText={text => handleChange('mobile', text)}
              maxLength={10}
            />
          </View>
        </ScrollView>
        <CustomButton
          loading={loading}
          title={t('common.login') || 'Login'}
          buttonStyle={{
            width: SIZES.width * 0.92,
            alignSelf: 'center',
            marginBottom: SIZES.h5,
            marginTop: SIZES.h5,
          }}
          onPress={handleSubmit}
        />
      </View>
    </MainView>
  );
};

export default WelcomeScreen;
