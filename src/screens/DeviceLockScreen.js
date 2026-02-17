import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  StatusBar,
  DeviceEventEmitter,
  ScrollView,
  NativeModules,
  Alert,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import { BASE_API_URL } from '../services/axios/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import { getPublicMobileStatusThunk } from '../redux/slices/main/loanSlice';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocationService from '../services/LocationService';

const { KioskModule } = NativeModules;

const DeviceLockScreen = () => {
  const dispatch = useDispatch();
  const [emiAmount, setEmiAmount] = useState(null);
  const [loanId, setLoanId] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' });
  const [deviceImei, setDeviceImei] = useState(null);
  const [loanImei, setLoanImei] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [shopName, setShopName] = useState('Satya Kabir E-solutions Pvt. Ltd.');
  const [lockReason, setLockReason] = useState(null);
  const [daysOverdue, setDaysOverdue] = useState(0);
  const [breakdown, setBreakdown] = useState({
    principal: 0,
    lateFees: 0,
    bounceFees: 0,
  });

  // Support Info State
  const [supportPhone, setSupportPhone] = useState('6205872519');
  const [supportEmail, setSupportEmail] = useState('princekumar5252@gmail.com');
  const [supportWhatsapp, setSupportWhatsapp] = useState('916205872519');

  // Disable Back Button & Enable Kiosk Mode
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    // Enable Kiosk Mode (Pin App)
    if (KioskModule && KioskModule.enableKioskMode) {
      KioskModule.enableKioskMode()
        .then(() => console.log('Kiosk Mode Enabled via JS'))
        .catch(err => console.error('Kiosk Mode Error:', err));
    }

    return () => {
      backHandler.remove();
    };
  }, []);

  // Fetch Company Support Info
  useEffect(() => {
    const fetchSupportInfo = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}company`);
        if (response.data && response.data.success && response.data.data) {
          const { companyMobile, supportEmail, whatsappNumber } =
            response.data.data;
          if (companyMobile) setSupportPhone(companyMobile);
          if (supportEmail) setSupportEmail(supportEmail);
          if (whatsappNumber) setSupportWhatsapp(whatsappNumber);
          console.log(
            'DeviceLockScreen: Company Info Fetched:',
            response.data.data,
          );
        }
      } catch (error) {
        console.error('DeviceLockScreen: Error fetching company info:', error);
      }
    };

    fetchSupportInfo();
  }, []);

  // Fetch Device Status & Due Amount
  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true);

        // PRIORITY 1: Provisioned IMEI (Soft-Bind)
        let id = null;
        try {
          if (KioskModule && KioskModule.getProvisionedImei) {
            id = await KioskModule.getProvisionedImei();
            if (id)
              console.log('DeviceLockScreen: Using Provisioned IMEI:', id);
          }
        } catch (e) {
          console.log('Error getting provisioned IMEI:', e);
        }

        // PRIORITY 2: Device Unique ID
        if (!id) {
          id = await DeviceInfo.getUniqueId();
        }

        setDeviceImei(id);

        const storedPhone = await AsyncStorage.getItem('vlocker_user_phone');
        console.log(
          'DeviceLockScreen: Fetching for ID:',
          id,
          'Phone Fallback:',
          storedPhone,
          'isEmulator:',
          await DeviceInfo.isEmulator(),
        );
        const result = await dispatch(
          getPublicMobileStatusThunk({ imei: id, phone: storedPhone || '' }),
        ).unwrap();

        if (result) {
          // Check for 'loan' object or 'data' object in response
          const loan = result.loan || result.data;

          if (loan) {
            const amountToShow =
              loan.totalDueAmount > 0
                ? loan.totalDueAmount
                : loan.emiAmount || loan.monthlyEmi || 0;

            console.log(
              'DeviceLockScreen: Amount to show:',
              amountToShow,
              'from loan:',
              loan._id,
              'Lock Reason:',
              result.lockReason,
              'Days Overdue:',
              result.daysOverdue,
              'Status:', // Log status
              result.status || loan.status,
            );
            setEmiAmount(amountToShow);
            setLoanId(loan._id);
            setLockReason(result.lockReason || null);
            setDaysOverdue(result.daysOverdue || 0);
            setCustomerInfo({
              name: loan.customerId?.customerName || 'Customer',
              email: loan.customerId?.customerEmail || 'customer@vlocker.com',
            });
            setShopName(loan.shopName || 'Satya Kabir E-solutions Pvt. Ltd.');
            setLoanImei(loan.imeiNumber1 || loan.imeiNumber2 || null);
            if (result.data?.breakdown) {
              setBreakdown(result.data.breakdown);
            }

            // Handle Location Request
            if (result.requestLocation) {
              console.log(
                'DeviceLockScreen: Received Location Request Command',
              );
              LocationService.syncLocation('COMMAND');
            }

            // Handle Remote Location Control
            if (loan.devicePolicy) {
              const shouldEnableLocation = loan.devicePolicy.isLocationEnabled;
              console.log(
                `[DeviceLockScreen] Policy Check: isLocationEnabled = ${shouldEnableLocation} (Type: ${typeof shouldEnableLocation})`,
              );

              if (KioskModule && KioskModule.setLocationEnabled) {
                console.log(
                  `[DeviceLockScreen] Calling KioskModule.setLocationEnabled(${shouldEnableLocation})`,
                );
                try {
                  // KioskModule methods usually return a Promise
                  KioskModule.setLocationEnabled(shouldEnableLocation)
                    .then(() =>
                      console.log(
                        `[DeviceLockScreen] setLocationEnabled(${shouldEnableLocation}) SUCCESS`,
                      ),
                    )
                    .catch(err =>
                      console.error(
                        `[DeviceLockScreen] setLocationEnabled(${shouldEnableLocation}) FAILED:`,
                        err,
                      ),
                    );
                } catch (e) {
                  console.error(
                    `[DeviceLockScreen] Exception calling setLocationEnabled:`,
                    e,
                  );
                }
              } else {
                console.warn(
                  '[DeviceLockScreen] KioskModule.setLocationEnabled NOT FOUND',
                );
              }
            } else {
              console.log(
                '[DeviceLockScreen] devicePolicy is missing in loan object',
              );
            }

            // Emit Status to Root.js strictly based on API
            const currentStatus = result.status || loan.status;
            if (currentStatus === 'UNLOCKED') {
              console.log(
                'DeviceLockScreen: Status is UNLOCKED. Emitting unlock event.',
              );
              DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', {
                status: 'UNLOCKED',
              });
            } else {
              // Only emit LOCKED if we are sure it's locked.
              // This refreshes the lock state in Root.js
              DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', {
                status: 'LOCKED',
              });
            }
          } else {
            console.log('DeviceLockScreen: No loan data found in result');
            // If we have result but no loan data, ambiguous. Ideally don't force lock unless we know.
            // But if we are here, we are on Lock Screen.
          }
        }
      } catch (error) {
        console.error('Error fetching loan data (offline):', error);
        // If error/offline, we still keep the screen red and locked.
        // We could show a specific offline message if we want.
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();

    const interval = setInterval(() => {
      fetchLoanData();
      // Moved emission logic inside fetchLoanData to prevent overriding actual status
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handlePayment = async () => {
    // Redirect to Landing Page for Payment (Use local IP)
    const paymentUrl = `http://172.20.10.2:3000/payment?autoPay=true&amount=${emiAmount}`;

    if (KioskModule && KioskModule.setIsPaying) {
      await KioskModule.setIsPaying(true);
    }

    if (KioskModule && KioskModule.openChrome) {
      KioskModule.openChrome(paymentUrl);
    } else {
      Linking.openURL(paymentUrl).catch(err => {
        console.error('An error occurred', err);
        Alert.alert('Error', "Don't know how to open URI: " + paymentUrl);
      });
    }
  };

  const handleWhatsApp = () => {
    const message = `Hello, my device (IMEI: ${deviceImei}) is locked. I want to pay my EMI of ₹${emiAmount}.`;
    Linking.openURL(
      `whatsapp://send?phone=${supportWhatsapp}&text=${message}`,
    ).catch(() => {
      Linking.openURL(`https://wa.me/${supportWhatsapp}?text=${message}`);
    });
  };

  const handleCall = () => {
    Linking.openURL(`tel:${supportPhone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${supportEmail}`);
  };

  const handleOpenWifi = async () => {
    try {
      if (KioskModule && KioskModule.setIsPaying) {
        // Set is_paying to true temporarily so LockService doesn't kick us out of settings
        await KioskModule.setIsPaying(true);
      }
      if (KioskModule && KioskModule.openInternetPanel) {
        KioskModule.openInternetPanel();
      } else if (KioskModule && KioskModule.openWifiSettings) {
        KioskModule.openWifiSettings();
      }
    } catch (error) {
      console.error('Error opening WiFi settings:', error);
    }
  };

  const handleOpenMobileData = () => {
    if (KioskModule && KioskModule.openMobileDataSettings) {
      KioskModule.openMobileDataSettings();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#B00020"
        barStyle="light-content"
        hidden={true}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Icon */}
        <View style={styles.header}>
          <View style={styles.lockIconCircle}>
            <Ionicons name="lock-closed" size={50} color="#fff" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>DEVICE LOCKED</Text>
        <Text style={styles.subtitle}>Please Pay Your EMI</Text>

        {/* EMI Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Due Amount</Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#B00020"
              style={{ marginTop: 10 }}
            />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.amountValue}>₹{emiAmount ?? '---'}</Text>

              {breakdown &&
                (breakdown.lateFees > 0 || breakdown.bounceFees > 0) && (
                  <View style={styles.breakdownContainer}>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Overdue EMI:</Text>
                      <Text style={styles.breakdownValue}>
                        ₹{breakdown.principal}
                      </Text>
                    </View>
                    {breakdown.lateFees > 0 && (
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Late Fee:</Text>
                        <Text style={styles.breakdownValue}>
                          ₹{breakdown.lateFees}
                        </Text>
                      </View>
                    )}
                    {breakdown.bounceFees > 0 && (
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Bounce Fee:</Text>
                        <Text style={styles.breakdownValue}>
                          ₹{breakdown.bounceFees}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
            </View>
          )}
        </View>

        {/* Warning Message */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            {lockReason === 'AUTO_LOCK_OVERDUE'
              ? `Your device has been automatically locked because your EMI payment is ${daysOverdue} day${
                  daysOverdue !== 1 ? 's' : ''
                } overdue. Please pay your outstanding dues immediately to restore access.`
              : lockReason === 'GRACE_PERIOD_ACTIVE'
              ? `Your EMI payment is ${daysOverdue} day${
                  daysOverdue !== 1 ? 's' : ''
                } overdue. Please pay soon to avoid automatic device lock.`
              : lockReason === 'MANUAL_LOCK'
              ? 'Your device has been locked by the administrator. Please contact support or pay your dues to unlock.'
              : 'Your device has been locked because your EMI is OVERDUE. Please pay your outstanding dues immediately to restore access.'}
          </Text>
        </View>

        {/* Days Overdue Badge (only show if overdue) */}
        {daysOverdue > 0 && (
          <View style={styles.overdueBadge}>
            <MaterialIcons name="warning" size={20} color="#D32F2F" />
            <Text style={styles.overdueBadgeText}>
              {daysOverdue} Day{daysOverdue !== 1 ? 's' : ''} Overdue
            </Text>
          </View>
        )}

        {/* Company Branding */}
        <View style={styles.brandingContainer}>
          <Text style={styles.companyName}>{shopName}</Text>
          <Text style={styles.companyTagline}>
            IT Software & Digital Marketing Agency
          </Text>
        </View>

        {/* Customer Support */}
        <View style={styles.supportContainer}>
          <Text style={styles.sectionTitle}>Customer Support</Text>

          <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{supportPhone}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="email" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{supportEmail}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Network Access */}
        <View style={styles.supportContainer}>
          <Text style={styles.sectionTitle}>Internet & Network</Text>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <TouchableOpacity
              style={styles.networkButton}
              onPress={handleOpenWifi}
            >
              <Ionicons name="wifi" size={24} color="#B00020" />
              <Text style={styles.networkButtonText}>WiFi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.networkButton}
              onPress={handleOpenMobileData}
            >
              <Ionicons name="cellular" size={24} color="#B00020" />
              <Text style={styles.networkButtonText}>Data</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.smallInfo}>
            Use these buttons to connect to the internet to pay and unlock.
          </Text>
        </View>

        {/* Footer Info */}
        <Text style={styles.footerInfo}>
          Device IMEI: {loanImei || deviceImei || 'Loading...'}
        </Text>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.payNowButton}
          onPress={handlePayment}
          disabled={paymentLoading}
        >
          {paymentLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons
                name="payment"
                size={24}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.whatsappButtonText}>PAY NOW</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  lockIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#B00020',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B00020',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
  },
  amountCard: {
    backgroundColor: '#FFE5E5',
    width: '90%',
    padding: 25,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#B00020',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#B00020',
  },
  warningBox: {
    width: '90%',
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  warningText: {
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  companyTagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 5,
  },
  supportContainer: {
    width: '90%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
  },
  contactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footerInfo: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payNowButton: {
    backgroundColor: '#B00020',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  networkButton: {
    flex: 0.48,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#B00020',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkButtonText: {
    color: '#B00020',
    fontWeight: 'bold',
    marginTop: 5,
  },
  smallInfo: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    marginBottom: 20,
  },
  overdueBadgeText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  breakdownContainer: {
    width: '100%',
    marginTop: 15,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(176, 0, 32, 0.2)',
    width: '100%',
    marginBottom: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginVertical: 2,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DeviceLockScreen;
