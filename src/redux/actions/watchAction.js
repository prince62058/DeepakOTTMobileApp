import { getApi, postApi, putApi } from '../../services/axios/api';
import { showToast } from '../../utils/ToastAndroid';
import {
  createRateEndpoint,
  getMovieDetailsEndpoint,
  getMovieTrailerEndpoint,
  updateFreeWatchEndpoint,
  updateWatchEndpoint,
  watchlistEndpoint,
} from '../api/apiEndpoint';
import {
  MOVIESERIES_DETAILS,
  MOVIESERIES_TRAILER,
  WATCHLIST_DATA,
} from '../types';
import { getProfileApi } from './authAction';
import { homeApi } from './homeAction';

const handleError = (error, cb, endpoint) => {
  console.log(`${endpoint} API ERROR -->`, error);
  showToast(error);
  cb?.(false);
};

export const watchListApi =
  ({ cb, page = 1, limit = 20 }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    const params = { userId: user?._id, page, limit };
    try {
      cb?.(true);
      const response = await getApi(`${watchlistEndpoint}`, params);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${watchlistEndpoint} API RESPONSE -->`, response?.data)
        dispatch({ type: WATCHLIST_DATA, payload: response?.data });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, watchlistEndpoint);
    }
  };

export const updateWatchApi =
  ({ cb, data }) =>
  async (dispatch, getState) => {
    if (data?.playTimeStamps === 0) return;
    try {
      cb?.(true);
      const response = await putApi(`${updateWatchEndpoint}`, data);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${updateWatchEndpoint} API RESPONSE -->`, response?.data?.data)
        await dispatch(homeApi({})); // Await this to refresh home data
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, updateWatchEndpoint);
    }
  };

export const updateFreeWatchApi =
  ({ cb, data }) =>
  async (dispatch, getState) => {
    if (data?.playTimeStamps === 0) return;
    try {
      cb?.(true);
      const response = await postApi(`${updateFreeWatchEndpoint}`, data);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${updateFreeWatchEndpoint} API RESPONSE -->`, response?.data)
        dispatch(getProfileApi({}));
        await dispatch(homeApi({})); // Await this to refresh home data
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, updateFreeWatchEndpoint);
    }
  };

export const getMovieTrailerApi =
  ({ cb, id }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    const params = { userId: user?._id, movieOrSeriesId: id };
    // console.log('Trailor api params ---> ', params)
    try {
      cb?.(true);
      const response = await getApi(`${getMovieTrailerEndpoint}`, params);
      if (response?.status === 200 || response?.status === 201) {
        console.log(
          `${getMovieTrailerEndpoint} API RESPONSE -->`,
          response?.data,
        );
        dispatch({
          type: MOVIESERIES_TRAILER,
          payload: {
            trailer: response?.data?.data,
            morelike: response?.data?.moreLikeThis,
          },
        });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, getMovieTrailerEndpoint);
    }
  };

export const getMovieDetailsApi =
  ({ cb, id }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    const params = { userId: user?._id, movieOrSeriesId: id };
    try {
      cb?.(true);
      const response = await getApi(`${getMovieDetailsEndpoint}`, params);
      if (response?.status === 200 || response?.status === 201) {
        console.log(
          `${getMovieDetailsEndpoint} API RESPONSE -->`,
          response?.data?.data,
        );
        dispatch({ type: MOVIESERIES_DETAILS, payload: response?.data?.data });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, getMovieDetailsEndpoint);
    }
  };

export const createRateApi =
  ({ cb, id }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    const data = { userId: user?._id, movieOrSeriesId: id };
    try {
      cb?.(true);
      const response = await postApi(`${createRateEndpoint}`, data);
      if (response?.status === 200 || response?.status === 201) {
        console.log(`${createRateEndpoint} API RESPONSE -->`, response?.data);
        // showToast('Added to wishlist')
        dispatch(getMovieTrailerApi({ id }));
        // getMovieTrailerApi
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, createRateEndpoint);
    }
  };
