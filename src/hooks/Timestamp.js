import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateWatchApi,
  updateFreeWatchApi,
} from '../redux/actions/watchAction';

function secondsToNearestMinutes(seconds) {
  const s = Number(seconds) || 0;
  if (s <= 0) return 0;
  return Math.round(s / 60);
}

export const useWatchTracker = (
  userId,
  movieOrSeriesId,
  playTimeStamps,
  isFullScreen,
) => {
  const intervalRef = useRef(null);
  const timeRef = useRef(playTimeStamps);
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    timeRef.current = playTimeStamps;
  }, [playTimeStamps]);

  useEffect(() => {
    if (!isFullScreen || !movieOrSeriesId) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    console.log('Hook running...', playTimeStamps);

    const sendTimestamp = () => {
      const payload = {
        userId,
        movieOrSeriesId,
        playTimeStamps: Math.max(0, timeRef.current || 0),
      };

      // Debug: Log payload
      console.log('⏰ Hook Sending Timestamp:', {
        params: { userId, movieOrSeriesId, isFullScreen },
        payload,
      });

      const isFreeUser =
        user?.planDetails?.planType === 'FREE_PLAN' || !user?.isActivePlan;

      if (isFreeUser) {
        // Fix: Send SECONDS, not minutes, if the backend expects seconds.
        // Previous code sent `secondsToNearestMinutes(timeRef.current)` which might be wrong if backend treats it as seconds.
        // Let's try sending raw seconds first to be consistent with `updateWatchApi`.
        const freePayload = { ...payload };
        console.log('🚀 Hook dispatching updateFreeWatchApi', freePayload);
        dispatch(updateFreeWatchApi({ data: freePayload }));
      } else {
        console.log('🚀 Hook dispatching updateWatchApi', payload);
        dispatch(updateWatchApi({ data: payload }));
      }
    };

    sendTimestamp();
    intervalRef.current = setInterval(sendTimestamp, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [movieOrSeriesId, userId, isFullScreen]);
};
