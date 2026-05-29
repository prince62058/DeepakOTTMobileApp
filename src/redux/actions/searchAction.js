import { deleteApi, getApi, postApi } from '../../services/axios/api';
import { showToast } from '../../utils/ToastAndroid';
import {
  createTopSearchEndpoint,
  searchMoviewSeriesEndpoint,
  topSearchEndpoint,
  deleteTopSearchEndpoint,
} from '../api/apiEndpoint';
import { TOP_SEARCHES, MOVIESERIES_SEARCH, GENRE_MOVIES } from '../types';

const handleError = (error, cb, endpoint) => {
  console.log(`${endpoint} API ERROR -->`, error);
  showToast(error);
  cb?.(false);
};

export const getTopSearchApi =
  ({ cb }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    try {
      cb?.(true);
      const response = await getApi(`${topSearchEndpoint}`);
      if (response?.status === 200 || response?.status === 201) {
        console.log(
          `${topSearchEndpoint} API RESPONSE -->`,
          response?.data?.data,
        );
        dispatch({ type: TOP_SEARCHES, payload: response?.data?.data });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, topSearchEndpoint);
    }
  };

export const searchMovieSeriesApi =
  ({ cb, search, mainType, genre }) =>
  async (dispatch, getState) => {
    const { user } = getState().auth;
    const params = {
      search,
      ...(mainType && { mainType }),
      ...(genre && { genre }),
    };
    try {
      cb?.(true);
      const response = await getApi(`${searchMoviewSeriesEndpoint}`, params);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`${searchMoviewSeriesEndpoint} API RESPONSE -->`, response?.data?.data)
        dispatch({ type: MOVIESERIES_SEARCH, payload: response?.data?.data });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, searchMoviewSeriesEndpoint);
    }
  };

export const createTopSearchApi =
  ({ cb, payload }) =>
  async (dispatch, getState) => {
    try {
      const response = await postApi(`${createTopSearchEndpoint}`, payload);
      if (response?.status === 200 || response?.status === 201) {
        console.log(
          `${createTopSearchEndpoint} API RESPONSE -->`,
          response?.data?.data,
        );
      }
    } catch (error) {
      handleError(error, cb, createTopSearchEndpoint);
    }
  };

export const deleteTopSearchApi =
  ({ id, cb }) =>
  async (dispatch, getState) => {
    try {
      const response = await deleteApi(`${deleteTopSearchEndpoint}/${id}`);
      if (response?.status === 200 || response?.status === 201) {
        dispatch(getTopSearchApi({}));
        cb?.(true);
      }
    } catch (error) {
      handleError(error, cb, deleteTopSearchEndpoint);
    }
  };

export const getGenreMoviewApi =
  ({ cb, genre, mainType, page = 1, limit = 21 }) =>
  async (dispatch, getState) => {
    const params = { genre, page, limit, ...(mainType && { mainType }) };
    try {
      cb?.(true);
      const response = await getApi(`${searchMoviewSeriesEndpoint}`, params);
      if (response?.status === 200 || response?.status === 201) {
        // console.log(`Genre movies API RESPONSE -->`, response?.data)
        dispatch({ type: GENRE_MOVIES, payload: response?.data });
        cb?.(false);
      }
    } catch (error) {
      handleError(error, cb, searchMoviewSeriesEndpoint);
    }
  };
