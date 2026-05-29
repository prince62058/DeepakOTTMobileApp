import { getApi, postApi } from '../../services/axios/api';
import { showToast } from '../../utils/ToastAndroid';
import {
  createPurchaseEndpoint,
  createRentOnMoviewEndpoint,
  getSubscriptionEndpoint,
} from '../api/apiEndpoint';
import { SUBSCRIPTION_DATA } from '../types';
import { getProfileApi } from './authAction';

const handleError = (error, cb, endpoint) => {
  console.log(`${endpoint} API ERROR -->`, error);
  showToast(error);
  cb?.(false);
};

export const subscriptionApi =
  ({ cb }) =>
  async (dispatch, getState) => {
    try {
      cb?.(true);
      const response = await getApi(`${getSubscriptionEndpoint}`);
      if (response?.status === 200 || response?.status === 201) {
        console.log(
          `${getSubscriptionEndpoint} API RESPONSE -->`,
          response?.data?.data,
        );
        dispatch({ type: SUBSCRIPTION_DATA, payload: response?.data?.data });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, getSubscriptionEndpoint);
    }
  };

export const takeSubscriptionApi =
  ({ cb, data, onSuccess }) =>
  async (dispatch, getState) => {
    try {
      cb?.(true);
      const response = await postApi(`${createPurchaseEndpoint}`, data);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${createPurchaseEndpoint} API RESPONSE -->`, response?.data?.data)
        showToast('Subscription purchased successfully');
        dispatch(subscriptionApi({}));
        dispatch(getProfileApi({}));
        cb?.(false);
        onSuccess?.();
      }
    } catch (error) {
      handleError(error, cb, createPurchaseEndpoint);
    }
  };

export const movieOnrentApi =
  ({ cb, data }) =>
  async (dispatch, getState) => {
    console.log('red', data);

    try {
      cb?.(true);
      const response = await postApi(`${createRentOnMoviewEndpoint}`, data);
      if (response?.status === 200 || response?.status === 201) {
        console.log(
          `${createRentOnMoviewEndpoint} API RESPONSE -->`,
          response?.data?.data,
        );
        showToast('Subscription purchased successfully');
        dispatch(subscriptionApi({}));
        dispatch(getProfileApi({}));
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, createRentOnMoviewEndpoint);
    }
  };
