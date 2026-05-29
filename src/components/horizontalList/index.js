import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS, icons, SIZES } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import AnimatedEntry from '../animations/AnimatedEntry';

const Movie = React.memo(({ item, posterPress, index, isTrending }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const posterSource =
    typeof item?.poster === 'string' && item.poster.startsWith('https')
      ? { uri: item.poster }
      : item?.poster;

  return (
    <AnimatedEntry index={index}>
      <Pressable
        onPress={posterPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.movieContainer,
          isTrending && {
            marginRight: SIZES.width * 0.08,
            paddingLeft: SIZES.width * 0.05,
          },
        ]}
      >
        <Animated.View
          style={[animatedStyle, isTrending && styles.trendingItem]}
        >
          {isTrending && <Text style={styles.rankText}>{index + 1}</Text>}
          <Image source={posterSource} style={styles.poster} />
        </Animated.View>
      </Pressable>
    </AnimatedEntry>
  );
});

const HorizontalList = ({
  data,
  heading,
  onPress,
  posterPress,
  isTrending,
}) => {
  const navigation = useNavigation();

  const handleMoviewClick = item => {
    navigation.navigate('ContinueWatch', { data: item, autoPlay: false });
  };

  return (
    <View>
      <Pressable style={styles.row} onPress={onPress}>
        <Text style={styles.heading}>{heading}</Text>
        <Image source={icons.rightArrow} style={styles.arrow} />
      </Pressable>
      <View style={styles.View}>
        <FlatList
          data={data}
          keyExtractor={item => item?._id ?? item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SIZES.w8 }}
          removeClippedSubviews={true}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          renderItem={({ item, index }) => (
            <Movie
              item={item}
              index={index}
              isTrending={isTrending}
              posterPress={() => handleMoviewClick(item)}
            />
          )}
        />
      </View>
    </View>
  );
};

export default HorizontalList;

const styles = StyleSheet.create({
  View: {
    width: '100%',
    alignSelf: 'center',
  },
  heading: {
    color: COLORS.white,
    fontFamily: FONTS.Regular,
    fontSize: SIZES.w12,
  },
  row: {
    marginTop: SIZES.height * 0.02,
    paddingHorizontal: SIZES.w8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrow: {
    width: SIZES.w4,
    height: SIZES.w4,
    resizeMode: 'contain',
  },
  movieContainer: {
    marginRight: SIZES.width * 0.01,
  },
  poster: {
    width: SIZES.width * 0.285,
    height: SIZES.height * 0.188,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rankText: {
    fontSize: SIZES.width * 0.25,
    fontFamily: FONTS.Bold,
    color: COLORS.primary,
    position: 'absolute',
    left: -SIZES.width * 0.08,
    bottom: -SIZES.height * 0.02,
    zIndex: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    includeFontPadding: false,
    textDecorationLine: 'none',
  },
});
