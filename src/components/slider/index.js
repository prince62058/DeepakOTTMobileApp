import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, icons, images, SIZES } from '../../constants';
import CustomButton from '../customButton';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, fontSize } from '../../utils/responsive/fonts';
import TransliteratedText from '../transliteratedText';

import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const PaginationDot = ({ index, activeIndex }) => {
  const isActive = index === activeIndex;

  const activeWidth = scale(20);
  const inactiveWidth = scale(8);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isActive ? activeWidth : inactiveWidth),
      opacity: withTiming(isActive ? 1 : 0.5),
      backgroundColor: isActive ? COLORS.primary : COLORS.separator,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const SlideItem = ({ item, index, scrollX, handleMoviewClick }) => {
  const { t, i18n } = useTranslation();
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scaleVal = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale: scaleVal }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.slide, animatedStyle]}>
      <ImageBackground
        source={{ uri: item?.poster }}
        style={styles.imageBg}
        resizeMode={'cover'}
        imageStyle={styles.imageRadius}
      >
        <View style={styles.shadowOverlay} />

        <View style={styles.overlayContent}>
          <View style={styles.row}>
            <Text style={styles.text}>{item?.releaseYear}</Text>
            <TransliteratedText
              style={styles.text}
              text={`• ${item?.name}`}
              language={i18n.language}
            />
            <Text style={styles.text}>
              • {t(`genres.${item?.genre?.[0]?.name?.toLowerCase()}`) || item?.genre?.[0]?.name}
            </Text>
            <Text style={styles.text}>• {item?.watchQuality}</Text>
          </View>
          <TransliteratedText
            style={styles.title}
            numberOfLines={1}
            text={item?.name}
            language={i18n.language}
          />

          <View style={styles.button}>
            <CustomButton
              title={t('common.watch_now') || 'Watch Now'}
              iconLeft={icons.play}
              buttonStyle={[styles.buttonStyle, { width: scale(120) }]}
              iconStyle={styles.iconStyle}
              buttonText={styles.buttonText}
              onPress={() => handleMoviewClick(item)}
            />
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const Slider = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { home } = useSelector(state => state.home);

  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollX = useSharedValue(0);

  const displayData = (home?.trendingOne || []).slice(0, 4);

  // Auto-scroll
  useEffect(() => {
    const dataLength = displayData.length;
    if (dataLength <= 1) return;

    const id = setInterval(() => {
      let next = currentIndex + 1;
      if (next >= dataLength) next = 0;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }, 3000);
    return () => clearInterval(id);
  }, [currentIndex, displayData.length]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleMoviewClick = item => {
    navigation.navigate('ContinueWatch', { data: item });
  };

  return (
    <View>
      <Animated.FlatList
        ref={flatListRef}
        data={displayData}
        keyExtractor={item => item?._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="center"
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: SIZES.width,
          offset: SIZES.width * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item, index }) => (
          <SlideItem
            item={item}
            index={index}
            scrollX={scrollX}
            handleMoviewClick={handleMoviewClick}
          />
        )}
      />

      <View style={styles.dotsRow}>
        {displayData.map((_, i) => (
          <PaginationDot key={i} index={i} activeIndex={currentIndex} />
        ))}
      </View>
    </View>
  );
};

export default Slider;

const styles = StyleSheet.create({
  slide: {
    width: width,
  },
  imageBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: verticalScale(200),
    width: '100%',
    alignSelf: 'center',
    borderRadius: scale(16),
    overflow: 'hidden',
  },
  mainImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  imageRadius: {
    borderRadius: scale(16),
    resizeMode: 'cover',
  },

  shadowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1F2937',
    opacity: 0.5,
    borderRadius: scale(16),
  },

  overlayContent: {
    marginTop: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: fontSize(18),
    fontFamily: FONTS.Bold,
    marginVertical: verticalScale(5),
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
  },
  text: {
    color: COLORS.white,
    fontFamily: FONTS.SemiBold,
    fontSize: fontSize(12),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: verticalScale(5),
  },
  iconStyle: {
    width: scale(16),
    height: scale(16),
    marginLeft: 0,
  },
  buttonText: {
    fontSize: fontSize(12),
    marginRight: scale(4),
    fontFamily: FONTS.Bold,
  },
  buttonStyle: {
    height: verticalScale(35),
  },
  dotsRow: {
    marginTop: verticalScale(10),
    marginBottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(10),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: COLORS.separator,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
});
