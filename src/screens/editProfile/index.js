import { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/customButton';
import CustomInput from '../../components/customInput';
import MainView from '../../components/mainView';
import { icons, SIZES } from '../../constants';
import styles from './styles';
import { showToast } from '../../utils/ToastAndroid';
import { updateProfileApi } from '../../redux/actions/authAction';
import { uploadImage } from '../../redux/actions/companyAction';
import { pickImage } from '../../services/picker/cropImagePicker';
import CustomHeader from '../../components/header/CustomHeader';

const EditProfile = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    image: user?.image || '',
    name: user?.name || '',
    email: user?.email || '',
    number: String(user?.number) || '',
  });
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (value?.length > 0) handleErrorChange(key, null);
  };

  const [error, setError] = useState({});
  const handleErrorChange = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async () => {
    const image = await pickImage();
    if (image) {
      let formData = new FormData();
      formData.append('image', image);
      dispatch(
        uploadImage({
          data: formData,
          success: data => handleChange('image', data),
        }),
      );
    }
  };

  const validate = () => {
    const newErr = {};
    if (!form.name.trim()) newErr.name = t('common.name_required') || 'Name is required';
    if (!form.email.trim()) {
      newErr.email = t('common.email_required') || 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(form.email.trim())) {
      newErr.email =
        t('common.email_invalid') || 'Please enter a valid Gmail address (must end with @gmail.com)';
    }

    setError(newErr);
    return Object.keys(newErr).length === 0;
  };
  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      userId: user?._id,
    };

    if (form?.name?.trim() && form?.name !== user?.name) {
      payload.name = form?.name?.trim();
    }
    if (form?.email?.trim() && form?.email !== user?.email) {
      payload.email = form?.email?.trim();
    }
    if (form?.number?.trim() && form?.number !== String(user?.number)) {
      payload.number = form?.number?.trim();
    }
    if (form.image && form.image !== user.image) {
      payload.image = form.image;
    }

    if (Object.keys(payload).length <= 1) {
      showToast(t('common.no_changes') || 'No changes to update.');
      return;
    }

    dispatch(updateProfileApi({ data: payload, cb: setLoading, navigation }));
  };

  return (
    <MainView
      transparent
      bottomSafe={false}
      keyboardBehavior={'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
    >
      <CustomHeader title={t('common.edit_profile') || 'Edit Profile'} />
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileContainer}>
            <Image
              style={styles.profilePic}
              source={
                form?.image
                  ? { uri: form.image }
                  : {
                      uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                    }
              }
            />
            <Pressable onPress={handleImageUpload} style={styles.edit}>
              <Image
                source={icons.EditProfile}
                style={{ width: SIZES.width * 0.1, height: SIZES.width * 0.1 }}
              />
            </Pressable>
          </View>
          <View style={styles.inputView}>
            <CustomInput
              label={t('common.full_name') || 'Full Name'}
              placeholder={t('common.enter_name') || 'Enter Your Name'}
              leftIcon={icons.profile}
              value={form?.name}
              onChangeText={text => handleChange('name', text)}
              error={error.name}
            />

            <CustomInput
              label={t('common.your_email') || 'Your Email'}
              placeholder={t('common.enter_email') || 'Enter Your Email'}
              leftIcon={icons.email}
              value={form?.email}
              onChangeText={text => handleChange('email', text)}
              error={error.email}
              email
            />

            <CustomInput
              label={t('common.mobile_number') || 'Mobile Number'}
              placeholder={t('common.enter_mobile') || 'Enter mobile number'}
              mobile
              value={form?.number}
              onChangeText={text => handleChange('number', text)}
              noteditable
            />
          </View>
        </ScrollView>

        <CustomButton
          title={t('common.update') || 'Update'}
          buttonStyle={{
            width: SIZES.width * 0.92,
            alignSelf: 'center',
            marginBottom: SIZES.h5,
          }}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </MainView>
  );
};

export default EditProfile;
