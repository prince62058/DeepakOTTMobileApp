import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

const Nodata = ({
  title = 'Something wonderful is on its way...',
  image = null,
  description = "We couldn't find any content right now, but stay tuned for more magic.",
}) => {
  return (
    <View style={styles.container}>
      {image ? (
        <Image source={image} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✧</Text>
        </View>
      )}
      <Text style={styles.text}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
};

export default Nodata;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.width * 0.1,
  },
  image: {
    width: SIZES.width * 0.5,
    height: SIZES.width * 0.5,
    marginBottom: SIZES.height * 0.02,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.height * 0.02,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconText: {
    color: COLORS.white,
    fontSize: 32,
  },
  text: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: SIZES.width * 0.045,
    textAlign: 'center',
    marginBottom: SIZES.height * 0.01,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: FONTS.medium,
    fontSize: SIZES.width * 0.035,
    textAlign: 'center',
    lineHeight: SIZES.width * 0.05,
  },
});
