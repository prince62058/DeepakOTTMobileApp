import { getApi, putApi, deleteApi } from '../../services/axios/api';
import { showToast } from '../../utils/ToastAndroid';
import {
  getNotificationEndpoint,
  notificationDetailsEndpoint,
  notificationSeenEndpoint,
  clearAllNotificationsEndpoint,
} from '../api/apiEndpoint';
import { NOTIFICATION_COUNT, NOTIFICATION_DATA } from '../types';

const handleError = (error, cb, endpoint) => {
  // console.log(`${endpoint} API ERROR -->`, error)
  showToast(error);
  cb?.(false);
};

export const notificationApi =
  ({ cb }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    const params = { userId: user?._id };
    try {
      cb?.(true);
      const response = await getApi(`${getNotificationEndpoint}`, params);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${getNotificationEndpoint} API RESPONSE -->`, response?.data?.data)
        dispatch({ type: NOTIFICATION_DATA, payload: response?.data?.data });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, getNotificationEndpoint);
    }
  };

export const markSeenApi =
  ({ id, cb }) =>
  async dispatch => {
    const params = { id };
    try {
      const response = await getApi(`${notificationDetailsEndpoint}`, params);
      if (response?.status === 200 || response?.status === 201) {
        cb?.();
        // Also update the count when something is marked as seen
        dispatch(notificationCountApi({}));
      }
    } catch (error) {
      console.log(`${notificationDetailsEndpoint} API ERROR -->`, error);
    }
  };

export const notificationCountApi =
  ({ cb }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    if (!user?._id) return;
    const params = { userId: user?._id };
    try {
      const response = await getApi(`${notificationSeenEndpoint}`, params);
      if (response?.status === 200 || response?.status === 201) {
        dispatch({ type: NOTIFICATION_COUNT, payload: response?.data?.data });
        cb?.(false);
      }
    } catch (error) {
      console.log(`${notificationSeenEndpoint} API ERROR -->`, error);
      cb?.(false);
    }
  };

export const clearAllNotificationsApi =
  ({ cb }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    if (!user?._id) return;
    const params = { userId: user?._id };
    try {
      const response = await deleteApi(
        `${clearAllNotificationsEndpoint}`,
        params,
      );
      if (response?.status === 200 || response?.status === 201) {
        // Refresh notifications and count after clearing
        dispatch(notificationApi({}));
        dispatch(notificationCountApi({}));
        cb?.(true);
      }
    } catch (error) {
      console.log(`${clearAllNotificationsEndpoint} API ERROR -->`, error);
      cb?.(false);
    }
  };
