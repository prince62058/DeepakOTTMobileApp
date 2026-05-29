/*
    Centralized API Service using Axios
    ------------------------------------
    Why we use this:
    - To avoid repeating axios setup (baseURL, headers, error handling) in every request.
    - To keep all CRUD (GET, POST, PUT, DELETE) requests consistent and reusable.
    - To automatically attach authentication tokens with every request.
    - To handle common errors (401, 404, network issues) in one place.

    Why it is necessary:
    - In real projects, APIs are called from many different screens/components.
    - Without a centralized service, you'd duplicate axios/fetch logic everywhere.
    - This improves maintainability: if baseURL or headers change, update once here.
    - Also makes debugging easier with request/response interceptors.

    How it works:
    - We create an axios instance (`api`) with baseURL, timeout, and default headers.
    - Request Interceptor:
        * Runs before each API call.
        * Fetches secure token from Keychain.
        * If token exists, attaches it as "Authorization: Bearer <token>" header.
        * Adds metadata (startTime) for logging request duration.
    - Response Interceptor:
        * Runs after API response is received.
        * Logs request duration (helpful for performance monitoring).
        * Handles errors gracefully, returning a user-friendly message.
    - CRUD Helper Functions:
        * getApi   → calls api.get(endpoint, { params })
        * postApi  → calls api.post(endpoint, data, { params, headers })
        * putApi   → calls api.put(endpoint, data, { params, headers })
        * deleteApi→ calls api.delete(endpoint, { params })
    - Special handling for POST & PUT:
        * Accepts `params` (query string).
        * If `media=true`, automatically sets Content-Type to multipart/form-data 
          (used for file/image/video uploads).
*/

import axios from 'axios';
import { getSecureItem } from '../storage/keychain';

import { Platform } from 'react-native';

// For Physical Devices & Emulators: Use your machine's local IP address
// You can find it by running 'ifconfig' (Mac/Linux) or 'ipconfig' (Windows)
// const LOCAL_IP = '192.168.29.158'; 
// const BASE_URL = Platform.select({
//   android: `http://10.0.2.2:4555/api`, // Works for Android Emulator
//   ios: `http://localhost:4555/api`,     // Works for iOS Simulator
//   default: `http://${LOCAL_IP}:4555/api` // Fallback for physical devices
// });

const BASE_URL = 'https://api.deepent.in/api';

export const api = axios.create({
  baseURL: BASE_URL,

  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    const token = await getSecureItem('USER_TOKEN');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.metadata = { startTime: new Date() };
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => {
    const method = response.config.method?.toUpperCase();
    const url = response.config.url;
    const duration = Date.now() - response.config.metadata.startTime;
    // console.groupCollapsed(
    //     `%c🚀 API Response %c ${method} %c${url} %c(${duration}ms)`,
    //     "color: white; background: #4CAF50; padding: 2px 6px; border-radius: 4px;",
    //     "color: #2196F3; font-weight: bold;",
    //     "color: #FF9800;",
    //     "color: #9E9E9E;"
    // )
    // console.log("📦 Data:", response?.data)
    // console.groupEnd()
    // console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`, response?.data)
    return response;
  },
  error => {
    console.log(error?.response);
    let errorMessage;
    if (error.status === 404) {
      errorMessage = 'Requested resource not found';
    } else {
      errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.request?._response ||
        error?.message ||
        'Something went wrong. Please try again.';
    }
    return Promise.reject(errorMessage);
  },
);

// ---------- API Helpers ----------

export const getApi = async (endpoint, params) => {
  try {
    return await api.get(endpoint, { params });
  } catch (error) {
    throw error;
  }
};

export const postApi = async (endpoint, data, params, media = false) => {
  try {
    return await api.post(endpoint, data, {
      params,
      headers: media ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  } catch (error) {
    throw error;
  }
};

export const putApi = async (endpoint, data, params, media = false) => {
  try {
    return await api.put(endpoint, data, {
      params,
      headers: media ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  } catch (error) {
    throw error;
  }
};

export const deleteApi = async (endpoint, params) => {
  try {
    return await api.delete(endpoint, { params });
  } catch (error) {
    throw error;
  }
};
