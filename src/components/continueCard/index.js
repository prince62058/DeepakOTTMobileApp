import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { COLORS, FONTS, icons, images, SIZES } from '../../constants';
import CustomButton from '../customButton';
import TransliteratedText from '../transliteratedText';

const ContinueCard = ({ cardPress, resumePress, addPress, item }) => {
  const { t, i18n } = useTranslation();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const barWidth = SIZES.width * 0.44;

  // played minutes
  const playedMinutes = Math.ceil(item?.playTimeStamps / 60);

  // total duration in minutes (fallback to 1 to avoid divide by zero)
  const totalDurationMinutes = item?.movieOrSeriesId?.totalDuration || 1;
  const totalDurationSeconds = totalDurationMinutes * 60;

  const rawPlayTime = item?.playTimeStamps || 0;

  // Heuristic for legacy data:
  // If rawPlayTime is small (< duration * 2, roughly) it MIGHT be "minutes" (legacy) or "seconds" (new short watch).
  // Calculate progress both ways.
  const progressSeconds = rawPlayTime / totalDurationSeconds;
  const progressMinutes = rawPlayTime / totalDurationMinutes;

  // If progress calculated as seconds is tiny (< 1%) BUT as minutes is significant (> 5%),
  // prefer the Minutes view visually so the bar isn't empty for legacy data.
  // Note: This is visual only. Resume logic is separate.
  let progress = Math.min(progressSeconds, 1);
  if (
    progressSeconds < 0.01 &&
    progressMinutes > 0.05 &&
    progressMinutes <= 1
  ) {
    progress = progressMinutes;
  }

  // console.log("item for watching video", item)

  return (
    <Pressable
      onPress={cardPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ marginRight: SIZES.w10 }}
    >
      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleValue }] }]}
      >
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: item?.movieOrSeriesId?.poster }}
            style={styles.recPoster}
            resizeMode="cover"
          />
          {/* Progress bar */}
          <Progress.Bar
            progress={progress}
            color="#FFB800"
            unfilledColor={COLORS.gray200}
            borderWidth={0}
            width={barWidth}
            height={2}
            style={styles.progress}
          />
          <View
            style={[
              styles.dot,
              {
                left: barWidth * progress - SIZES.width * 0.012,
                backgroundColor: '#FFB800',
              },
            ]}
          />
        </View>
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <TransliteratedText
            style={[styles.heading, { maxWidth: SIZES.width * 0.32 }]}
            numberOfLines={1}
            text={item?.movieOrSeriesId?.name}
            language={i18n.language}
          />
          <View style={styles.hdView}>
            <Text style={styles.hd}>{item?.movieOrSeriesId?.watchQuality}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.text}>
            {item?.movieOrSeriesId?.totalDuration -
              Math.ceil(item?.playTimeStamps / 60)}
            {t('common.m_left') || 'm Left'}
          </Text>
          <Text style={styles.text}>
            • {item?.movieOrSeriesId?.releaseYear}
          </Text>
          <Text style={styles.text}>
            • {t(`genres.${item?.movieOrSeriesId?.genre?.[0]?.name?.toLowerCase()}`) || item?.movieOrSeriesId?.genre?.[0]?.name}
          </Text>
        </View>

        <View style={styles.button}>
          <CustomButton
            title={t('common.resume') || 'Resume'}
            iconLeft={icons.play}
            buttonStyle={[styles.buttonStyle, { width: SIZES.width * 0.4 }]}
            iconStyle={styles.iconStyle}
            buttonText={styles.buttonText}
            onPress={() => resumePress(Math.max(0, item?.playTimeStamps || 0))}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default ContinueCard;

const styles = StyleSheet.create({
  card: {
    width: SIZES.width * 0.44,
    height: SIZES.height * 0.268,
    borderRadius: SIZES.w0,
    backgroundColor: COLORS.lightBlack,
  },
  posterContainer: {
    position: 'relative',
  },
  recPoster: {
    width: SIZES.width * 0.44,
    height: SIZES.height * 0.126,
    borderTopLeftRadius: SIZES.w0,
    borderTopRightRadius: SIZES.w0,
  },
  progress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  dot: {
    position: 'absolute',
    bottom: -SIZES.width * 0.0075,
    width: SIZES.w0,
    height: SIZES.w0,
    borderRadius: SIZES.w0,
    backgroundColor: COLORS.p1,
  },
  heading: {
    color: COLORS.white,
    fontFamily: FONTS.Bold,
    fontSize: SIZES.w6,
    marginTop: SIZES.h6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.width * 0.0115,
    paddingHorizontal: SIZES.w0,
  },
  text: {
    color: COLORS.gray200,
    fontFamily: FONTS.SemiBold,
    fontSize: SIZES.w2,
    marginVertical: SIZES.height * 0.005,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.w0,
    marginTop: SIZES.height * 0.002,
    paddingHorizontal: SIZES.width * 0.018,
  },
  iconStyle: {
    width: SIZES.width * 0.036,
    height: SIZES.width * 0.036,
    marginLeft: SIZES.w0,
  },
  buttonText: {
    fontSize: SIZES.w3,
    marginRight: SIZES.w1,
  },
  buttonStyle: {
    height: SIZES.height * 0.0465,
  },
  hdView: {
    backgroundColor: COLORS.gray200,
    paddingHorizontal: SIZES.width * 0.014,
    paddingVertical: SIZES.width * 0.004,
    borderRadius: SIZES.width * 0.016,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hd: {
    color: COLORS.gray700,
    fontFamily: FONTS.SemiBold,
    fontSize: SIZES.w1,
    marginTop: SIZES.height * 0.0025,
  },
});
