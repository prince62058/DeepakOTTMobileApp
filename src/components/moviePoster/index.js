import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { images, SIZES } from '../../constants';

const MoviePoster = React.memo(({ posterPress, item, plan, index = 0 }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  };

  const onLoad = () => {
    opacity.value = withTiming(1, { duration: 450 });
  };

  // Handle poster source
  const posterSource =
    typeof item?.poster === 'string' && item.poster.startsWith('https')
      ? { uri: item.poster }
      : item?.poster;

  return (
    <Pressable
      onPress={posterPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ marginRight: SIZES.width * 0.01 }}
    >
      <Animated.View
        entering={FadeInDown.delay(index * 50)
          .springify()
          .damping(12)}
      >
        <Animated.View style={[styles.posterContainer, animatedStyle]}>
          <Image
            source={
              posterSource &&
              (typeof posterSource !== 'object' || posterSource.uri)
                ? posterSource
                : images.golden_diya_logo
            }
            style={styles.poster}
            onLoad={onLoad}
          />
        </Animated.View>
      </Animated.View>
      {plan && item?.plan ? (
        item.plan === 'premium' ? (
          <Image source={images.premium} style={styles.premium} />
        ) : (
          <Image source={images.free} style={styles.free} />
        )
      ) : null}
    </Pressable>
  );
});

export default MoviePoster;

const styles = StyleSheet.create({
  posterContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  poster: {
    width: SIZES.width * 0.31,
    height: SIZES.height * 0.215,
    resizeMode: 'cover',
  },
  premium: {
    position: 'absolute',
    top: 8,
    left: 2,
    width: SIZES.width * 0.05,
    height: SIZES.width * 0.05,
    resizeMode: 'contain',
  },
  free: {
    position: 'absolute',
    top: 4,
    right: 1,
    width: SIZES.width * 0.07,
    height: SIZES.width * 0.07,
    resizeMode: 'contain',
  },
});
