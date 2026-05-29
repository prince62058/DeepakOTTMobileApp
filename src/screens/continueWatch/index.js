import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  BackHandler,
  ScrollView,
  Alert,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from 'react-native-gesture-handler';
import DeviceBrightness from 'react-native-device-brightness';
import { VolumeManager } from 'react-native-volume-manager';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/customButton';
import MainView from '../../components/mainView';
import MoviePoster from '../../components/moviePoster';
import { COLORS, icons, images, SIZES } from '../../constants';
import { useWatchTracker } from '../../hooks/Timestamp';
import TransliteratedText from '../../components/transliteratedText';
import {
  createRateApi,
  getMovieDetailsApi,
  getMovieTrailerApi,
  updateWatchApi,
  updateFreeWatchApi,
} from '../../redux/actions/watchAction';
import { createWishlistApi } from '../../redux/actions/wishlistAction';
import { showToast } from '../../utils/ToastAndroid';
import styles from './styles';
import { movieOnrentApi } from '../../redux/actions/subscriptionAction';
import { durationHook } from '../../hooks/DurationHook';
import { shareFile } from '../../services/share/ShareFile';
import {
  saveLastWatchedEpisode,
  getLastWatchedEpisode,
} from '../../utils/lastWatched';
import { getApi } from '../../services/axios/api';
import { getMovieDetailsEndpoint } from '../../redux/api/apiEndpoint';
import { store } from '../../redux/store';

const ContinueWatch = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(route?.params?.data ?? {});
  const timeStamp = Math.max(0, route?.params?.timeStamp ?? 0);
  const deepLinkId = route?.params?.id;

  useEffect(() => {
    if (route?.params?.data) {
      setData(route.params.data);
    } else if (deepLinkId) {
      console.log('🔗 Deep Link ID detected in Screen:', deepLinkId);
      fetchMovieData(deepLinkId);
    }
  }, [route?.params?.data, deepLinkId]);

  const fetchMovieData = async id => {
    try {
      const state = store.getState();
      const userId = state.auth?.user?._id;
      const params = { userId, movieOrSeriesId: id };
      const res = await getApi(getMovieDetailsEndpoint, params);
      if (res?.status === 200 || res?.status === 201) {
        const movieData = res?.data?.data;
        if (movieData) {
          setData(movieData);
        }
      }
    } catch (error) {
      console.log('Error fetching deep linked movie:', error);
    }
  };

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { movieTrailer, moreLikeThis, movieDetails } = useSelector(
    state => state.watchlist,
  );

  // 💾 Track last watched episode for this series
  // Ref for data to access fresh state in validation/unmount
  const dataRef = useRef(data);
  const userRef = useRef(user);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (data?.mainType === 'EPISODE' && data?.parentsSeries) {
      saveLastWatchedEpisode(data.parentsSeries, data._id);
    }
  }, [data?._id]);

  const videoRef = useRef(null);
  const [rating, setRating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showNextEpisodeBtn, setShowNextEpisodeBtn] = useState(false);
  const [showSkipBtn, setShowSkipBtn] = useState(false);
  const [showNetworkError, setShowNetworkError] = useState(false);

  const [isSeeking, setIsSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playDuration, setPlayDuration] = useState(timeStamp ?? 0);
  const [resizeMode, setResizeMode] = useState('cover');
  const [showSettings, setShowSettings] = useState(false);
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedVideoTrack, setSelectedVideoTrack] = useState({
    type: 'auto',
  });
  const [selectedAudioTrack, setSelectedAudioTrack] = useState({
    type: 'index',
    value: 0,
  });
  const [buffering, setBuffering] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔆 Brightness & 🔊 Volume Gestures State
  const [brightness, setBrightness] = useState(0.5);
  const [volume, setVolume] = useState(0.5);
  const [showIndicator, setShowIndicator] = useState(false);
  const [indicatorType, setIndicatorType] = useState('brightness'); // 'brightness' | 'volume'
  const [indicatorValue, setIndicatorValue] = useState(0.5);
  const indicatorTimeoutRef = useRef(null);
  const initialBrightnessRef = useRef(0.5);
  const initialVolumeRef = useRef(0.5);
  const isLockedSideRef = useRef(null); // 'left' | 'right' | null

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const currentTimeRef = useRef(timeStamp ?? 0);

  useEffect(() => {
    setIsSeeking(false);
    setBuffering(false);
    setShowNextEpisodeBtn(false);
    setShowSkipBtn(false);
    setShowNetworkError(false);

    // 🧹 Strict State Reset for new Episode/Movie
    console.log('🎬 Resetting state for:', data?._id);
    const initialTime = timeStamp ?? 0;
    setPlayDuration(initialTime);
    currentTimeRef.current = initialTime;

    // 🛡️ Episode duration safety: Only use data duration if it's NOT a Series container
    const dbDuration = (data?.totalDuration || 0) * 60;
    setDuration(dbDuration);
  }, [data?._id]);

  const handleProgress = progressValue => {
    const freshTime = Math.floor(progressValue.currentTime || 0);
    // 🛡️ Guard against NaN or negative values
    if (isNaN(freshTime) || freshTime < 0) return;

    // 🎬 Aggressive Duration Fix: Always sync with player's seekableDuration if it differs
    // Prioritize PLAYER duration over DB duration if they mismatch
    if (
      progressValue.seekableDuration > 0 &&
      Math.abs(progressValue.seekableDuration - duration) > 2
    ) {
      console.log(
        '📏 Dynamic Duration Update (Progress):',
        progressValue.seekableDuration,
      );
      setDuration(progressValue.seekableDuration);
    }

    currentTimeRef.current = freshTime;
    if (!isSeeking) {
      setPlayDuration(freshTime);
    }

    // Higher frequency debug log to track why it might be "stuck"
    if (freshTime % 2 === 0) {
      console.log(
        `⏱️ DBG: Time=${freshTime}s | Seek=${isSeeking} | Dur=${duration}`,
      );
    }

    // Show "Next Episode" and "Skip" button if within last 90 seconds (1.5 minutes) (only for EPISODES)
    const isEpisodeType = data?.mainType === 'EPISODE';
    if (
      isEpisodeType &&
      duration > 0 &&
      duration - currentTimeRef.current <= 90
    ) {
      if (!showNextEpisodeBtn) setShowNextEpisodeBtn(true);
      if (!showSkipBtn) setShowSkipBtn(true);
    } else {
      if (showNextEpisodeBtn) setShowNextEpisodeBtn(false);
      if (showSkipBtn) setShowSkipBtn(false);
    }
  };

  const handleLoad = meta => {
    console.log('🎬 Video Loaded. Meta:', meta);

    // 🎬 Use player duration if available, else use DB duration (but only if it's the specific episode/movie duration)
    const metaDuration = meta.duration || 0;
    const dbDuration = (data?.totalDuration || 0) * 60;
    const finalDuration = metaDuration > 0 ? metaDuration : dbDuration;

    console.log(
      '🎬 Duration Set:',
      finalDuration,
      '(meta:',
      metaDuration,
      'db:',
      dbDuration,
      ')',
    );
    setDuration(finalDuration);
    if (meta.videoTracks) setVideoTracks(meta.videoTracks);
    if (meta.audioTracks) setAudioTracks(meta.audioTracks);

    // Resume from current progress (handles exiting fullscreen/Modal)
    let resumeTime = currentTimeRef.current || playDuration || timeStamp || 0;

    // 🛡️ Extra safety for resumeTime
    if (isNaN(resumeTime) || resumeTime < 0) resumeTime = 0;

    if (resumeTime > 0 && videoRef.current) {
      console.log(`🔄 Resuming playback at: ${resumeTime}s`);
      videoRef.current.seek(resumeTime);
    }
  };

  // --- Brightness & Volume Gesture Logic ---
  useEffect(() => {
    // Initial fetch of current levels
    const fetchInitialLevels = async () => {
      try {
        let currentBrightness = await DeviceBrightness.getBrightnessLevel();
        console.log('🔆 Initial Brightness (Raw):', currentBrightness);

        // If -1, it means "system default", so we need to fetch the actual system level
        if (currentBrightness === -1) {
          currentBrightness = await DeviceBrightness.getSystemBrightnessLevel();
          console.log('🔆 System Brightness Fallback:', currentBrightness);
        }

        setBrightness(currentBrightness);
        initialBrightnessRef.current = currentBrightness;

        const { volume: currentVolume } = await VolumeManager.getVolume();
        setVolume(currentVolume);
        initialVolumeRef.current = currentVolume;
      } catch (err) {
        console.log('Error fetching initial levels:', err);
      }
    };
    fetchInitialLevels();
  }, [isFullScreen]);

  const onGestureEvent = event => {
    const { translationY, x, state } = event.nativeEvent;

    // Handle BEGAN and also ACTIVE if isLockedSideRef is not yet set
    if (
      state === State.BEGAN ||
      (state === State.ACTIVE && !isLockedSideRef.current)
    ) {
      if (!isLockedSideRef.current) {
        initialBrightnessRef.current = brightness;
        initialVolumeRef.current = volume;
        isLockedSideRef.current = x < SCREEN_WIDTH / 2 ? 'left' : 'right';
        console.log('👆 Gesture Lock:', isLockedSideRef.current, 'at x:', x);
      }
    }

    if (state === State.ACTIVE && isLockedSideRef.current) {
      const isLeft = isLockedSideRef.current === 'left';
      const sensitivity = 400;
      const delta = -translationY / sensitivity;

      if (isLeft) {
        const newBrightness = Math.max(
          0.01,
          Math.min(1, initialBrightnessRef.current + delta),
        );
        setBrightness(newBrightness);
        setIndicatorType('brightness');
        setIndicatorValue(newBrightness);
        DeviceBrightness.setBrightnessLevel(newBrightness);
      } else {
        const newVolume = Math.max(
          0,
          Math.min(1, initialVolumeRef.current + delta),
        );
        setVolume(newVolume);
        setIndicatorType('volume');
        setIndicatorValue(newVolume);
        VolumeManager.setVolume(newVolume, { showUI: false });
      }

      setShowIndicator(true);
      if (indicatorTimeoutRef.current)
        clearTimeout(indicatorTimeoutRef.current);
      indicatorTimeoutRef.current = setTimeout(() => {
        setShowIndicator(false);
      }, 1500);
    }
  };

  const onHandlerStateChange = event => {
    const { state } = event.nativeEvent;
    if (
      state === State.END ||
      state === State.CANCELLED ||
      state === State.FAILED
    ) {
      console.log('👇 Gesture Clear (State:', state, ')');
      isLockedSideRef.current = null;
    }
  };

  const IndicatorOverlay = ({ type, value, visible }) => {
    if (!visible) return null;
    const isBrightness = type === 'brightness';
    return (
      <View
        style={[
          styles.indicatorSideOverlay,
          isBrightness ? styles.leftSide : styles.rightSide,
        ]}
      >
        <View style={styles.indicatorContainerSide}>
          <Icon
            name={isBrightness ? 'weather-sunny' : 'volume-high'}
            size={22}
            color="white"
            style={{ marginBottom: 15 }}
          />
          <View style={styles.indicatorTrackVertical}>
            <View
              style={[
                styles.indicatorFillVertical,
                { height: `${value * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  const handleSeek = seconds => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, playDuration + seconds));
      videoRef.current.seek(newTime);
      setPlayDuration(newTime);
      currentTimeRef.current = Math.floor(newTime);
    }
  };

  const toggleResizeMode = () => {
    const modes = ['contain', 'cover', 'stretch'];
    const nextIndex = (modes.indexOf(resizeMode) + 1) % modes.length;
    setResizeMode(modes[nextIndex]);
    showToast(`Resize: ${modes[nextIndex]}`);
  };

  const handleNextEpisode = () => {
    if (movieDetails?.episodes?.length > 0) {
      const currentIndex = movieDetails.episodes.findIndex(
        ep => ep._id === data?._id,
      );
      if (
        currentIndex !== -1 &&
        currentIndex < movieDetails.episodes.length - 1
      ) {
        const nextEpisode = movieDetails.episodes[currentIndex + 1];
        console.log('⏭ Skipped to next episode:', nextEpisode.name);
        showToast(`Playing: ${nextEpisode.name || 'Next Episode'}`);
        navigation.replace('ContinueWatch', {
          data: nextEpisode,
          autoPlay: true,
        });
      } else {
        showToast('No more episodes available.');
      }
    }
  };

  const handleSkip = async () => {
    console.log('🔙 Skipping to Home...');
    if (isFullScreen) {
      Orientation.lockToPortrait();
      setIsFullScreen(false);
      setIsLandscape(false);
    }
    try {
      await saveWatchProgress();
    } catch (e) {
      console.log('Save on skip failed', e);
    }
    navigation.navigate('BottomTab', { screen: 'Home' });
  };

  const handleRetry = () => {
    setShowNetworkError(false);
    setBuffering(true);
    // Force video reload by toggling paused or re-seeking
    if (videoRef.current) {
      const currentTime = currentTimeRef.current;
      videoRef.current.seek(currentTime);
      setPaused(false);
    }
  };

  // Auto-save watch progress
  const saveIntervalRef = useRef(null);

  const saveWatchProgress = async () => {
    // Access fresh state via Refs
    const currentData = dataRef.current;
    const currentUser = userRef.current;

    // 🚫 Don't save progress for Series container (Only Episodes/Movies)
    // 🚫 Also don't save progress for Trailers (Teasers), which play in Portrait mode (!isFullScreen)
    if (
      currentData?.mainType === 'WEB_SERIES' ||
      currentData?.mainType === 'TV_SHOW' ||
      !isFullScreen
    ) {
      return;
    }

    // Consolidate current progress from all sources
    let currentProgress = Math.floor(
      currentTimeRef.current || playDuration || 0,
    );

    // 🛡️ ABSOLUTE safety guard for timestamp
    if (isNaN(currentProgress) || currentProgress < 0) {
      console.log(
        '🚫 Invalid progress detected, skipping save:',
        currentProgress,
      );
      return;
    }

    if (!currentData?._id || currentProgress === 0) return;

    const progressData = {
      movieOrSeriesId: currentData?.parentsSeries || currentData._id,
      playTimeStamps: currentProgress,
      userId: currentUser?._id,
    };

    // Include session for series grouping
    if (currentData?.session) {
      progressData.session = currentData.session;
    }

    // Check if user is on Free Plan (or no plan)
    const isFreeUser =
      currentUser?.planDetails?.planType === 'FREE_PLAN' ||
      !currentUser?.isActivePlan;

    // Only deduct quota if explicitly requested
    if (isFreeUser) {
      progressData.deductQuota = false;
    }

    console.log('💾 Saving watch progress:', {
      currentProgress,
      id: progressData.movieOrSeriesId,
      deduct: progressData.deductQuota,
    });

    try {
      await dispatch(updateWatchApi({ data: progressData }));
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  const handleBackPress = async () => {
    console.log('🔙 Handling Back Press...');
    if (saving) return true; // Prevent double press

    setSaving(true);
    setPaused(true);
    if (videoRef.current) videoRef.current.pause();

    try {
      await saveWatchProgress();
    } catch (e) {
      console.log('Save on back failed', e);
    } finally {
      setSaving(false);
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
    return true;
  };

  // Handle Hardware Back Press
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [playDuration, data]); // specific dependencies to capture current state

  // Save every 10 seconds while playing
  // Save every 10 seconds while playing
  useEffect(() => {
    if (isFullScreen && !paused) {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);

      saveIntervalRef.current = setInterval(() => {
        saveWatchProgress();
      }, 10000);
    } else {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    }

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [isFullScreen, paused]); // Removed playDuration

  // Save on component unmount
  useEffect(() => {
    return () => {
      if (playDuration > 0) {
        // Fire and forget on unmount, as we can't await here
        // (but specific back press handling covers the user action)
        saveWatchProgress();
      }
    };
  }, []); // Empty dependency for unmount only

  const isSeries =
    data?.mainType === 'WEB_SERIES' || data?.mainType === 'EPISODE';

  const topBottomTitle = isSeries
    ? [
        { id: 1, title: t('common.episodes') || 'Episodes' },
        { id: 2, title: t('common.more_like_this') || 'More Like This' },
        { id: 3, title: t('common.more_details') || 'More Details' },
      ]
    : [
        { id: 2, title: t('common.more_like_this') || 'More Like This' },
        { id: 3, title: t('common.more_details') || 'More Details' },
      ];

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const scrollRef = useRef(null);

  const isEpisode = data?.mainType === 'EPISODE';
  const isMovie = data?.mainType === 'MOVIE';

  // Dynamic button title (Resume S1 E1 Name / Watch Now)
  const buttonTitle = isEpisode
    ? `${t('common.resume') || 'Resume'}: S${data?.session || 1} E${
        data?.index || 1
      } ${data?.name}`
    : isMovie
    ? data?.playTimeStamps > 0 || timeStamp > 0
      ? t('common.continue_watching') || 'Continue Watching'
      : t('common.watch_now') || 'Watch Now'
    : `${t('common.play_season') || 'Play Season'} ${selectedSeason}`;

  // Seasons derived from available episodes
  const availableSeasons =
    movieDetails?.sessions?.length > 0
      ? [...movieDetails.sessions].sort((a, b) => a - b)
      : [1];

  // Filter episodes for current season
  const filteredEpisodes =
    movieDetails?.episodes?.filter(ep => {
      const epSeason = ep.session || ep.season || 1;
      return epSeason === selectedSeason;
    }) || [];

  // Scroll to top when data (current playing) changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [data?._id]);

  useEffect(() => {
    if (route?.params?.autoPlay) {
      setPaused(false);
    }
  }, [route?.params?.autoPlay]);

  const genreText = data?.genre
    ?.filter(item => item?.name)
    ?.map(item => t(`genres.${item?.name?.toLowerCase()}`) || item?.name)
    ?.join(' , ');

  const TAB_WIDTH = isSeries ? SIZES.width * 0.3 : SIZES.width * 0.45;
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [languageSelect, setLanguageSelect] = useState(0);

  const slideX = useRef(new Animated.Value(0)).current;
  const langSlideX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(getMovieTrailerApi({ id: data?._id }));
    dispatch(getMovieDetailsApi({ id: data?._id }));
  }, [data?._id]);

  // Sync details into local data state for immediate UI feedback
  useEffect(() => {
    if (movieDetails && movieDetails._id === data?._id) {
      setData(prev => ({ ...prev, ...movieDetails }));
    }
  }, [movieDetails]);

  useEffect(() => {
    Animated.spring(slideX, {
      toValue: selectedIndex * TAB_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex]);

  // ⏯ Auto-Resume & Auto-Play Logic
  useEffect(() => {
    if (data?.file && route?.params?.autoPlay !== false) {
      console.log('⏯ Triggering automatic playback:', {
        timeStamp,
        autoPlay: route?.params?.autoPlay,
        file: data?.file,
      });
      // Small delay to ensure video component is ready
      const timer = setTimeout(() => {
        handleContinueWatch();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [data?._id, data?.file]);

  // 💾 Save "Last Watched Episode" for Series
  useEffect(() => {
    if (data?._id && data?.parentsSeries) {
      saveLastWatchedEpisode(data.parentsSeries, data._id);
    }
  }, [data?._id, data?.parentsSeries]);

  /*
   * 🎬 Dynamic "Continue Watching" Handler
   * If Series -> Redirects to First Episode or Last Watched Episode
   * If Movie -> Plays directly
   */
  const handleContinueWatch = async () => {
    // 1. Check Plan (Bypassed for Free/Open Source version)
    // if (
    //   (user?.totalFreeTime > 0 &&
    //     user?.planDetails?.planType === 'FREE_PLAN') ||
    //   user?.planDetails?.planType !== 'FREE_PLAN'
    // ) {
    // 2. If Series, Find Correct Episode & Redirect
    if (
      (data?.mainType === 'WEB_SERIES' || data?.mainType === 'TV_SHOW') &&
      movieDetails?.episodes?.length > 0
    ) {
      console.log('🔄 Series detected. Checking last watched episode...');
      let targetEpisode = null;

      // Try getting last watched episode from storage
      const lastEpisodeId = await getLastWatchedEpisode(data._id);
      if (lastEpisodeId) {
        targetEpisode = movieDetails.episodes.find(
          ep => ep._id === lastEpisodeId,
        );
      }

      // Default to Episode 1 if no history found
      if (!targetEpisode) {
        targetEpisode = movieDetails.episodes[0];
      }

      if (targetEpisode) {
        showToast(`Playing: ${targetEpisode.name || 'Episode 1'}`);
        navigation.replace('ContinueWatch', {
          data: targetEpisode,
          autoPlay: true,
        });
        return;
      }
    }

    // 3. Normal Playback (Movie or already an Episode)
    if (videoRef.current) {
      if (timeStamp > 0) {
        videoRef.current.seek(timeStamp);
      }
      setIsFullScreen(true);
      Orientation.lockToLandscape();
      setIsLandscape(true);
      setPaused(false);
    }
    dispatch(getMovieDetailsApi({ id: data?._id }));
    // } else {
    //   // ⏸ Pause the video immediately before navigating
    //   setPaused(true);
    //   if (videoRef.current) {
    //     videoRef.current.pause?.();
    //   }
    //   showToast('Purchase plan');
    //   navigation.navigate('Subscription', { movieId: data?._id });
    // }
  };
  const handleWishlist = () => {
    if (movieTrailer?.isMyListed) {
      return;
    }
    dispatch(createWishlistApi({ id: data?._id }));
  };

  const handleRating = () => {
    // if (movieTrailer?.isRated) {
    //     showToast('You have already rated this movie/series.')
    //     return
    // }
    if (rating) return;
    dispatch(createRateApi({ id: data?._id, cb: setRating }));
  };

  const handleShare = () => {
    const shareLink = `https://deepakott.com/movie/${data?._id}`;
    const message = `🎬 Watch *${data?.name}* on DeepakOTT!\n\n👉 Click to Watch: ${shareLink}`;

    shareFile({
      loading: setShareLoading,
      message,
      title: `Share ${data?.name}`,
    });
  };

  useWatchTracker(user?._id, data?._id, playDuration, isFullScreen);

  // durationHook(
  //     data?._id,
  //     playDuration
  // )

  useEffect(() => {
    const backAction = () => {
      if (isFullScreen) {
        Orientation.lockToPortrait();
        setIsFullScreen(false);
        setIsLandscape(false);
        return true; // Prevent default behavior (going back)
      }
      // If we are playing an episode or redirected from series, go to Home
      navigation.navigate('BottomTab', { screen: 'Home' });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isFullScreen, navigation]);

  // ⏱️ Free Plan Time Limit Enforcement
  // 🚨 Handle Free Limit Expiration
  const handleFreeLimitReached = message => {
    setPaused(true);
    if (isFullScreen) {
      Orientation.lockToPortrait();
      setIsFullScreen(false);
      setIsLandscape(false);
    }

    // Show "Pop" (Alert) then Redirect
    Alert.alert(
      'Free Plan Limit Reached',
      message ||
        'You have used your free 5 minutes. Please upgrade to continue watching.',
      [
        {
          text: 'Upgrade Now',
          onPress: () =>
            navigation.navigate('Subscription', { movieId: data?._id }),
        },
        {
          text: 'Cancel',
          onPress: () => navigation.navigate('BottomTab', { screen: 'Home' }),
          style: 'cancel',
        },
      ],
      { cancelable: false },
    );
  };

  // ⏱️ Free Plan Time Limit Enforcement (Disabled for Free/Open Source version)
  /* useEffect(() => {
    // Treat as Free Plan if: explicit FREE_PLAN OR no active plan
    const isFreeUser =
      user?.planDetails?.planType === 'FREE_PLAN' || !user?.isActivePlan;

    if (isFreeUser && isFullScreen && !paused) {
      // Get time limit from user's plan (in minutes), default to 5 if not set
      const timeLimitMinutes = user?.planDetails?.freeWatchTimeLimit || 5;
      const timeLimitSeconds = timeLimitMinutes * 60;

      // Check if user exceeded the time limit
      if (playDuration >= timeLimitSeconds) {
        console.log(
          `⏱️ Free plan time limit reached: ${timeLimitMinutes} minutes`,
        );
        handleFreeLimitReached(
          `You have watched for ${timeLimitMinutes} minutes. Please upgrade to continue.`,
        );
      }
    }
  }, [
    playDuration,
    user?.planDetails?.planType,
    user?.isActivePlan,
    user?.planDetails?.freeWatchTimeLimit,
    isFullScreen,
    paused,
  ]); */

  // Legacy check for totalFreeTime (Quota Expiration from Backend) - (Disabled for Free/Open Source version)
  /* useEffect(() => {
    if (
      user?.planDetails?.planType === 'FREE_PLAN' &&
      user?.totalFreeTime <= 0 &&
      isFullScreen &&
      !paused // Only trigger if trying to play
    ) {
      console.log('⏱️ Total Free Quota Expired');
      handleFreeLimitReached(
        'Your total free watch time is over. Please upgrade to unlimited access.',
      );
    }
  }, [user?.totalFreeTime, user?.planDetails?.planType, isFullScreen, paused]); */

  console.log('Moview trailer', movieTrailer);
  console.log('Video Source Debug:', {
    isFullScreen,
    paused,
    file: data?.file,
    teaser: data?.teaserUrl,
    resolvedUri: isFullScreen
      ? data?.file
      : (data?.mainType === 'EPISODE' ? data?.file : data?.teaserUrl) ??
        'https://www.w3schools.com/html/mov_bbb.mp4',
  });

  const toggleOrientation = () => {
    if (isLandscape) {
      Orientation.lockToPortrait();
      setIsLandscape(false);
      showToast('Portrait Mode');
    } else {
      Orientation.lockToLandscape();
      setIsLandscape(true);
      showToast('Landscape Mode');
    }
  };

  const renderVideoPlayer = () => {
    const videoSourceUri =
      (data?.mainType === 'EPISODE'
        ? data?.file || movieDetails?.file
        : isFullScreen
        ? data?.file || movieDetails?.file
        : data?.teaserUrl ||
          movieDetails?.teaserUrl ||
          data?.file ||
          movieDetails?.file) || 'https://www.w3schools.com/html/mov_bbb.mp4';

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetY={[-5, 5]}
          failOffsetX={[-15, 15]}
        >
          <View style={{ flex: 1 }}>
            <Video
              ref={videoRef}
              key={videoSourceUri || data?._id}
              source={{ uri: videoSourceUri }}
              poster={data?.poster || movieDetails?.poster}
              posterResizeMode="cover"
              style={isFullScreen ? styles.fullScreenVideo : styles.videoPlayer}
              resizeMode={resizeMode}
              controls={false}
              progressUpdateInterval={500}
              selectedVideoTrack={selectedVideoTrack}
              selectedAudioTrack={selectedAudioTrack}
              bufferConfig={{
                minBufferMs: 25000,
                maxBufferMs: 60000,
                bufferForPlaybackMs: 3000,
                bufferForPlaybackAfterRebufferMs: 6000,
              }}
              paused={paused}
              onProgress={handleProgress}
              onLoadStart={() => {
                console.log('Video Load Start:', videoSourceUri);
                setBuffering(true);
              }}
              onLoad={handleLoad}
              onReadyForDisplay={meta => {
                console.log('🎬 Ready for Display. Meta:', meta);
                if (meta?.duration > 0 && meta.duration !== duration) {
                  setDuration(meta.duration);
                }
              }}
              onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
              onError={e => {
                console.log('Video Error:', e);
                let errorMsg =
                  e?.error?.extra ||
                  e?.error?.errorString ||
                  'Unknown video error';

                if (
                  errorMsg.includes('DECODING_FAILED') ||
                  errorMsg.includes('CODEC_SUPPORT')
                ) {
                  errorMsg =
                    'Codec Incompatibility: This file is not supported by your device hardware.';
                  showToast(`Video Error: ${errorMsg}`);
                } else if (
                  errorMsg.includes('Unable to resolve host') ||
                  errorMsg.includes('network')
                ) {
                  setShowNetworkError(true);
                  setPaused(true);
                } else {
                  showToast(`Video Error: ${errorMsg}`);
                }

                setBuffering(false);
              }}
              onEnd={e => {
                console.log('🎬 Video Ended', e);
                if (
                  data?.mainType === 'WEB_SERIES' ||
                  data?.mainType === 'TV_SHOW' ||
                  !isFullScreen
                ) {
                  return;
                }

                const totalSeconds = (data?.totalDuration || 0) * 60;
                if (totalSeconds > 0) {
                  setPlayDuration(totalSeconds);
                  const progressData = {
                    movieOrSeriesId: data?.parentsSeries || data?._id,
                    playTimeStamps: totalSeconds,
                    userId: user?._id,
                  };
                  if (user?.planDetails?.planType === 'FREE_PLAN') {
                    dispatch(updateFreeWatchApi({ data: progressData }));
                  } else {
                    dispatch(updateWatchApi({ data: progressData }));
                  }
                } else {
                  saveWatchProgress();
                }

                const currentIndex =
                  movieDetails?.episodes?.findIndex(
                    ep => ep._id === data?._id,
                  ) ?? -1;

                if (
                  currentIndex !== -1 &&
                  currentIndex < movieDetails.episodes.length - 1
                ) {
                  const nextEpisode = movieDetails.episodes[currentIndex + 1];
                  showToast(`Next Episode: ${nextEpisode.name || 'Next'}`);
                  navigation.replace('ContinueWatch', {
                    data: nextEpisode,
                    autoPlay: true,
                  });
                }
              }}
            />

            {/* --- Custom Control Overlay --- */}
            <Pressable style={styles.controlsOverlay} onPress={toggleControls}>
              {showControls && (
                <>
                  {/* Top Bar */}
                  <View style={styles.newTopBar}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => {
                        if (isFullScreen) {
                          Orientation.lockToPortrait();
                          setIsFullScreen(false);
                          setIsLandscape(false);
                        } else {
                          handleBackPress();
                        }
                      }}
                    >
                      <Icon
                        name={isFullScreen ? 'arrow-left' : 'chevron-left'}
                        size={isFullScreen ? 28 : 24}
                        color="white"
                      />
                    </TouchableOpacity>

                    {isFullScreen && (
                      <TransliteratedText
                        style={styles.fullscreenTitle}
                        numberOfLines={1}
                        text={data?.name}
                        language={i18n.language}
                      />
                    )}

                    <View style={styles.rightIcons}>
                      {isFullScreen && (
                        <TouchableOpacity
                          style={styles.controlButton}
                          onPress={toggleOrientation}
                        >
                          <Icon
                            name={
                              isLandscape
                                ? 'phone-rotate-portrait'
                                : 'phone-rotate-landscape'
                            }
                            size={26}
                            color="white"
                          />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={toggleResizeMode}
                      >
                        <Icon
                          name="aspect-ratio"
                          size={isFullScreen ? 26 : 20}
                          color="white"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => setShowSettings(true)}
                      >
                        <Icon
                          name="cog"
                          size={isFullScreen ? 26 : 20}
                          color="white"
                        />
                      </TouchableOpacity>
                      {!isFullScreen && (
                        <TouchableOpacity
                          style={styles.controlButton}
                          onPress={() => {
                            setIsFullScreen(true);
                            Orientation.lockToLandscape();
                          }}
                        >
                          <Icon name="fullscreen" size={20} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View style={styles.centerControls}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => handleSeek(-10)}
                    >
                      <Icon
                        name="rewind-10"
                        size={isFullScreen ? 45 : 25}
                        color="white"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => setPaused(!paused)}
                    >
                      <Icon
                        name={paused ? 'play' : 'pause'}
                        size={isFullScreen ? 65 : 35}
                        color="white"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => handleSeek(10)}
                    >
                      <Icon
                        name="fast-forward-10"
                        size={isFullScreen ? 45 : 25}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Skip Button */}
                  {showSkipBtn && isFullScreen && (
                    <TouchableOpacity
                      style={styles.skipButtonContainer}
                      onPress={handleSkip}
                    >
                      <Text style={styles.skipButtonText}>
                        {t('common.skip') || 'Skip'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Next Episode Button */}
                  {showNextEpisodeBtn && isFullScreen && (
                    <TouchableOpacity
                      style={styles.nextEpisodeContainer}
                      onPress={handleNextEpisode}
                    >
                      <Text style={styles.nextEpisodeText}>
                        {t('common.next_episode') || 'Next Episode'}
                      </Text>
                      <Icon name="skip-next" size={24} color={COLORS.black} />
                    </TouchableOpacity>
                  )}

                  <View style={styles.bottomControls}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeText}>
                        {(() => {
                          const h = Math.floor(playDuration / 3600);
                          const m = Math.floor((playDuration % 3600) / 60);
                          const s = Math.floor(playDuration % 60);
                          return h > 0
                            ? `${h}:${String(m).padStart(2, '0')}:${String(
                                s,
                              ).padStart(2, '0')}`
                            : `${m}:${String(s).padStart(2, '0')}`;
                        })()}
                      </Text>
                      <Text style={styles.timeText}>
                        {(() => {
                          const h = Math.floor(duration / 3600);
                          const m = Math.floor((duration % 3600) / 60);
                          const s = Math.floor(duration % 60);
                          return h > 0
                            ? `${h}:${String(m).padStart(2, '0')}:${String(
                                s,
                              ).padStart(2, '0')}`
                            : `${m}:${String(s).padStart(2, '0')}`;
                        })()}
                      </Text>
                    </View>
                    <Slider
                      style={{ width: '100%', height: 40 }}
                      minimumValue={0}
                      maximumValue={duration}
                      value={playDuration}
                      minimumTrackTintColor="#FFB800"
                      maximumTrackTintColor="rgba(255,255,255,0.2)"
                      thumbTintColor="#FFB800"
                      onValueChange={val => {
                        setIsSeeking(true);
                        setPlayDuration(val);
                      }}
                      onSlidingComplete={async val => {
                        setIsSeeking(false);
                        setPlayDuration(val);
                        currentTimeRef.current = val;
                        videoRef.current?.seek(val);
                        await saveWatchProgress();
                      }}
                    />
                  </View>
                </>
              )}

              {buffering && (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { justifyContent: 'center', alignItems: 'center' },
                  ]}
                >
                  <ActivityIndicator size="large" color="#FFB800" />
                </View>
              )}

              <IndicatorOverlay
                type={indicatorType}
                value={indicatorValue}
                visible={showIndicator}
              />
            </Pressable>
          </View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    );
  };

  const renderEpisodeItem = ({ item, index }) => (
    <Pressable
      style={styles.episodeItem}
      onPress={() => {
        // 💾 Save progress of CURRENT episode before switching
        if (playDuration > 0) {
          saveWatchProgress();
        }

        // Merge item with existing data to keep series context (like genre, sessions)
        setData(prev => ({
          ...prev, // Keep series metadata
          ...item, // Overwrite with episode specific info (file, name, etc)
          mainType: 'EPISODE', // Safety ensure
        }));
        setPaused(false);
        setPlayDuration(0);
        currentTimeRef.current = 0;
        if (videoRef.current) {
          videoRef.current.seek(0);
        }
      }}
    >
      <View style={styles.episodeThumbnailContainer}>
        <Image
          source={
            typeof item?.poster === 'string' && item.poster.startsWith('http')
              ? { uri: item.poster }
              : typeof item?.poster === 'string' && item.poster.length > 0
              ? { uri: item.poster }
              : images.placeholder // Fallback
          }
          style={styles.episodeThumbnail}
        />
        <View style={styles.playIconOverlay}>
          <Icon name="play-circle-outline" size={32} color="white" />
        </View>
      </View>
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeNum}>
          {t('common.episode') || 'EPISODE'} {index + 1}
        </Text>
        <Text style={styles.episodeTitle} numberOfLines={1}>
          {item.name ||
            item.title ||
            `${t('common.episode') || 'Episode'} ${index + 1}`}
        </Text>
        <Text style={styles.episodeDescription} numberOfLines={2}>
          {item.description || 'No description available for this episode.'}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Fullscreen Player Rendering */}
      {isFullScreen ? (
        <Modal
          visible={isFullScreen}
          supportedOrientations={['portrait', 'landscape']}
          transparent={false}
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => {
            Orientation.lockToPortrait();
            setIsFullScreen(false);
          }}
        >
          <View style={styles.fullscreenContainer}>{renderVideoPlayer()}</View>
        </Modal>
      ) : (
        <MainView transparent={false} bottomSafe={false} mainStyle={{ flex: 1 }}>
          <View style={styles.container}>{renderVideoPlayer()}</View>

          <FlatList
            ref={scrollRef}
            key={selectedIndex === 0 && isSeries ? 'list' : 'grid'}
            keyExtractor={(item, index) => item?._id || index.toString()}
            data={
              selectedIndex === 0 && isSeries
                ? filteredEpisodes
                : selectedIndex === (isSeries ? 1 : 0)
                ? moreLikeThis
                : []
            }
            numColumns={selectedIndex === 0 && isSeries ? 1 : 3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: SIZES.height * 0.05,
            }}
            columnWrapperStyle={
              selectedIndex === 0 && isSeries
                ? undefined
                : selectedIndex === (isSeries ? 1 : 0)
                ? { justifyContent: 'space-between' }
                : undefined
            }
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height:
                    selectedIndex === 0 && isSeries ? 29 : SIZES.height * 0.005,
                }}
              />
            )}
            ListHeaderComponent={
              <View style={styles.cloumn}>
                <TransliteratedText
                  style={styles.title}
                  text={data?.name}
                  language={i18n.language}
                />

                <View style={styles.row}>
                  <Text style={styles.text}>
                    {data?.totalDuration || movieDetails?.totalDuration || 0}m
                  </Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.text}>
                    {t(
                      `languages.${(
                        data?.language?.[0]?.name ||
                        movieDetails?.language?.[0]?.name ||
                        'Hindi'
                      ).toLowerCase()}`,
                    ) ||
                      data?.language?.[0]?.name ||
                      movieDetails?.language?.[0]?.name ||
                      'Hindi'}
                  </Text>
                  <Text style={styles.dot}>•</Text>
                  <View style={styles.hdView}>
                    <Text style={styles.hd}>
                      {data?.watchQuality || movieDetails?.watchQuality || 'HD'}
                    </Text>
                  </View>
                  <Text style={styles.dot}>•</Text>
                  <Image source={images.imdb} style={styles.imdb} />
                  <Text style={styles.imdbText}>
                    {data?.imdbRating || movieDetails?.imdbRating || '8.5'}
                  </Text>
                </View>

                <CustomButton
                  iconLeft={icons.play}
                  iconStyle={styles.iconStyle}
                  title={buttonTitle}
                  buttonStyle={styles.buttonStyle}
                  onPress={handleContinueWatch}
                />

                <View
                  style={[
                    styles.topBottomView,
                    { position: 'relative', marginTop: 0 },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.line2,
                      {
                        position: 'absolute',
                        bottom: SIZES.w2,
                        left: 0,
                        transform: [{ translateX: langSlideX }],
                        width: SIZES.width / 5.6,
                      },
                    ]}
                  />
                  {data?.language?.map((item, index) => {
                    const active = languageSelect === index;
                    return (
                      <Pressable
                        key={item?._id || index}
                        style={[
                          styles.PressableView,
                          { width: SIZES.width / 5.6 },
                        ]}
                        onPress={() => setLanguageSelect(index)}
                      >
                        <Text
                          style={[
                            styles.topBottomText,
                            {
                              color: active ? COLORS.white : COLORS.gray400,
                              fontSize: 12, // Reduced font size to prevent wrapping
                              textAlign: 'center',
                            },
                          ]}
                          numberOfLines={1} // Force single line
                        >
                          {item.name ?? 'Language'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.view}>
                  <Text style={styles.heading}>
                    {t('common.description') || 'Description'}
                  </Text>
                  <Text
                    style={styles.subText}
                    numberOfLines={expanded ? undefined : 2}
                  >
                    {data?.description}
                  </Text>
                  <Pressable onPress={() => setExpanded(prev => !prev)}>
                    <Text style={styles.readMore}>
                      {' '}
                      {expanded
                        ? t('common.read_less') || 'Read less'
                        : t('common.read_more') || 'Read more'}
                    </Text>
                  </Pressable>

                  <View style={styles.seprater} />

                  <View
                    style={[styles.row, { justifyContent: 'space-evenly' }]}
                  >
                    <Pressable
                      style={styles.iconBlock}
                      onPress={handleWishlist}
                    >
                      <Image
                        source={
                          movieTrailer?.isMyListed
                            ? icons?.wishlistFill
                            : icons.add
                        }
                        style={styles.icons}
                      />
                      <Text style={styles.iconText}>
                        {t('common.my_list') || 'My List'}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.iconBlock} onPress={handleRating}>
                      <Image
                        source={
                          movieTrailer?.isRated
                            ? icons.rattingFilled
                            : icons.like
                        }
                        style={styles.icons}
                      />
                      <Text style={styles.iconText}>
                        {t('common.rate') || 'Rate'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.iconBlock}
                      onPress={handleShare}
                      disabled={shareLoading}
                    >
                      <Image source={icons.share} style={styles.icons} />
                      <Text style={styles.iconText}>
                        {t('common.share') || 'Share'}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Top/Bottom tabs */}
                  <View
                    style={[styles.topBottomView, { position: 'relative' }]}
                  >
                    <Animated.View
                      style={[
                        styles.line,
                        {
                          position: 'absolute',
                          bottom: 4,
                          left: 0,
                          transform: [{ translateX: slideX }],
                          width: TAB_WIDTH,
                        },
                      ]}
                    />
                    {topBottomTitle.map((item, index) => {
                      const active = selectedIndex === index;
                      return (
                        <Pressable
                          key={item.id}
                          style={[styles.PressableView, { width: TAB_WIDTH }]}
                          onPress={() => setSelectedIndex(index)}
                        >
                          <Text
                            style={[
                              styles.topBottomText,
                              { color: active ? COLORS.white : COLORS.gray400 },
                            ]}
                          >
                            {item.title}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={{ height: SIZES.height * 0.015 }} />

                  {/* Season Dropdown (Figma) */}
                  {selectedIndex === 0 && isSeries && (
                    <TouchableOpacity
                      style={styles.seasonSelector}
                      onPress={() => setShowSeasonModal(true)}
                    >
                      <Text style={styles.seasonText}>
                        {t('common.season') || 'Season'} {selectedSeason} (
                        {filteredEpisodes.length} EP)
                      </Text>
                      <Image
                        source={icons.down}
                        style={styles.seasonDropdownIcon}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            }
            renderItem={({ item, index }) =>
              selectedIndex === 0 && isSeries ? (
                renderEpisodeItem({ item, index })
              ) : selectedIndex === (isSeries ? 1 : 0) ? (
                <MoviePoster
                  item={item}
                  posterPress={() =>
                    navigation.push('ContinueWatch', { data: item })
                  }
                />
              ) : null
            }
            ListFooterComponent={
              selectedIndex === (isSeries ? 2 : 1) ? (
                <View style={styles.view}>
                  <View style={styles.detailView}>
                    <Text style={styles.detailHeading}>
                      {t('common.director') || 'Director'}
                    </Text>
                    <Text style={styles.detailSubText}>
                      {typeof movieDetails?.director === 'object'
                        ? movieDetails?.director?.name
                        : movieDetails?.director || data?.director}
                    </Text>
                  </View>
                  <View style={styles.detailView}>
                    <Text style={styles.detailHeading}>
                      {t('common.cast') || 'Cast'}
                    </Text>
                    <Text style={styles.detailSubText}>
                      {Array.isArray(movieDetails?.cast)
                        ? movieDetails.cast
                            .map(item =>
                              typeof item === 'object' ? item?.name : item,
                            )
                            .join(', ')
                        : typeof movieDetails?.cast === 'object'
                        ? movieDetails?.cast?.name
                        : movieDetails?.cast || data?.cast}
                    </Text>
                  </View>
                  <View style={styles.detailView}>
                    <Text style={styles.detailHeading}>
                      {t('common.writer') || 'Writer'}
                    </Text>
                    <Text style={styles.detailSubText}>
                      {typeof movieDetails?.writer === 'object'
                        ? movieDetails?.writer?.name
                        : movieDetails?.writer || data?.writer}
                    </Text>
                  </View>
                  <View style={styles.detailView}>
                    <Text style={styles.detailHeading}>
                      {t('common.genre') || 'Genre'}
                    </Text>
                    <Text style={styles.detailSubText}>
                      {(movieDetails?.genre?.length > 0
                        ? movieDetails.genre
                        : data?.genre || []
                      )
                        ?.filter(item => item?.name)
                        ?.map(item => item?.name)
                        ?.join(', ') || 'Action'}
                    </Text>
                  </View>
                  <View style={styles.detailView}>
                    <Text style={styles.detailHeading}>Rating</Text>
                    <Text style={styles.detailSubText}>
                      {movieDetails?.rating || data?.rating || 10}/10
                    </Text>
                  </View>
                  <View style={styles.detailView}>
                    <Text style={styles.detailHeading}>This show is</Text>
                    <Text style={styles.detailSubText}>
                      {movieDetails?.description || data?.description}
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
        </MainView>
      )}

      {/* --- Settings Modal --- */}
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isFullScreen && { width: '50%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Playback Settings</Text>

              <Text style={styles.sectionTitle}>Video Quality</Text>

              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedVideoTrack({ type: 'auto' });
                  setShowSettings(false);
                  showToast('Quality: Auto');
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedVideoTrack.type === 'auto' &&
                      styles.modalItemActive,
                  ]}
                >
                  Auto (Recommended)
                </Text>
                {selectedVideoTrack.type === 'auto' && (
                  <Icon name="check" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>

              {videoTracks.length > 0 ? (
                videoTracks.map((track, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedVideoTrack({
                        type: 'resolution',
                        value: track.height || 720,
                      });
                      setShowSettings(false);
                      showToast(`Quality: ${track.height}p`);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedVideoTrack.type === 'resolution' &&
                          selectedVideoTrack.value === track.height &&
                          styles.modalItemActive,
                      ]}
                    >
                      {track.height}p{' '}
                      {track.bitrate
                        ? `(${Math.round(track.bitrate / 1000)} kbps)`
                        : ''}
                    </Text>
                    {selectedVideoTrack.type === 'resolution' &&
                      selectedVideoTrack.value === track.height && (
                        <Icon name="check" size={20} color={COLORS.primary} />
                      )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ paddingVertical: 10 }}>
                  <Text
                    style={[
                      styles.modalItemText,
                      { fontStyle: 'italic', fontSize: 13 },
                    ]}
                  >
                    No manual resolutions detected for this stream.
                  </Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>Audio Language</Text>

              {audioTracks.length > 0 ? (
                audioTracks.map((track, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedAudioTrack({ type: 'index', value: idx });
                      setShowSettings(false);
                      showToast(
                        `Audio: ${
                          track.language || track.title || 'Track ' + (idx + 1)
                        }`,
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedAudioTrack.value === idx &&
                          styles.modalItemActive,
                      ]}
                    >
                      {track.language || `Track ${idx + 1}`}{' '}
                      {track.title ? `- ${track.title}` : ''}
                    </Text>
                    {selectedAudioTrack.value === idx && (
                      <Icon name="check" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.modalItemText, { fontSize: 13 }]}>
                  Default Audio
                </Text>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Season Selection Modal --- */}
      <Modal
        visible={showSeasonModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSeasonModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Season</Text>
            <ScrollView>
              {availableSeasons.map(seasonNum => (
                <TouchableOpacity
                  key={seasonNum}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSeason(seasonNum);
                    setShowSeasonModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedSeason === seasonNum && styles.modalItemActive,
                    ]}
                  >
                    Season {seasonNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSeasonModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- Network Error Modal --- */}
      <Modal
        visible={showNetworkError}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNetworkError(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.networkErrorContent}>
            <Icon name="wifi-off" size={60} color={COLORS.primary} />
            <Text style={styles.networkErrorTitle}>No Internet Connection</Text>
            <Text style={styles.networkErrorMsg}>
              Please check your internet connection and try again.
            </Text>

            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goBackButton}
              onPress={handleBackPress}
            >
              <Text style={styles.closeButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ContinueWatch;
