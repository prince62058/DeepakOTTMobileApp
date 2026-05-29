import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  forwardRef,
} from 'react';
import {
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import CustomInput from '../../components/customInput';
import CustomButton from '../../components/customButton';
import { COLORS, FONTS, icons, SIZES } from '../../constants';
import RadioButton from '../radioButtom';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../utils/ToastAndroid';
import { withdrawReqApi } from '../../redux/actions/transactionAction';

const WithdrawSheet = forwardRef((prop, ref) => {
  const insent = useSafeAreaInsets();

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { banks } = useSelector(state => state.banks);
  const { company } = useSelector(state => state.company);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    userId: user?._id,
    Type: 'DEBIT',
    amount: '',
    bankOrUpiId: '',
  });
  const [error, setError] = useState({});
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    let errors = {};
    if (!form.amount) errors.amount = 'Amount is required';
    if (!form?.bankOrUpiId) errors.bankOrUpiId = 'Select bank or upi';
    setError(errors);
    console.log('🔍 Validation Check:', {
      form,
      errors,
      isValid: Object.keys(errors)?.length === 0,
    });
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = () => {
    console.log('🚀 Submit Button Clicked');
    console.log('📝 Form Data:', form);

    if (!validate()) {
      console.log('❌ Validation Failed');
      return;
    }

    console.log('✅ Validation Passed - Calling API');
    dispatch(
      withdrawReqApi({
        cb: setLoading,
        data: form,
        success: () => ref?.current?.dismiss(),
      }),
    );
  };

  const bankData = useMemo(() => {
    return banks?.filter(item => item?.type === 'BANK');
  }, [banks]);
  const upiData = useMemo(() => {
    return banks?.filter(item => item?.type === 'UPI');
  }, [banks]);

  // Track open/close
  const handleSheetChange = useCallback(
    index => {
      setIsOpen(index >= 0);
      if (index === -1) {
        setError({});
        setForm({
          userId: user?._id,
          Type: 'DEBIT',
          amount: '',
          bankOrUpiId: '',
        });
        setSelectedMethod(null);
      }
    },
    [user],
  );

  // Back button closes sheet if open
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
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.2}
        style={{ backgroundColor: COLORS.gray400 }}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      onChange={handleSheetChange}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={{ backgroundColor: COLORS.black }}
      enableOverDrag={false}
      snapPoints={['65%', '85%']} // Allow expansion for multiple items
    >
      <BottomSheetScrollView
        style={[styles.sheetContainer, { paddingBottom: insent.bottom }]}
        contentContainerStyle={{ paddingBottom: insent.bottom + 20 }}
      >
        <Text style={styles.sheetTitle}>Withdraw Request</Text>
        <View style={styles.separator} />

        <CustomInput
          label="Enter Amount"
          placeholder="Enter Amount"
          inputWrapperStyle={{ borderWidth: 1, borderColor: COLORS.gray50 }}
          mobile
          value={form?.amount}
          onChangeText={value => handleChange('amount', value)}
          error={error?.amount}
        />

        {bankData?.length > 0 && (
          <>
            <Text style={styles.sheetHeading}>Your Bank Account</Text>
            {bankData.map((item, index) => (
              <Pressable
                key={item?._id || index}
                style={[
                  styles.pressableView,
                  { marginTop: SIZES.height * 0.01 },
                ]}
                onPress={() => {
                  setSelectedMethod(`bank_${item?._id}`);
                  handleChange('bankOrUpiId', item?._id);
                }}
              >
                <Image source={icons.bankBS} style={styles.bankBS} />
                <View style={styles.body}>
                  <Text style={styles.text}>{item?.bankName}</Text>
                  <Text style={styles.subText}>
                    Account Number: {item?.accountNumber}
                  </Text>
                  <Text style={styles.subText}>
                    IFSC code : {item?.ifscCode}
                  </Text>
                </View>
                <RadioButton
                  active={selectedMethod === `bank_${item?._id}`}
                  onPress={() => {
                    setSelectedMethod(`bank_${item?._id}`);
                    handleChange('bankOrUpiId', item?._id);
                  }}
                />
              </Pressable>
            ))}
          </>
        )}

        {upiData?.length > 0 && (
          <>
            <Text style={styles.sheetHeading}>UPI</Text>
            {upiData.map((item, index) => (
              <Pressable
                key={item?._id || index}
                style={[
                  styles.pressableView,
                  { marginTop: SIZES.height * 0.01 },
                ]}
                onPress={() => {
                  setSelectedMethod(`upi_${item?._id}`);
                  handleChange('bankOrUpiId', item?._id);
                }}
              >
                <Image source={icons.upi} style={styles.upi} />
                <View style={styles.body}>
                  <Text style={styles.text}>{item?.upiId}</Text>
                </View>
                <RadioButton
                  active={selectedMethod === `upi_${item?._id}`}
                  onPress={() => {
                    setSelectedMethod(`upi_${item?._id}`);
                    handleChange('bankOrUpiId', item?._id);
                  }}
                />
              </Pressable>
            ))}
          </>
        )}

        {error?.bankOrUpiId && (
          <Text style={styles.errorText}>{error.bankOrUpiId}</Text>
        )}

        <CustomButton
          title="Submit Request"
          mainStyle={styles.btn}
          onPress={handleSubmit}
          loading={loading}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default WithdrawSheet;

const styles = StyleSheet.create({
  sheetContainer: {
    paddingHorizontal: SIZES.width * 0.04,
    paddingTop: SIZES.height * 0.02,
  },
  sheetTitle: {
    fontFamily: FONTS.PoppinsSemiBold,
    fontSize: SIZES.w7,
    color: COLORS.white,
    marginBottom: SIZES.height * 0.014,
  },
  separator: {
    height: SIZES.height * 0.001,
    backgroundColor: COLORS.gray400,
    width: '100%',
    marginBottom: SIZES.height * 0.02,
  },
  btn: {
    marginVertical: SIZES.height * 0.03,
  },
  indicator: {
    backgroundColor: COLORS.gray300,
    width: SIZES.width * 0.2,
    height: SIZES.height * 0.004,
    borderRadius: SIZES.height * 0.006,
  },
  sheetHeading: {
    fontFamily: FONTS.PoppinsMedium,
    fontSize: SIZES.w6,
    color: COLORS.white,
    marginTop: SIZES.height * 0.015,
  },
  pressableView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlack,
    borderRadius: 8,
    paddingHorizontal: SIZES.w6,
  },
  body: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: SIZES.w12,
    paddingVertical: SIZES.h6,
  },
  bankBS: {
    width: SIZES.width * 0.12,
    height: SIZES.width * 0.12,
    resizeMode: 'contain',
  },
  upi: {
    width: SIZES.width * 0.15,
    height: SIZES.width * 0.15,
    resizeMode: 'contain',
  },
  text: {
    fontSize: SIZES.w8,
    color: COLORS.white,
    fontFamily: FONTS.PoppinsMedium,
  },
  subText: {
    fontSize: SIZES.w2,
    color: COLORS.gray400,
    fontFamily: FONTS.PoppinsMedium,
  },
  errorText: {
    fontSize: SIZES.w4,
    color: COLORS.red,
    fontFamily: FONTS.PoppinsRegular,
    marginTop: SIZES.height * 0.01,
    marginLeft: SIZES.width * 0.02,
  },
});
