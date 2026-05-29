import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  forwardRef,
} from 'react';
import {
  BackHandler,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../components/customInput';
import CustomButton from '../../components/customButton';
import { COLORS, FONTS, SIZES } from '../../constants';
import RadiusButton from '../radiusButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { createBankApi } from '../../redux/actions/bankAction';
import { useTranslation } from 'react-i18next';

const AddPaymentSheet = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const insets = useSafeAreaInsets();
  const [submit, setSubmit] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [isOpen, setIsOpen] = useState(false);

  // ---------- form & errors ----------
  const [form, setForm] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const newErr = {};
    if (selectedMethod === 'bank') {
      if (!form.accountHolder.trim())
        newErr.accountHolder = t('common.holder_name_req') || 'Holder name required';
      if (!form.accountNumber.trim())
        newErr.accountNumber = t('common.acc_num_req') || 'Account number required';
      if (!form.bankName.trim()) newErr.bankName = t('common.bank_name_req') || 'Bank Name required';
      if (!form.ifsc.trim()) newErr.ifsc = t('common.ifsc_req') || 'IFSC code required';
    } else {
      if (!form.upiId.trim()) newErr.upiId = t('common.upi_req') || 'UPI ID required';
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload =
      selectedMethod === 'bank'
        ? {
            userId: user?._id,
            type: 'BANK',
            fullName: form.accountHolder,
            bankName: form.bankName,
            accountNumber: form.accountNumber,
            ifscCode: form.ifsc,
          }
        : {
            userId: user?._id,
            type: 'UPI',
            upiId: form.upiId,
          };

    dispatch(
      createBankApi({
        cb: setSubmit,
        data: payload,
        success: () => ref?.current?.dismiss(),
      }),
    );
  };

  // ---------- sheet open/close ----------
  const handleSheetChange = useCallback(index => {
    if (index === -1) setSelectedMethod('bank');
    setIsOpen(index >= 0);
    setErrors({});
    setForm({
      accountHolder: '',
      bankName: '',
      accountNumber: '',
      ifsc: '',
      upiId: '',
    });
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (isOpen) {
        ref.current?.dismiss();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => sub.remove();
  }, [isOpen, ref]);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.2}
        style={{ backgroundColor: COLORS.gray400 }}
        pressBehavior={submit ? 'none' : 'close'}
      />
    ),
    [],
  );

  const snapPoints = useMemo(() => ['80%'], []);

  const renderFooter = useCallback(
    props => (
      <BottomSheetFooter {...props}>
        <View style={styles.footerContainer}>
          <CustomButton
            title={t('common.submit') || "Submit"}
            onPress={handleSubmit}
            loading={submit}
          />
        </View>
      </BottomSheetFooter>
    ),
    [handleSubmit, submit],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onChange={handleSheetChange}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={{ backgroundColor: COLORS.black }}
      enableOverDrag={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableDynamicSizing={false}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.sheetContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Toggle Buttons */}
        <View style={styles.body}>
          <RadiusButton
            title={t('common.add_bank') || "Add Bank"}
            buttonStyle={styles.buttonStyle}
            buttonText={styles.buttonText}
            active={selectedMethod === 'bank'}
            onPress={() => setSelectedMethod('bank')}
          />
          <RadiusButton
            title={t('common.add_upi') || "Add UPI"}
            buttonStyle={styles.buttonStyle}
            buttonText={styles.buttonText}
            active={selectedMethod === 'upi'}
            onPress={() => setSelectedMethod('upi')}
          />
        </View>

        <View style={styles.separator} />

        {/* Inputs */}
        {selectedMethod === 'bank' ? (
          <>
            <CustomInput
              label={t('common.bank_holder_name') || "Bank Account Holder Name"}
              placeholder={t('common.full_name') || "Enter Full Name"}
              value={form.accountHolder}
              onChangeText={t => handleChange('accountHolder', t)}
              error={errors.accountHolder}
              maxLength={50}
              bottomSheet
            />
            <CustomInput
              label={t('common.bank_name') || "Bank Name"}
              placeholder={t('common.enter_bank_name') || "Enter Bank Name"}
              value={form.bankName}
              onChangeText={t => handleChange('bankName', t)}
              error={errors.bankName}
              maxLength={50}
              bottomSheet
            />
            <CustomInput
              label={t('common.account_number') || "Account Number"}
              placeholder={t('common.enter_account_number') || "Enter Your Account Number"}
              value={form.accountNumber}
              onChangeText={t =>
                handleChange('accountNumber', t.replace(/[^0-9]/g, ''))
              }
              error={errors.accountNumber}
              keyboardType="numeric"
              maxLength={20}
              bottomSheet
            />
            <CustomInput
              label={t('common.ifsc_code') || "IFSC Code"}
              placeholder={t('common.enter_ifsc') || "Enter IFSC Code"}
              value={form.ifsc}
              onChangeText={t => handleChange('ifsc', t)}
              error={errors.ifsc}
              customContainer={styles.customContainer}
              maxLength={11}
              bottomSheet
            />
          </>
        ) : (
          <CustomInput
            label={t('common.your_upi') || "Your UPI ID"}
            placeholder={t('common.enter_upi') || "Enter Your UPI ID"}
            value={form.upiId}
            onChangeText={t => handleChange('upiId', t)}
            error={errors.upiId}
            customContainer={styles.customContainer}
            maxLength={50}
            bottomSheet
          />
        )}

        <View style={{ height: 80 }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default AddPaymentSheet;

const styles = StyleSheet.create({
  sheetContainer: {
    paddingHorizontal: SIZES.width * 0.04,
    paddingVertical: SIZES.height * 0.015,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.w8,
    marginBottom: SIZES.h1,
  },
  customContainer: {
    marginBottom: SIZES.height * 0.025,
  },
  separator: {
    height: SIZES.height * 0.001,
    backgroundColor: COLORS.gray400,
    width: '100%',
    marginBottom: SIZES.height * 0.01,
  },
  indicator: {
    backgroundColor: COLORS.gray300,
    width: SIZES.width * 0.2,
    height: SIZES.height * 0.004,
    borderRadius: SIZES.height * 0.006,
  },
  buttonStyle: {
    borderRadius: 100,
    width: SIZES.width * 0.42,
    height: SIZES.height * 0.055,
  },
  buttonText: {
    fontFamily: FONTS.PoppinsMedium,
    fontSize: SIZES.w6,
    textAlign: 'center',
  },
  footerContainer: {
    paddingHorizontal: SIZES.width * 0.04,
    paddingBottom: SIZES.h2,
    backgroundColor: COLORS.black,
  },
});
