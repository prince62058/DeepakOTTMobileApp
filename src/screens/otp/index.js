import { useEffect, useRef, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';

import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/customButton';
import HeadingText from '../../components/headingText';
import MainView from '../../components/mainView';
import { icons, SIZES, COLORS } from '../../constants';
import { sendOtpApi, verifyOtpApi } from '../../redux/actions/authAction';
import styles from './styles';

const RESEND_OTP_TIME = 30;

const OtpScreen = ({ navigation, route }) => {
  const paramsData = route.params;
  const { t } = useTranslation();
  // console.log(paramsData)
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef([]);
  const [errorData, setErrorData] = useState(null);

  const [timer, setTimer] = useState(RESEND_OTP_TIME);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0 && !isResendEnabled) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendEnabled(true);
    }
    return () => clearInterval(interval);
  }, [timer, isResendEnabled]);

  const otpHandler = message => {
    if (message) {
      console.log('OTP Message Received:', message);
      const otpMatch = /(\d{4,6})/.exec(message);
      if (otpMatch && otpMatch[1]) {
        const otpValue = otpMatch[1];
        console.log('Extracted OTP:', otpValue);
        const newOtp = otpValue.slice(0, 4).split('');
        setOtp(newOtp);
      }
    }
  };

  // Auto-submit when OTP is full
  useEffect(() => {
    const result = otp.join('');
    if (result.length === 4) {
      Keyboard.dismiss();
      handleSubmit();
    }
  }, [otp]);

  const handleOtpChange = (value, index) => {
    if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== '' && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleFocus = index => {
    setActiveIndex(index);
  };

  // Format timer mm:ss
  const formatTimer = sec => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Reset OTP Timer on resend
  const handleResendOtp = () => {
    if (!isResendEnabled) return;
    console.log('Resend OTP API hit');
    const payload = { number: Number(paramsData?.number) };
    dispatch(sendOtpApi({ payload, cb: setLoading, navigation }));
    setTimer(RESEND_OTP_TIME); // reset timer
    setIsResendEnabled(false); // disable button
    setOtp(['', '', '', '']); // clear old OTP
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  const validation = () => {
    let error = {};
    const result = otp.join('');
    if (!result) {
      error.mobile = t('common.otp_required') || 'Otp is required';
    } else if (result.length < 4) {
      error.mobile = t('common.otp_4_digits') || 'Otp must be 4 digits';
    }
    setErrorData(error);
    return Object.keys(error).length === 0;
  };

  const handleSubmit = () => {
    if (!validation()) return;
    const payload = { number: Number(paramsData?.number), otp: otp.join('') };
    dispatch(verifyOtpApi({ payload, cb: setLoading, navigation }));
  };

  return (
    <MainView
      transparent
      keyboardBehavior={'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 100}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <HeadingText
            heading={t('common.otp_verification') || 'Otp Verification'}
            para={
              t('common.otp_para') || 'This Verification is essential for 2-Step Verification and making your account secure in any case of loss.'
            }
          />

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                textContentType="oneTimeCode"
              />
            ))}
          </View>

          <View style={styles.timerContainer}>
            <TouchableOpacity
              style={styles.container}
              onPress={handleResendOtp}
            >
              <Text style={styles.resendText}>{t('common.resend_otp') || 'Resend OTP:'}</Text>
              {!isResendEnabled ? (
                <Text style={styles.timerText}>{formatTimer(timer)}</Text>
              ) : null}
            </TouchableOpacity>

            <Text style={styles.resetPara}>
              {t('common.otp_sent') || 'The OTP has been sent to your personal number ending with'}{' '}
              {paramsData?.number?.toString()?.slice(6)} please Do not share it
              with others.
            </Text>
          </View>
        </ScrollView>
        <CustomButton
          loading={loading}
          title={t('common.complete') || "Complete "}
          buttonStyle={{
            width: SIZES.width * 0.92,
            alignSelf: 'center',
            marginBottom: SIZES.h5,
          }}
          onPress={handleSubmit}
          iconRight={icons.Check}
          iconStyle={styles.iconStyle}
        />
      </View>
    </MainView>
  );
};

export default OtpScreen;
