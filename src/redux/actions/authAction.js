import { getApi, postApi, putApi } from '../../services/axios/api';
import {
  deleteSecureItem,
  setSecureItem,
} from '../../services/storage/keychain';
import { showToast } from '../../utils/ToastAndroid';
import {
  getProfileEndpoint,
  registerEndpoint,
  loginEndpoint,
  sendOtpEndpoint,
  updateProfileEndpoint,
  verifyOtpEndpoint,
  getLanguageEndpoint,
  getGenreEndpoint,
} from '../api/apiEndpoint';
import { persistor } from '../store';
import {
  BANK_DATA,
  GENRE_DATA,
  LANGUAGE_DATA,
  USER_DATA,
  USER_TOKEN,
} from '../types';

const handleError = (error, cb, endpoint) => {
  // console.log(`${endpoint} API ERROR -->`, error)
  showToast(error);
  cb?.(false);
};

//  1.SEND OTP DONE
export const sendOtpApi =
  ({ payload, cb, navigation }) =>
  async dispatch => {
    try {
      cb?.(true);
      const response = await postApi(sendOtpEndpoint, payload);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${sendOtpEndpoint} API RESPONSE -->`, response?.data)
        cb?.(false);
        navigation.navigate('Otp', { number: payload.number });
      }
    } catch (error) {
      handleError(error, cb, sendOtpEndpoint);
    }
  };

// 2.VERIFY OTP DONE
export const verifyOtpApi =
  ({ payload, cb, navigation }) =>
  async dispatch => {
    try {
      cb?.(true);
      const response = await postApi(verifyOtpEndpoint, payload);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${verifyOtpEndpoint} API RESPONSE -->`, response?.data?.data)
        const { token, ...user } = response?.data?.data;
        if (response?.data?.data?.existingUser) {
          dispatch({ type: USER_TOKEN, payload: { token, user } });
          await setSecureItem('USER_TOKEN', response?.data?.data);
        } else {
          dispatch({ type: USER_DATA, payload: response?.data?.data });
          navigation.navigate('CompleteProfile');
        }
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, verifyOtpEndpoint);
    }
  };

// 3.CREATE USER PROFILE DONE
export const registerApi =
  ({ payload, cb, navigation }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;

    try {
      cb?.(true);
      const response = await postApi(registerEndpoint, payload);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${registerEndpoint} API RESPONSE -->`, response?.data?.data)
        dispatch({
          type: USER_TOKEN,
          payload: { token: user?.token, user: response?.data?.data },
        });
        await setSecureItem('USER_TOKEN', user?.token);
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, registerEndpoint);
    }
  };

// 4. LOGOUT API DONE
export const logoutApi = () => async dispatch => {
  dispatch({ type: USER_TOKEN, payload: { token: null, user: null } });
  dispatch({ type: BANK_DATA, payload: null });
  // await persistor.purge()
  await deleteSecureItem('USER_TOKEN');
};

// GET PROFILE DONE
export const getProfileApi =
  ({ cb }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    try {
      cb?.(true);
      const response = await getApi(`${getProfileEndpoint}/${user?._id}`);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${getProfileEndpoint} API RESPONSE -->`, response?.data?.find || response?.data?.data)
        dispatch({
          type: USER_DATA,
          payload: response?.data?.find ?? response?.data?.data,
        });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, getProfileEndpoint);
    }
  };

// UPDATE PROFILE API DOME
export const updateProfileApi =
  ({ data, cb, navigation }) =>
  async (dispatch, getState) => {
    try {
      cb?.(true);
      const response = await putApi(`${updateProfileEndpoint}`, data);
      // console.log(`${updateProfileEndpoint} API RESPONSE -->`, response)
      if (response?.status === 200 || response?.status === 201) {
        // showToast('Profile updated successfully')
        if (navigation) {
          showToast('Profile updated successfully');
          navigation.goBack();
        }
        dispatch(getProfileApi({}));
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, updateProfileEndpoint);
    }
  };

// GET LANGUAGE API DONE
export const getLanguageApi =
  ({ cb }) =>
  async (dispatch, getState) => {
    try {
      cb?.(true);
      const response = await getApi(`${getLanguageEndpoint}`);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${getLanguageEndpoint} API RESPONSE -->`, response?.data?.data)
        dispatch({ type: LANGUAGE_DATA, payload: response?.data?.data });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, getLanguageEndpoint);
    }
  };

// GET GENRE API DONE
export const getGenreApi =
  ({ cb }) =>
  async (dispatch, getState) => {
    try {
      cb?.(true);
      const response = await getApi(`${getGenreEndpoint}`);
      if (response?.status === 200 || response?.status === 201) {
        console.log(
          `${getGenreEndpoint} API RESPONSE -->`,
          response?.data?.data,
        );
        dispatch({ type: GENRE_DATA, payload: response?.data?.data });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, getGenreEndpoint);
    }
  };
