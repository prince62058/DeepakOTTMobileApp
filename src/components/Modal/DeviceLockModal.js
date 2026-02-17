import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import MainText from '../MainText';
import { COLORS, FONTS, SIZES } from '../../constants';
import { fontSize } from '../../utils/fontSize';
import SubmitButton from '../common/button/SubmitButton';
import ToggleButton from '../common/button/ToggleButton';
import { pickImage } from '../../services/picker/cropImagePicker';
import { postMediaApi, postLocationApi } from '../../services/axios/api';
import {
  getSimDetailsThunk,
  requestDeviceLocationThunk,
} from '../../redux/slices/main/loanSlice';
import { showToast } from '../../utils/ToastAndroid';

const DeviceLockModal = ({
  visible = false,
  handleConfirm,
  handleModalToggle,
  onUpdate,
  item = {},
  selectedItems = [], // New prop for bulk
}) => {
  const dispatch = useDispatch();
  // Debugging imports
  if (!getSimDetailsThunk || !requestDeviceLocationThunk) {
    console.warn('LoanSlice thunks are undefined:', {
      getSimDetailsThunk,
      requestDeviceLocationThunk,
    });
  }

  const [uploadingStatus, setUploadingStatus] = useState(false);

  const isBulk = selectedItems.length > 1;
  const displayItem = isBulk ? selectedItems[0] : item;
  const isLocked = displayItem?.deviceUnlockStatus === 'LOCKED';
  const textValue = isLocked ? 'Unlock' : 'Lock';
  const policy = displayItem?.devicePolicy || {};

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleGetLocation = async () => {
    try {
      setLoadingLocation(true);
      let hasPermission = false;

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        hasPermission = auth === 'granted';
      }

      if (hasPermission) {
        Geolocation.getCurrentPosition(
          async position => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            console.log('Location:', latitude, longitude);

            // Send to backend
            try {
              const loanId = displayItem._id;
              await postLocationApi({ loanId, latitude, longitude });
              console.log('Location sent to backend');
            } catch (err) {
              console.error('Error sending location:', err);
            }

            setLoadingLocation(false);
          },
          error => {
            console.log(error.code, error.message);
            setLoadingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } else {
        setLoadingLocation(false);
      }
    } catch (err) {
      console.warn(err);
      setLoadingLocation(false);
    }
  };

  const handleWallpaperUpload = async () => {
    try {
      const image = await pickImage();
      if (!image) return;

      setUploadingStatus(true);
      const res = await postMediaApi('upload', { file: image });
      console.log('Upload success:', res.data);

      const imageUrl = `https://api.vlocker.in/${res.data.filePath}`;
      onUpdate('WALLPAPER_URL', imageUrl);
    } catch (error) {
      console.error('Wallpaper upload error:', error);
    } finally {
      setUploadingStatus(false);
    }
  };

  /* SIM INFO LOGIC */
  const [simModalVisible, setSimModalVisible] = useState(false);
  const [simDetails, setSimDetails] = useState([]);
  const [loadingSim, setLoadingSim] = useState(false);

  const handleGetSimInfo = async () => {
    if (isBulk) return; // Single device only for now
    try {
      setLoadingSim(true);
      const res = await dispatch(
        getSimDetailsThunk({ loanId: displayItem._id }),
      ).unwrap();
      if (res.success && res.data) {
        setSimDetails(res.data);
        setSimModalVisible(true);
      } else {
        showToast('No SIM details found');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSim(false);
    }
  };

  /* REMOTE LOCATION LOGIC */
  const handleRequestLocation = async () => {
    if (isBulk) return;
    try {
      setLoadingLocation(true);
      if (displayItem.location && displayItem.location.latitude) {
        // If location exists, open map
        const { latitude, longitude } = displayItem.location;
        Linking.openURL(
          `https://www.google.com/maps?q=${latitude},${longitude}`,
        );
      } else {
        // Request update
        await dispatch(
          requestDeviceLocationThunk({ loanId: displayItem._id }),
        ).unwrap();
        showToast('Request sent. Wait ~30s and try again.');
        // Optionally trigger a refresh of loan data
        // onUpdate('REFRESH'); // If supported or just close/reopen
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      transparent
      animationType="slide"
      onRequestClose={handleModalToggle}
    >
      <View style={styles.centerWrapper}>
        <View style={styles.container}>
          <MainText style={styles.title}>
            {isBulk
              ? `Bulk Control (${selectedItems.length})`
              : 'Device Control'}
          </MainText>
          <MainText style={styles.desc}>
            {isBulk
              ? 'Applying changes to all selected devices'
              : `${displayItem?.deviceName || 'Device'}\n(ID: ${
                  displayItem?.imeiNumber1 || 'N/A'
                })`}
          </MainText>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Lock Toggle */}
            <View style={styles.row}>
              <View>
                <MainText style={styles.label}>Device Lock</MainText>
                <MainText style={styles.sublabel}>
                  Current: {displayItem?.deviceUnlockStatus || 'UNLOCKED'}
                </MainText>
              </View>
              <ToggleButton
                value={isLocked}
                onPress={handleConfirm}
                activeTitle="LOCKED"
                title="UNLOCKED"
              />
            </View>
            <View style={styles.divider} />

            {!isBulk && (
              <>
                <MainText style={styles.sectionHeader}>Live Features</MainText>
                {/* SIM INFO */}
                <View style={styles.row}>
                  <View>
                    <MainText style={styles.label}>SIM Information</MainText>
                    <MainText style={styles.sublabel}>
                      View installed SIM details
                    </MainText>
                  </View>
                  <SubmitButton
                    title={loadingSim ? '...' : 'Get Info'}
                    onPress={handleGetSimInfo}
                    mainStyle={styles.uploadBtn}
                    textStyle={{ fontSize: fontSize(12) }}
                    disabled={loadingSim}
                  />
                </View>

                {/* LOCATION */}
                <View style={styles.row}>
                  <View>
                    <MainText style={styles.label}>Device Location</MainText>
                    {displayItem.location && displayItem.location.latitude ? (
                      <MainText style={styles.sublabel} numberOfLines={1}>
                        {displayItem.location.latitude.toFixed(4)},{' '}
                        {displayItem.location.longitude.toFixed(4)}
                      </MainText>
                    ) : (
                      <MainText style={styles.sublabel}>Not Available</MainText>
                    )}
                  </View>
                  <SubmitButton
                    title={
                      displayItem.location && displayItem.location.latitude
                        ? 'Open Map'
                        : 'Request'
                    }
                    onPress={handleRequestLocation}
                    mainStyle={styles.uploadBtn}
                    textStyle={{ fontSize: fontSize(12) }}
                    disabled={loadingLocation}
                  />
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Existing Policies */}
            <View style={styles.row}>
              <View>
                <MainText style={styles.label}>Factory Reset</MainText>
              </View>
              <ToggleButton
                value={policy.isResetAllowed}
                onPress={() => onUpdate('RESET', !policy.isResetAllowed)}
                activeTitle="Allowed"
                title="Blocked"
              />
            </View>
            <View style={styles.row}>
              <View>
                <MainText style={styles.label}>Uninstall App</MainText>
              </View>
              <ToggleButton
                value={policy.isUninstallAllowed}
                onPress={() =>
                  onUpdate('UNINSTALL', !policy.isUninstallAllowed)
                }
                activeTitle="Allowed"
                title="Blocked"
              />
            </View>
            <View style={styles.row}>
              <View>
                <MainText style={styles.label}>Developer Mode</MainText>
              </View>
              <ToggleButton
                value={!policy.isDeveloperOptionsBlocked}
                onPress={() =>
                  onUpdate(
                    'DEV_MODE',
                    !(policy.isDeveloperOptionsBlocked ?? false),
                  )
                }
                activeTitle="Allowed"
                title="Blocked"
              />
            </View>
            <View style={styles.divider} />
            <MainText style={styles.sectionHeader}>App Restrictions</MainText>
            {[
              { id: 'WHATSAPP', label: 'WhatsApp', key: 'isWhatsAppBlocked' },
              {
                id: 'INSTAGRAM',
                label: 'Instagram',
                key: 'isInstagramBlocked',
              },
              { id: 'SNAPCHAT', label: 'Snapchat', key: 'isSnapchatBlocked' },
              { id: 'YOUTUBE', label: 'YouTube', key: 'isYouTubeBlocked' },
              { id: 'FACEBOOK', label: 'Facebook', key: 'isFacebookBlocked' },
              { id: 'DIALER', label: 'Dialer', key: 'isDialerBlocked' },
              { id: 'MESSAGES', label: 'Messages', key: 'isMessagesBlocked' },
              {
                id: 'PLAYSTORE',
                label: 'Play Store',
                key: 'isPlayStoreBlocked',
              },
              { id: 'CHROME', label: 'Chrome', key: 'isChromeBlocked' },
            ].map(app => (
              <View key={app.id} style={styles.row}>
                <View>
                  <MainText style={styles.label}>{app.label}</MainText>
                </View>
                <ToggleButton
                  value={policy[app.key] || false}
                  onPress={() => onUpdate(app.id, !(policy[app.key] || false))}
                  activeTitle="Blocked"
                  title="Allowed"
                />
              </View>
            ))}
            <View style={styles.divider} />
            <MainText style={styles.sectionHeader}>Remote Wallpaper</MainText>
            <View style={styles.row}>
              <View>
                <MainText style={styles.label}>Enable Wallpaper</MainText>
              </View>
              <ToggleButton
                value={policy.isWallpaperEnabled || false}
                onPress={() =>
                  onUpdate('WALLPAPER', !(policy.isWallpaperEnabled || false))
                }
                activeTitle="Enabled"
                title="Disabled"
              />
            </View>
            {policy.isWallpaperEnabled && (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <MainText style={styles.label}>Custom Wallpaper</MainText>
                  <MainText style={styles.sublabel} numberOfLines={1}>
                    {policy.wallpaperUrl || 'No image uploaded'}
                  </MainText>
                </View>
                <SubmitButton
                  title={uploadingStatus ? '...' : 'Upload'}
                  onPress={handleWallpaperUpload}
                  mainStyle={styles.uploadBtn}
                  textStyle={{ fontSize: fontSize(12) }}
                  disabled={uploadingStatus}
                />
              </View>
            )}
          </ScrollView>

          <SubmitButton
            title="Close"
            onPress={handleModalToggle}
            mainStyle={styles.closeBtn}
          />
        </View>
      </View>

      {/* SIM Detail Modal */}
      <Modal
        visible={simModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSimModalVisible(false)}
      >
        <View style={styles.centerWrapper}>
          <View
            style={[
              styles.container,
              { height: 'auto', maxHeight: SIZES.height * 0.6 },
            ]}
          >
            <MainText style={styles.title}>SIM Details</MainText>
            <ScrollView style={{ marginTop: 10 }}>
              {simDetails.length === 0 ? (
                <MainText style={{ color: COLORS.white, textAlign: 'center' }}>
                  No SIM Info Available
                </MainText>
              ) : (
                simDetails.map((sim, index) => (
                  <View
                    key={index}
                    style={{
                      marginBottom: 15,
                      padding: 10,
                      backgroundColor: COLORS.gray + '20',
                      borderRadius: 10,
                    }}
                  >
                    <MainText style={styles.label}>
                      Slot {sim.slotIndex + 1} ({sim.carrierName})
                    </MainText>
                    <MainText style={styles.sublabel}>
                      Number: {sim.number || 'Unknown'}
                    </MainText>
                    <MainText style={styles.sublabel}>
                      ICCID: {sim.iccid}
                    </MainText>
                    <MainText style={styles.sublabel}>
                      Country: {sim.countryIso}
                    </MainText>
                    <MainText style={styles.sublabel}>
                      Updated: {new Date(sim.timestamp).toLocaleString()}
                    </MainText>
                  </View>
                ))
              )}
            </ScrollView>
            <SubmitButton
              title="Close"
              onPress={() => setSimModalVisible(false)}
              mainStyle={styles.closeBtn}
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default DeviceLockModal;

const styles = StyleSheet.create({
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    width: SIZES.width * 0.95,
    maxHeight: SIZES.height * 0.8,
    backgroundColor: COLORS.black,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  title: {
    fontSize: fontSize(22),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  desc: {
    fontSize: fontSize(14),
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  scroll: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight + '20',
  },
  label: {
    fontSize: fontSize(16),
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  sublabel: {
    fontSize: fontSize(12),
    color: COLORS.gray,
  },
  sectionHeader: {
    fontSize: fontSize(16),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginVertical: 10,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.primary + '30',
    marginVertical: 10,
  },
  closeBtn: {
    marginTop: 20,
    width: '100%',
    backgroundColor: COLORS.red,
    marginHorizontal: 0,
  },
  uploadBtn: {
    width: 100,
    height: 35,
    marginHorizontal: 0,
    marginTop: 0,
    backgroundColor: COLORS.primary,
  },
});
